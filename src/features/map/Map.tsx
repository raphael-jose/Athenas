// ══════════════════════════════════════════════════════════════
// Athenas — Mapa do mundo
// ══════════════════════════════════════════════════════════════
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { CEFR_LABELS } from "@/lib/constants";
import { isWorldCleared, isWorldUnlocked, WORLDS, worldProgress } from "@/data/worlds";
import { PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";

export function MapPage() {
  const { state } = useApp();
  const { navigate } = useRouter();

  return (
    <div className="page">
      <PageHeader title={<><Icon name="map" size={20} style={{ verticalAlign: -3 }} /> Mapa do Athenas</>} sub={`Nível CEFR: ${CEFR_LABELS[state.cefr]}`} />

      {WORLDS.map((w, i) => {
        const unlocked = isWorldUnlocked(w, state.cefr, state.worldsCleared);
        const cleared = isWorldCleared(w, state.lessonsCompleted);
        const progress = worldProgress(w, state.lessonsCompleted);
        const hasContent = w.lessons.length > 0;

        return (
          <div key={w.id}>
            <button
              className={`world-card ${w.color} ${unlocked && !cleared ? "tap" : ""} ${!unlocked ? "locked" : ""}`}
              disabled={!unlocked}
              onClick={() => navigate(`/world/${w.id}`)}
              aria-label={`Mundo ${w.title}`}
            >
              {cleared ? (
                <span className="wc-cfr" style={{ background: "rgba(40,120,80,0.5)" }}> Concluído</span>
              ) : unlocked ? (
                <span className="wc-cfr">CEFR {CEFR_LABELS[w.cefr]}</span>
              ) : hasContent ? (
                <span className="wc-lock">
                  <Icon name="lock" size={13} /> {CEFR_LABELS[w.unlockCefr]}
                </span>
              ) : (
                <span className="wc-lock">
                  <Icon name="radio" size={13} /> Em breve
                </span>
              )}
              <span className="wc-emoji">
                <Icon name={w.icon} size={40} />
              </span>
              <h3>{w.title}</h3>
              <div className="wc-meta">{w.description}</div>
              {hasContent && (
                <>
                  <div className="wc-progress">
                    <span style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                  </div>
                  <div className="row-between mt-2 small" style={{ color: "rgba(255,255,255,0.92)" }}>
                    <span>
                      {progress.done}/{progress.total} aulas
                    </span>
                    {w.boss && (
                      <span className="row" style={{ gap: 5 }}>
                        <Icon name="sword" size={14} /> Boss {state.bossesDefeated.includes(w.boss.id) ? "" : ""}
                      </span>
                    )}
                  </div>
                </>
              )}
            </button>
            {i < WORLDS.length - 1 && <div className="map-connector" aria-hidden />}
          </div>
        );
      })}

      <div className="card-soft mt-4 center">
        <Mascot mood="happy" size={80} />
        <p className="small muted">
          Quanto mais você estuda, mais o mapa se abre. O caminho vai de A0 até o Modo Deus Supremo: os mundos Français Avancé, Maîtrise e Mode Natif se liberam quando você alcança o nível NATIF.
        </p>
      </div>
    </div>
  );
}
