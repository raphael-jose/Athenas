// ══════════════════════════════════════════════════════════════
// Athenas — Cloudflare Worker: proxy seguro da IA 🇫🇷
//
// Este Worker é a alternativa BLINDADA à chave embutida:
//   • A chave do Ollama vive SOMENTE aqui, como secret do Worker
//     (wrangler secret put OLLAMA_API_KEY) — nunca no bundle, nunca
//     no GitHub, nunca no navegador.
//   • O frontend chama este Worker (Provedor → Proxy); o Worker
//     injeta a chave e fala com o Ollama Cloud.
//   • CORS restrito à(s) origem(ns) do app (ALLOWED_ORIGINS).
//   • Rate limit simples por IP (evita abuso/queima de créditos).
//
// Formato esperado pelo frontend (ProxyProvider):
//   POST {worker}/v1/chat/completions  →  { "content": "…" }
// ══════════════════════════════════════════════════════════════

// Endpoint OpenAI-compatível do Ollama Cloud: https://ollama.com
// (NÃO /api — esse prefixo é a API nativa e /v1/chat/completions ali dá 404).
const DEFAULT_UPSTREAM = "https://ollama.com";

/** Cabeçalhos CORS — origem permitida só se estiver na lista. */
export function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? origin || "*" : "null",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}

// Rate limit em memória (simples, suficiente para app pessoal).
const hits = new Map(); // key -> { count, resetAt }

function rateLimited(env, key, store) {
  const max = parseInt(env.RATE_LIMIT_MAX ?? "30", 10) || 30;
  const windowSec = parseInt(env.RATE_LIMIT_WINDOW ?? "60", 10) || 60;
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || now >= rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return false;
  }
  rec.count += 1;
  return rec.count > max;
}

/**
 * Núcleo do Worker, isolado para testes (fetchImpl injetável).
 * @param {Request} request
 * @param {object} env  — secrets/vars do Cloudflare
 * @param {Function} [fetchImpl] — fetch para o Ollama (padrão: globalThis.fetch)
 * @param {Map} [rateStore] — armazenamento do rate limit (padrão: compartilhado)
 */
export async function handleRequest(request, env, fetchImpl = globalThis.fetch, rateStore = hits) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const originOk =
    allowedOrigins.length === 0 || allowedOrigins.includes("*") || (origin !== "" && allowedOrigins.includes(origin));

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin, originOk) });
  }

  // Health check (usado para "Testar sinal" e monitoramento)
  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
    return json({ ok: true, service: "athenas-ai-proxy" }, 200, corsHeaders(origin, true));
  }

  if (!originOk) {
    return json({ error: "origin_not_allowed" }, 403, corsHeaders(origin, false));
  }

  const clientKey = request.headers.get("CF-Connecting-IP") || "anonymous";
  if (rateLimited(env, clientKey, rateStore)) {
    return json({ error: "rate_limited" }, 429, corsHeaders(origin, true));
  }

  if (request.method !== "POST" || url.pathname !== "/v1/chat/completions") {
    return json({ error: "not_found" }, 404, corsHeaders(origin, true));
  }

  if (!env.OLLAMA_API_KEY) {
    return json({ error: "missing_server_key" }, 500, corsHeaders(origin, true));
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // corpo inválido → trata como vazio; mensagens ausentes viram []
  }

  const model = body.model && body.model !== "default" ? String(body.model) : env.OLLAMA_MODEL || "gpt-oss:20b";
  const upstream = (env.OLLAMA_BASE_URL || DEFAULT_UPSTREAM).replace(/\/+$/, "");
  const upstreamUrl = upstream.endsWith("/v1") ? `${upstream}/chat/completions` : `${upstream}/v1/chat/completions`;

  let res;
  try {
    res = await fetchImpl(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OLLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: Array.isArray(body.messages) ? body.messages : [],
        temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
        max_tokens: typeof body.max_tokens === "number" ? body.max_tokens : 800,
        stream: false
      })
    });
  } catch (err) {
    return json({ error: "upstream_unreachable" }, 502, corsHeaders(origin, true));
  }

  const text = await res.text();
  if (!res.ok) {
    const status = res.status === 429 ? 429 : res.status;
    return new Response(text, {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin, true) }
    });
  }

  // Extrai só o texto → shape que o ProxyProvider do app espera.
  let content = "";
  try {
    content = JSON.parse(text)?.choices?.[0]?.message?.content ?? "";
  } catch {
    // resposta não-JSON do upstream → 502
  }
  if (!content) return json({ error: "empty_response" }, 502, corsHeaders(origin, true));
  return json({ content }, 200, corsHeaders(origin, true));
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  }
};
