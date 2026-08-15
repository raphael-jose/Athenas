// ══════════════════════════════════════════════════════════════
// Athenas — Celebrações: level up e conquistas
// ══════════════════════════════════════════════════════════════
import { useApp } from "@/hooks/useApp";
import { Button, Modal } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";

export function LevelUpModal() {
  const { levelUpEvent, dismissLevelUp } = useApp();
  return (
    <Modal open={!!levelUpEvent} onClose={dismissLevelUp}>
      <div className="center" style={{ padding: "8px 0" }}>
        <Mascot mood="excited" size={130} />
        <h2 style={{ marginTop: 8, color: "var(--c-primary-deep)" }}>Niveau {levelUpEvent?.level} !</h2>
        <p className="bold" style={{ fontSize: "1.15rem", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {levelUpEvent?.name}
          <span style={{ color: levelUpEvent && levelUpEvent.level >= 50 ? "var(--c-gold)" : "var(--c-primary)", display: "inline-flex" }}>
            <Icon name={levelUpEvent && levelUpEvent.level >= 50 ? "crown" : "confetti"} size={22} filled />
          </span>
        </p>
        <p className="muted small mt-2">Que evolução! Continue assim, o francês está ficando cada vez mais seu.</p>
        <Button className="mt-3" block onClick={dismissLevelUp}>
          Continuar a aventura
        </Button>
      </div>
    </Modal>
  );
}

export function AchievementModal() {
  const { achievementEvent, dismissAchievement } = useApp();
  return (
    <Modal open={!!achievementEvent} onClose={dismissAchievement}>
      <div className="center" style={{ padding: "8px 0" }}>
        <div className="floaty" style={{ color: "var(--c-gold)", display: "flex", justifyContent: "center" }}>
          <Icon name={achievementEvent?.icon ?? "trophy"} size={56} filled />
        </div>
        <h2 style={{ marginTop: 8 }}>Conquista desbloqueada !</h2>
        <p className="bold" style={{ fontSize: "1.2rem", margin: 0 }}>
          {achievementEvent?.title}
        </p>
        <p className="muted small mt-2">{achievementEvent?.desc}</p>
        <Button variant="gold" className="mt-3" block onClick={dismissAchievement}>
          Que orgulho !
        </Button>
      </div>
    </Modal>
  );
}
