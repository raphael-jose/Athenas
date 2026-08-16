// ══════════════════════════════════════════════════════════════
// Athenas — Detalhe do mundo: lista de aulas + boss
// ══════════════════════════════════════════════════════════════
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { CEFR_LABELS } from "@/lib/constants";
import { isBossUnlocked, isLessonUnlocked, worldById, worldLessons, worldProgress } from "@/data/worlds";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { BossSprite } from "@/components/BossSprite";

export function WorldDetail({ worldId }: { worldId: string }) {
  const { state } = useApp();
  const { navigate } = useRouter();
  const world = worldById(worldId);
  if (!world) return <EmptyState icon="smileySad" title="Mundo não encontrado" />;

  const lessons = worldLessons(world);
  const progress = worldProgress(world, state.lessonsCompleted);
  const bossUnlocked = isBossUnlocked(world, state.lessonsCompleted);
  const bossDone = world.boss ? state.bossesDefeated.includes(world.boss.id) : false;

  return (
    <div className="page">
      <PageHeader
        title={<><Icon name={world.icon} size={20} style={{ verticalAlign: -3 }} /> {world.title}</>}
        sub={`CEFR ${CEFR_LABELS[world.cefr]} · ${progress.done}/${progress.total} aulas`}
        onBack={() => navigate("/map")}
      />

      <div className="card-soft mb-3">
        <p className="small muted" style={{ margin: 0 }}>{world.description}</p>
        <div className="mt-2">
          <ProgressBar value={(progress.done / Math.max(1, progress.total)) * 100} />
        </div>
      </div>

      <div className="section-title">
        <Icon name="target" size={18} /> Missões
      </div>
      <div className="stack">
        {lessons.map((lesson) => {
          const done = state.lessonsCompleted.includes(lesson.id);
          const unlocked = isLessonUnlocked(world, lesson.id, state.lessonsCompleted);
          const perfect = state.perfectLessons.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              className={`lesson-card ${!unlocked ? "locked" : ""}`}
              disabled={!unlocked}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
            >
              <div className="lc-emoji">
                <Icon name={lesson.icon} size={24} />
              </div>
              <div className="grow">
                <h4>
                  {done ? " " : ""}
                  {lesson.title}
                </h4>
                <div className="lc-meta">{lesson.objective}</div>
              </div>
              {perfect && (
                <span title="Perfeito!" style={{ color: "var(--c-gold)", display: "inline-flex" }}>
                  <Icon name="starFour" size={18} filled />
                </span>
              )}
              {!unlocked && (
                <span title="Aula bloqueada" style={{ color: "var(--c-muted)", display: "inline-flex" }}>
                  <Icon name="lock" size={16} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {world.boss && (
        <>
          <div className="section-title">
            <Icon name="sword" size={18} /> Chefe da região
          </div>
          <button
            className={`lesson-card ${!bossUnlocked || bossDone ? "locked" : ""}`}
            disabled={!bossUnlocked || bossDone}
            onClick={() => navigate(`/boss/${world.boss!.id}`)}
          >
            <div className="lc-emoji" style={{ background: "var(--c-red-soft)" }}>
              <BossSprite bossId={world.boss.id} size={40} />
            </div>
            <div className="grow">
              <h4>{bossDone ? " " : ""}{world.boss.title}</h4>
              <div className="lc-meta">{bossDone ? "Derrotado!" : "Mistura tudo o que você aprendeu."}</div>
            </div>
            {!bossUnlocked && (
              <span title="Complete todas as aulas" style={{ color: "var(--c-muted)", display: "inline-flex" }}>
                <Icon name="lock" size={16} />
              </span>
            )}
          </button>
        </>
      )}

      {worldId === "world-8" && (
        <>
          <div className="section-title">
            <Icon name="scales" size={18} /> Mini-jogo da região
          </div>
          <button className="lesson-card" onClick={() => navigate("/negociation")}>
            <div className="lc-emoji" style={{ background: "var(--c-gold-soft, #fdf3dd)" }}>
              <Icon name="scales" size={24} />
            </div>
            <div className="grow">
              <h4>Négociation salariale</h4>
              <div className="lc-meta">Simule uma negociação de salário com a Lulu recrutadora e escolha as respostas estratégicas.</div>
            </div>
            <span style={{ color: "var(--c-gold)", display: "inline-flex" }}>
              <Icon name="arrowRight" size={16} />
            </span>
          </button>
        </>
      )}

      {lessons.length === 0 && (
        <EmptyState icon="radio" title="Mundo em construção" text="Este mundo faz parte das próximas fases do Athenas. Fique de olho!" />
      )}

      <div className="center mt-4">
        <Mascot mood="proud" size={90} />
      </div>
    </div>
  );
}
