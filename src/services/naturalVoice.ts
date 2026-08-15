// ══════════════════════════════════════════════════════════════
// Athenas — Voz natural da Lulu (TTS no navegador, grátis)
//
// Roda modelos de voz abertos do HuggingFace (Xenova/mms-tts) direto
// no navegador via transformers.js — SEM chave, SEM servidor e SEM
// configuração. O modelo (≈36 MB) é baixado uma vez do CDN público do
// HuggingFace e fica no cache do navegador; depois disso, funciona até
// offline.
//
// 🎀 Voz feminina por idioma:
//   francês  → Xenova/mms-tts-fra (voz feminina de francês)
//   português → Xenova/mms-tts-por (voz feminina de português)
//
// Se algo falhar (sem internet, CDN fora do ar, navegador sem suporte),
// o app cai automaticamente na melhor voz feminina do dispositivo.
// ══════════════════════════════════════════════════════════════
import { env, pipeline, type TextToAudioPipeline } from "@huggingface/transformers";

// Tudo do CDN público do HuggingFace — nada de arquivos locais
// (evita 404 no GitHub Pages) e nada de chave.
env.allowLocalModels = false;

export const FR_MODEL = "Xenova/mms-tts-fra";
export const PT_MODEL = "Xenova/mms-tts-por";

/** Modelo de voz natural para o idioma (null = sem voz natural disponível). */
export function langToModel(lang: string): string | null {
  const prefix = lang.toLowerCase().slice(0, 2);
  if (prefix === "fr") return FR_MODEL;
  if (prefix === "pt") return PT_MODEL;
  return null;
}

// Pipelines em cache por modelo (uma vez carregados, ficam em memória).
const pipes = new Map<string, TextToAudioPipeline>();
const loaders = new Map<string, Promise<TextToAudioPipeline>>();

/** true quando um modelo já está pronto em memória (síntese rápida). */
export function isNaturalReady(): boolean {
  return pipes.size > 0;
}

function getSynth(model: string): Promise<TextToAudioPipeline> {
  const cached = pipes.get(model);
  if (cached) return Promise.resolve(cached);
  let loading = loaders.get(model);
  if (!loading) {
    loading = pipeline("text-to-speech", model, { dtype: "q8" }).then((p) => {
      pipes.set(model, p);
      loaders.delete(model);
      return p;
    });
    loaders.set(model, loading);
  }
  return loading;
}

export interface NaturalAudio {
  blob: Blob;
  durationMs: number;
}

/**
 * Sintetiza o texto na voz natural do idioma. Devolve null quando não
 * há modelo para o idioma ou o áudio veio vazio; lança erro se falhar.
 */
export async function synthesizeNaturalVoice(text: string, lang: string): Promise<NaturalAudio> {
  const model = langToModel(lang);
  if (!model) throw new Error("no_model");
  const synth = await getSynth(model);
  const out = (await synth(text)) as { audio: Float32Array; sampling_rate: number };
  const audio = out?.audio;
  const sampleRate = out?.sampling_rate ?? 16000;
  if (!audio || audio.length === 0) throw new Error("empty_audio");
  return {
    blob: floatToWav(audio, sampleRate),
    durationMs: (audio.length / sampleRate) * 1000
  };
}

/** Converte PCM (Float32) em um arquivo WAV (PCM 16-bit mono). */
function floatToWav(audio: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + audio.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + audio.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits por amostra
  writeStr(36, "data");
  view.setUint32(40, audio.length * 2, true);
  for (let i = 0; i < audio.length; i++) {
    const s = Math.max(-1, Math.min(1, audio[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}
