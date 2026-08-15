// ══════════════════════════════════════════════════════════════
// Athenas — Relay: a Lulu online no navegador (sem Worker, sem baixar nada)
//
// O ollama.com NÃO envia cabeçalhos CORS — o navegador não consegue
// chamá-lo direto (preflight bloqueado), por mais válida que seja a chave.
// A solução "de qualquer forma": um relay público de CORS, que recebe a
// chamada do navegador e a reencaminha para o Ollama Cloud pelo servidor
// (aí a chave funciona — testado ao vivo: responde com o gpt-oss:20b).
//
// ⚠️ Transparência: o relay vê a chave, mas ela já viaja no bundle público
// de qualquer jeito. Para blindagem total, o caminho ideal continua sendo
// o Cloudflare Worker (worker/) — quando existir, ele é usado primeiro.
// ══════════════════════════════════════════════════════════════
import { toApiMessages } from "./types";
import type { AIRequestContext } from "./types";

export interface RelayConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

// Relays públicos de CORS, em ordem de preferência (o primeiro foi testado
// ao vivo no navegador com a chave real e respondeu 200 com o modelo).
const RELAYS: { name: string; wrap: (target: string) => string }[] = [
  { name: "corsproxy.io", wrap: (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}` },
  { name: "corsproxy.org", wrap: (u) => `https://corsproxy.org/?url=${encodeURIComponent(u)}` },
  { name: "api.cors.lol", wrap: (u) => `https://api.cors.lol/?url=${encodeURIComponent(u)}` }
];

const RELAY_TIMEOUT_MS = 12000;

/** Chama o Ollama Cloud através dos relays, em ordem, até um responder. */
export async function relayChat(cfg: RelayConfig, ctx: AIRequestContext): Promise<string> {
  const base = cfg.baseUrl.replace(/\/+$/, "");
  const target = base.endsWith("/v1") ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
  const body = JSON.stringify({
    model: cfg.model,
    messages: toApiMessages(ctx.system, ctx.messages),
    temperature: ctx.temperature ?? 0.7,
    max_tokens: ctx.maxTokens ?? 800,
    stream: false
  });

  let lastError: unknown = new Error("relay_unavailable");
  for (const relay of RELAYS) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), RELAY_TIMEOUT_MS);
    const onAbort = () => ctl.abort();
    ctx.signal?.addEventListener("abort", onAbort);
    try {
      const res = await fetch(relay.wrap(target), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`
        },
        body,
        signal: ctl.signal
      });
      if (!res.ok) {
        lastError = new Error(`relay_http_${res.status}`);
        continue;
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        lastError = new Error("empty_response");
        continue;
      }
      return content;
    } catch (e) {
      lastError = e;
    } finally {
      clearTimeout(timer);
      ctx.signal?.removeEventListener("abort", onAbort);
    }
  }
  throw lastError;
}
