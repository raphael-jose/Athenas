// ══════════════════════════════════════════════════════════════
// Athenas — Testes da limpeza de texto para a voz da Lulu
// A voz não deve ler formatação (markdown) nem descrever emojis.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { cleanForSpeech } from "./speechClean";

describe("cleanForSpeech — voz não lê formatação nem emojis", () => {
  it("remove negrito **texto**", () => {
    expect(cleanForSpeech("**Bonjour** comment ça va ?")).toBe("Bonjour comment ça va ?");
  });

  it("remove itálico *texto* e _texto_", () => {
    expect(cleanForSpeech("*salut* _tout le monde_")).toBe("salut tout le monde");
  });

  it("remove código `inline`", () => {
    expect(cleanForSpeech("Le mot `bonjour` signifie bonjour")).toBe("Le mot bonjour signifie bonjour");
  });

  it("remove títulos, citações e listas", () => {
    expect(cleanForSpeech("# Vocabulaire\n\n> Astuce\n- un\n- deux\n\n1. trois")).toBe("Vocabulaire Astuce un deux trois");
  });

  it("remove links mas mantém o texto do link", () => {
    expect(cleanForSpeech("Veja [esta aula](https://exemplo.com)")).toBe("Veja esta aula");
  });

  it("remove emojis (não descreve)", () => {
    expect(cleanForSpeech("Bora continuar ! 🌸")).toBe("Bora continuar !");
    expect(cleanForSpeech("Une rose pour moi ? 🌹")).toBe("Une rose pour moi ?");
    expect(cleanForSpeech("❤️😘✨ C'est parti !")).toBe("C'est parti !");
  });

  it("mantém apóstrofos e hífens do francês", () => {
    expect(cleanForSpeech("aujourd'hui")).toBe("aujourd'hui");
    expect(cleanForSpeech("peut-être")).toBe("peut-être");
  });

  it("mantém pontuação e símbolos de texto reais", () => {
    expect(cleanForSpeech("Paris → Lyon ✓")).toBe("Paris → Lyon ✓");
  });

  it("devolve vazio quando só havia emojis", () => {
    expect(cleanForSpeech("🌸🌹❤️")).toBe("");
    expect(cleanForSpeech("")).toBe("");
  });
});
