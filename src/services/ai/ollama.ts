// ══════════════════════════════════════════════════════════════
// Athenas — OllamaProvider
// Fala com qualquer API compatível com OpenAI /v1/chat/completions
// (Ollama Cloud, Ollama local, LM Studio, etc.).
// A chave fica no navegador do usuário (Configurações) — nunca no código.
// ══════════════════════════════════════════════════════════════
import type { AIProvider, AIRequestContext } from "./types";
import { toApiMessages } from "./types";

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export class OllamaProvider implements AIProvider {
  readonly id = "ollama";
  readonly label = "Ollama (nuvem ou local)";
  private cfg: OllamaConfig;

  constructor(cfg: OllamaConfig) {
    this.cfg = cfg;
  }

  ready(): boolean {
    return this.cfg.apiKey.trim().length > 0 && this.cfg.baseUrl.trim().length > 0;
  }

  async chat(ctx: AIRequestContext): Promise<string> {
    if (!this.ready()) {
      throw new Error("missing_api_key");
    }
    const base = this.cfg.baseUrl.replace(/\/+$/, "");
    const url = base.endsWith("/v1") ? `${base}/chat/completions` : `${base}/v1/chat/completions`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.cfg.apiKey}`
      },
      body: JSON.stringify({
        model: this.cfg.model,
        messages: toApiMessages(ctx.system, ctx.messages),
        temperature: ctx.temperature ?? 0.7,
        max_tokens: ctx.maxTokens ?? 800,
        stream: false
      }),
      signal: ctx.signal
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("invalid_key");
      if (res.status === 429) throw new Error("rate_limited");
      throw new Error(`ollama_http_${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("empty_response");
    return content;
  }
}
