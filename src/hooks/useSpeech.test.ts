// ══════════════════════════════════════════════════════════════
// Athenas — Testes da seleção de voz (regra estrita feminina)
// pickVoice é pura: recebe idioma + lista de vozes e devolve a voz.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { pickVoice } from "./useSpeech";
import { FR_MODEL, PT_MODEL, langToModel } from "@/services/naturalVoice";

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
      v("Google français", FR), // masculino no Android — nunca escolhido se houver feminina
      v("Microsoft Denise - French (France)", FR)
    ];
    // as duas femininas existem; qualquer uma vale, mas nunca o Google français
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

  it("cai para a melhor voz nativa quando NÃO existe feminina no idioma", () => {
    const voices = [v("Microsoft Thomas - French (France)", FR), v("Microsoft Pierre - French (France)", FR)];
    expect(pickVoice(FR, voices)?.name).toContain("Thomas");
  });

  it("prefere voz de gênero neutro a uma masculina conhecida (sem feminina)", () => {
    const voices = [
      v("Microsoft Thomas - French (France)", FR), // masculina conhecida
      v("Voz do Sistema - French (France)", FR) // gênero desconhecido
    ];
    expect(pickVoice(FR, voices)?.name).not.toContain("Thomas");
  });

  it("Google português do Brasil é feminina (Android) e vence a masculina", () => {
    const voices = [
      v("Google português do Brasil", PT),
      v("Microsoft Daniel - Portuguese (Brazil)", PT)
    ];
    expect(pickVoice(PT, voices)?.name).toContain("Google português");
  });

  it("masculina conhecida é o ÚLTIMO recurso, quando só ela existe", () => {
    const voices = [v("Google français", FR)]; // única opção (Android sem voz feminina FR)
    expect(pickVoice(FR, voices)?.name).toContain("Google français");
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

  it("português usa o modelo feminino de português", () => {
    expect(langToModel("pt-BR")).toBe(PT_MODEL);
    expect(langToModel("pt")).toBe(PT_MODEL);
  });

  it("idiomas sem modelo devolvem null (fallback para a voz do dispositivo)", () => {
    expect(langToModel("en-US")).toBeNull();
    expect(langToModel("de-DE")).toBeNull();
    expect(langToModel("")).toBeNull();
  });
});
