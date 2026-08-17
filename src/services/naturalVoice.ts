// ══════════════════════════════════════════════════════════════
// Athenas — Voz natural da Lulu (TTS no navegador, grátis)
//
// Roda modelos de voz abertos do HuggingFace (Xenova/mms-tts) direto
// no navegador via transformers.js — SEM chave, SEM servidor e SEM
// configuração. O modelo (≈36 MB) é baixado uma vez do CDN público do
// HuggingFace e fica no cache do navegador; depois disso, funciona até
// offline.
//
// 🎀 Tudo roda em um WEB WORKER (naturalVoice.worker.ts): carregar o
// modelo e sintetizar nunca congelam a interface — a thread principal
// só posta o texto e recebe o WAV pronto.
//
// 🎀 Voz feminina por idioma:
//   francês → Xenova/mms-tts-fra (voz FEMININA natural de francês)
//   português → NÃO tem modelo natural feminino compatível aqui: o
//     Xenova/mms-tts-por tem voz MASCULINA (confirmado em
//     huggingface.co/Xenova/mms-tts-por e transformers.js #547), então
//     o app NÃO o usa — português fala na voz FEMININA do aparelho
//     (Google/Microsoft pt-BR), com a regra estrita de nunca masculina.
//
// Se algo falhar (sem internet, CDN fora do ar, navegador sem suporte),
// o app cai automaticamente na melhor voz feminina do dispositivo.
// ══════════════════════════════════════════════════════════════

export const FR_MODEL = "Xenova/mms-tts-fra";

/**
 * Modelo de voz natural para o idioma (null = sem voz natural disponível).
 * Só devolve modelo quando a voz é FEMININA — o mms-tts-por (português)
 * é masculino, então português fica com a voz feminina do aparelho.
 */
export function langToModel(lang: string): string | null {
  const prefix = lang.toLowerCase().slice(0, 2);
  if (prefix === "fr") return FR_MODEL;
  return null;
}

export interface NaturalAudio {
  blob: Blob;
  durationMs: number;
}

// ── Cliente do worker ─────────────────────────────────────────
let worker: Worker | null = null;
let workerReady = false; // modelo já carregado em memória (síntese rápida)
let workerBroken = false; // worker indisponível (CSP/erro) → usa sempre o fallback
let seq = 0;

type Pending = { resolve: (a: NaturalAudio) => void; reject: (e: Error) => void };
const pending = new Map<number, Pending>();

function getWorker(): Worker | null {
  if (worker) return worker;
  if (workerBroken) return null;
  try {
    worker = new Worker(new URL("./naturalVoice.worker.ts", import.meta.url), { type: "module" });
  } catch {
    workerBroken = true;
    return null;
  }
  worker.onmessage = (e: MessageEvent<{ type: string; id?: number; buffer?: ArrayBuffer; durationMs?: number; error?: string }>) => {
    const msg = e.data;
    if (msg.type === "ready") {
      workerReady = true;
      return;
    }
    if (msg.id === undefined) return;
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    if (msg.type === "result" && msg.buffer) {
      p.resolve({ blob: new Blob([msg.buffer], { type: "audio/wav" }), durationMs: msg.durationMs ?? 0 });
    } else {
      p.reject(new Error(msg.error ?? "worker_error"));
    }
  };
  worker.onerror = () => {
    // O worker caiu: devolve erro a tudo que está pendente e passa a
    // usar o fallback (voz do aparelho) pelo resto da sessão.
    workerReady = false;
    worker = null;
    workerBroken = true;
    for (const [, p] of pending) p.reject(new Error("worker_crash"));
    pending.clear();
  };
  return worker;
}

/** true quando o modelo já está pronto em memória (síntese rápida). */
export function isNaturalReady(): boolean {
  return workerReady;
}

/**
 * Sintetiza o texto na voz natural do idioma, rodando no Web Worker
 * (a thread principal fica livre — sem travar). Devolve o WAV pronto
 * ou rejeita (aí o chamador cai na voz do aparelho).
 */
export function synthesizeNaturalVoice(text: string, lang: string): Promise<NaturalAudio> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    if (!w) {
      reject(new Error("worker_unavailable"));
      return;
    }
    const id = ++seq;
    pending.set(id, { resolve, reject });
    w.postMessage({ type: "synth", id, text, lang });
  });
}
