// ══════════════════════════════════════════════════════════════
// Athenas — Conquistas
// ══════════════════════════════════════════════════════════════
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { ACHIEVEMENTS } from "@/services/gamification";
import { PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";

export function AchievementsPage() {
  const { state } = useApp();
  const { navigate } = useRouter();
  const unlocked = state.achievements.length;

  return (
    <div className="page">
      <PageHeader title={<><Icon name="trophy" size={20} style={{ verticalAlign: -3 }} /> Conquistas</>} sub={`${unlocked} de ${ACHIEVEMENTS.length} desbloqueadas`} onBack={() => navigate("/profile")} />

      <div className="stack">
        {ACHIEVEMENTS.map((a) => {
          const got = state.achievements.includes(a.id);
          return (
            <div key={a.id} className={`achievement ${got ? "" : "locked"}`}>
              <div className="a-emoji" style={{ color: got ? "var(--c-gold)" : "var(--c-muted)" }}>
                <Icon name={a.icon} size={30} />
              </div>
              <div className="grow">
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
              {got && (
                <span title="Desbloqueada" style={{ color: "var(--c-green)", display: "inline-flex" }}>
                  <Icon name="check" size={18} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="center mt-4">
        <Mascot mood={unlocked > 5 ? "proud" : "happy"} size={90} />
      </div>
    </div>
  );
}
