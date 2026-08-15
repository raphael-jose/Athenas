// ══════════════════════════════════════════════════════════════
// Athenas — Boss fight
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { BOSSES, worldById } from "@/data/worlds";
import { ExercisePlayer, type ExerciseResult } from "@/components/ExercisePlayer";
import { Button, Card, Chip, EmptyState, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { LuluBurst } from "@/components/LuluBurst";
import { fireConfetti } from "@/lib/confetti";

type Phase = "intro" | "battle" | "victory";

export function BossBattle({ bossId }: { bossId: string }) {
  const { state, completeBoss } = useApp();
  const { navigate } = useRouter();
  const boss = BOSSES[bossId];
  const [phase, setPhase] = useState<Phase>("intro");
  const [exIdx, setExIdx] = useState(0);
  const [damage, setDamage] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  if (!boss) return <EmptyState icon="smileySad" title="Boss não encontrado" />;

  const world = worldById(boss.worldId);
  const exercises = boss.exercises;
  const hp = Math.max(0, 100 - (damage / exercises.length) * 100);
  const firstTryCount = results.filter((r) => r.firstTry).length;
  const allFirstTry = results.length > 0 && results.every((r) => r.firstTry);

  const onResult = (r: ExerciseResult) => {
    setResults((prev) => [...prev, r]);
    if (!r.correct || !r.firstTry) setDamage((d) => d + 1);
  };

  const next = () => {
    if (exIdx + 1 >= exercises.length) {
      completeBoss(boss.id, boss.worldId, boss.xp);
      setPhase("victory");
      fireConfetti(true);
    } else {
      setExIdx((i) => i + 1);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title={<><Icon name={boss.icon} size={20} style={{ verticalAlign: -3 }} /> {boss.title}</>}
        sub={world ? <><Icon name={world.icon} size={14} style={{ verticalAlign: -2 }} /> {world.title}</> : "Boss"}
        onBack={() => navigate(world ? `/world/${world.id}` : "/map")}
      />

      {phase === "intro" && (
        <Card className="center">
          <div className="boss-emoji" style={{ color: "var(--c-red)", display: "flex", justifyContent: "center" }}>
            <Icon name={boss.icon} size={56} />
          </div>
          <h2>O chefe apareceu !</h2>
          <p className="muted small">{boss.intro}</p>
          <div className="row center" style={{ justifyContent: "center" }}>
            <Chip variant="rose"><Icon name="sword" size={14} /> Mistura tudo</Chip>
            <Chip variant="gold">+{boss.xp} XP</Chip>
          </div>
          <Button className="mt-4" block onClick={() => setPhase("battle")}>
            Enfrentar {boss.title}
          </Button>
        </Card>
      )}

      {phase === "battle" && (
        <>
          <Card className="mb-3">
            <div className="row-between small mb-2">
              <span className="bold row" style={{ gap: 5 }}><Icon name={boss.icon} size={15} /> HP</span>
              <span className="muted">
                Ataque {exIdx + 1}/{exercises.length}
              </span>
            </div>
            <div className="boss-hp">
              <span style={{ width: `${hp}%` }} />
            </div>
          </Card>
          <ExercisePlayer key={`${bossId}-${exIdx}`} exercise={exercises[exIdx]} index={exIdx} total={exercises.length} onResult={onResult} onNext={next} />
        </>
      )}

      {phase === "victory" && (
        <Card className="center">
          <LuluBurst theme={state.settings.theme}>
            <Mascot mood="excited" size={130} />
          </LuluBurst>
          <h2 className="row" style={{ fontSize: "1.5rem", justifyContent: "center", gap: 8 }}>Victoire ! <Icon name="confetti" size={22} /></h2>
          <p className="muted small">
            {firstTryCount}/{exercises.length} golpes perfeitos
            {allFirstTry && " · sem levar dano!"}
          </p>
          <div className="row center mt-3" style={{ justifyContent: "center" }}>
            <Chip variant="gold">+{boss.xp} XP</Chip>
            <Chip variant="rose"><Icon name="star" size={14} /> +25 étoiles</Chip>
            {allFirstTry && <Chip variant="green"><Icon name="starFour" size={14} /> Impecável</Chip>}
          </div>
          <p className="small muted mt-3">
            {world ? (
              <span className="row" style={{ gap: 6, justifyContent: "center" }}>
                <Icon name={world.icon} size={15} /> Mundo {world.title} concluído!
              </span>
            ) : (
              "Boss derrotado!"
            )}
          </p>
          <div className="stack mt-4">
            <Button block onClick={() => navigate("/map")}>
              Voltar ao mapa
            </Button>
            <Button variant="soft" block onClick={() => navigate("/review")}>
              Revisar palavras
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
