// ══════════════════════════════════════════════════════════════
// Athenas — Négociation salariale: simulação de negociação
// A Lulu interpreta a recrutadora; escolha a resposta mais
// estratégica em cada round. Cada escolha vale 0–3 pontos.
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import {
  maxNegotiationScore,
  NEGOTIATION_ROUNDS,
  negotiationScore,
  outcomeFor,
  reviewTips,
  type NegotiationChoice
} from "@/services/negotiation";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { sfxCorrect, sfxWrong, sfxVictory } from "@/lib/sfx";
import { fireConfetti } from "@/lib/confetti";

type Phase = "intro" | "round" | "choiceEnd" | "done";

export function NegotiationGamePage() {
  const { addXp, addStars, toast } = useApp();
  const { navigate } = useRouter();

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [pt, setPt] = useState(false);
  const [done, setDone] = useState<{ score: number; outcome: ReturnType<typeof outcomeFor>; tips: ReturnType<typeof reviewTips> } | null>(null);

  const r = NEGOTIATION_ROUNDS[round];
  const maxScore = maxNegotiationScore();

  const pick = (i: number) => {
    if (phase !== "round") return;
    setPicked(i);
    setAnswers((a) => [...a, i]);
    const c = r.choices[i];
    if (c.score >= 2) sfxCorrect();
    else sfxWrong();
    setPhase("choiceEnd");
  };

  const next = () => {
    const isLast = round >= NEGOTIATION_ROUNDS.length - 1;
    if (!isLast) {
      setRound((n) => n + 1);
      setPicked(null);
      setPhase("round");
      return;
    }
    // fim: recompensa + resultado
    const all = [...answers, picked as number];
    const score = negotiationScore(all);
    const outcome = outcomeFor(score);
    const tips = reviewTips(all);
    setDone({ score, outcome, tips });
    addXp(outcome.xp, { silent: true });
    if (outcome.stars > 0) addStars(outcome.stars);
    if (outcome.xp >= 30) {
      fireConfetti(true);
      sfxVictory();
    }
    toast(outcome.xp >= 30 ? `Negociação vencida! +${outcome.xp} XP e +${outcome.stars} étoiles` : `Negociação concluída! +${outcome.xp} XP`, "scales");
    setPhase("done");
  };

  const start = () => {
    setRound(0);
    setAnswers([]);
    setPicked(null);
    setDone(null);
    setPt(false);
    setPhase("round");
  };

  // ── Intro ────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="scales" size={20} style={{ verticalAlign: -3 }} /> Négociation salariale</>} sub="Simulação de negociação de salário" onBack={() => navigate("/")} />
        <Card className="center">
          <Mascot mood="excited" size={110} />
          <h2>Vous voulez ce poste ? Négociez !</h2>
          <p className="muted small">
            A Lulu interpreta a <strong>recrutadora</strong> em {NEGOTIATION_ROUNDS.length} momentos de uma negociação de verdade.
            Em cada um, escolha a resposta <strong>mais estratégica</strong> — pontos valem por tática, não por tamanho.
          </p>
          <div className="row center mt-3" style={{ justifyContent: "center" }}>
            <Chip variant="rose"><Icon name="chat" size={13} /> {NEGOTIATION_ROUNDS.length} rounds</Chip>
            <Chip variant="gold"><Icon name="star" size={13} /> {maxScore} pts de estratégia</Chip>
            <Chip variant="accent"><Icon name="lightbulb" size={13} /> dica após cada escolha</Chip>
          </div>
          <p className="small muted mt-3">
            Desfecho de elite: +30 XP e +8 étoiles · Bom resultado: +30 XP · Participação: +10 XP
          </p>
          <Button className="mt-4" block onClick={start}>
            <Icon name="scales" size={16} /> Negociar !
          </Button>
        </Card>
      </div>
    );
  }

  // ── Fim ──────────────────────────────────────────────────────
  if (phase === "done" && done) {
    const pct = Math.round((done.score / maxScore) * 100);
    return (
      <div className="page">
        <PageHeader title={<><Icon name="scales" size={20} style={{ verticalAlign: -3 }} /> Négociation salariale</>} sub="Resultado da negociação" onBack={() => navigate("/")} />
        <Card className="center">
          <Mascot mood={done.outcome.xp >= 30 ? "excited" : "happy"} size={120} />
          <h2 className="row" style={{ justifyContent: "center", gap: 8 }}>
            <Icon name={done.outcome.icon} size={22} style={{ color: "var(--c-gold)" }} /> {done.outcome.title}
          </h2>
          <p className="muted small">{done.outcome.desc}</p>
          <div className="stats-grid mt-3">
            <div className="stat-card"><strong>{done.score}/{maxScore}</strong><small>pontos</small></div>
            <div className="stat-card"><strong>{pct}%</strong><small>estratégia</small></div>
            <div className="stat-card"><strong>{done.outcome.stars > 0 ? `+${done.outcome.stars}` : "—"}</strong><small>étoiles</small></div>
            <div className="stat-card"><strong>+{done.outcome.xp}</strong><small>XP</small></div>
          </div>
          {done.tips.length > 0 && (
            <div className="card-soft mt-3" style={{ textAlign: "left" }}>
              <div className="small bold row mb-2" style={{ gap: 6 }}>
                <Icon name="lightbulb" size={14} /> Para a próxima negociação
              </div>
              {done.tips.map((t, i) => (
                <p key={i} className="small mt-1 mb-0" style={{ marginBottom: 0 }}>
                  <strong>Rodada {t.round}:</strong> {t.tip}
                </p>
              ))}
            </div>
          )}
          <div className="row center mt-3" style={{ justifyContent: "center" }}>
            <Chip variant="gold">{done.outcome.xp >= 30 ? `+${done.outcome.xp} XP · +${done.outcome.stars} étoiles` : `+${done.outcome.xp} XP`}</Chip>
          </div>
          <div className="stack mt-4">
            <Button block onClick={start}>Negociar de novo</Button>
            <Button variant="soft" block onClick={() => navigate("/")}>Voltar ao início</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Round / feedback da escolha ──────────────────────────────
  const chosen: NegotiationChoice | null = picked !== null ? r.choices[picked] : null;

  return (
    <div className="page">
      <PageHeader
        title={<><Icon name="scales" size={20} style={{ verticalAlign: -3 }} /> Négociation salariale</>}
        sub={`Rodada ${Math.min(round + 1, NEGOTIATION_ROUNDS.length)} de ${NEGOTIATION_ROUNDS.length} · ${negotiationScore(answers)} pts`}
        onBack={() => navigate("/")}
      />

      <div className="card-soft mb-3">
        <p className="small bold mb-1" style={{ marginBottom: 4 }}><Icon name="map" size={14} style={{ verticalAlign: -2 }} /> {r.context}</p>
        <div className="msg assistant">
          <strong>La recruteuse :</strong> {pt ? r.linePt : r.line}
        </div>
      </div>

      {phase === "choiceEnd" && chosen ? (
        <Card className="center duel-feedback">
          <div className="row center" style={{ justifyContent: "center" }}>
            <Chip variant={chosen.score >= 2 ? "green" : chosen.score === 1 ? "gold" : "rose"}>
              <Icon name={chosen.score >= 2 ? "check" : chosen.score === 1 ? "starHalf" : "x"} size={13} /> {chosen.score} pts de estratégia
            </Chip>
          </div>
          <p className="small mt-2" style={{ color: "var(--c-accent-deep)" }}>“{chosen.lulu}”</p>
          <p className="muted small mt-1" style={{ textAlign: "left" }}>{chosen.luluPt}</p>
          <div className="card-soft mt-3 small" style={{ textAlign: "left" }}>
            <strong><Icon name="lightbulb" size={13} /> Análise da Lulu:</strong> {chosen.feedback}
          </div>
          <Button className="mt-4" block onClick={next}>
            {round >= NEGOTIATION_ROUNDS.length - 1 ? "Ver resultado" : "Próxima rodada"}
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="stack">
            {r.choices.map((c, i) => (
              <button key={i} className="option-btn" onClick={() => pick(i)}>
                <span className="opt-letter">{["A", "B", "C"][i]}</span>
                <span>
                  {c.text}
                  <small className="muted" style={{ display: "block" }}>{c.pt}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="row-between mt-3">
            <Button variant="ghost" size="sm" onClick={() => setPt(!pt)}>
              {pt ? "Ver em francês" : "Ver tradução"}
            </Button>
            <span className="muted small row" style={{ gap: 5 }}>
              <Icon name="lightbulb" size={14} /> Escolha a resposta mais estratégica
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
