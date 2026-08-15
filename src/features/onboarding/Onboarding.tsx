// ══════════════════════════════════════════════════════════════
// Athenas — Primeira experiência: boas-vindas → diagnóstico → nome
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { AVATARS, CEFR_BAND_NAMES, CEFR_LABELS } from "@/lib/constants";
import { clamp } from "@/lib/utils";
import {
  DIAG_MAX_QUESTIONS,
  DIAG_MIN_QUESTIONS,
  DIAG_QUESTIONS,
  estimateBand,
  nextQuestionForBand,
  SELF_ASSESSMENT,
  type DiagQuestion
} from "@/data/diagnostic";
import { WORLDS } from "@/data/worlds";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import type { CefrBand, IconName } from "@/types";

type Step = "welcome" | "assess" | "diag" | "result" | "name";

export function Onboarding() {
  const { finishDiagnostic, finishOnboarding } = useApp();
  const { navigate } = useRouter();
  const [step, setStep] = useState<Step>("welcome");

  const [band, setBand] = useState<CefrBand>(1);
  const [history, setHistory] = useState<number[]>([]);
  const [used, setUsed] = useState<number[]>([]);
  const [q, setQ] = useState<DiagQuestion | null>(null);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [result, setResult] = useState<{ band: CefrBand; correct: number; total: number; history: number[] } | null>(null);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<IconName>("rabbit");

  const startDiagnostic = (b: CefrBand) => {
    setBand(b);
    setQ(nextQuestionForBand(b, []));
    setStep("diag");
  };

  const answer = (i: number) => {
    if (!q) return;
    const isRight = i === q.answer;
    const qIdx = DIAG_QUESTIONS.indexOf(q);
    const nextUsed = [...used, qIdx];
    setUsed(nextUsed);
    const newAsked = asked + 1;
    const newCorrect = correct + (isRight ? 1 : 0);
    setAsked(newAsked);
    setCorrect(newCorrect);
    const nextBand = clamp(band + (isRight ? 1 : -1), 0, 6) as CefrBand;
    const newHistory = [...history, band];
    setHistory(newHistory);
    setBand(nextBand);

    const acc = newCorrect / newAsked;
    const shouldStop =
      newAsked >= DIAG_MAX_QUESTIONS ||
      (newAsked >= DIAG_MIN_QUESTIONS && nextBand >= 6 && acc >= 0.7) ||
      (newAsked >= DIAG_MIN_QUESTIONS && nextBand <= 0 && acc <= 0.4);

    if (shouldStop) {
      const est = estimateBand(newHistory, newCorrect, newAsked);
      const res = { band: est, correct: newCorrect, total: newAsked, history: newHistory };
      setResult(res);
      finishDiagnostic(res);
      setStep("result");
    } else {
      setQ(nextQuestionForBand(nextBand, nextUsed));
    }
  };

  const finish = () => {
    finishOnboarding({ name, avatar, band: result?.band ?? 1 });
    navigate("/map");
  };

  return (
    <div className="landing">
      {step === "welcome" && (
        <>
          <img src="./logo.png" alt="Athenas" className="logo-img" />
          <h1>Athenas</h1>
          <p className="tagline">Ton aventure française commence ici.</p>
          <p className="muted small" style={{ maxWidth: 300 }}>
            O RPG mais fofo para aprender francês — do zero absoluto ao Modo Deus Supremo.
          </p>
          <div className="floaty">
            <Mascot mood="happy" size={110} />
          </div>
          <Button size="lg" onClick={() => setStep("assess")}>
            Commencer
          </Button>
        </>
      )}

      {step === "assess" && (
        <>
          <Mascot mood="explaining" size={105} />
          <h2 style={{ fontSize: "1.5rem" }}>Você já fala francês ?</h2>
          <div className="stack" style={{ width: "100%", maxWidth: 430 }}>
            {SELF_ASSESSMENT.map((opt) => (
              <button key={opt.id} className="choice-btn" onClick={() => startDiagnostic(opt.startBand)}>
                <span className="cb-emoji" style={{ color: "var(--c-accent-deep)" }}>
                  <Icon name={opt.icon} size={22} />
                </span>
                <span className="grow">
                  {opt.label}
                  <small>{opt.note}</small>
                </span>
                <span aria-hidden>→</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === "diag" && q && (
        <>
          <Mascot mood="thinking" size={95} />
          <h2 className="row" style={{ fontSize: "1.3rem", justifyContent: "center", gap: 8 }}><Icon name="search" size={20} /> Diagnóstico carinhoso</h2>
          <p className="muted small">
            {asked + 1} de {DIAG_MAX_QUESTIONS} · acertos {correct} · dificuldade {CEFR_LABELS[band]}
          </p>
          <div className="exercise-card" style={{ width: "100%", maxWidth: 460 }}>
            <div className="ex-prompt">{q.prompt}</div>
            <div className="stack">
              {q.options.map((opt, i) => (
                <button key={i} className="option-btn" onClick={() => answer(i)}>
                  <span className="opt-letter">{["A", "B", "C", "D"][i]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {step === "result" && result && (
        <>
          <Mascot mood={result.correct / result.total >= 0.7 ? "proud" : "happy"} size={105} />
          <h2>Seu ponto de partida :</h2>
          <div className="chip chip-rose" style={{ fontSize: "1rem", padding: "8px 18px" }}>
            Nível estimado <strong>{CEFR_LABELS[result.band]}</strong> — {CEFR_BAND_NAMES[result.band]}
          </div>
          <p className="muted small">Acertou {result.correct} de {result.total} ({Math.round((result.correct / result.total) * 100)}%)</p>
          <p className="small" style={{ maxWidth: 380 }}>
            Seu caminho recomendado começa no mundo{" "}
            <strong>{WORLDS.find((w) => w.lessons.length > 0 && w.unlockCefr <= result.band)?.title}</strong>
            . Sem pressa: cada passo conta !
          </p>
          <Button size="lg" onClick={() => setStep("name")}>
            Continuar →
          </Button>
        </>
      )}

      {step === "name" && (
        <>
          <Mascot mood="happy" size={105} />
          <h2>Como podemos te chamar ?</h2>
          <input
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome…"
            maxLength={20}
            style={{ maxWidth: 320 }}
            aria-label="Nome"
          />
          <div className="row wrap center" style={{ maxWidth: 420, justifyContent: "center" }}>
            {AVATARS.map((a) => (
              <button
                key={a}
                className="option-btn"
                style={{
                  width: 52,
                  padding: 8,
                  justifyContent: "center",
                  borderColor: avatar === a ? "var(--c-primary)" : undefined,
                  background: avatar === a ? "var(--c-primary-soft)" : undefined
                }}
                onClick={() => setAvatar(a)}
                aria-label={`avatar ${a}`}
              >
                <Icon name={a} size={22} />
              </button>
            ))}
          </div>
          <Button size="lg" onClick={finish}>
            Criar meu mundo
          </Button>
        </>
      )}
    </div>
  );
}
