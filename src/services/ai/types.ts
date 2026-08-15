// ══════════════════════════════════════════════════════════════
// Athenas — Camada de abstração de IA
// A interface NUNCA conversa diretamente com o Ollama: ela usa um
// AIProvider. Trocar de provedor = trocar uma configuração.
//
//   AIProvider
//   ├── MockProvider   (offline, sem chave — padrão)
//   ├── OllamaProvider (API compatível com OpenAI /v1/chat/completions)
//   └── ProxyProvider  (endpoint serverless seu — recomendado p/ produção)
// ══════════════════════════════════════════════════════════════
import type { ChatMessage } from "@/types";

export interface AIRequestContext {
  messages: ChatMessage[];
  system: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface AIProvider {
  readonly id: string;
  readonly label: string;
  /** true quando está configurado para funcionar (ex.: tem chave). */
  ready(): boolean;
  chat(ctx: AIRequestContext): Promise<string>;
}

export type AIProviderId = "mock" | "ollama" | "proxy";

/** Monta o histórico no formato esperado pelas APIs. */
export function toApiMessages(system: string, messages: ChatMessage[]) {
  const history = messages
    .filter((m) => m.role !== "system")
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content }));
  return [{ role: "system", content: system }, ...history];
}
