// ══════════════════════════════════════════════════════════════
// Athenas — Desafio Relâmpago ⚡ (tempo + corações)
// Errou ou deixou o tempo acabar? Perde um coração ❤.
// Cinco corações e acabou — mas cada acerto acende uma estrelinha.
// ══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { buildChallenge, CHALLENGE_DEFAULTS, type ChallengeQuestion } from "@/services/challenge";
import { XP } from "@/lib/constants";
import { Button, Card, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { fireConfetti, fireSparkle } from "@/lib/confetti";
import { sfxCorrect, sfxWrong } from "@/lib/sfx";

type Status = "start" | "playing" | "over";

export function ChallengePage() {
  const { addXp, toast } = useApp();
  const { navigate } = useRouter();
  const [status, setStatus] = useState<Status>("start");
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState<number>(CHALLENGE_DEFAULTS.hearts);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(CHALLENGE_DEFAULTS.seconds);
  const [best, setBest] = useState<number>(0);
  const timeRef = useRef(timeLeft);
  const heartsRef = useRef(hearts);
  const scoreRef = useRef(score);

  // melhor pontuação salva localmente
  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("athenas:challenge:best") ?? 0));
    } catch {
      // ignore
    }
  }, []);

  const start = () => {
    const qs = buildChallenge();
    setQuestions(qs);
    setIdx(0);
    setHearts(CHALLENGE_DEFAULTS.hearts);
    heartsRef.current = CHALLENGE_DEFAULTS.hearts;
    setScore(0);
    scoreRef.current = 0;
    setPicked(null);
    setTimeLeft(CHALLENGE_DEFAULTS.seconds);
    setStatus("playing");
  };

  const q = questions[idx];

  // cronômetro
  useEffect(() => {
    if (status !== "playing" || !q) return;
    timeRef.current = CHALLENGE_DEFAULTS.seconds;
    setTimeLeft(CHALLENGE_DEFAULTS.seconds);
    const t = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(t);
        // tempo esgotado: conta como erro (perde coração)
        setPicked(-1);
        sfxWrong();
        setTimeout(() => {
          loseHeart();
          if (heartsRef.current <= 0) {
            finish();
            return;
          }
          next();
        }, 550);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, status]);

  const loseHeart = () => {
    heartsRef.current = Math.max(0, heartsRef.current - 1);
    setHearts(heartsRef.current);
  };

  const next = () => {
    setIdx((i) => i + 1);
    setPicked(null);
  };

  const choose = (i: number) => {
    if (picked !== null || !q || heartsRef.current <= 0) return;
    setPicked(i);
    const correct = i === q.answer;
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      sfxCorrect();
      fireSparkle();
    } else {
      sfxWrong();
      loseHeart();
    }
    setTimeout(() => {
      if (heartsRef.current <= 0 || idx + 1 >= questions.length) {
        finish();
      } else {
        next();
      }
    }, 500);
  };

  const finish = () => {
    const s = scoreRef.current;
    if (s > best) {
      setBest(s);
      try {
        localStorage.setItem("athenas:challenge:best", String(s));
      } catch {
        // ignore
      }
    }
    const gained = Math.max(1, s * XP.EXERCISE_CORRECT);
    addXp(gained);
    if (s >= questions.length * 0.8) fireConfetti(true);
    if (s >= questions.length * 0.6) toast("Desafio Relâmpago arrasado! ⚡", "lightning");
    setStatus("over");
  };

  // ── Tela inicial ─────────────────────────────────────────────
  if (status === "start") {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="lightning" size={20} style={{ verticalAlign: -3 }} /> Desafio Relâmpago</>} sub="Tempo + corações" onBack={() => navigate("/")} />
        <Card className="center">
          <Mascot mood="excited" size={120} />
          <h2 style={{ fontSize: "1.3rem" }}>Você tem coragem ? ⚡</h2>
          <p className="muted small" style={{ maxWidth: 300, margin: "8px auto 0" }}>
            {CHALLENGE_DEFAULTS.questions} perguntas de vocabulário, {CHALLENGE_DEFAULTS.seconds}s cada.
            Errou ou o tempo acabou? <strong>Perde um coração</strong>.
            Cinco corações e acabou!
          </p>
          <div className="row center mt-3" style={{ justifyContent: "center", fontSize: "1.4rem" }}>
            {"❤".repeat(CHALLENGE_DEFAULTS.hearts)}
          </div>
          {best > 0 && <ChipBest best={best} />}
          <Button className="mt-4" block onClick={start}>
            <Icon name="play" size={16} /> Começar desafio
          </Button>
        </Card>
      </div>
    );
  }

  // ── Fim de jogo ──────────────────────────────────────────────
  if (status === "over") {
    const pct = Math.round((score / Math.max(1, questions.length)) * 100);
    const won = hearts > 0;
    return (
      <div className="page">
        <PageHeader title={<><Icon name="lightning" size={20} style={{ verticalAlign: -3 }} /> Desafio Relâmpago</>} onBack={() => navigate("/")} />
        <Card className="center">
          <Mascot mood={won ? "proud" : "worried"} size={120} />
          <h2 style={{ fontSize: "1.4rem" }}>{won ? "Raio puro !" : "Os corações acabaram…"}</h2>
          <p className="muted small">
            {score} de {questions.length} certas ({pct}%)
          </p>
          {!won && (
            <p className="muted small">Relaxa — todo raio cai e se levanta. Tenta de novo !</p>
          )}
          <div className="row center mt-3" style={{ justifyContent: "center", gap: 6 }}>
            <ChipVariant label={`${score} ⭐`} />
            <ChipVariant label={`${hearts} ❤`} />
            {best > 0 && <ChipVariant label={`Recorde: ${best}`} />}
          </div>
          <div className="stack mt-4">
            <Button block onClick={start}>
              <Icon name="arrowClockwise" size={16} /> Jogar de novo
            </Button>
            <Button variant="ghost" block onClick={() => navigate("/")}>
              Voltar pra casa
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Jogando ──────────────────────────────────────────────────
  if (!q) return null;
  const pctTime = (timeLeft / CHALLENGE_DEFAULTS.seconds) * 100;

  return (
    <div className="page">
      <PageHeader
        title={<><Icon name="lightning" size={20} style={{ verticalAlign: -3 }} /> Desafio Relâmpago</>}
        sub={`${idx + 1}/${questions.length} · ${score} certas`}
        onBack={() => navigate("/")}
      />

      {/* corações + tempo */}
      <Card className="mb-3" style={{ padding: "10px 14px" }}>
        <div className="row-between">
          <span style={{ fontSize: "1.15rem", letterSpacing: 2 }} title="Corações">
            {Array.from({ length: CHALLENGE_DEFAULTS.hearts }, (_, i) => (
              <span key={i} style={{ opacity: i < hearts ? 1 : 0.18, filter: i < hearts ? "none" : "grayscale(1)" }}>
                ❤
              </span>
            ))}
          </span>
          <span className={`chip ${timeLeft <= 3 ? "chip-red" : "chip-gold"}`}>
            <Icon name="clock" size={14} /> {timeLeft}s
          </span>
        </div>
        <div className="progress thin mt-2">
          <span style={{ width: `${pctTime}%`, background: timeLeft <= 3 ? "var(--c-red)" : undefined }} />
        </div>
      </Card>

      <Card>
        <div className="ex-prompt">
          O que significa <strong style={{ fontSize: "1.15em" }}>« {q.prompt} »</strong> ?
        </div>
        <div className="stack">
          {q.options.map((opt, i) => {
            const isCorrect = picked !== null && i === q.answer;
            const isWrong = picked === i && i !== q.answer;
            return (
              <button
                key={i}
                className={`option-btn ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                onClick={() => choose(i)}
                disabled={picked !== null}
              >
                <span className="opt-letter">{["A", "B", "C", "D"][i]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
        {picked !== null && picked === -1 && (
          <p className="muted small mt-3 center">⏰ O tempo acabou… perdeu um coração !</p>
        )}
      </Card>
    </div>
  );
}

function ChipVariant({ label }: { label: string }) {
  return <span className="chip chip-gold">{label}</span>;
}

function ChipBest({ best }: { best: number }) {
  return (
    <div className="muted small mt-2 row" style={{ justifyContent: "center", gap: 5 }}>
      <Icon name="trophy" size={14} /> Seu recorde: {best}
    </div>
  );
}
