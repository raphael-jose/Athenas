// ══════════════════════════════════════════════════════════════
// Athenas — Prática de gramática (quiz por tópico)
// ══════════════════════════════════════════════════════════════
import { useRef, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { grammarNodeById } from "@/data/grammar";
import { grammarExercises } from "@/data/grammarPractice";
import { ExercisePlayer, type ExerciseResult } from "@/components/ExercisePlayer";
import { Button, Card, Chip, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { fireConfetti } from "@/lib/confetti";

type Phase = "intro" | "exercise" | "done";

export function GrammarPracticePage({ nodeId }: { nodeId: string }) {
  const { addXp, addStars, toast } = useApp();
  const { navigate } = useRouter();
  const node = grammarNodeById(nodeId);
  const exercises = grammarExercises(nodeId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [exIdx, setExIdx] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const awarded = useRef(false);

  if (!node) return <EmptyState icon="smileySad" title="Tópico não encontrado" />;
  if (exercises.length === 0) {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="book" size={20} style={{ verticalAlign: -3 }} /> {node.title}</>} onBack={() => navigate("/grammar")} />
        <EmptyState
          icon="radio"
          title="Prática em construção"
          text="Este tópico ainda não tem exercícios. Volte nas próximas fases do Athenas!"
          action={<Button onClick={() => navigate("/grammar")}>Voltar à gramática</Button>}
        />
      </div>
    );
  }

  const totalEx = exercises.length;
  const correct = results.filter((r) => r.correct).length;
  const perfect = results.length > 0 && results.every((r) => r.correct && r.firstTry);

  const finish = () => {
    if (!awarded.current) {
      awarded.current = true;
      addXp(15 + (perfect ? 5 : 0), { silent: true });
      addStars(5);
      toast(`Prática de ${node.title} concluída! +${15 + (perfect ? 5 : 0)} XP`, "book");
      if (perfect) fireConfetti(true);
    }
    setPhase("done");
  };

  const onNext = () => {
    if (exIdx + 1 >= totalEx) finish();
    else setExIdx((i) => i + 1);
  };

  return (
    <div className="page">
      <PageHeader title={<><Icon name={node.icon} size={20} style={{ verticalAlign: -3 }} /> {node.title}</>} sub="Prática de gramática" onBack={() => navigate("/grammar")} />

      {phase === "intro" && (
        <Card className="center">
          <Mascot mood="explaining" size={110} />
          <h2>Bora fixar ?</h2>
          <p className="muted small">{node.blurb}</p>
          <div className="row center" style={{ justifyContent: "center" }}>
            <Chip variant="rose">+15 XP</Chip>
            <Chip variant="gold">{perfect ? "Bônus de perfeição" : `${totalEx} exercícios`}</Chip>
          </div>
          <Button className="mt-4" block onClick={() => setPhase("exercise")}>
            Praticar
          </Button>
        </Card>
      )}

      {phase === "exercise" && (
        <>
          <div className="mb-3">
            <ProgressBar value={(exIdx / totalEx) * 100} variant="accent" />
          </div>
          <ExercisePlayer
            key={`${nodeId}-${exIdx}`}
            exercise={exercises[exIdx]}
            index={exIdx}
            total={totalEx}
            onResult={(r) => setResults((prev) => [...prev, r])}
            onNext={onNext}
          />
        </>
      )}

      {phase === "done" && (
        <Card className="center">
          <Mascot mood="excited" size={120} />
          <h2>Gramática dominada !</h2>
          <p className="muted small">
            {correct}/{totalEx} corretos {perfect && "· impecável!"}
          </p>
          <Chip variant="gold">+{15 + (perfect ? 5 : 0)} XP</Chip>
          <div className="stack mt-4">
            <Button block onClick={() => navigate("/grammar")}>
              Voltar à árvore
            </Button>
            <Button
              variant="soft"
              block
              onClick={() => {
                awarded.current = false;
                setExIdx(0);
                setResults([]);
                setPhase("intro");
              }}
            >
              Praticar de novo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
