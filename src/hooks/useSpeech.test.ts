// ══════════════════════════════════════════════════════════════
// Athenas — Testes da voz (regra: só vozes femininas Piper)
// langToPiperVoice é pura: recebe o idioma e devolve a voz Piper.
// O app NÃO usa a Web Speech API (voz de navegador) — as duas
// únicas vozes são do Piper: siwis (francês) e Dii (português).
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { langToPiperVoice } from "@/hooks/useSpeech";

describe("langToPiperVoice — voz feminina Piper (siwis para tudo)", () => {
  it("francês usa a voz siwis (feminina)", () => {
    expect(langToPiperVoice("fr-FR")).toBe("siwis");
    expect(langToPiperVoice("fr")).toBe("siwis");
  });

  it("português também usa siwis (a Lulu é francesa)", () => {
    expect(langToPiperVoice("pt-BR")).toBe("siwis");
    expect(langToPiperVoice("pt")).toBe("siwis");
  });

  it("idiomas desconhecidos também usam siwis", () => {
    expect(langToPiperVoice("en-US")).toBe("siwis");
    expect(langToPiperVoice("de-DE")).toBe("siwis");
    expect(langToPiperVoice("")).toBe("siwis");
  });
});
