import { describe, expect, it } from "vitest";
import { MockProvider } from "./mock";
import { OllamaProvider } from "./ollama";
import { ProxyProvider } from "./proxy";
import { analyzeFrench } from "./corrections";
import { defaultSettings } from "@/services/storage";

describe("AIProvider (abstração)", () => {
  it("padrão é Ollama Cloud quando há chave embutida (cloud como padrão)", () => {
    const s = defaultSettings();
    expect(s.aiProvider).toBe("ollama");
    // endpoint OpenAI-compatível do Ollama Cloud (sem /api — é a API nativa)
    expect(s.aiBaseUrl).toBe("https://ollama.com");
    // modelo que existe de verdade no cloud (qwen3:8b é local)
    expect(s.aiModel).toBe("gpt-oss:20b");
  });

  it("provedor mock está sempre pronto", () => {
    const p = new MockProvider();
    expect(p.id).toBe("mock");
    expect(p.ready()).toBe(true);
  });

  it("ollama requer chave", () => {
    const p = new OllamaProvider({ baseUrl: "https://ollama.com/api", model: "qwen3:8b", apiKey: "" });
    expect(p.ready()).toBe(false);
    const p2 = new OllamaProvider({ baseUrl: "https://ollama.com/api", model: "qwen3:8b", apiKey: "sk-test" });
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

  it("mock consulta o banco completo de vocabulário (FR→PT e PT→FR)", async () => {
    const p = new MockProvider();
    const a = await p.chat({ messages: [{ role: "user", content: "o que significa table?", at: 0 }], system: "x" });
    expect(a).toContain("mesa");
    const b = await p.chat({ messages: [{ role: "user", content: "como se diz 'mesa'?", at: 0 }], system: "x" });
    expect(b).toContain("table");
    const c = await p.chat({ messages: [{ role: "user", content: "o que significa bonjour?", at: 0 }], system: "x" });
    expect(c.toLowerCase()).toContain("olá".toLowerCase());
  });

  it("mock reconhece formas conjugadas e aponta o verbo", async () => {
    const p = new MockProvider();
    const out = await p.chat({ messages: [{ role: "user", content: "o que significa 'suis'?", at: 0 }], system: "x" });
    expect(out).toContain("être");
    expect(out).toContain("suis");
  });

  it("mock mantém conversa com mini-perguntas (acerta ou erra, segue o fluxo)", async () => {
    const p = new MockProvider();
    const first = await p.chat({ messages: [{ role: "user", content: "me dá um exercício", at: 0 }], system: "x" });
    expect(first).toContain("Perguntinha");
    const history = [
      { role: "user" as const, content: "me dá um exercício", at: 0 },
      { role: "assistant" as const, content: first, at: 1 },
      { role: "user" as const, content: "merci", at: 2 }
    ];
    const second = await p.chat({ messages: history, system: "x" });
    expect(second).toMatch(/Bravo|Quase/);
    const third = await p.chat({
      messages: [...history, { role: "assistant" as const, content: second, at: 3 }, { role: "user" as const, content: "pular", at: 4 }],
      system: "x"
    });
    expect(third).toContain("Sem problema");
  });

  it("mock não prende o aluno no loop do quiz (pergunta real responde de verdade)", async () => {
    const p = new MockProvider();
    const first = await p.chat({ messages: [{ role: "user", content: "me dá um exercício", at: 0 }], system: "x" });
    expect(first).toContain("Perguntinha:");
    const out = await p.chat({
      messages: [
        { role: "user", content: "me dá um exercício", at: 0 },
        { role: "assistant", content: first, at: 1 },
        { role: "user", content: "tenho uma duvida, pode me ajudar?", at: 2 }
      ],
      system: "x"
    });
    expect(out).not.toMatch(/Quase|Bravo|Sem problema/);
    expect(out.length).toBeGreaterThan(10);
  });

  it("mock detecta pedido de correção e diferenciais", async () => {
    const p = new MockProvider();
    const a = await p.chat({ messages: [{ role: "user", content: "corrija: je suis avec faim", at: 0 }], system: "x" });
    expect(a).toContain("j'ai faim");
    const b = await p.chat({ messages: [{ role: "user", content: "diferença entre savoir e connaître", at: 0 }], system: "x" });
    expect(b).toContain("connais");
  });

  it("mock NÃO responde em inglês: mensagem em inglês redireciona para o francês", async () => {
    const p = new MockProvider();
    const out = await p.chat({ messages: [{ role: "user", content: "What is the capital of France and how are you today my friend?", at: 0 }], system: "x" });
    expect(out).toMatch(/ingl[eê]s|franc[eê]s/);
    expect(out.toLowerCase()).not.toContain("paris is");
  });

  it("mock NÃO responde assunto fora do francês: redireciona com carinho", async () => {
    const p = new MockProvider();
    const out = await p.chat({ messages: [{ role: "user", content: "quanto é 2+2?", at: 0 }], system: "x" });
    expect(out).toMatch(/franc[eê]s|palavra|exerc[ií]cio/);
  });

  it("mock continua respondendo perguntas de francês (significado)", async () => {
    const p = new MockProvider();
    const out = await p.chat({ messages: [{ role: "user", content: "o que significa bonjour?", at: 0 }], system: "x" });
    expect(out.toLowerCase()).toContain("bonjour");
  });

  it("chave ausente no ollama lança erro mapeável", async () => {
    const p = new OllamaProvider({ baseUrl: "https://ollama.com/api", model: "qwen3:8b", apiKey: "" });
    await expect(p.chat({ messages: [], system: "x" })).rejects.toThrow("missing_api_key");
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
