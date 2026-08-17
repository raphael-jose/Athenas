// ══════════════════════════════════════════════════════════════
// Athenas — Testes da voz natural (regra: só HuggingFace feminino)
// langToModel é pura: recebe o idioma e devolve o modelo natural.
// O app NÃO usa mais a Web Speech API (voz de navegador) — as duas
// únicas vozes são os modelos do HuggingFace (mms-tts-fra e Dii).
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { FR_MODEL, langToModel } from "@/services/naturalVoice";

describe("langToModel — voz natural do HuggingFace", () => {
  it("francês usa o modelo feminino de francês", () => {
    expect(langToModel("fr-FR")).toBe(FR_MODEL);
    expect(langToModel("fr")).toBe(FR_MODEL);
  });

  it("português NÃO usa o mms-tts-por (é masculino) — a voz pt-BR é a Dii (Piper), fora deste mapa", () => {
    expect(langToModel("pt-BR")).toBeNull();
    expect(langToModel("pt")).toBeNull();
  });

  it("idiomas sem modelo devolvem null", () => {
    expect(langToModel("en-US")).toBeNull();
    expect(langToModel("de-DE")).toBeNull();
    expect(langToModel("")).toBeNull();
  });
});
