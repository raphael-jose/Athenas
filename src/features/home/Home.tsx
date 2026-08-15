// ══════════════════════════════════════════════════════════════
// Athenas — Home: "Bonjour !  Pronta para mais uma aventura?"
// ══════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { CEFR_LABELS, DAILY_XP_GOAL } from "@/lib/constants";
import { levelProgress, levelName } from "@/services/gamification";
import { nextReviewCount } from "@/services/srs";
import { nextLessonInWorld, WORLDS } from "@/data/worlds";
import { Mascot } from "@/components/Mascot";
import { Button, Card, Chip, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/Icons";
import type { IconName } from "@/types";
import { percent } from "@/lib/utils";

export function Home() {
  const { state } = useApp();
  const { navigate } = useRouter();
  const lvl = levelProgress(state.xp);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const nextWorld = useMemo(() => {
    for (const w of WORLDS) {
      if (w.lessons.length === 0) continue;
      if (!state.worldsUnlocked.includes(w.id) && !state.worldsCleared.includes(w.id)) continue;
      const next = nextLessonInWorld(w, state.lessonsCompleted);
      if (next) return { world: w, lesson: next };
    }
    return null;
  }, [state.worldsUnlocked, state.worldsCleared, state.lessonsCompleted]);

  const due = nextReviewCount(state.reviewQueue);
  const xpToday = state.dailyProgress[state.lastDailyDate]?.xp ?? 0;

  const mascotMsg = useMemo(() => {
    if (due > 0) return "Ton cerveau quer revisar umas palavras… bora?";
    if (state.dailyMissions.some((m) => !m.done)) return "Tem missões do dia te esperando!";
    if (!nextWorld) return "Você já fez tudo por hoje… incrível!";
    return nextWorld.lesson
      ? `Pronta para "${nextWorld.lesson.title}"? Eu te acompanho!`
      : "Pronta para mais uma aventura ?";
  }, [due, state.dailyMissions, nextWorld]);

  return (
    <div className="page">
      <header className="topbar">
        <img src="./logo.png" alt="Athenas" className="logo-img" />        <div className="brand">Athenas</div>
        <div className="stat-pill" title="Sequência de dias">
          <span className="val">
            <span style={{ color: "#e88a3a", display: "inline-flex" }}>
              <Icon name="flame" size={16} filled />
            </span>{" "}
            {state.streak}
          </span>
          <span className="lbl">dias</span>
        </div>
        <div className="stat-pill" title="Étoiles">
          <span className="val">
            <span style={{ color: "var(--c-gold)", display: "inline-flex" }}>
              <Icon name="star" size={16} filled />
            </span>{" "}
            {state.stars}
          </span>
          <span className="lbl">étoiles</span>
        </div>
      </header>

      {/* Saudação + mascote */}
      <Card className="center" style={{ paddingTop: 28 }}>
        <div style={{ marginTop: -64 }}>
          <Mascot mood={due > 0 ? "happy" : "excited"} size={110} />
        </div>
        <h2 style={{ fontSize: "1.4rem", margin: "4px 0 0" }}>
          {greeting}, {state.name || "amigue"} ! 
        </h2>
        <p className="muted small" style={{ maxWidth: 340, margin: "8px auto 0" }}>
          {mascotMsg}
        </p>
        <div className="row center mt-3" style={{ justifyContent: "center" }}>
          <Button size="sm" onClick={() => navigate("/ai")}>
            <Icon name="chat" size={15} /> Falar com a Lulu
          </Button>
          {due > 0 && (
            <Button size="sm" variant="gold" onClick={() => navigate("/review")}>
              <Icon name="brain" size={15} /> Revisar ({due})
            </Button>
          )}
        </div>
      </Card>

      {/* Nível + XP + CEFR */}
      <Card className="mt-3">
        <div className="row-between">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
              Nível {lvl.level} — {levelName(lvl.level)}
            </h3>
            <p className="muted small" style={{ margin: "2px 0 0" }}>
              {lvl.into} / {lvl.needed} XP para o próximo nível
            </p>
          </div>
          <Chip variant="rose">XP {state.xp}</Chip>
        </div>
        <div className="mt-3">
          <ProgressBar value={lvl.pct} />
        </div>
        <div className="row-between mt-4" style={{ alignItems: "flex-start" }}>
          <div className="grow">
            <div className="small bold mb-1">Nível CEFR</div>
            <div className="cefr-strip">
              {CEFR_LABELS.map((c, i) => (
                <span key={c} className={`cefr-dot ${i <= state.cefr ? "on" : ""} ${i === state.cefr ? "current" : ""}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <Chip variant="gold">
            Hoje: {xpToday}/{DAILY_XP_GOAL} XP
          </Chip>
        </div>
      </Card>

      {/* Mentor — plano do dia */}
      <Card className="tap mt-3 mentor-banner" onClick={() => navigate("/mentor")}>
        <div className="row">
          <span
            className="lc-emoji"
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--c-accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            <Mascot mood="explaining" size={48} />
          </span>
          <div className="grow">
            <div className="muted small bold">MINHA MENTORA</div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Seu plano do dia está pronto</h3>
            <p className="muted small" style={{ margin: "2px 0 0" }}>
              Revisões, treinos e a próxima aula — eu planejei tudo.
            </p>
          </div>
          <span style={{ fontSize: "1.2rem" }}>→</span>
        </div>
      </Card>

      {/* Continuar aventura */}
      {nextWorld && (
        <Card className="tap mt-3" onClick={() => navigate(`/lesson/${nextWorld.lesson.id}`)}>
          <div className="row">
            <div className="lc-emoji" style={{ width: 52, height: 52, borderRadius: 16, background: "var(--c-accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={nextWorld.lesson.icon} size={26} />
            </div>
            <div className="grow">
              <div className="muted small bold">CONTINUAR AVENTURA</div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                {nextWorld.lesson.title}
              </h3>
            </div>
            <span style={{ fontSize: "1.2rem" }}>→</span>
          </div>
        </Card>
      )}

      {/* Missões do dia */}
      <div className="section-title">
        <Icon name="target" size={18} /> Missões de hoje
      </div>
      <Card>
        <div className="stack">
          {state.dailyMissions.map((m) => (
            <div key={m.id}>
              <div className="row-between small">
                <span className="bold row" style={{ gap: 6 }}>
                  <Icon name={m.icon} size={16} /> {m.label}
                </span>
                {m.done ? <Chip variant="green"> +{m.xp} XP</Chip> : <span className="muted">{m.progress}/{m.target}</span>}
              </div>
              <div className="mt-2">
                <ProgressBar thin value={percent(m.progress, m.target)} variant="green" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Atalhos */}
      <div className="section-title">
        <Icon name="sparkle" size={18} /> Explore
      </div>
      <div className="stats-grid">
        {(
          [
            { icon: "map" as IconName, lbl: "Aventura", to: "/map", tint: "mint" },
            { icon: "brain" as IconName, lbl: due > 0 ? `Revisar (${due})` : "Revisar", to: "/review", tint: "gold" },
            { icon: "chat" as IconName, lbl: "Lulu IA", to: "/ai", tint: "lilac" },
            { icon: "trophy" as IconName, lbl: "Conquistas", to: "/achievements", tint: "gold" },
            { icon: "book" as IconName, lbl: "Gramática", to: "/grammar", tint: "rose" },
            { icon: "speaker" as IconName, lbl: "Pronúncia", to: "/practice/pronunciation", tint: "blue" },
            { icon: "book" as IconName, lbl: "Vocabulário", to: "/vocabulary", tint: "lilac" },
            { icon: "sword" as IconName, lbl: "Duelo", to: "/duel", tint: "gold" },
            { icon: "lightning" as IconName, lbl: "Desafio ⚡", to: "/challenge", tint: "gold" },
            { icon: "scales" as IconName, lbl: "Negociação", to: "/negociation", tint: "gold" },
            { icon: "heart" as IconName, lbl: "Loja", to: "/customize", tint: "rose" }
          ]
        ).map((a) => (
          <button key={a.to} className="stat-card tap" onClick={() => navigate(a.to)}>
            <span className={`s-ico tint-${a.tint}`}>
              <Icon name={a.icon} size={22} />
            </span>
            <div className="s-lbl">{a.lbl}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
