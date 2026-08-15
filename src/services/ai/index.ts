// ══════════════════════════════════════════════════════════════
// Athenas — Fábrica de provedores de IA
// ══════════════════════════════════════════════════════════════
import type { Settings } from "@/types";
import { MockProvider } from "./mock";
import { OllamaProvider } from "./ollama";
import { ProxyProvider } from "./proxy";
import type { AIProvider } from "./types";

export function createProvider(settings: Settings): AIProvider {
  switch (settings.aiProvider) {
    case "ollama":
      return new OllamaProvider({
        baseUrl: settings.aiBaseUrl,
        model: settings.aiModel,
        apiKey: settings.aiKey
      });
    case "proxy":
      return new ProxyProvider(settings.aiBaseUrl);
    case "mock":
    default:
      return new MockProvider();
  }
}

export { MockProvider, OllamaProvider, ProxyProvider };
export type { AIProvider } from "./types";

export function providerErrorToMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  switch (msg) {
    case "missing_api_key":
      return "A Lulu online precisa de uma chave!  Vá em Perfil → Configurações → IA e adicione sua chave do Ollama.";
    case "invalid_key":
      return "Hmm, essa chave não passou…  Confere se a API key do Ollama está certinha nas Configurações.";
    case "rate_limited":
      return "Calma, calma!  A API está limitando as requisições por um instante. Respira e tenta de novo em alguns segundos.";
    case "missing_proxy_url":
      return "Configure a URL do proxy nas Configurações de IA. ";
    case "empty_response":
      return "A Lulu ficou sem palavras…  Pode tentar de novo?";
    default:
      return "Minha anteninha está sem sinal  Não foi possível falar com a Lulu agora. Mas podemos continuar com aulas, revisões e exercícios offline! ";
  }
}
