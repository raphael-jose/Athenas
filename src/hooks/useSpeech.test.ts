// ══════════════════════════════════════════════════════════════
// Athenas — Testes da voz (regra: só vozes femininas Piper)
// langToPiperVoice é pura: recebe o idioma e devolve a voz Piper.
// O app NÃO usa a Web Speech API (voz de navegador) — as duas
// únicas vozes são do Piper: siwis (francês) e Dii (português).
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { langToPiperVoice } from "@/hooks/useSpeech";

describe("langToPiperVoice — voz feminina Piper", () => {
  it("francês usa a voz siwis (feminina)", () => {
    expect(langToPiperVoice("fr-FR")).toBe("siwis");
    expect(langToPiperVoice("fr")).toBe("siwis");
  });

  it("português usa a voz Dii (feminina)", () => {
    expect(langToPiperVoice("pt-BR")).toBe("dii");
    expect(langToPiperVoice("pt")).toBe("dii");
  });

  it("idiomas desconhecidos caem na voz Dii (pt-BR)", () => {
    expect(langToPiperVoice("en-US")).toBe("dii");
    expect(langToPiperVoice("de-DE")).toBe("dii");
    expect(langToPiperVoice("")).toBe("dii");
  });
});
