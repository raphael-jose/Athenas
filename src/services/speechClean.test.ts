import { describe, expect, it } from "vitest";
import { cleanSpokenText } from "./speechClean";

describe("cleanSpokenText", () => {
  it("colapsa gaguejos de sílaba", () => {
    expect(cleanSpokenText("j-je veux un café")).toBe("je veux un café");
    expect(cleanSpokenText("p-pourquoi pas")).toBe("pourquoi pas");
  });

  it("colapsa palavras repetidas seguidas", () => {
    expect(cleanSpokenText("je je veux un café")).toBe("je veux un café");
    expect(cleanSpokenText("bonjour bonjour bonjour !")).toBe("bonjour !");
    expect(cleanSpokenText("le le le croissant est bon")).toBe("le croissant est bon");
  });

  it("remove vícios de fala em francês e português", () => {
    expect(cleanSpokenText("euh je voudrais euh un pain")).toBe("je voudrais un pain");
    expect(cleanSpokenText("tipo né eu quero um croissant")).toBe("eu quero um croissant");
    expect(cleanSpokenText("hum oui merci")).toBe("oui merci");
  });

  it("não remove palavras reais que parecem vícios", () => {
    expect(cleanSpokenText("ben oui")).toBe("oui");
    expect(cleanSpokenText("ah bon ?")).toBe("ah bon ?");
  });

  it("normaliza espaços e pontuação final", () => {
    expect(cleanSpokenText("  je   veux  du  café  ")).toBe("je veux du café");
    expect(cleanSpokenText("merci beaucoup...")).toBe("merci beaucoup");
    expect(cleanSpokenText("bonjour , ça va ?")).toBe("bonjour, ça va ?");
  });

  it("não altera repetições intencionais separadas", () => {
    expect(cleanSpokenText("je veux je veux")).toBe("je veux je veux");
  });
});
