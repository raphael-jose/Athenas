// ══════════════════════════════════════════════════════════════
// Athenas — Testes do proxy serverless (worker/index.mjs)
// O núcleo (handleRequest) recebe o fetch injetado, então dá para
// validar todo o comportamento sem rodar um Worker de verdade.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { handleRequest, corsHeaders } from "../../worker/index.mjs";

const ENV_OK = { OLLAMA_API_KEY: "chave-servidor" };

/** Cria um request com método/caminho/origem. */
function req(method: string, path: string, init: RequestInit & { origin?: string } = {}): Request {
  const headers = new Headers(init.headers);
  if (init.origin) headers.set("Origin", init.origin);
  return new Request(`https://proxy.test${path}`, { method, ...init, headers });
}

type UpstreamCall = { url: string; init?: RequestInit };
type OkUpstream = ((url: string, init?: RequestInit) => Promise<Response>) & { calls: UpstreamCall[] };

/** Stub do upstream que devolve um chat completo (registra as chamadas). */
function okUpstream(content = "Bonjour ! Comment ça va ?"): OkUpstream {
  const wrapped = (async (url: string, init?: RequestInit) => {
    wrapped.calls.push({ url, init });
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
  }) as OkUpstream;
  wrapped.calls = [];
  return wrapped;
}

describe("Worker proxy — CORS e rotas", () => {
  it("preflight OPTIONS responde 204 com cabeçalhos CORS", async () => {
    const r = await handleRequest(req("OPTIONS", "/v1/chat/completions", { origin: "https://app.github.io" }), ENV_OK);
    expect(r.status).toBe(204);
    expect(r.headers.get("Access-Control-Allow-Origin")).toBe("https://app.github.io");
    expect(r.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("origem fora da lista permitida é bloqueada (403)", async () => {
    const env = { ...ENV_OK, ALLOWED_ORIGINS: "https://app.github.io" };
    const r = await handleRequest(req("POST", "/v1/chat/completions", { origin: "https://malicioso.example" }), env);
    expect(r.status).toBe(403);
    expect(r.headers.get("Access-Control-Allow-Origin")).toBe("null");
  });

  it("origem permitida passa no CORS", async () => {
    const env = { ...ENV_OK, ALLOWED_ORIGINS: "https://app.github.io" };
    const up = okUpstream();
    const r = await handleRequest(
      req("POST", "/v1/chat/completions", { origin: "https://app.github.io" }),
      env,
      up
    );
    expect(r.status).toBe(200);
    expect(r.headers.get("Access-Control-Allow-Origin")).toBe("https://app.github.io");
  });

  it("health check GET / responde ok", async () => {
    const r = await handleRequest(req("GET", "/"), ENV_OK);
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ ok: true });
  });

  it("rota desconhecida → 404", async () => {
    const r = await handleRequest(req("POST", "/outra-coisa"), ENV_OK);
    expect(r.status).toBe(404);
  });
});

describe("Worker proxy — requisição de chat", () => {
  it("devolve { content } no shape que o ProxyProvider espera", async () => {
    const up = okUpstream("Salut !");
    const r = await handleRequest(
      req("POST", "/v1/chat/completions", {
        body: JSON.stringify({ model: "default", messages: [{ role: "user", content: "oi" }] }),
        headers: { "Content-Type": "application/json" }
      }),
      ENV_OK,
      up
    );
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ content: "Salut !" });
  });

  it("usa o modelo do env quando o app manda 'default'", async () => {
    const up = okUpstream();
    await handleRequest(
      req("POST", "/v1/chat/completions", {
        body: JSON.stringify({ model: "default", messages: [] }),
        headers: { "Content-Type": "application/json" }
      }),
      { ...ENV_OK, OLLAMA_MODEL: "llama3:8b" },
      up
    );
    const sent = JSON.parse((up.calls[0].init?.body as string) ?? "{}");
    expect(sent.model).toBe("llama3:8b");
    expect(up.calls[0].init?.headers).toMatchObject({ Authorization: "Bearer chave-servidor" });
  });

  it("respeita modelo customizado enviado pelo app", async () => {
    const up = okUpstream();
    await handleRequest(
      req("POST", "/v1/chat/completions", {
        body: JSON.stringify({ model: "qwen3:32b", messages: [] }),
        headers: { "Content-Type": "application/json" }
      }),
      ENV_OK,
      up
    );
    const sent = JSON.parse((up.calls[0].init?.body as string) ?? "{}");
    expect(sent.model).toBe("qwen3:32b");
  });

  it("sem chave no servidor → 500 missing_server_key", async () => {
    const r = await handleRequest(req("POST", "/v1/chat/completions"), {});
    expect(r.status).toBe(500);
    expect(await r.json()).toMatchObject({ error: "missing_server_key" });
  });

  it("upstream com 429 → repassa 429 (rate_limited)", async () => {
    const up = async () => new Response(JSON.stringify({ error: "rate limit" }), { status: 429 });
    const r = await handleRequest(
      req("POST", "/v1/chat/completions", { body: "{}" }),
      ENV_OK,
      up as never
    );
    expect(r.status).toBe(429);
  });

  it("upstream fora do ar → 502", async () => {
    const up = async () => {
      throw new Error("network down");
    };
    const r = await handleRequest(
      req("POST", "/v1/chat/completions", { body: "{}" }),
      ENV_OK,
      up as never
    );
    expect(r.status).toBe(502);
  });

  it("resposta vazia do upstream → 502 empty_response", async () => {
    const up = async () => new Response(JSON.stringify({ choices: [] }), { status: 200 });
    const r = await handleRequest(
      req("POST", "/v1/chat/completions", { body: "{}" }),
      ENV_OK,
      up as never
    );
    expect(r.status).toBe(502);
    expect(await r.json()).toMatchObject({ error: "empty_response" });
  });
});

describe("Worker proxy — rate limit", () => {
  it("bloqueia após estourar o limite por IP", async () => {
    const up = okUpstream();
    const store = new Map<string, { count: number; resetAt: number }>();
    const env = { ...ENV_OK, RATE_LIMIT_MAX: "2", RATE_LIMIT_WINDOW: "60" };
    const body = JSON.stringify({ model: "default", messages: [] });
    const first = await handleRequest(req("POST", "/v1/chat/completions", { body }), env, up, store);
    const second = await handleRequest(req("POST", "/v1/chat/completions", { body }), env, up, store);
    const third = await handleRequest(req("POST", "/v1/chat/completions", { body }), env, up, store);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
  });

  it("cabeçalhos CORS marcam Vary: Origin", () => {
    const h = corsHeaders("https://app.github.io", true);
    expect(h["Access-Control-Allow-Origin"]).toBe("https://app.github.io");
    expect(h.Vary).toBe("Origin");
  });
});
