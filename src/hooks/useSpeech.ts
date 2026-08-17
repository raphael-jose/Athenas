// ══════════════════════════════════════════════════════════════
// Athenas — Fala: síntese + reconhecimento
//
// 🎀 VOZ DA LULU (regra única em todo o app, SEM configuração):
//   SÓ existem DUAS vozes, ambas NATURAIS e FEMININAS do HuggingFace:
//     1. FRANCÊS → mms-tts-fra (≈36 MB, cacheado, funciona até offline)
//     2. PORTUGUÊS → Dii (Piper pt-BR, ≈63 MB)
//   Enquanto o modelo não está pronto, o botão PULSA esperando; quando
//   pronto, fala com a voz natural. Se o modelo falhar de verdade, fica
//   em SILÊNCIO — NUNCA a voz genérica (nem Google, nem navegador) e
//   NUNCA voz masculina, em lugar nenhum do projeto.
//
// Detecção de idioma: texto em francês → voz fr-FR; texto em
// português → voz pt-BR. Cada um na sua língua, sem sotaque
// cruzado.
// ══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo } from "react";
import { isNaturalReady, langToModel, synthesizeNaturalVoice } from "@/services/naturalVoice";
import { isPiperReady, piperWarmup, synthesizePiper } from "@/services/piperVoice";
import { cleanForSpeech } from "@/services/speechClean";

export interface SpeechResult {
  supported: boolean;
  /**
   * Fala o texto com voz FEMININA NATURAL (HuggingFace: mms-tts-fra em
   * francês, Piper Dii em português). O botão pulsa enquanto o modelo
   * carrega; se falhar, silêncio — NUNCA voz genérica (Google/navegador).
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

// ── Voz natural (HuggingFace no navegador) ────────────────────
// Áudio natural em reprodução (para o stop() silenciar de qualquer tela).
let currentAudio: HTMLAudioElement | null = null;

// Token anti-duplicação: o clique mais recente vence — um toque rápido
// por cima do outro não sobrepõe áudio (o resultado antigo é descartado).
let naturalToken = 0;

// Primeira fala baixa o modelo (≈36 MB) — dá tempo; depois é rápido.
const NATURAL_FIRST_TIMEOUT_MS = 45000;
// Síntese com modelo quente: em WASM no navegador a inferência pode
// levar 10-20s em desktop e 20-30s em celular mesmo em frases curtas —
// o timeout curto demais cortava a fala bem na hora e caía no fallback
// silencioso ("botão morto").
const NATURAL_FAST_TIMEOUT_MS = 30000;

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
 * Tenta a voz natural (HuggingFace); se a síntese falhar, fica em
 * silêncio — NUNCA cai na voz genérica (Google/navegador).
 */
async function speakNatural(text: string, lang: string, opts?: SpeakOpts) {
  const token = ++naturalToken;
  const timeoutMs = isNaturalReady() ? NATURAL_FAST_TIMEOUT_MS : NATURAL_FIRST_TIMEOUT_MS;
  try {
    const audio = await withTimeout(synthesizeNaturalVoice(text, lang), timeoutMs);
    // outra fala assumiu — não duplica áudio
    if (token !== naturalToken) return;
    playAudioBlob(audio.blob, opts?.onEnd);
  } catch {
    if (token !== naturalToken) return;
    console.info("[Athenas-voz] síntese natural falhou — silêncio (nunca a voz genérica)");
    opts?.onEnd?.();
  }
}

// ── Warm-up da voz natural (junto com o 1º áudio tocado) ───────
// O carregamento do modelo do HuggingFace roda em worker (não trava a
// tela). Enquanto o modelo não está pronto, o botão PULSA esperando;
// quando pronto, fala com a voz natural. Nunca a do navegador.
let warmupPromise: Promise<void> | null = null;

/**
 * Inicia o carregamento do modelo em background (uma vez por sessão,
 * e de novo após uma falha — o worker retenta o download). Devolve a
 * promise do aquecimento (resolve quando o modelo + 1ª síntese
 * terminam).
 */
function kickOffNaturalWarmup(): Promise<void> {
  if (warmupPromise) return warmupPromise;
  if (isNaturalReady()) return Promise.resolve();
  warmupPromise = synthesizeNaturalVoice("bonjour", "fr-FR")
    .then(() => undefined)
    .catch(() => {
      // falha real (rede bloqueada/CDN fora): permite retentar no próximo toque
      warmupPromise = null;
    });
  return warmupPromise;
}

/**
 * ESPERA pela voz do HuggingFace (francês) e fala com ela — o botão
 * pulsa enquanto o modelo baixa/carrega (1ª vez ≈ 36 MB; depois fica
 * em cache e é rápido). Se o modelo FALHAR de verdade, fica em
 * silêncio — NUNCA a voz genérica (Google/navegador).
 */
async function speakWhenNaturalReady(text: string, lang: string, opts?: SpeakOpts) {
  const token = ++naturalToken;
  try {
    await withTimeout(kickOffNaturalWarmup(), 120000);
    if (token !== naturalToken) return;
    const audio = await withTimeout(synthesizeNaturalVoice(text, lang), NATURAL_FIRST_TIMEOUT_MS);
    if (token !== naturalToken) return;
    playAudioBlob(audio.blob, opts?.onEnd);
  } catch (err) {
    if (token !== naturalToken) return;
    console.info("[Athenas-voz] voz natural não ficou pronta — silêncio (nunca a voz genérica)", err instanceof Error ? err.message : "");
    opts?.onEnd?.();
  }
}

/**
 * Fala AGORA com a voz Dii (Piper pt-BR feminina, HuggingFace) — modelo
 * já quente. Se a síntese falhar, fica em silêncio — nunca genérica.
 */
async function speakPiperFast(text: string, opts?: SpeakOpts) {
  const token = ++naturalToken;
  try {
    const blob = await withTimeout(synthesizePiper(text), 45000);
    if (token !== naturalToken) return;
    playAudioBlob(blob, opts?.onEnd);
  } catch {
    if (token !== naturalToken) return;
    console.info("[Athenas-voz] síntese Dii falhou — silêncio (nunca a voz genérica)");
    opts?.onEnd?.();
  }
}

/**
 * ESPERA pela voz Dii (Piper pt-BR) e fala com ela — o botão pulsa
 * enquanto o modelo baixa na 1ª vez (runtime + modelo ≈ 170 MB; depois
 * fica em cache e é rápido). Se a Dii FALHAR de verdade, fica em
 * silêncio — NUNCA a voz genérica (Google/navegador).
 */
async function speakWhenPiperReady(text: string, opts?: SpeakOpts) {
  const token = ++naturalToken;
  try {
    await withTimeout(piperWarmup(), 240000);
    if (token !== naturalToken) return;
    const blob = await withTimeout(synthesizePiper(text), 45000);
    if (token !== naturalToken) return;
    playAudioBlob(blob, opts?.onEnd);
  } catch (err) {
    if (token !== naturalToken) return;
    console.info("[Athenas-voz] voz Dii não ficou pronta — silêncio (nunca a voz genérica)", err instanceof Error ? err.message : "");
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
    // 🎀 PRÉ-CARGA da voz do HuggingFace: começa a baixar/carregar o
    // modelo assim que o app abre (em worker, sem travar a tela). Assim
    // a primeira fala do usuário já é a voz natural do HuggingFace (o
    // botão pulsa até ela ficar pronta).
    const pre = setTimeout(() => {
      kickOffNaturalWarmup();
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
      const lang = opts?.lang ?? detectLang(cleaned);
      const hasNatural = langToModel(lang) !== null;
      const isPt = lang.toLowerCase().slice(0, 2) === "pt";

      // 1. FRANCÊS: modelo HuggingFace JÁ pronto → fala agora
      //    (stop() interrompe qualquer fala anterior — nunca sobrepõe).
      if (hasNatural && isNaturalReady()) {
        stop();
        speakNatural(cleaned, lang, opts);
        return true;
      }

      // 2. PORTUGUÊS: voz Dii (Piper) JÁ pronta → fala agora
      //    (stop() interrompe qualquer fala anterior).
      if (isPt && isPiperReady()) {
        stop();
        speakPiperFast(cleaned, opts);
        return true;
      }

      // 3. Modelo ainda carregando → ESPERA (o botão pulsa) e fala com
      //    a voz natural assim que pronta. NUNCA a voz genérica — nem a
      //    do Google, nem a do navegador.
      if (hasNatural) {
        kickOffNaturalWarmup();
        speakWhenNaturalReady(cleaned, lang, opts);
        return true;
      }
      if (isPt) {
        void piperWarmup();
        speakWhenPiperReady(cleaned, opts);
        return true;
      }

      // 4. Sem voz natural no idioma → silêncio (melhor que voz genérica).
      console.info(`[Athenas-voz] sem voz natural em ${lang} — silêncio`);
      opts?.onEnd?.();
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
