// ══════════════════════════════════════════════════════════════
// Athenas — Voz remota instantânea (sem chave, sem download)
//
// O modelo de voz natural LOCAL (HuggingFace mms-tts) é excelente, mas
// na primeira vez precisa baixar ≈36 MB + carregar o WASM — o que pode
// levar 30-60s no celular, deixando o botão de áudio mudo nesse meio
// tempo (e mudo de vez se o aparelho não tiver voz feminina no idioma).
//
// Este serviço fala em <1s usando o endpoint público de síntese da
// ResponsiveVoice (vozes Google Cloud naturais, TODAS FEMININAS), sem
// chave e sem CORS problemático. O app usa ele como PONTE instantânea:
//   - 1º toque: voz remota fala na hora (~700ms)
//   - em background, o modelo local é aquecido
//   - toques seguintes: voz local (funciona até offline)
//   - sem internet: cai na voz feminina do aparelho
// ══════════════════════════════════════════════════════════════

const SYNTH_URL = "https://texttospeech.responsivevoice.org/v1/text:synthesize";

// Vozes femininas por idioma (nomes oficiais da ResponsiveVoice).
const VOICES: Record<string, { lang: string; voice: string }> = {
  fr: { lang: "fr-FR", voice: "French Female" },
  pt: { lang: "pt-BR", voice: "Portuguese Brazilian Female" }
};

/**
 * Sintetiza o texto na voz remota (Google Cloud natural FEMININA) e
 * devolve o MP3 pronto para tocar. Rejeita se o idioma não tiver voz
 * remota ou se o servidor devolver erro — o chamador cai no fallback.
 */
export async function synthesizeRemote(text: string, lang: string): Promise<Blob> {
  const prefix = lang.toLowerCase().slice(0, 2);
  const cfg = VOICES[prefix];
  if (!cfg) throw new Error("no_remote_voice");
  const url = `${SYNTH_URL}?text=${encodeURIComponent(text)}&lang=${cfg.lang}&engine=g1&name=${encodeURIComponent(cfg.voice)}&voice=${encodeURIComponent(cfg.voice)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`remote_tts_${res.status}`);
  const blob = await res.blob();
  // Resposta vazia / HTML de erro disfarçado → trata como falha.
  if (!blob || blob.size < 500 || !blob.type.toLowerCase().includes("audio")) {
    throw new Error("remote_tts_empty");
  }
  return blob;
}
