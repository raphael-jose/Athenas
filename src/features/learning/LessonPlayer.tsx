// ══════════════════════════════════════════════════════════════
// Athenas — Player de aula
// ══════════════════════════════════════════════════════════════
import { useRef, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { XP } from "@/lib/constants";
import { lessonById, worldById, nextLessonInWorld } from "@/data/worlds";
import { wordById } from "@/data/words";
import { ExercisePlayer, type ExerciseResult } from "@/components/ExercisePlayer";
import { Button, Card, Chip, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { LuluBurst } from "@/components/LuluBurst";
import { AudioButton } from "@/components/AudioButton";
import { useSpeech } from "@/hooks/useSpeech";
import { sfxComplete } from "@/lib/sfx";
import { fireConfetti } from "@/lib/confetti";

type Phase = "intro" | "theory" | "examples" | "exercise" | "done";

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const { state, completeLesson } = useApp();
  const { navigate } = useRouter();
  const { speak } = useSpeech();
  const lesson = lessonById(lessonId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [exIdx, setExIdx] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  // Snapshot no momento em que a aula abriu (evita mostrar "revisada" na 1ª conclusão)
  const completedRef = useRef(state.lessonsCompleted.includes(lessonId));
  const completed = completedRef.current;

  if (!lesson) return <EmptyState icon="smileySad" title="Aula não encontrada" />;

  const exercises = lesson.exercises;
  const totalEx = exercises.length;
  const correctCount = results.filter((r) => r.correct).length;
  const firstTryCount = results.filter((r) => r.firstTry).length;
  const perfect = results.length > 0 && results.every((r) => r.correct && r.firstTry);
  const xpGain = (completed ? 5 : lesson.xp ?? XP.LESSON) + (perfect && !completed ? XP.PERFECT_BONUS : 0);

  const world = worldById(lesson.worldId);
  const nextLesson = world ? nextLessonInWorld(world, [...state.lessonsCompleted, lessonId]) : null;

  const onResult = (r: ExerciseResult) => {
    setResults((prev) => [...prev, r]);
  };

  const finish = () => {
    completeLesson(lessonId, {
      correct: correctCount,
      total: totalEx,
      topic: lesson.topic,
      wordIds: lesson.words ?? [],
      xp: lesson.xp ?? XP.LESSON
    });
    if (perfect && !completed) fireConfetti(true);
    sfxComplete();
    setPhase("done");
  };

  const progressPct = (() => {
    if (phase === "done") return 100;
    if (phase === "exercise") return ((exIdx + (results.length > exIdx ? 1 : 0)) / (totalEx + 3)) * 100;
    const map: Record<Phase, number> = { intro: 5, theory: 30, examples: 55, exercise: 60, done: 100 };
    return map[phase];
  })();

  const goNextExercise = () => {
    if (exIdx + 1 >= totalEx) {
      finish();
    } else {
      setExIdx((i) => i + 1);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title={<><Icon name={lesson.icon} size={20} style={{ verticalAlign: -3 }} /> {lesson.title}</>}
        sub={lesson.objective}
        onBack={() => navigate(world ? `/world/${world.id}` : "/map")}
        right={completed ? <Chip variant="green"> revisada</Chip> : undefined}
      />

      <div className="mb-3">
        <ProgressBar value={progressPct} variant={perfect ? "gold" : "accent"} />
      </div>

      {phase === "intro" && (
        <Card className="center">
          <Mascot mood="happy" size={120} />
          <h2 style={{ fontSize: "1.3rem" }}>Vamos começar ?</h2>
          <p className="muted small">Objetivo: {lesson.objective}</p>
          <div className="row center" style={{ justifyContent: "center" }}>
            <Chip variant="rose">+{lesson.xp ?? XP.LESSON} XP</Chip>
            <Chip variant="accent"><Icon name="starFour" size={14} /> {lesson.words?.length ?? 0} palavras novas</Chip>
          </div>
          <Button className="mt-4" block onClick={() => setPhase("theory")}>
            Começar
          </Button>
        </Card>
      )}

      {phase === "theory" && (
        <Card>
          <h3 className="row" style={{ gap: 8 }}><Icon name="book" size={20} /> A teoria, com carinho</h3>
          <div className="stack">
            {lesson.theory.map((t, i) => (
              <div key={i} className="row" style={{ alignItems: "flex-start" }}>
                <span aria-hidden style={{ color: "var(--c-primary)", display: "inline-flex" }}>
                  <Icon name="flower" size={15} />
                </span>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4" block onClick={() => setPhase("examples")}>
            Ver exemplos →
          </Button>
        </Card>
      )}

      {phase === "examples" && (
        <Card>
          <h3 className="row" style={{ gap: 8 }}><Icon name="chat" size={20} /> Exemplos de verdade</h3>
          <p className="muted small row" style={{ gap: 6 }}>
            <Icon name="speaker" size={15} /> Toque no alto-falante ao lado de cada frase para ouvir a pronúncia
          </p>
          <div className="stack">
            {lesson.examples.map((e, i) => (
              <div key={i} className="card-soft">
                <div className="row-between">
                  <div className="bold" style={{ fontSize: "1.05rem" }}>{e.fr}</div>
                  <AudioButton text={e.fr} size="sm" label={`Ouvir ${e.fr}`} />
                </div>
                <div className="muted small">{e.pt}</div>
              </div>
            ))}
          </div>
          <Button className="mt-4" block onClick={() => setPhase("exercise")}>
            Hora de praticar
          </Button>
        </Card>
      )}

      {phase === "exercise" && (
        <ExercisePlayer
          key={`${lessonId}-${exIdx}`}
          exercise={exercises[exIdx]}
          index={exIdx}
          total={totalEx}
          onResult={onResult}
          onNext={goNextExercise}
        />
      )}

      {phase === "done" && (
        <Card className="center">
          <LuluBurst theme={state.settings.theme}>
            <Mascot mood="excited" size={130} />
          </LuluBurst>
          <h2 className="row" style={{ fontSize: "1.5rem", justifyContent: "center", gap: 8 }}>Bravo ! <Icon name="confetti" size={22} /></h2>
          <p className="muted small">
            {correctCount}/{totalEx} corretos · {firstTryCount} de primeira
          </p>
          <div className="row center mt-3" style={{ justifyContent: "center" }}>
            <Chip variant="gold">+{xpGain} XP</Chip>
            {perfect && !completed && <Chip variant="green"><Icon name="starFour" size={14} /> Perfeito +{XP.PERFECT_BONUS} XP</Chip>}
          </div>

          {lesson.words && lesson.words.length > 0 && (
            <div className="card-soft mt-4" style={{ textAlign: "left" }}>
              <div className="small bold mb-2 row" style={{ gap: 6 }}><Icon name="starFour" size={14} /> Palavras aprendidas</div>
              <div className="row wrap">
                {lesson.words.map((wid) => {
                  const w = wordById(wid);
                  if (!w) return null;
                  return (
                    <button
                      key={wid}
                      className="word-audio-chip"
                      onClick={() => speak(w.fr)}
                      title={`Ouvir ${w.fr}`}
                      aria-label={`Ouvir ${w.fr}`}
                    >
                      {w.fr} <span className="muted">= {w.pt}</span>
                      <Icon name="speaker" size={13} />
                    </button>
                  );
                })}
              </div>
              <div className="small muted mt-2">Elas entraram na sua fila de revisão inteligente!</div>
            </div>
          )}

          <div className="stack mt-4">
            {nextLesson && (
              <Button block onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
                Próxima aula : {nextLesson.title} →
              </Button>
            )}
            <Button variant="ghost" block onClick={() => navigate(world ? `/world/${world.id}` : "/map")}>
              Voltar ao mundo
            </Button>
            <Button variant="soft" block onClick={() => navigate("/review")}>
              Revisar agora
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
