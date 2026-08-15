import { describe, expect, it } from "vitest";
import { createProvider } from "./index";
import { MockProvider } from "./mock";
import { OllamaProvider } from "./ollama";
import { ProxyProvider } from "./proxy";
import { analyzeFrench } from "./corrections";
import { defaultSettings } from "@/services/storage";

describe("AIProvider (abstração)", () => {
  it("provedor mock está sempre pronto", () => {
    const p = createProvider(defaultSettings());
    expect(p.id).toBe("mock");
    expect(p.ready()).toBe(true);
  });

  it("ollama requer chave", () => {
    const p = new OllamaProvider({ baseUrl: "https://ollama.com", model: "gpt-oss:20b", apiKey: "" });
    expect(p.ready()).toBe(false);
    const p2 = new OllamaProvider({ baseUrl: "https://ollama.com", model: "gpt-oss:20b", apiKey: "sk-test" });
    expect(p2.ready()).toBe(true);
  });

  it("proxy requer URL", () => {
    const p = new ProxyProvider("");
    expect(p.ready()).toBe(false);
    expect(new ProxyProvider("https://meu-proxy.workers.dev").ready()).toBe(true);
  });

  it("mock responde conteúdo não-vazio e em português", async () => {
    const p = new MockProvider();
    const out = await p.chat({
      messages: [{ role: "user", content: "o que significa bonjour?", at: 0 }],
      system: "persona"
    });
    expect(out.length).toBeGreaterThan(10);
    expect(out.toLowerCase()).toContain("bonjour");
  });

  it("mock detecta pedido de correção e diferenciais", async () => {
    const p = new MockProvider();
    const a = await p.chat({ messages: [{ role: "user", content: "corrija: je suis avec faim", at: 0 }], system: "x" });
    expect(a).toContain("j'ai faim");
    const b = await p.chat({ messages: [{ role: "user", content: "diferença entre savoir e connaître", at: 0 }], system: "x" });
    expect(b).toContain("connais");
  });

  it("chave ausente no ollama lança erro mapeável", async () => {
    const p = new OllamaProvider({ baseUrl: "https://ollama.com", model: "gpt-oss:20b", apiKey: "" });
    await expect(p.chat({ messages: [], system: "x" })).rejects.toThrow("missing_api_key");
  });

  it("normaliza base URL do Ollama Cloud (remove /api)", async () => {
    const p = new OllamaProvider({ baseUrl: "https://ollama.com/api", model: "gpt-oss:20b", apiKey: "k" });
    // chat com fetch stub: verifica a URL montada
    const calls: string[] = [];
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async (url: any) => {
      calls.push(String(url));
      return new Response(JSON.stringify({ choices: [{ message: { content: "oi" } }] }));
    }) as typeof fetch;
    try {
      await p.chat({ messages: [{ role: "user", content: "x", at: 0 }], system: "s" });
    } finally {
      globalThis.fetch = origFetch;
    }
    expect(calls[0]).toBe("https://ollama.com/v1/chat/completions");
  });
});

describe("Ça sonne français ?", () => {
  it("detecta 'je suis avec faim' e sugere 'j'ai faim'", () => {
    const r = analyzeFrench("Je suis avec faim");
    expect(r.isNatural).toBe(false);
    expect(r.suggestion).toContain("j'ai faim");
  });

  it("detecta idade com avoir", () => {
    const r = analyzeFrench("Je suis 25 ans");
    expect(r.suggestion).toContain("j'ai 25 ans");
  });

  it("aceita frase natural", () => {
    const r = analyzeFrench("Je suis très fatigué aujourd'hui.");
    expect(r.isNatural).toBe(true);
  });

  it("avisa quando não é francês", () => {
    const r = analyzeFrench("A mesa é bonita");
    expect(r.isNatural).toBe(false);
  });
});
