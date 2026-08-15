// ══════════════════════════════════════════════════════════════
// Athenas — Grammar Duel: duelo de gramática contra a Lulu
// Perguntas rápidas (choice/fillBlank) dos tópicos liberados.
// Acertou rápido = mais dano na Lulu. Errou/perdeu o tempo = vida.
// ══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { CEFR_LABELS } from "@/lib/constants";
import {
  DUEL_CONFIG,
  duelQuestions,
  resolveRound,
  tauntFor,
  luluTaunt,
  type DuelQuestion,
  type DuelState
} from "@/services/duel";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { sfxCorrect, sfxWrong, sfxVictory } from "@/lib/sfx";
import { fireConfetti } from "@/lib/confetti";

type Phase = "intro" | "duel" | "roundEnd" | "done";

export function GrammarDuelPage() {
  const { state, addXp, addStars, toast } = useApp();
  const { navigate } = useRouter();

  const questions = useMemo(() => duelQuestions(state.cefr, DUEL_CONFIG.totalRounds, 7), [state.cefr]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [duel, setDuel] = useState<DuelState>({
    round: 0,
    totalRounds: DUEL_CONFIG.totalRounds,
    luluHp: DUEL_CONFIG.luluHpMax,
    lives: DUEL_CONFIG.livesMax,
    score: 0,
    correctCount: 0
  });
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(DUEL_CONFIG.timeMax);
  const [lastOutcome, setLastOutcome] = useState<{ correct: boolean; points: number; timedOut: boolean; text: string } | null>(null);
  const [victory, setVictory] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q: DuelQuestion | undefined = questions[round];

  // Timer do round
  useEffect(() => {
    if (phase !== "duel" || !q) return;
    setTimeLeft(q.timeMax);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // estourou o tempo
          submitAnswer(null, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  const submitAnswer = (val: string | null, timedOut = false) => {
    if (phase !== "duel" || !q) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const exercise = q.exercise;
    const correct = val !== null && (exercise.kind === "choice" ? exercise.answer === Number(val) : exercise.answer.toLowerCase().trim() === val.toLowerCase().trim());
    const outcome = resolveRound(duel, correct, timedOut ? 0 : timeLeft, q.timeMax);
    setDuel(outcome.state);
    setLastOutcome({
      correct,
      points: outcome.points,
      timedOut,
      text: tauntFor(correct, timedOut, outcome.points, outcome.state.luluHp, round, questions.length)
    });
    if (correct) sfxCorrect();
    else sfxWrong();

    if (outcome.result === "win" || outcome.result === "lose") {
      const won = outcome.result === "win";
      setVictory(won);
      if (won) {
        addXp(30, { silent: true });
        addStars(8);
        fireConfetti(true);
        sfxVictory();
        toast("Duelo vencido! +30 XP e +8 étoiles", "sword");
      } else {
        addXp(10, { silent: true });
        toast("Duelo disputado! +10 XP de consolação", "heart");
      }
      setPhase("done");
    } else {
      setPhase("roundEnd");
      setTimeout(() => {
        setRound((r) => r + 1);
        setAnswer("");
        setPhase("duel");
      }, 1400);
    }
  };

  const start = () => {
    setRound(0);
    setDuel({ round: 0, totalRounds: DUEL_CONFIG.totalRounds, luluHp: DUEL_CONFIG.luluHpMax, lives: DUEL_CONFIG.livesMax, score: 0, correctCount: 0 });
    setLastOutcome(null);
    setPhase("duel");
  };

  // ── Intro ────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="sword" size={20} style={{ verticalAlign: -3 }} /> Grammar Duel</>} sub="Duelo de gramática contra a Lulu" onBack={() => navigate("/grammar")} />
        <Card className="center">
          <Mascot mood="excited" size={110} />
          <h2>Prête pour le duel ?</h2>
          <p className="muted small">
            {DUEL_CONFIG.totalRounds} perguntas de gramática dos tópicos liberados para o seu nível ({CEFR_LABELS[state.cefr]}).
            Acertou rápido? Mais dano na Lulu. Errou ou deixou o tempo acabar? Perde uma vida.
          </p>
          <div className="row center mt-3" style={{ justifyContent: "center" }}>
            <Chip variant="rose"><Icon name="heart" size={13} /> {DUEL_CONFIG.livesMax} vidas</Chip>
            <Chip variant="gold"><Icon name="star" size={13} /> {DUEL_CONFIG.luluHpMax} HP da Lulu</Chip>
            <Chip variant="accent"><Icon name="clock" size={13} /> {DUEL_CONFIG.timeMax}s por round</Chip>
          </div>
          <p className="small muted mt-3">Vitória: +30 XP e +8 étoiles · Participação: +10 XP</p>
          <Button className="mt-4" block onClick={start}>
            <Icon name="sword" size={16} /> Duelar !
          </Button>
        </Card>
      </div>
    );
  }

  // ── Fim ──────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="sword" size={20} style={{ verticalAlign: -3 }} /> Grammar Duel</>} sub="Resultado" onBack={() => navigate("/grammar")} />
        <Card className="center">
          <Mascot mood={victory ? "excited" : "happy"} size={120} />
          <h2 className="row" style={{ justifyContent: "center", gap: 8 }}>
            {victory ? <>Victoire ! <Icon name="confetti" size={20} /></> : <>Bien joué !</>}
          </h2>
          <p className="muted small">{victory ? luluTaunt("win") : luluTaunt("lose")}</p>
          <div className="stats-grid mt-3">
            <div className="stat-card"><strong>{duel.score}</strong><small>pontos</small></div>
            <div className="stat-card"><strong>{duel.correctCount}/{questions.length}</strong><small>acertos</small></div>
            <div className="stat-card"><strong>{100 - duel.luluHp}%</strong><small>dano na Lulu</small></div>
            <div className="stat-card"><strong>{duel.lives}/3</strong><small>vidas restantes</small></div>
          </div>
          <div className="row center mt-3" style={{ justifyContent: "center" }}>
            <Chip variant="gold">{victory ? "+30 XP · +8 étoiles" : "+10 XP"}</Chip>
          </div>
          <div className="stack mt-4">
            <Button block onClick={start}>Jogar de novo</Button>
            <Button variant="soft" block onClick={() => navigate("/grammar")}>Voltar à gramática</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Duelo / fim de round ─────────────────────────────────────
  const hpPct = (duel.luluHp / DUEL_CONFIG.luluHpMax) * 100;

  return (
    <div className="page">
      <PageHeader title={<><Icon name="sword" size={20} style={{ verticalAlign: -3 }} /> Grammar Duel</>} sub={`Round ${Math.min(round + 1, DUEL_CONFIG.totalRounds)} de ${DUEL_CONFIG.totalRounds}`} onBack={() => navigate("/grammar")} />

      {/* Barras: Lulu HP + vidas do aluno */}
      <div className="card-soft mb-3 duel-hud">
        <div className="row-between small">
          <span className="row" style={{ gap: 6 }}>
            <Icon name="robot" size={16} /> Lulu <strong>{duel.luluHp} HP</strong>
          </span>
          <span className="row" style={{ gap: 4 }}>
            {Array.from({ length: DUEL_CONFIG.livesMax }).map((_, i) => (
              <Icon key={i} name="heart" size={16} filled={i < duel.lives} style={{ color: i < duel.lives ? "var(--c-red)" : "var(--c-muted)", opacity: i < duel.lives ? 1 : 0.35 }} />
            ))}
          </span>
        </div>
        <div className="duel-hp-track"><span style={{ width: `${hpPct}%` }} /></div>
        <div className="row-between small mt-1">
          <span className="muted">Lulu</span>
          <span className="muted">Pontos: <strong style={{ color: "var(--c-ink)" }}>{duel.score}</strong></span>
        </div>
      </div>

      {phase === "roundEnd" && lastOutcome ? (
        <Card className="center duel-feedback">
          <Mascot mood={lastOutcome.correct ? "excited" : "worried"} size={90} />
          <h3 className={lastOutcome.correct ? "" : ""} style={{ color: lastOutcome.correct ? "var(--c-green)" : "var(--c-red)" }}>
            {lastOutcome.correct ? "Parfait !" : lastOutcome.timedOut ? "Le temps est écoulé !" : "Presque…"}
          </h3>
          {q && (
            <p className="muted small">
              <strong>{q.nodeTitle}:</strong> {q.exercise.kind === "choice" ? q.exercise.options[q.exercise.answer] : q.exercise.answer}
              {q.exercise.explanation ? ` — ${q.exercise.explanation}` : ""}
            </p>
          )}
          <p className="small mt-2" style={{ color: "var(--c-accent-deep)" }}>“{lastOutcome.text}”</p>
        </Card>
      ) : q ? (
        <Card>
          <Chip variant="accent"><Icon name="book" size={13} /> {q.nodeTitle}</Chip>
          <h3 className="mt-2">{q.exercise.prompt}</h3>
          <div className="duel-timer"><span key={round} style={{ width: `${(timeLeft / q.timeMax) * 100}%` }} /></div>
          {q.exercise.kind === "choice" ? (
            <div className="stack mt-3">
              {q.exercise.options.map((opt, i) => (
                <button key={i} className="option-btn" onClick={() => submitAnswer(String(i))}>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <>
              <input
                className="text-input mt-3"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && answer.trim()) submitAnswer(answer);
                }}
                placeholder="Sua resposta…"
                autoFocus
              />
              <Button className="mt-3" block disabled={!answer.trim()} onClick={() => submitAnswer(answer)}>
                Responder
              </Button>
            </>
          )}
        </Card>
      ) : (
        <Card className="center"><p className="muted">Sem perguntas para o seu nível ainda.</p></Card>
      )}
    </div>
  );
}
