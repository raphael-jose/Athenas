// ══════════════════════════════════════════════════════════════
// Athenas — Fala: síntese + reconhecimento
//
// 🎀 VOZ DA LULU (regra única em todo o app):
//   1. VOZ NATURAL FEMININA (ElevenLabs) quando o usuário conecta a
//      chave em Perfil → Configurações → Voz — o padrão Rachel
//      (feminina, multilíngue) fala francês e português com
//      naturalidade. A chave fica só no navegador dele.
//   2. FALLBACK: a melhor voz FEMININA do dispositivo (Web Speech
//      API) — cache global + retry + seleção estrita, nunca a voz
//      padrão masculina genérica do navegador.
//
// Detecção de idioma: texto em francês → voz fr-FR; texto em
// português → voz pt-BR. Cada um na sua língua, sem sotaque
// cruzado.
// ══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo } from "react";
import { ELEVENLABS_API_BASE, ELEVENLABS_DEFAULT_VOICE_ID, ELEVENLABS_MODEL } from "@/lib/constants";

export interface NaturalVoiceConfig {
  key: string;
  voiceId: string;
}

export interface SpeechResult {
  supported: boolean;
  /**
   * Fala o texto com voz FEMININA NATURAL (ElevenLabs, se configurada)
   * ou com a melhor voz feminina do dispositivo. `lang` força um idioma;
   * `voice` testa uma configuração sem salvar.
   */
  speak: (text: string, opts?: { rate?: number; lang?: string; onEnd?: () => void; voice?: NaturalVoiceConfig }) => boolean;
  stop: () => void;
  /** Escuta o usuário e devolve a transcrição. Retorna false se o navegador não suportar. */
  listen: (opts: { onResult: (transcript: string) => void; onError?: (code: string) => void; lang?: string }) => boolean;
  /** true se o navegador suportar reconhecimento de fala. */
  canListen: boolean;
}

interface SpeechRecogLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
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

/** true quando o nome indica claramente voz masculina. */
function isMale(v: SpeechSynthesisVoice): boolean {
  return MALE_HINTS.test(v.name) && !FEMALE_HINTS.test(v.name);
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
 * Escolhe a voz do idioma com REGRA ESTRITA de feminilidade:
 *  1. feminina conhecida (a de melhor qualidade);
 *  2. senão, voz de gênero NEUTRO (evita masculina conhecida);
 *  3. só no fim, masculina conhecida — quando o dispositivo não tem
 *     nenhuma outra opção no idioma.
 * Nunca escolhe masculina enquanto existir uma feminina.
 */
export function pickVoice(lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const prefix = lang.toLowerCase().slice(0, 2);
  const matches = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  if (matches.length === 0) return null;
  const females = matches.filter(isFemale);
  if (females.length > 0) return bestOf(females);
  const neutrals = matches.filter((v) => !isMale(v));
  if (neutrals.length > 0) return bestOf(neutrals);
  return bestOf(matches);
}

// ── Voz natural (ElevenLabs) ──────────────────────────────────
// Configuração global alimentada pelo AppProvider (settings). A
// chave vive só no navegador do usuário — nunca no código, nunca no
// bundle público.
let naturalVoiceConfig: NaturalVoiceConfig | null = null;

/** Define a voz natural do app (chamada quando as settings mudam). Vazio desativa. */
export function configureNaturalVoice(key: string, voiceId: string): NaturalVoiceConfig | null {
  naturalVoiceConfig = key.trim()
    ? { key: key.trim(), voiceId: voiceId.trim() || ELEVENLABS_DEFAULT_VOICE_ID }
    : null;
  return naturalVoiceConfig;
}

/** Monta a requisição de síntese (pura — testável). */
export function elevenLabsRequest(text: string, cfg: NaturalVoiceConfig) {
  const url = `${ELEVENLABS_API_BASE}/${encodeURIComponent(cfg.voiceId)}`;
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": cfg.key
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true }
    })
  };
  return { url, init };
}

// Áudio natural em reprodução (para o stop() silenciar de qualquer tela).
let currentAudio: HTMLAudioElement | null = null;

/** Sintetiza no ElevenLabs e toca. Devolve false se falhar (fallback p/ voz do dispositivo). */
async function elevenLabsSpeak(text: string, cfg: NaturalVoiceConfig, onEnd?: () => void): Promise<boolean> {
  try {
    const { url, init } = elevenLabsRequest(text, cfg);
    const res = await fetch(url, init);
    if (!res.ok) return false;
    const blob = await res.blob();
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
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

// Cache global: as vozes chegam de forma assíncrona (voiceschanged).
// Todas as instâncias de useSpeech alimentam o mesmo cache, e o speak
// consulta o cache + getVoices() na hora — e, se ainda vazio, ESPERA
// pelas vozes antes de falar (nunca cai na voz padrão masculina).
let voiceCache: SpeechSynthesisVoice[] = [];

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
  /** Testa uma configuração de voz natural sem salvar (ex.: botão "Testar"). */
  voice?: NaturalVoiceConfig;
}

/** Fala imediatamente com a voz escolhida (ou sem voz se não houver nenhuma). */
function speakNow(text: string, lang: string, voice: SpeechSynthesisVoice | null, opts?: SpeakOpts) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = opts?.rate ?? 1.0;
  u.pitch = 1.05;
  if (voice) u.voice = voice;
  if (voice && isMale(voice)) {
    // Diagnóstico: só acontece quando o dispositivo NÃO tem voz feminina no idioma.
    console.info(`[Athenas-voz] sem feminina em ${lang} — fallback: ${voice.name}`);
  }
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
      // 1. Voz natural feminina (ElevenLabs) — se falhar (offline, chave
      //    inválida…), cai automaticamente na voz do dispositivo.
      const cfg = opts?.voice ?? naturalVoiceConfig;
      if (cfg) {
        stop();
        elevenLabsSpeak(text, cfg, opts?.onEnd).then((ok) => {
          if (!ok) webSpeak(text, lang, opts);
        });
        return true;
      }
      // 2. Fallback: melhor voz feminina do dispositivo.
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
      rec.maxAlternatives = 3;
      rec.continuous = false;
      rec.onresult = (e) => {
        const alts = e.results[0];
        const transcript = alts && alts.length > 0 ? alts[0].transcript : "";
        opts.onResult(transcript.trim());
      };
      rec.onerror = (e) => opts.onError?.(e.error ?? "error");
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
