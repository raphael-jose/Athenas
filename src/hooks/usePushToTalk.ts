// ══════════════════════════════════════════════════════════════
// Athenas — Push-to-talk (segure para falar, estilo WhatsApp)
// Reconhecimento de fala contínuo enquanto o botão está pressionado:
// mostra o que está ouvindo ao vivo (interim) e, ao soltar, devolve
// a transcrição final acumulada.
// ══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechResultLike {
  isFinal: boolean;
  0: { transcript: string } | undefined;
}

interface SpeechRecogLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<SpeechResultLike> }) => void) | null;
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

export interface PushToTalkResult {
  supported: boolean;
  recording: boolean;
  /** Transcrição parcial exibida ao vivo enquanto grava. */
  interim: string;
  error: string | null;
  /** Começa a escutar (chame no pointerdown). */
  start: (lang?: string) => void;
  /** Para de escutar e resolve com a transcrição final acumulada. */
  stop: () => Promise<string>;
  /** Cancela sem resultado (ex.: deslizou para fora). */
  cancel: () => void;
}

export function usePushToTalk(): PushToTalkResult {
  const supported = typeof window !== "undefined" && getRecognitionCtor() !== null;
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecogLike | null>(null);
  const finalsRef = useRef<string[]>([]);
  const interimRef = useRef("");
  const resolveRef = useRef<((t: string) => void) | null>(null);

  const start = useCallback((lang = "fr-FR") => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    finalsRef.current = [];
    interimRef.current = "";
    setInterim("");
    setError(null);
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = true;
    rec.onresult = (e) => {
      let live = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? "";
        if (r.isFinal) finalsRef.current.push(t.trim());
        else live += t;
      }
      interimRef.current = live;
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microfone sem permissão — libere o acesso e tente de novo. 🎙️");
      } else if (e.error === "no-speech") {
        setError("Não ouvi nada… fale um pouco mais alto !");
      } else if (e.error === "network") {
        setError("Reconhecimento sem conexão — tente de novo.");
      } else {
        setError(null);
      }
    };
    rec.onend = () => {
      setRecording(false);
      setInterim("");
      const all = [...finalsRef.current, interimRef.current].filter(Boolean).join(" ").trim();
      resolveRef.current?.(all);
      resolveRef.current = null;
    };
    recRef.current = rec;
    setRecording(true);
    rec.start();
  }, []);

  const stop = useCallback(
    () =>
      new Promise<string>((resolve) => {
        const rec = recRef.current;
        resolveRef.current = resolve;
        if (!rec) {
          resolve(interimRef.current);
          return;
        }
        rec.stop(); // onend resolve com a transcrição acumulada
      }),
    []
  );

  const cancel = useCallback(() => {
    recRef.current?.abort();
    recRef.current = null;
    setRecording(false);
    setInterim("");
    resolveRef.current?.("");
    resolveRef.current = null;
  }, []);

  useEffect(
    () => () => {
      recRef.current?.abort();
      recRef.current = null;
    },
    []
  );

  return { supported, recording, interim, error, start, stop, cancel };
}
