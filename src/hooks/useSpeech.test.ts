// ══════════════════════════════════════════════════════════════
// Athenas — Testes da seleção de voz (regra estrita feminina)
// pickVoice é pura: recebe idioma + lista de vozes e devolve a voz.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { pickVoice } from "./useSpeech";
import { FR_MODEL, langToModel } from "@/services/naturalVoice";

function v(name: string, lang: string): SpeechSynthesisVoice {
  return { name, lang, default: false, localService: false, voiceURI: name } as SpeechSynthesisVoice;
}

const FR = "fr-FR";
const PT = "pt-BR";

describe("pickVoice — voz feminina em todo o app", () => {
  it("escolhe feminina mesmo quando existe masculina de melhor qualidade", () => {
    const voices = [
      v("Microsoft Thomas - French (France)", FR), // masculino neural
      v("Microsoft Hortense - French (France)", FR) // feminina
    ];
    expect(pickVoice(FR, voices)?.name).toContain("Hortense");
  });

  it("escolhe a melhor feminina entre várias (qualidade como desempate)", () => {
    const voices = [
      v("Microsoft Julie - French (France)", FR),
      v("Google français", FR), // feminina (Android) — perde só no desempate por qualidade
      v("Microsoft Denise - French (France)", FR)
    ];
    // as três são femininas; qualquer uma vale, mas a de melhor qualidade vence
    const chosen = pickVoice(FR, voices);
    expect(chosen?.name).not.toContain("Google");
  });

  it("prefere feminina de melhor qualidade quando há várias", () => {
    const voices = [
      v("Julie - French (France)", FR), // feminina, sem marca de qualidade
      v("Microsoft Julie - French (France)", FR) // feminina com qualidade
    ];
    expect(pickVoice(FR, voices)?.name).toContain("Microsoft Julie");
  });

  it("em PT-BR prefere voz feminina", () => {
    const voices = [
      v("Microsoft Daniel - Portuguese (Brazil)", PT), // masculino
      v("Microsoft Francisca - Portuguese (Brazil)", PT), // feminina
      v("Google português do Brasil", PT) // feminina
    ];
    expect(pickVoice(PT, voices)?.name).not.toContain("Daniel");
  });

  it("NUNCA cai para voz masculina: sem feminina no idioma, devolve null (silêncio)", () => {
    const voices = [v("Microsoft Thomas - French (France)", FR), v("Microsoft Pierre - French (France)", FR)];
    expect(pickVoice(FR, voices)).toBeNull();
  });

  it("NUNCA usa voz de gênero desconhecido/neutro quando não há feminina", () => {
    const voices = [
      v("Microsoft Thomas - French (France)", FR), // masculina conhecida
      v("Voz do Sistema - French (France)", FR) // gênero desconhecido
    ];
    expect(pickVoice(FR, voices)).toBeNull();
  });

  it("Google português do Brasil é feminina (Android) e vence a masculina", () => {
    const voices = [
      v("Google português do Brasil", PT),
      v("Microsoft Daniel - Portuguese (Brazil)", PT)
    ];
    expect(pickVoice(PT, voices)?.name).toContain("Google português");
  });

  it("Google français (Android) é FEMININA e fala quando é a única opção", () => {
    // A voz padrão de francês do Android é feminina — antigamente era
    // classificada como masculina e o chat ficava mudo no celular.
    const voices = [v("Google français", FR)];
    expect(pickVoice(FR, voices)?.name).toContain("Google français");
  });

  it("masculina conhecida NUNCA é usada — nem como último recurso", () => {
    const voices = [v("Microsoft Thomas - French (France)", FR)]; // única opção e masculina
    expect(pickVoice(FR, voices)).toBeNull();
  });

  it("ignora vozes de outros idiomas (filtro por prefixo)", () => {
    const voices = [v("Microsoft Julie - French (Canada)", "fr-CA"), v("Microsoft Camila - Portuguese (Brazil)", PT)];
    expect(pickVoice(FR, voices)?.name).toContain("Julie");
    expect(pickVoice(PT, voices)?.name).toContain("Camila");
  });

  it("retorna null quando não há vozes do idioma", () => {
    expect(pickVoice("de-DE", [v("Julie", FR)])).toBeNull();
  });
});

describe("langToModel — voz natural do HuggingFace", () => {
  it("francês usa o modelo feminino de francês", () => {
    expect(langToModel("fr-FR")).toBe(FR_MODEL);
    expect(langToModel("fr")).toBe(FR_MODEL);
  });

  it("português NÃO usa modelo natural (o mms-tts-por é masculino) — fica na voz feminina do aparelho", () => {
    expect(langToModel("pt-BR")).toBeNull();
    expect(langToModel("pt")).toBeNull();
  });

  it("idiomas sem modelo devolvem null (fallback para a voz do dispositivo)", () => {
    expect(langToModel("en-US")).toBeNull();
    expect(langToModel("de-DE")).toBeNull();
    expect(langToModel("")).toBeNull();
  });
});
