// ══════════════════════════════════════════════════════════════
// Athenas — Worker da voz natural (TTS no navegador)
//
// A síntese do modelo (transformers.js / ONNX WASM) roda AQUI, em
// uma thread própria, para o carregamento do modelo e a inferência
// NUNCA congelarem a interface. O main-thread só posta {texto,
// idioma} e recebe o WAV pronto (ArrayBuffer transferível).
//
// Protocolo:
//   in : { type: "synth", id, text, lang }
//   out: { type: "ready" }                    (modelo carregado)
//        { type: "result", id, buffer, durationMs }
//        { type: "error",  id, error }
// ══════════════════════════════════════════════════════════════
import { env, pipeline, type TextToAudioPipeline } from "@huggingface/transformers";

// Tudo do CDN público do HuggingFace — nada de arquivos locais
// (evita 404 no GitHub Pages) e nada de chave.
env.allowLocalModels = false;

// Só o francês tem modelo natural FEMININO. O mms-tts-por (português) tem
// voz masculina — não é usado; português fala na voz feminina do aparelho.
const FR_MODEL = "Xenova/mms-tts-fra";

function langToModel(lang: string): string | null {
  const prefix = lang.toLowerCase().slice(0, 2);
  if (prefix === "fr") return FR_MODEL;
  return null;
}

// Pipelines em cache por modelo (uma vez carregados, ficam em memória).
const pipes = new Map<string, TextToAudioPipeline>();
const loaders = new Map<string, Promise<TextToAudioPipeline>>();
let postedReady = false;

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

function post(msg: unknown, transfer?: Transferable[]) {
  (self as unknown as { postMessage: (m: unknown, t?: Transferable[]) => void }).postMessage(msg, transfer);
}

/** Converte PCM (Float32) em um arquivo WAV (PCM 16-bit mono). */
function floatToWav(audio: Float32Array, sampleRate: number): ArrayBuffer {
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
  return buffer;
}

(self as unknown as Worker).onmessage = async (e: MessageEvent<{ type: string; id: number; text: string; lang: string }>) => {
  const { type, id, text, lang } = e.data;
  if (type !== "synth") return;
  try {
    const model = langToModel(lang);
    if (!model) throw new Error("no_model");
    const synth = await getSynth(model);
    if (!postedReady) {
      postedReady = true;
      post({ type: "ready" });
    }
    const out = (await synth(text)) as { audio?: Float32Array; sampling_rate?: number };
    const audio = out?.audio;
    const sampleRate = out?.sampling_rate ?? 16000;
    if (!audio || audio.length === 0) throw new Error("empty_audio");
    const buffer = floatToWav(audio, sampleRate);
    post({ type: "result", id, buffer, durationMs: (audio.length / sampleRate) * 1000 }, [buffer]);
  } catch (err) {
    post({ type: "error", id, error: err instanceof Error ? err.message : "worker_error" });
  }
};
