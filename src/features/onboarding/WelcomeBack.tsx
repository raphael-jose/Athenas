// ══════════════════════════════════════════════════════════════
// Athenas — Tela de boas-vindas (login com memória)
// O app é 100% local, então \"login\" = lembrar quem você é e para
// onde estava indo. Aparece uma vez por dia: mostra avatar, nome,
// streak, nível, XP e a próxima atividade — um toque e você
// continua exatamente de onde parou (rota salva ou plano do dia).
// ══════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { levelFromXp, levelName, levelProgress } from "@/services/gamification";
import { buildDailyPlan } from "@/services/mentor";
import { dueItems } from "@/services/srs";
import { resumeTarget } from "@/services/session";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icons";
import type { IconName } from "@/types";

export function WelcomeBack() {
  const { state, markLoggedIn } = useApp();
  const { navigate } = useRouter();

  const plan = useMemo(() => buildDailyPlan(state), [state]);
  const nextLesson = plan.find((i) => i.kind === "lesson");
  const due = useMemo(() => dueItems(state.reviewQueue).length, [state.reviewQueue]);
  const level = levelFromXp(state.xp);
  const pct = levelProgress(state.xp).pct;
  const target = resumeTarget(state);

  const continueFn = () => {
    markLoggedIn();
    navigate(target);
  };

  const name = state.name.trim() || "Amélie";

  return (
    <div className="landing">
      <img src="./logo.png" alt="Athenas" className="logo-img" />
      <div className="floaty" style={{ color: "var(--c-primary)", display: "flex", justifyContent: "center" }}>
        <Icon name={(state.avatar as IconName) || "rabbit"} size={92} />
      </div>
      <h2 style={{ margin: "4px 0 2px" }}>Bon retour, {name} ! 💗</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Que bom te ver de novo. Quer continuar a aventura?
      </p>

      <div className="row wrap center" style={{ gap: 8, justifyContent: "center", margin: "10px 0 18px" }}>
        <span className="chip chip-rose">
          <Icon name="flame" size={14} /> {state.streak} {state.streak === 1 ? "dia" : "dias"}
        </span>
        <span className="chip chip-accent">
          <Icon name="starFour" size={14} /> Nível {level} · {levelName(level)}
        </span>
        <span className="chip">
          <Icon name="sparkle" size={14} /> {state.xp} XP
        </span>
      </div>

      <div className="card card-soft" style={{ width: "100%", maxWidth: 430, textAlign: "left", marginBottom: 18 }}>
        <p className="small bold" style={{ margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="signpost" size={15} /> Onde você parou
        </p>
        {nextLesson ? (
          <>
            <p style={{ margin: 0, fontSize: "1.05rem" }}>
              <Icon name={nextLesson.icon} size={18} /> {nextLesson.title}
            </p>
            <p className="muted small" style={{ margin: "4px 0 0" }}>{nextLesson.desc}</p>
          </>
        ) : due > 0 ? (
          <p style={{ margin: 0, fontSize: "1.05rem" }}>
            <Icon name="brain" size={18} /> Revisar {due} palavra{due > 1 ? "s" : ""} pendente{due > 1 ? "s" : ""}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: "1.05rem" }}>
            <Icon name="map" size={18} /> Explorar o mapa da aventura
          </p>
        )}
        <div className="progress thin" style={{ marginTop: 10 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Button size="lg" block onClick={continueFn}>
        Continuar de onde parei
      </Button>
      <p className="muted small" style={{ marginTop: 12 }}>
        Sempre logada neste dispositivo — seu progresso fica salvo por aqui. 🌸
      </p>
    </div>
  );
}
