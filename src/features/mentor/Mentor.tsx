// ══════════════════════════════════════════════════════════════
// Athenas — Mentor 
// Sua guia pessoal de estudos: plano do dia, insights,
// dica do dia e conselho rápido.
// ══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { buildDailyPlan, buildMentorInsights, mentorAdvice, mentorGreeting, MENTOR_TIPS, type MentorAdvice } from "@/services/mentor";
import { levelFromXp, levelName } from "@/services/gamification";
import { nextReviewCount } from "@/services/srs";
import { DAILY_XP_GOAL } from "@/lib/constants";
import { percent } from "@/lib/utils";
import { Mascot } from "@/components/Mascot";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";

const ADVICE_QUESTIONS = [
  "Como estudar melhor?",
  "O que revisar hoje?",
  "Estou travando na gramática",
  "Sem motivação hoje",
  "Como treinar a fala?"
];

const PRIORITY_LABEL = ["1º", "2º", "3º", "4º"];

export function MentorPage() {
  const { state } = useApp();
  const { navigate } = useRouter();
  const [advice, setAdvice] = useState<MentorAdvice | null>(null);

  const plan = useMemo(() => buildDailyPlan(state), [state]);
  const insights = useMemo(() => buildMentorInsights(state), [state]);
  const tip = useMemo(() => MENTOR_TIPS[Math.floor(Date.now() / 86_400_000) % MENTOR_TIPS.length], []);

  const lvl = levelFromXp(state.xp);
  const due = nextReviewCount(state.reviewQueue);
  const xpToday = state.dailyProgress[state.lastDailyDate]?.xp ?? 0;
  const acc = percent(state.exercisesCorrect, state.exercisesTotal);

  return (
    <div className="page">
      <PageHeader
        title={
          <>
            Mentor <Icon name="compass" size={20} style={{ verticalAlign: -3 }} />
          </>
        }
        sub="Sua guia pessoal de estudos"
        onBack={() => navigate("/")}
      />

      {/* Saudação da mentora */}
      <Card className="center" style={{ paddingTop: 30 }}>
        <div style={{ marginTop: -66 }}>
          <Mascot mood="excited" size={108} />
        </div>
        <p className="muted small" style={{ maxWidth: 330, margin: "4px auto 0" }}>
          {mentorGreeting(state)}
        </p>
        <div className="row center mt-3" style={{ justifyContent: "center", gap: 6 }}>
          <Chip variant="rose">Nível {lvl} — {levelName(lvl)}</Chip>
          <Chip variant="gold">{xpToday}/{DAILY_XP_GOAL} XP hoje</Chip>
        </div>
      </Card>

      {/* Plano do dia */}
      <div className="section-title">
        <Icon name="calendar" size={18} /> Plano de hoje
      </div>
      <Card>
        <div className="stack">
          {plan.map((item, i) => (
            <button
              key={item.id}
              className="plan-item tap"
              onClick={() => item.to && navigate(item.to)}
            >
              <span className="plan-prio">{PRIORITY_LABEL[i] ?? `${i + 1}º`}</span>
              <span className="plan-emoji">
                <Icon name={item.icon} size={22} />
              </span>
              <span className="grow plan-body">
                <span className="bold small">{item.title}</span>
                <span className="muted small">{item.desc}</span>
              </span>
              {item.to && <Icon name="back" size={16} style={{ transform: "rotate(180deg)", color: "var(--c-muted)" }} />}
            </button>
          ))}
        </div>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (          <>
            <div className="section-title">
              <Icon name="lightbulb" size={18} /> Insights
            </div>
            <div className="stack">
              {insights.map((ins) => (
                <Card
                  key={ins.title}
                  soft
                  className={ins.to ? "tap" : ""}
                  onClick={() => ins.to && navigate(ins.to)}
                >
                  <div className="row" style={{ gap: 10 }}>
                    <span style={{ color: "var(--c-accent-deep)", display: "inline-flex" }}>
                      <Icon name={ins.icon} size={22} />
                    </span>
                  <span className="grow">
                    <span className="bold small">{ins.title}</span>
                    <span className="muted small">{ins.text}</span>
                  </span>
                  {ins.to && <Icon name="back" size={15} style={{ transform: "rotate(180deg)", color: "var(--c-muted)" }} />}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Estatísticas rápidas */}
      <div className="section-title">
        <Icon name="chartBar" size={18} /> Como você está
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="s-emoji">
            <Icon name="brain" size={26} />
          </div>
          <div className="s-val">{due}</div>
          <div className="s-lbl">revisões pendentes</div>
        </div>
        <div className="stat-card">
          <div className="s-emoji">
            <Icon name="starFour" size={26} />
          </div>
          <div className="s-val">{state.xp}</div>
          <div className="s-lbl">XP total</div>
        </div>
        <div className="stat-card">
          <div className="s-emoji">
            <Icon name="target" size={26} />
          </div>
          <div className="s-val">{acc}%</div>
          <div className="s-lbl">precisão</div>
        </div>
        <div className="stat-card">
          <div className="s-emoji">
            <Icon name="flame" size={26} />
          </div>
          <div className="s-val">{state.streak}</div>
          <div className="s-lbl">dias seguidos</div>
        </div>
      </div>

      {/* Conselho rápido */}
      <div className="section-title">
        <Icon name="chatCircleDots" size={18} /> Precisa de um conselho?
      </div>
      <Card>
        <p className="muted small" style={{ marginTop: 0 }}>
          Toque numa pergunta e a Lulu mentora responde na hora:
        </p>
        <div className="chip-row">
          {ADVICE_QUESTIONS.map((q) => (
            <button key={q} className="chip chip-btn tap" onClick={() => setAdvice(mentorAdvice(state, q))}>
              {q}
            </button>
          ))}
        </div>
        {advice && (
          <div className="advice-bubble">
            <span style={{ color: "var(--c-accent-deep)", display: "inline-flex" }}>
              <Icon name={advice.icon} size={22} />
            </span>
            <span className="grow small">{advice.text}</span>
          </div>
        )}
      </Card>

      {/* Dica do dia */}
      <div className="section-title">
        <Icon name="flower" size={18} /> Dica do dia
      </div>
      <Card soft>
        <p className="small" style={{ margin: 0 }}>
          {tip}
        </p>
      </Card>

      <div className="row center mt-4" style={{ justifyContent: "center" }}>
        <Button variant="soft" onClick={() => navigate("/map")}>
          Explorar o mapa
        </Button>
      </div>
    </div>
  );
}
