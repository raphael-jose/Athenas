// ══════════════════════════════════════════════════════════════
// Athenas — Fala: síntese + reconhecimento
//
// 🎀 VOZ DA LULU (regra única em todo o app, SEM configuração):
//   1. VOZ NATURAL FEMININA — modelos abertos do HuggingFace rodando
//      no próprio navegador (transformers.js), grátis e sem chave.
//      O modelo (≈36 MB) é baixado uma vez do CDN público e fica no
//      cache — depois funciona até offline.
//   2. FALLBACK: a melhor voz FEMININA do dispositivo (Web Speech
//      API) — cache global + retry + seleção ESTRITA: só feminina.
//      Se o aparelho não tiver voz feminina no idioma, fica em
//      silêncio (a voz natural assume quando pronta) — NUNCA voz
//      masculina, em lugar nenhum do projeto.
//
// Detecção de idioma: texto em francês → voz fr-FR; texto em
// português → voz pt-BR. Cada um na sua língua, sem sotaque
// cruzado.
// ══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo } from "react";
import { isNaturalReady, langToModel, synthesizeNaturalVoice } from "@/services/naturalVoice";

export interface SpeechResult {
  supported: boolean;
  /**
   * Fala o texto com voz FEMININA NATURAL (HuggingFace no navegador)
   * ou, se falhar, com a melhor voz feminina do dispositivo.
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

// ── Seleção de voz FEMININA ──────────────────────────────────
// Nomes comuns de vozes femininas (Windows/Edge, Google/Android,
// Apple/macOS/iOS) — FR e PT-BR, com um bocado de inglês também
// (algumas plataformas só oferecem feminina em inglês).
const FEMALE_HINTS =
  /(julie|hortense|am[ée]lie|audrey|c[ée]cile|florence|louise|marie|maria|elise|claire|denise|jos[ée]phine|juliette|le?a|manon|ma[ée]va|charlotte|victorine|virginie|chantal|amelia|francisca|thalita|camila|brenda|fernanda|helena|vit[oó]ria|alice|laura|nathalie|emma|ava|bella|emily|hannah|isabella|isabela|karen|mia|natasha|olivia|paula|rebeca|samantha|sara|serena|sofia|susan|zira|joana|julia|gabriela|luciana|marcia|marta|nadia|nora|raquel|valentina|ana|lara|leila|lisa|liz|luana|monica|tessa|victoria|fiona|kate|moira|zoe|amber|jenny|hazel|heather|lily|nina|rosa|sonia|tina|uma|vanessa|vicki|google us english|google uk english female|google portugu[êe]s do brasil|google deutsch|female|feminin|woman|mulher|voz feminina|siri)/i;
const MALE_HINTS =
  /(thomas|antoine|michel|paul|pierre|lucas|daniel|davi|jorge|david|george|alexandre|antonio|f[áa]bio|luciano|joaquim|rogerio|rodrigo|yuri|samuel|thiago|luiz|fernando|carlos|marcos|pedro|miguel|rafael|gustavo|henrique|mark|michael|dylan|ryan|tristan|watson|ian|ken|jason|andy|edward|harry|jack|kyle|lee|noah|william|fred|alex|brian|christopher|eric|guy|james|john|oliver|rishi|google fran[çc]ais|male|masculin|homme|homem|voz masculina)/i;
const QUALITY_HINTS = /(google|microsoft|natural|neural|premium|enhanced|online|high|siri)/i;

/** true quando o nome indica claramente voz feminina. */
function isFemale(v: SpeechSynthesisVoice): boolean {
  return FEMALE_HINTS.test(v.name) && !MALE_HINTS.test(v.name);
}

function qualityScore(v: SpeechSynthesisVoice): number {
  let s = 0;
  if (QUALITY_HINTS.test(v.name)) s += 3;
  if (isFemale(v)) s += 1; // desempate entre femininas
  return s;
}

function bestOf(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice {
  return [...list].sort((a, b) => qualityScore(b) - qualityScore(a))[0];
}

/**
 * Escolhe a voz do idioma com REGRA ESTRITA: só FEMININA.
 * Se o dispositivo não tiver nenhuma voz feminina no idioma,
 * devolve null — o app fica em silêncio (ou usa a voz natural
 * do HuggingFace, que é feminina) em vez de cair em voz
 * masculina ou de gênero desconhecido.
 */
export function pickVoice(lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const prefix = lang.toLowerCase().slice(0, 2);
  const matches = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  if (matches.length === 0) return null;
  const females = matches.filter(isFemale);
  if (females.length === 0) return null;
  return bestOf(females);
}

// ── Voz natural (HuggingFace no navegador) ────────────────────
// Áudio natural em reprodução (para o stop() silenciar de qualquer tela).
let currentAudio: HTMLAudioElement | null = null;

// Proteção contra chamadas simultâneas (o pipeline sintetiza em série)
// e contra resultados atrasados após o fallback já ter falado.
let naturalBusy = false;
let naturalToken = 0;

// Primeira fala baixa o modelo (≈36 MB) — dá tempo; depois é rápido.
const NATURAL_FIRST_TIMEOUT_MS = 45000;
const NATURAL_FAST_TIMEOUT_MS = 12000;

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
 * Tenta a voz natural; se falhar ou demorar demais, fala com a
 * melhor voz feminina do dispositivo (sem duplicar o áudio).
 */
async function speakNatural(text: string, lang: string, opts?: SpeakOpts) {
  const token = ++naturalToken;
  let fellBack = false;
  const timeoutMs = isNaturalReady() ? NATURAL_FAST_TIMEOUT_MS : NATURAL_FIRST_TIMEOUT_MS;
  try {
    const audio = await withTimeout(synthesizeNaturalVoice(text, lang), timeoutMs);
    // outra fala assumiu ou o fallback já falou — não duplica áudio
    if (token !== naturalToken || fellBack) return;
    playAudioBlob(audio.blob, opts?.onEnd);
    return;
  } catch {
    if (token !== naturalToken) return;
  }
  fellBack = true;
  webSpeak(text, lang, opts);
}

// Cache global: as vozes chegam de forma assíncrona (voiceschanged).
// Todas as instâncias de useSpeech alimentam o mesmo cache, e o speak
// consulta o cache + getVoices() na hora — e, se ainda vazio, ESPERA
// pelas vozes antes de falar (nunca cai na voz padrão masculina).
let voiceCache: SpeechSynthesisVoice[] = [];

// ── Warm-up da voz natural (junto com o 1º áudio tocado) ───────
// O carregamento do modelo do HuggingFace (WASM) roda na thread
// principal e pode CONGELAR a interface por alguns segundos no
// celular. A regra é: enquanto o modelo não está pronto, falamos
// IMEDIATAMENTE com a melhor voz do aparelho (zero espera) e o
// modelo começa a carregar em background junto com esse primeiro
// áudio; quando estiver pronto, todas as falas seguintes usam a
// voz natural.
let warmupDone = false;

/**
 * Inicia o carregamento do modelo em background (uma vez por sessão).
 * A fala já saiu na voz do aparelho; quando o modelo ficar pronto,
 * as próximas falas usam a voz natural.
 */
function kickOffNaturalWarmup() {
  if (warmupDone || isNaturalReady()) return;
  warmupDone = true;
  // Carrega o francês (idioma principal do app). Se falhar (offline,
  // CDN bloqueado), simplesmente seguimos com a voz do aparelho.
  synthesizeNaturalVoice("bonjour", "fr-FR").catch(() => {});
}

function refreshCache(): SpeechSynthesisVoice[] {
  try {
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) voiceCache = list;
  } catch {
    // alguns navegadores lançam antes de a API estar pronta
  }
  return voiceCache;
}

interface SpeakOpts {
  rate?: number;
  lang?: string;
  onEnd?: () => void;
}

/**
 * Fala imediatamente com a voz feminina escolhida. Sem voz feminina
 * no idioma, fica em SILÊNCIO (nunca usa a voz padrão masculina do
 * navegador) e avisa o chamador pelo onEnd.
 */
function speakNow(text: string, lang: string, voice: SpeechSynthesisVoice | null, opts?: SpeakOpts) {
  if (!voice) {
    console.info(`[Athenas-voz] sem voz feminina em ${lang} — silêncio (voz natural feminina assume quando pronta)`);
    opts?.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = opts?.rate ?? 1.0;
  u.pitch = 1.05;
  u.voice = voice;
  if (opts?.onEnd) u.onend = opts.onEnd;
  synth.speak(u);
  synth.resume(); // proteção contra "travamento" do Chrome após cancel()
}

/**
 * Fala aguardando as vozes carregarem: tenta na hora; se ainda não há
 * vozes no idioma, escuta "voiceschanged" por até 2,5s e fala assim que
 * uma voz (feminina!) aparecer. Só cai para a voz padrão do navegador
 * se absolutamente nenhuma voz chegar.
 */
function speakWaitingForVoices(text: string, lang: string, opts?: SpeakOpts) {
  const attempt = (): SpeechSynthesisVoice | null => pickVoice(lang, refreshCache());
  let done = false;
  const onVoices = () => {
    const voice = attempt();
    if (voice) {
      done = true;
      window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
      speakNow(text, lang, voice, opts);
    }
  };
  window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
  window.setTimeout(() => {
    if (done) return;
    done = true;
    window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
    speakNow(text, lang, attempt(), opts);
  }, 2500);

  const voice = attempt();
  if (voice) {
    done = true;
    window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
    speakNow(text, lang, voice, opts);
  }
}

/** Fala com a melhor voz feminina do dispositivo (fallback). */
function webSpeak(text: string, lang: string, opts?: SpeakOpts) {
  const voice = pickVoice(lang, refreshCache());
  if (voice) {
    speakNow(text, lang, voice, opts);
  } else {
    // vozes ainda não carregaram: espera por elas antes de falar
    speakWaitingForVoices(text, lang, opts);
  }
}

export function useSpeech(): SpeechResult {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const canListen = typeof window !== "undefined" && getRecognitionCtor() !== null;

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      refreshCache();
    };
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    // em alguns navegadores as vozes chegam atrasadas
    const t = setTimeout(load, 400);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
      clearTimeout(t);
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, opts?: SpeakOpts) => {
      if (!supported) return false;
      const lang = opts?.lang ?? detectLang(text);
      // 1. Voz natural feminina (HuggingFace no navegador) — grátis,
      //    sem chave. Só usamos quando o modelo JÁ ESTÁ carregado em
      //    memória: carregá-lo na hora pode congelar a tela no celular
      //    (WASM na thread principal) — por isso o warm-up roda em
      //    background (kickOffNaturalWarmup) e o restante fala na hora.
      if (langToModel(lang) && isNaturalReady() && !naturalBusy) {
        naturalBusy = true;
        stop();
        speakNatural(text, lang, opts).finally(() => {
          naturalBusy = false;
        });
        return true;
      }
      // 2. Modelo ainda não pronto: fala AGORA com a melhor voz do
      //    aparelho e, junto com este primeiro áudio, aquece o modelo
      //    natural em background — o próximo tap já usa a voz bonita.
      if (langToModel(lang)) kickOffNaturalWarmup();
      webSpeak(text, lang, opts);
      return true;
    },
    [supported]
  );

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
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
