// ══════════════════════════════════════════════════════════════
// Athenas — Fala: síntese + reconhecimento
//
// 🎀 VOZ DA LULU (regra única em todo o app, SEM configuração):
//   Dois modelos Piper FEMININOS, cada um no seu idioma:
//     1. FRANCÊS → siwis (Piper VITS, fr_FR, ≈60 MB)
//     2. PORTUGUÊS → Dii (Piper VITS, pt_BR, ≈63 MB)
//   Texto MISTO (ex: "bonjour, tudo bem?") é splitado por frase,
//   cada trecho fala com a voz do idioma correto, e os áudios
//   são concatenados em sequência.
//   Os modelos ficam no PRÓPRIO SITE (download confiável) e
//   depois ficam no cache do navegador (funcionam OFFLINE).
//   Se o modelo falhar, fica em SILÊNCIO — NUNCA voz genérica.
// ══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo } from "react";
import { isPiperReady, piperWarmup, synthesizePiper, type PiperVoice } from "@/services/piperVoice";
import { cleanForSpeech } from "@/services/speechClean";

export interface SpeechResult {
  supported: boolean;
  /**
   * Fala o texto com voz FEMININA (Piper: siwis em francês, Dii em
   * português). O botão pulsa enquanto o modelo carrega; se falhar,
   * silêncio — NUNCA voz genérica (Google/navegador).
   * `lang` força um idioma.
   */
  speak: (text: string, opts?: { rate?: number; lang?: string; onEnd?: () => void }) => boolean;
  stop: () => void;
  /** Escuta o usuário e devolve a transcrição. Retorna false se o navegador não suportar. */
  listen: (opts: { onResult: (transcript: string) => void; onError?: (code: string) => void; lang?: string }) => boolean;
  /** true se o navegador suportar reconhecimento de fala. */
  canListen: boolean;
}

type SpeechRecogAlt = { transcript: string; confidence?: number };
type SpeechRecogResult = ArrayLike<SpeechRecogAlt> & { isFinal?: boolean };

interface SpeechRecogLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<SpeechRecogResult> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SRCtor = new () => SpeechRecogLike;

function getRecognitionCtor(): SRCtor | null {
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ── Detecção de idioma (francês x português) ─────────────────
const PT_WORDS = [
  "não", "você", "vocês", "está", "estão", "são", "sou", "uma", "para", "muito",
  "obrigad", "olá", "então", "vamos", "nós", "eles", "elas", "tudo bem", "bom dia",
  "boa noite", "por favor", "porque", "até", "quer", "tenho", "comigo", "aqui",
  "também", "ainda", "depois", "sempre", "nunca", "hoje", "amanhã"
];

const FR_WORDS = [
  "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "est", "sont", "une",
  "des", "les", "très", "bonjour", "merci", "comment", "pourquoi", "alors",
  "beaucoup", "bien", "pas", "oui", "non", "avec", "sur", "c'est", "qu'est"
];

/** Detecta se o texto é francês ou português (heurística por marcadores). */
export function detectLang(text: string): "pt-BR" | "fr-FR" {
  const t = ` ${text.trim().toLowerCase()} `;
  let pt = /[ãõ]/.test(t) ? 2 : 0;
  let fr = /[œûî]/.test(t) ? 2 : 0;

  for (const w of PT_WORDS) {
    if (t.includes(` ${w} `) || t.includes(` ${w},`) || t.includes(` ${w}.`) || t.includes(` ${w}!`) || t.includes(` ${w}?`)) pt += 1;
  }
  for (const w of FR_WORDS) {
    if (t.includes(` ${w} `) || t.includes(` ${w},`) || t.includes(` ${w}.`) || t.includes(` ${w}!`) || t.includes(` ${w}?`) || t.endsWith(` ${w}`)) fr += 1;
  }

  if (pt === 0 && fr === 0) {
    // Sem pistas fortes, o contexto do Athenas é o francês (palavras soltas
    // como "salut", "merci" ou "café" são francês). Português costuma ter
    // marcadores fortes (ã, õ, você, não…).
    return "fr-FR";
  }
  return pt >= fr ? "pt-BR" : "fr-FR";
}

// ── Áudio em reprodução ──────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null;

// Token anti-duplicação: o clique mais recente vence — um toque rápido
// por cima do outro não sobrepõe áudio (o resultado antigo é descartado).
let naturalToken = 0;

// ── Tempo de espera POR DISPOSITIVO ───────────────────────────
// A síntese roda em WASM de thread única: no DESKTOP leva 3-7s; no
// CELULAR (mesmo modelo) leva 20-40s+ — o timeout curto de 30s cortava
// a fala no meio e o app ficava em silêncio exatamente no celular.
// Por isso o celular ganha timeouts bem mais generosos.
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone|Silk/i.test(ua)) return true;
  const data = (navigator as { userAgentData?: { mobile?: boolean } }).userAgentData;
  return data?.mobile === true;
}
const IS_MOBILE = isMobileDevice();

// Síntese com modelo já quente (sem download).
const SYNTH_TIMEOUT_MS = IS_MOBILE ? 150000 : 45000;
// Espera do modelo terminar de baixar (warm-up).
const WARMUP_TIMEOUT_MS = IS_MOBILE ? 420000 : 240000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(t);
        reject(e);
      }
    );
  });
}

/** Toca um blob de áudio e avisa quando terminar. */
function playAudioBlob(blob: Blob, onEnd?: () => void) {
  const objectUrl = URL.createObjectURL(blob);
  const audio = new Audio(objectUrl);
  currentAudio = audio;
  const cleanup = () => {
    if (currentAudio === audio) currentAudio = null;
    URL.revokeObjectURL(objectUrl);
  };
  audio.onended = () => {
    cleanup();
    onEnd?.();
  };
  audio.onerror = () => {
    cleanup();
    onEnd?.();
  };
  audio.play().catch(() => {
    cleanup();
    onEnd?.();
  });
}

/**
 * Mapeia idioma detectado → voz Piper.
 * Francês → siwis, Português → Dii.
 */
export function langToPiperVoice(lang: string): PiperVoice {
  return lang.toLowerCase().startsWith("pt") ? "dii" : "siwis";
}

// ── Texto misto (FR + PT) ────────────────────────────────────
// Separa o texto em trechos por idioma, para cada trecho falar
// com a voz correta. Ex: "bonjour, tudo bem?" →
//   [{ text: "bonjour,", lang: "fr" }, { text: "tudo bem?", lang: "pt" }]
function splitByLanguage(text: string): Array<{ text: string; voice: PiperVoice }> {
  // Divide por pontuação (frases) — preserva o delimitador.
  const parts = text.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (parts.length <= 1) {
    // Texto curto ou sem pontuação: detecta o idioma inteiro.
    const lang = detectLang(text);
    return [{ text, voice: langToPiperVoice(lang) }];
  }
  return parts.map((p) => ({
    text: p,
    voice: langToPiperVoice(detectLang(p))
  }));
}

// ── Concatenação de WAV ───────────────────────────────────────
/** Converte um Blob WAV em Float32Array + sampleRate. */
async function wavToFloat32(blob: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const buf = await blob.arrayBuffer();
  const view = new DataView(buf);
  // Cabeçalho WAV padrão: sampleRate em offset 24, dados em offset 44.
  const sampleRate = view.getUint32(24, true);
  const dataLen = view.getUint32(40, true);
  const numSamples = Math.floor(dataLen / 2); // 16-bit mono
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    samples[i] = view.getInt16(44 + i * 2, true) / 32768;
  }
  return { samples, sampleRate };
}

/** Converte Float32Array em Blob WAV (16-bit mono). */
function float32ToWavBlob(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

/** Junta vários blobs WAV em um único blob (resample todos para a mesma taxa). */
async function concatWavBlobs(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 0) throw new Error("no_blobs");
  if (blobs.length === 1) return blobs[0];
  const parts = await Promise.all(blobs.map(wavToFloat32));
  // Resample todos para a taxa do primeiro blob.
  const targetRate = parts[0].sampleRate;
  const allSamples: Float32Array[] = [];
  for (const p of parts) {
    if (p.sampleRate === targetRate) {
      allSamples.push(p.samples);
    } else {
      // Resample simples (linear) — suficiente para voz.
      const ratio = targetRate / p.sampleRate;
      const newLen = Math.floor(p.samples.length * ratio);
      const resampled = new Float32Array(newLen);
      for (let i = 0; i < newLen; i++) {
        const srcIdx = i / ratio;
        const idx = Math.floor(srcIdx);
        const frac = srcIdx - idx;
        resampled[i] = idx + 1 < p.samples.length
          ? p.samples[idx] * (1 - frac) + p.samples[idx + 1] * frac
          : p.samples[idx] ?? 0;
      }
      allSamples.push(resampled);
    }
  }
  // Concatena com uma pausa curta (100ms de silêncio) entre idiomas.
  const pause = new Float32Array(Math.floor(targetRate * 0.1)); // 100ms
  const total = allSamples.reduce((sum, s) => sum + s.length + pause.length, -pause.length);
  const merged = new Float32Array(total);
  let offset = 0;
  for (let i = 0; i < allSamples.length; i++) {
    merged.set(allSamples[i], offset);
    offset += allSamples[i].length;
    if (i < allSamples.length - 1) {
      merged.set(pause, offset);
      offset += pause.length;
    }
  }
  return float32ToWavBlob(merged, targetRate);
}

/**
 * Fala AGORA com a voz Piper — modelo já quente.
 * Suporta texto MISTO: splita por idioma, sintetiza cada trecho
 * com a voz correta, concatena e toca.
 */
async function speakPiperFast(text: string, opts?: SpeakOpts) {
  const token = ++naturalToken;
  try {
    const segments = splitByLanguage(text);
    let blob: Blob;
    if (segments.length === 1) {
      blob = await withTimeout(synthesizePiper(segments[0].text, segments[0].voice), SYNTH_TIMEOUT_MS);
    } else {
      const blobs = await Promise.all(
        segments.map((s) => withTimeout(synthesizePiper(s.text, s.voice), SYNTH_TIMEOUT_MS))
      );
      blob = await concatWavBlobs(blobs);
    }
    if (token !== naturalToken) return;
    playAudioBlob(blob, opts?.onEnd);
  } catch {
    if (token !== naturalToken) return;
    console.info("[Athenas-voz] síntese Piper falhou — silêncio (nunca a voz genérica)");
    opts?.onEnd?.();
  }
}

/**
 * ESPERA pela voz Piper e fala com ela — o botão pulsa enquanto
 * o modelo baixa na 1ª vez. Suporta texto MISTO.
 */
async function speakWhenPiperReady(text: string, opts?: SpeakOpts) {
  const token = ++naturalToken;
  try {
    // Warmup ambos os modelos (siwis e Dii) — o primeiro que precisar
    // já vai estar quente; o outro baixa em paralelo se necessário.
    await withTimeout(
      Promise.all([piperWarmup("siwis"), piperWarmup("dii")]),
      WARMUP_TIMEOUT_MS
    );
    if (token !== naturalToken) return;
    // Agora sintetiza (o modelo já está quente).
    const segments = splitByLanguage(text);
    let blob: Blob;
    if (segments.length === 1) {
      blob = await withTimeout(synthesizePiper(segments[0].text, segments[0].voice), SYNTH_TIMEOUT_MS);
    } else {
      const blobs = await Promise.all(
        segments.map((s) => withTimeout(synthesizePiper(s.text, s.voice), SYNTH_TIMEOUT_MS))
      );
      blob = await concatWavBlobs(blobs);
    }
    if (token !== naturalToken) return;
    playAudioBlob(blob, opts?.onEnd);
  } catch (err) {
    if (token !== naturalToken) return;
    console.info("[Athenas-voz] voz Piper não ficou pronta — silêncio (nunca a voz genérica)", err instanceof Error ? err.message : "");
    opts?.onEnd?.();
  }
}

/**
 * Fala com UMA voz específica (sem split de idioma) — usado
 * quando lang é forçado pelo caller.
 */
async function speakSingleVoice(text: string, voice: PiperVoice, opts?: SpeakOpts) {
  const token = ++naturalToken;
  try {
    const blob = await withTimeout(synthesizePiper(text, voice), SYNTH_TIMEOUT_MS);
    if (token !== naturalToken) return;
    playAudioBlob(blob, opts?.onEnd);
  } catch {
    if (token !== naturalToken) return;
    console.info(`[Athenas-voz] síntese ${voice} falhou — silêncio`);
    opts?.onEnd?.();
  }
}

/**
 * ESPERA pela voz Piper e fala com UMA voz específica — usado
 * quando lang é forçado pelo caller.
 */
async function speakSingleVoiceWhenReady(text: string, voice: PiperVoice, opts?: SpeakOpts) {
  const token = ++naturalToken;
  try {
    await withTimeout(piperWarmup(voice), WARMUP_TIMEOUT_MS);
    if (token !== naturalToken) return;
    const blob = await withTimeout(synthesizePiper(text, voice), SYNTH_TIMEOUT_MS);
    if (token !== naturalToken) return;
    playAudioBlob(blob, opts?.onEnd);
  } catch (err) {
    if (token !== naturalToken) return;
    console.info(`[Athenas-voz] voz ${voice} não ficou pronta — silêncio`, err instanceof Error ? err.message : "");
    opts?.onEnd?.();
  }
}

interface SpeakOpts {
  rate?: number;
  lang?: string;
  onEnd?: () => void;
}

export function useSpeech(): SpeechResult {
  // O app reproduz com <audio> (blob da voz natural) — não depende da
  // Web Speech API (que só era usada pela voz feia de navegador).
  const supported = typeof window !== "undefined" && "Audio" in window;
  const canListen = typeof window !== "undefined" && getRecognitionCtor() !== null;

  useEffect(() => {
    if (!supported) return;
    // 🎀 PRÉ-CARGA dos modelos Piper: começa a baixar/carregar AMBOS
    // (siwis + Dii) assim que o app abre (em worker, sem travar a tela).
    // Assim a primeira fala do usuário já tem voz disponível (o botão
    // pulsa até ficar pronto). Depois da 1ª vez, ficam no cache do
    // navegador e funcionam OFFLINE.
    const pre = setTimeout(() => {
      Promise.all([
        piperWarmup("siwis").catch(() => {}),
        piperWarmup("dii").catch(() => {})
      ]);
    }, 2000);
    return () => clearTimeout(pre);
  }, [supported]);

  const speak = useCallback(
    (text: string, opts?: SpeakOpts) => {
      if (!supported) return false;
      // A voz nunca deve ler formatação (**, *, _, #, `) nem descrever
      // emojis — limpa o texto antes de falar (mantém apóstrofos e
      // hífens do francês). Se sobrar nada (só emojis), não fala.
      const cleaned = cleanForSpeech(text);
      if (!cleaned) {
        opts?.onEnd?.();
        return true;
      }
      // Se lang for forçado, sintetiza tudo com uma voz (sem split).
      if (opts?.lang) {
        const forcedVoice: PiperVoice = langToPiperVoice(opts.lang);
        if (isPiperReady()) {
          stop();
          speakSingleVoice(cleaned, forcedVoice, opts);
        } else {
          speakSingleVoiceWhenReady(cleaned, forcedVoice, opts);
        }
        return true;
      }

      // 1. Modelo Piper JÁ pronto → fala agora com split de idioma
      //    (stop() interrompe qualquer fala anterior — nunca sobrepõe).
      if (isPiperReady()) {
        stop();
        speakPiperFast(cleaned, opts);
        return true;
      }

      // 2. Modelo ainda carregando → ESPERA (o botão pulsa) e fala
      //    com a voz feminina assim que pronta.
      speakWhenPiperReady(cleaned, opts);
      return true;
    },
    [supported]
  );

  const stop = useCallback(() => {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch {
        // ignore
      }
      currentAudio = null;
    }
  }, [supported]);

  const listen = useCallback(
    (opts: { onResult: (transcript: string) => void; onError?: (code: string) => void; lang?: string }) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return false;
      const rec = new Ctor();
      rec.lang = opts.lang ?? "fr-FR";
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.continuous = false;

      // Antes, qualquer resultado era aceito — o microfone pegava ruído de
      // fundo, a própria voz do celular tocando a frase, e até frases que o
      // usuário não disse. Agora: só resultados FINAIS, com texto de verdade
      // e (quando o motor informa) confiança mínima. Sem nada útil em ~9s,
      // reporta "no-speech" em vez de inventar uma frase.
      const CONFIDENCE_MIN = 0.2;
      let accepted: { text: string; confidence: number } | null = null;
      let done = false;

      const finish = (text: string | null) => {
        if (done) return;
        done = true;
        window.clearTimeout(guard);
        try {
          rec.stop();
        } catch {
          // já parou
        }
        if (text) opts.onResult(text);
        else opts.onError?.("no-speech");
      };

      rec.onresult = (e) => {
        for (let i = 0; i < e.results.length; i++) {
          const res = e.results[i];
          if (!res.isFinal) continue; // só resultado final (nada de palavra solta)
          const alt = res[0];
          const raw = alt?.transcript ?? "";
          const text = raw.trim().replace(/[.,!?;:…]+$/, "").trim();
          if (!text) continue; // silêncio ou só pontuação — ignora
          const confidence = typeof alt?.confidence === "number" ? alt.confidence : -1;
          // Confiança real e baixa = ruído/frase que o usuário não disse.
          // (confiança 0/ausente é o Chrome — não tem como distinguir, aceita.)
          if (confidence > 0 && confidence < CONFIDENCE_MIN) continue;
          if (!accepted || confidence > accepted.confidence) accepted = { text, confidence };
        }
        if (accepted) finish(accepted.text);
      };

      rec.onerror = (e) => {
        if (done) return;
        const code = e.error ?? "error";
        if (code === "not-allowed" || code === "service-not-allowed") {
          done = true;
          window.clearTimeout(guard);
          opts.onError?.(code);
          return;
        }
        // no-speech / aborted / audio-capture / network: sem frase útil
        finish(accepted?.text ?? null);
      };

      rec.onend = () => {
        if (done) return;
        finish(accepted?.text ?? null);
      };

      // Rede de segurança: não fica preso em "ouvindo…" para sempre.
      const guard = window.setTimeout(() => finish(accepted?.text ?? null), 9000);

      rec.start();
      return true;
    },
    []
  );

  return useMemo(
    () => ({ supported, speak, stop, listen, canListen }),
    [supported, speak, stop, listen, canListen]
  );
}
