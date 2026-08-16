// ══════════════════════════════════════════════════════════════
// Athenas — Motor de exercícios (7 tipos) com feedback carinhoso
// ══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from "react";
import type { Exercise, SpeedQuestion } from "@/types";
import { fuzzyMatch, shuffle, percent } from "@/lib/utils";
import { useSpeech } from "@/hooks/useSpeech";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot, type Mood } from "@/components/Mascot";
import { fireSparkle } from "@/lib/confetti";
import { sfxCorrect, sfxWrong } from "@/lib/sfx";

export interface ExerciseResult {
  correct: boolean;
  firstTry: boolean;
}

interface Props {
  exercise: Exercise;
  onResult: (r: ExerciseResult) => void;
  onNext: () => void;
  index: number;
  total: number;
  showProgress?: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E"];

// Nome dos tipos de exercício em português (exibido no subtítulo).
const EXERCISE_LABEL: Record<string, string> = {
  choice: "escolha",
  fillBlank: "complete",
  translation: "tradução",
  wordMatch: "associe",
  sentenceBuilder: "monte a frase",
  listening: "ouvir",
  speedRound: "velocidade"
};

export function ExercisePlayer({ exercise, onResult, onNext, index, total, showProgress = true }: Props) {
  // Sons de acerto/erro centralizados para todos os tipos de exercício
  const handleResult = (r: ExerciseResult) => {
    if (r.correct) sfxCorrect();
    else sfxWrong();
    onResult(r);
  };

  return (
    <div key={index}>
      {showProgress && (
        <div className="row-between small muted mb-3">
          <span>
            Exercício {index + 1} de {total}
          </span>
          <span>{EXERCISE_LABEL[exercise.kind] ?? exercise.kind}</span>
        </div>
      )}
      <ExerciseBody exercise={exercise} onResult={handleResult} onNext={onNext} />
    </div>
  );
}

function ExerciseBody({ exercise, onResult, onNext }: Omit<Props, "index" | "total" | "showProgress">) {
  switch (exercise.kind) {
    case "choice":
      return <ChoiceExercise ex={exercise} onResult={onResult} onNext={onNext} />;
    case "fillBlank":
      return <FillBlankExercise ex={exercise} onResult={onResult} onNext={onNext} />;
    case "translation":
      return <TranslationExercise ex={exercise} onResult={onResult} onNext={onNext} />;
    case "wordMatch":
      return <WordMatchExercise ex={exercise} onResult={onResult} onNext={onNext} />;
    case "sentenceBuilder":
      return <SentenceBuilderExercise ex={exercise} onResult={onResult} onNext={onNext} />;
    case "listening":
      return <ListeningExercise ex={exercise} onResult={onResult} onNext={onNext} />;
    case "speedRound":
      return <SpeedRoundExercise ex={exercise} onResult={onResult} onNext={onNext} />;
    default:
      return null;
  }
}

interface FeedbackProps {
  status: "idle" | "correct" | "wrong";
  feedback?: string;
  showAnswer?: string;
  onNext: () => void;
  isLast?: boolean;
}

function FeedbackBar({ status, feedback, showAnswer, onNext, isLast }: FeedbackProps) {
  if (status === "idle") return null;
  const mood: Mood = status === "correct" ? "excited" : "worried";
  return (
    <div className="mt-3">
      {status === "correct" && (
        <div className="feedback good row">
          <Mascot mood="excited" size={46} />
          <div className="grow">
            <strong>Parfait !</strong>
            <div className="small">{feedback}</div>
          </div>
        </div>
      )}
      {status === "wrong" && (
        <div className="feedback bad row">
          <Mascot mood={mood} size={46} />
          <div className="grow">
            <strong>Quase !</strong> <span className="small">{feedback}</span>
            {showAnswer && (
              <div className="small mt-1 row" style={{ gap: 5 }}>
                <Icon name="sparkle" size={13} /> Resposta: <strong>{showAnswer}</strong>
              </div>
            )}
            <div className="small mt-1">Tenta de novo — eu sei que você consegue !</div>
          </div>
        </div>
      )}
      {status === "correct" && (
        <Button className="mt-3" block onClick={onNext}>
          {isLast ? "Concluir" : "Continuar →"}
        </Button>
      )}
    </div>
  );
}

// ── Choice ────────────────────────────────────────────────────
function ChoiceExercise({ ex, onResult, onNext }: { ex: Extract<Exercise, { kind: "choice" }>; onResult: (r: ExerciseResult) => void; onNext: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const choose = (i: number) => {
    if (picked !== null) return;
    if (i === ex.answer) {
      setPicked(i);
      onResult({ correct: true, firstTry: wrong.length === 0 });
      fireSparkle();
    } else {
      setWrong((w) => [...w, i]);
      if (wrong.length >= 1) setShowAnswer(true);
      onResult({ correct: false, firstTry: false });
    }
  };

  return (
    <div className="exercise-card">
      <div className="ex-prompt">{ex.prompt}</div>
      <div className="stack">
        {ex.options.map((opt, i) => {
          const isCorrect = picked !== null && i === ex.answer;
          const isWrong = wrong.includes(i);
          return (
            <button
              key={i}
              className={`option-btn ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
              onClick={() => choose(i)}
              disabled={picked !== null}
            >
              <span className="opt-letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      <FeedbackBar
        status={picked !== null ? "correct" : wrong.length > 0 ? "wrong" : "idle"}
        feedback={ex.explanation}
        showAnswer={showAnswer ? ex.options[ex.answer] : undefined}
        onNext={onNext}
      />
    </div>
  );
}

// ── Fill blank ────────────────────────────────────────────────
function FillBlankExercise({ ex, onResult, onNext }: { ex: Extract<Exercise, { kind: "fillBlank" }>; onResult: (r: ExerciseResult) => void; onNext: () => void }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);

  const check = () => {
    if (done) return;
    if (fuzzyMatch(value, ex.answer, ex.accept ?? [])) {
      setDone(true);
      onResult({ correct: true, firstTry: !wrong });
      fireSparkle();
    } else {
      setWrong(true);
      if (wrong) setShowAnswer(true);
      onResult({ correct: false, firstTry: false });
    }
  };

  return (
    <div className="exercise-card">
      <div className="ex-prompt">{ex.prompt}</div>
      <input
        className="text-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        placeholder="Escreva aqui…"
        disabled={done}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Resposta"
      />
      {ex.hint && !done && (
        <div className="small muted mt-2 row" style={{ gap: 5 }}>
          <Icon name="lightbulb" size={14} /> Dica: {ex.hint}
        </div>
      )}
      {!done && (
        <Button className="mt-3" block onClick={check}>
          <Icon name="check" size={15} /> Verificar
        </Button>
      )}
      <FeedbackBar
        status={done ? "correct" : wrong ? "wrong" : "idle"}
        feedback={ex.explanation}
        showAnswer={showAnswer ? ex.answer : undefined}
        onNext={onNext}
      />
    </div>
  );
}

// ── Translation ───────────────────────────────────────────────
function TranslationExercise({ ex, onResult, onNext }: { ex: Extract<Exercise, { kind: "translation" }>; onResult: (r: ExerciseResult) => void; onNext: () => void }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);

  const check = () => {
    if (done) return;
    if (fuzzyMatch(value, ex.answer, ex.accept ?? [])) {
      setDone(true);
      onResult({ correct: true, firstTry: !wrong });
      fireSparkle();
    } else {
      setWrong(true);
      if (wrong) setShowAnswer(true);
      onResult({ correct: false, firstTry: false });
    }
  };

  return (
    <div className="exercise-card">
      <div className="ex-prompt">{ex.prompt}</div>
      <div className="small muted mb-3">Escreva em francês</div>
      <input
        className="text-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        placeholder="Tradução…"
        disabled={done}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Tradução"
      />
      {!done && (
        <Button className="mt-3" block onClick={check}>
          <Icon name="check" size={15} /> Verificar
        </Button>
      )}
      <FeedbackBar
        status={done ? "correct" : wrong ? "wrong" : "idle"}
        feedback={ex.explanation}
        showAnswer={showAnswer ? ex.answer : undefined}
        onNext={onNext}
      />
    </div>
  );
}

// ── Word match ────────────────────────────────────────────────
function WordMatchExercise({ ex, onResult, onNext }: { ex: Extract<Exercise, { kind: "wordMatch" }>; onResult: (r: ExerciseResult) => void; onNext: () => void }) {
  const left = useMemo(() => shuffle(ex.pairs.map((p) => p[0])), [ex.pairs]);
  const right = useMemo(() => shuffle(ex.pairs.map((p) => p[1])), [ex.pairs]);
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [flashBad, setFlashBad] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);

  const pairOf = (fr: string, pt: string) => ex.pairs.find((p) => p[0] === fr && p[1] === pt);

  const pickLeft = (fr: string) => {
    if (done || matched.includes(fr)) return;
    setSelLeft(fr);
    if (selRight) tryMatch(fr, selRight);
  };

  const pickRight = (pt: string) => {
    if (done) return;
    setSelRight(pt);
    if (selLeft) tryMatch(selLeft, pt);
  };

  const tryMatch = (fr: string, pt: string) => {
    if (pairOf(fr, pt)) {
      const next = [...matched, fr];
      setMatched(next);
      setSelLeft(null);
      setSelRight(null);
      if (next.length === ex.pairs.length) {
        setDone(true);
        onResult({ correct: true, firstTry: !wrong });
        fireSparkle();
      }
    } else {
      setWrong(true);
      onResult({ correct: false, firstTry: false });
      setFlashBad(fr + pt);
      setTimeout(() => {
        setFlashBad(null);
        setSelLeft(null);
        setSelRight(null);
      }, 450);
    }
  };

  return (
    <div className="exercise-card">
      <div className="ex-prompt row" style={{ gap: 8 }}><Icon name="heartbeat" size={20} /> Associe as palavras</div>
      <div className="match-grid">
        <div className="stack">
          {left.map((fr) => (
            <button
              key={fr}
              className={`match-btn ${selLeft === fr ? "selected" : ""} ${matched.includes(fr) ? "matched" : ""} ${
                flashBad === fr + (selRight ?? "") ? "flash-bad" : ""
              }`}
              onClick={() => pickLeft(fr)}
              disabled={matched.includes(fr)}
            >
              {fr}
            </button>
          ))}
        </div>
        <div className="stack">
          {right.map((pt) => (
            <button
              key={pt}
              className={`match-btn ${selRight === pt ? "selected" : ""} ${matched.some((f) => pairOf(f, pt)) ? "matched" : ""} ${
                flashBad === (selLeft ?? "") + pt ? "flash-bad" : ""
              }`}
              onClick={() => pickRight(pt)}
              disabled={matched.some((f) => pairOf(f, pt))}
            >
              {pt}
            </button>
          ))}
        </div>
      </div>
      <FeedbackBar status={done ? "correct" : wrong ? "wrong" : "idle"} onNext={onNext} />
    </div>
  );
}

// ── Sentence builder ──────────────────────────────────────────
function SentenceBuilderExercise({ ex, onResult, onNext }: { ex: Extract<Exercise, { kind: "sentenceBuilder" }>; onResult: (r: ExerciseResult) => void; onNext: () => void }) {
  const [pool, setPool] = useState<string[]>(() => shuffle(ex.words));
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);

  const addWord = (w: string) => {
    if (done) return;
    setPlaced((p) => [...p, w]);
    setPool((p) => p.filter((x) => x !== w));
  };

  const removeWord = (w: string) => {
    if (done) return;
    setPlaced((p) => {
      const idx = p.lastIndexOf(w);
      if (idx === -1) return p;
      const next = p.filter((_, i) => i !== idx);
      setPool((po) => [...po, w]);
      return next;
    });
  };

  const check = () => {
    if (done) return;
    const same = placed.length === ex.answer.length && placed.every((w, i) => w === ex.answer[i]);
    if (same) {
      setDone(true);
      onResult({ correct: true, firstTry: !wrong });
      fireSparkle();
    } else {
      setWrong(true);
      if (wrong) setShowAnswer(true);
      onResult({ correct: false, firstTry: false });
    }
  };

  return (
    <div className="exercise-card">
      <div className="ex-prompt">{ex.prompt}</div>
      <div className="small muted mb-3">Toque nas palavras na ordem certa</div>
      <div className="build-slot mb-3">
        {placed.length === 0 && <span className="muted small">…</span>}
        {placed.map((w, i) => (
          <button key={i} className="placed" onClick={() => removeWord(w)} aria-label={`remover ${w}`}>
            {w}
          </button>
        ))}
      </div>
      <div className="row wrap">
        {pool.map((w) => (
          <button key={w} className="word-chip" onClick={() => addWord(w)}>
            {w}
          </button>
        ))}
      </div>
      <div className="row mt-3">
        <Button variant="ghost" onClick={() => { setPlaced([]); setPool(shuffle(ex.words)); }}>
          <Icon name="trash" size={15} /> Apagar
        </Button>
        <Button className="grow" onClick={check} disabled={placed.length === 0}>
          <Icon name="check" size={15} /> Verificar
        </Button>
      </div>
      <FeedbackBar
        status={done ? "correct" : wrong ? "wrong" : "idle"}
        feedback={ex.explanation}
        showAnswer={showAnswer ? ex.answer.join(" ") : undefined}
        onNext={onNext}
      />
    </div>
  );
}

// ── Listening ─────────────────────────────────────────────────
function ListeningExercise({ ex, onResult, onNext }: { ex: Extract<Exercise, { kind: "listening" }>; onResult: (r: ExerciseResult) => void; onNext: () => void }) {
  const { speak, supported } = useSpeech();
  const [playing, setPlaying] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (supported) speak(ex.text, { onEnd: () => setPlaying(false) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = () => {
    setPlaying(true);
    speak(ex.text, { onEnd: () => setPlaying(false) });
  };

  const choose = (i: number) => {
    if (picked !== null) return;
    if (i === ex.answer) {
      setPicked(i);
      onResult({ correct: true, firstTry: wrong.length === 0 });
      fireSparkle();
    } else {
      setWrong((w) => [...w, i]);
      if (wrong.length >= 1) setShowAnswer(true);
      onResult({ correct: false, firstTry: false });
    }
  };

  return (
    <div className="exercise-card">
      <div className="ex-prompt row" style={{ gap: 8 }}>{ex.prompt} <Icon name="speaker" size={20} /></div>
      <button className={`listen-btn ${playing ? "playing" : ""}`} onClick={play} aria-label="Ouvir novamente">
        <Icon name="speaker" size={24} />
      </button>
      {!supported && <div className="small muted center">Seu navegador não tem voz… mas dá pra continuar!</div>}
      <div className="stack">
        {ex.options.map((opt, i) => {
          const isCorrect = picked !== null && i === ex.answer;
          const isWrong = wrong.includes(i);
          return (
            <button
              key={i}
              className={`option-btn ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
              onClick={() => choose(i)}
              disabled={picked !== null}
            >
              <span className="opt-letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      <FeedbackBar
        status={picked !== null ? "correct" : wrong.length > 0 ? "wrong" : "idle"}
        feedback={ex.explanation}
        showAnswer={showAnswer ? ex.options[ex.answer] : undefined}
        onNext={onNext}
      />
    </div>
  );
}

// ── Speed round ───────────────────────────────────────────────
function SpeedRoundExercise({ ex, onResult, onNext }: { ex: Extract<Exercise, { kind: "speedRound" }>; onResult: (r: ExerciseResult) => void; onNext: () => void }) {
  const [questions] = useState<SpeedQuestion[]>(() => shuffle(ex.questions));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(ex.time ?? 10);
  const [done, setDone] = useState(false);
  const timeRef = useRef(timeLeft);

  const q = questions[idx];
  const finished = idx >= questions.length;

  useEffect(() => {
    if (done || finished) return;
    timeRef.current = ex.time ?? 10;
    setTimeLeft(ex.time ?? 10);
    const t = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(t);
        // tempo esgotado → errada
        setPicked(-1);
        setTimeout(next, 600);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done]);

  const next = () => {
    setIdx((i) => i + 1);
    setPicked(null);
  };

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.answer;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setDone(true);
        const pct = percent(score + (correct ? 1 : 0), questions.length);
        onResult({ correct: pct >= 60, firstTry: pct >= 90 });
        fireSparkle();
      } else {
        next();
      }
    }, 350);
  };

  if (finished || done) {
    const pct = percent(score, questions.length);
    return (
      <div className="exercise-card center">
        <div style={{ color: "var(--c-gold)", display: "flex", justifyContent: "center" }}>
          <Icon name="lightning" size={44} filled />
        </div>
        <h3>Velocidade total !</h3>
        <p className="bold" style={{ fontSize: "1.3rem" }}>
          {score} / {questions.length} ({pct}%)
        </p>
        <p className="muted small">{pct >= 90 ? "Luz que nem um raio!" : pct >= 60 ? "Boa velocidade!" : "Devagar e sempre… tenta de novo!"}</p>
        <Button className="mt-3" block onClick={onNext}>
          {pct >= 60 ? "Continuar →" : "Continuar mesmo assim →"}
        </Button>
      </div>
    );
  }

  return (
    <div className="exercise-card">
      <div className="row-between mb-3">
        <span className="chip chip-gold row" style={{ gap: 5 }}><Icon name="lightning" size={14} /> {idx + 1}/{questions.length}</span>
        <span className={`chip ${timeLeft <= 3 ? "chip-red" : ""}`}><Icon name="clock" size={14} /> {timeLeft}s</span>
      </div>
      <div className="progress thin mb-3">
        <span style={{ width: `${(timeLeft / (ex.time ?? 10)) * 100}%` }} />
      </div>
      <div className="ex-prompt">{q.prompt}</div>
      <div className="stack">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${picked !== null && i === q.answer ? "correct" : ""} ${picked === i && i !== q.answer ? "wrong" : ""}`}
            onClick={() => choose(i)}
            disabled={picked !== null}
          >
            <span className="opt-letter">{LETTERS[i]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
