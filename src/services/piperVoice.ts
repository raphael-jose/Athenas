// ══════════════════════════════════════════════════════════════
// Athenas — Voz Piper da Lulu (femimina, sem chave)
//
// Cliente do worker (piperVoice.worker.ts): o main-thread só posta o
// texto e recebe o WAV pronto. O worker é criado SOB DEMANDA — as vozes
// (runtime + modelos ≈ 100 MB cada) são baixadas sob demanda.
//
// Vozes disponíveis:
//   "dii"   → pt-BR (Dii, Piper VITS)
//   "siwis" → fr-FR (siwis, Piper VITS)
// ══════════════════════════════════════════════════════════════

export type PiperVoice = "dii" | "siwis";

let worker: Worker | null = null;
let workerReady = false; // modelo(s) carregado(s) e 1ª síntese concluída
let seq = 0;

type Pending = { resolve: (b: Blob) => void; reject: (e: Error) => void };
const pending = new Map<number, Pending>();

/** Raiz do site (ex.: https://user.github.io/Athenas/) para os assets. */
function siteBaseUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

function getWorker(): Worker | null {
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./piperVoice.worker.ts", import.meta.url), { type: "module" });
  } catch {
    return null;
  }
  worker.onmessage = (e: MessageEvent<{ type: string; id?: number; blob?: Blob; durationMs?: number; error?: string }>) => {
    const msg = e.data;
    if (msg.type === "ready") {
      workerReady = true;
      return;
    }
    if (msg.id === undefined) return;
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    if (msg.type === "result" && msg.blob) {
      workerReady = true;
      p.resolve(msg.blob);
    } else {
      p.reject(new Error(msg.error ?? "piper_error"));
    }
  };
  worker.onerror = () => {
    workerReady = false;
    worker = null;
    // Se o worker caiu (memória/rede), o warmup antigo é inválido —
    // zera para o próximo pedido baixar o modelo de novo. Antes, a
    // promise já resolvida voltava na hora e a síntese seguinte
    // falhava/re-baixava 63 MB sem necessidade.
    warmupPromises.clear();
    for (const [, p] of pending) p.reject(new Error("piper_crash"));
    pending.clear();
  };
  worker.postMessage({ type: "init", baseUrl: siteBaseUrl() });
  return worker;
}

/** true quando a voz Dii já está pronta (síntese rápida). */
export function isPiperReady(): boolean {
  return workerReady;
}

// Warmup separado por voz — cada modelo precisa ser baixado e
// carregado individualmente na sessão ONNX do engine Piper.
const warmupPromises = new Map<PiperVoice, Promise<void>>();

/**
 * Espera (ou inicia) o carregamento de UMA voz Piper — baixa o modelo
 * e faz uma síntese curta para aquecer o engine. Resolve quando pronto;
 * rejeita se falhar. Cada voz tem seu próprio warmup (não se sobrepõe).
 * @param voice "dii" para português, "siwis" para francês
 */
export function piperWarmup(voice: PiperVoice = "dii"): Promise<void> {
  const existing = warmupPromises.get(voice);
  if (existing) return existing;
  const warmText = voice === "siwis" ? "bonjour" : "olá";
  const p = synthesizePiper(warmText, voice)
    .then(() => {
      workerReady = true;
    })
    .catch(() => {
      warmupPromises.delete(voice);
      throw new Error(`piper_warmup_failed_${voice}`);
    });
  warmupPromises.set(voice, p);
  return p;
}

/**
 * Sintetiza o texto na voz Piper (femimina). Rejeita se o worker
 * não estiver disponível ou a síntese falhar — o chamador fica em
 * silêncio (nunca voz genérica) e tenta de novo no próximo toque.
 * @param voice "dii" para português, "siwis" para francês
 */
export function synthesizePiper(text: string, voice: PiperVoice = "dii"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    if (!w) {
      reject(new Error("piper_unavailable"));
      return;
    }
    const id = ++seq;
    pending.set(id, { resolve, reject });
    w.postMessage({ type: "synth", id, text, voice });
  });
}
