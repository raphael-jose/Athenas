// ══════════════════════════════════════════════════════════════
// Athenas — Voz pt-BR da Lulu (Piper "Dii", HuggingFace)
//
// Cliente do worker (piperVoice.worker.ts): o main-thread só posta o
// texto e recebe o WAV pronto. O worker é criado SOB DEMANDA — a voz
// Dii (runtime + modelo ≈ 110 MB) só é baixada quando o app realmente
// fala português pela primeira vez.
// ══════════════════════════════════════════════════════════════

let worker: Worker | null = null;
let workerReady = false; // modelo carregado e 1ª síntese concluída
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

let warmupPromise: Promise<void> | null = null;

/**
 * Espera (ou inicia) o carregamento da voz Dii — baixa o runtime e o
 * modelo na primeira vez e faz uma síntese curta para aquecer o engine.
 * Resolve quando pronta; rejeita se falhar (o chamador cai na voz do
 * aparelho). Re-tenta no próximo pedido após uma falha.
 */
export function piperWarmup(): Promise<void> {
  if (warmupPromise) return warmupPromise;
  if (workerReady) return Promise.resolve();
  warmupPromise = synthesizePiper("olá")
    .then(() => {
      workerReady = true;
    })
    .catch(() => {
      // falha real (rede bloqueada/CDN fora): permite retentar depois
      warmupPromise = null;
      throw new Error("piper_warmup_failed");
    });
  return warmupPromise;
}

/**
 * Sintetiza o texto na voz Dii (pt-BR, feminina). Rejeita se o worker
 * não estiver disponível ou a síntese falhar — o chamador cai na voz
 * feminina do aparelho.
 */
export function synthesizePiper(text: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    if (!w) {
      reject(new Error("piper_unavailable"));
      return;
    }
    const id = ++seq;
    pending.set(id, { resolve, reject });
    w.postMessage({ type: "synth", id, text });
  });
}
