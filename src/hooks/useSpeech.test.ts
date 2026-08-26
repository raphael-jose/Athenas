// ══════════════════════════════════════════════════════════════
// Athenas — Testes da voz (regra: vozes femininas Piper)
// langToPiperVoice é pura: recebe o idioma e devolve a voz Piper.
// O app usa dois modelos Piper femininos:
//   - francês → siwis
//   - português → Dii
// Texto misto é splitado por frase, cada trecho com a voz correta.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { langToPiperVoice } from "@/hooks/useSpeech";

describe("langToPiperVoice — vozes femininas Piper", () => {
  it("francês usa a voz siwis (feminina)", () => {
    expect(langToPiperVoice("fr-FR")).toBe("siwis");
    expect(langToPiperVoice("fr")).toBe("siwis");
  });

  it("português usa a voz Dii (feminina)", () => {
    expect(langToPiperVoice("pt-BR")).toBe("dii");
    expect(langToPiperVoice("pt")).toBe("dii");
  });

  it("idiomas desconhecidos caem na voz siwis (francês)", () => {
    expect(langToPiperVoice("en-US")).toBe("siwis");
    expect(langToPiperVoice("de-DE")).toBe("siwis");
    expect(langToPiperVoice("")).toBe("siwis");
  });
});
