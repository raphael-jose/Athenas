// ══════════════════════════════════════════════════════════════
// Athenas — ProxyProvider
// Chama um endpoint intermediário (Cloudflare Worker / Vercel Function…)
// que guarda a chave do Ollama no servidor. O frontend NUNCA vê a chave.
// ══════════════════════════════════════════════════════════════
import type { AIProvider, AIRequestContext } from "./types";
import { toApiMessages } from "./types";

export class ProxyProvider implements AIProvider {
  readonly id = "proxy";
  readonly label = "Proxy serverless (seguro)";
  private url: string;

  constructor(url: string) {
    this.url = url.replace(/\/+$/, "");
  }

  ready(): boolean {
    return this.url.startsWith("http");
  }

  async chat(ctx: AIRequestContext): Promise<string> {
    if (!this.ready()) throw new Error("missing_proxy_url");

    const res = await fetch(`${this.url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "default",
        messages: toApiMessages(ctx.system, ctx.messages),
        temperature: ctx.temperature ?? 0.7,
        max_tokens: ctx.maxTokens ?? 800
      }),
      signal: ctx.signal
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("rate_limited");
      throw new Error(`proxy_http_${res.status}`);
    }
    const data = (await res.json()) as { content?: string };
    const content = data.content?.trim();
    if (!content) throw new Error("empty_response");
    return content;
  }
}
