// ══════════════════════════════════════════════════════════════
// Athenas — Revisão inteligente
// "Aujourd'hui, ton cerveau veut réviser ça"
// ══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { dueItems, masteryLevel, newReviewItem } from "@/services/srs";
import { wordById } from "@/data/words";
import { Button, Card, Chip, EmptyState, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot, type Mood } from "@/components/Mascot";
import { AudioButton } from "@/components/AudioButton";
import { useSpeech } from "@/hooks/useSpeech";
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from "@/lib/constants";
import type { ReviewItem } from "@/types";

export function ReviewPage() {
  const { state, reviewWords } = useApp();
  const { navigate } = useRouter();
  const { speak, supported } = useSpeech();

  const due = useMemo(() => dueItems(state.reviewQueue), [state.reviewQueue]);
  const [queue, setQueue] = useState<ReviewItem[]>(() => due);
  const [mode, setMode] = useState<"review" | "practice">(due.length > 0 ? "review" : "practice");
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const items = queue.length > 0 ? queue : mode === "practice" ? practiceItems() : [];

  const startPractice = () => {
    setMode("practice");
    setQueue(practiceItems());
  };

  const rate = (item: ReviewItem, quality: number) => {
    const idx = queue.findIndex((q) => q.wordId === item.wordId);
    if (idx === -1) return;
    setQueue((q) => q.filter((_, i) => i !== idx));
    setDone((d) => d + 1);
    setFlipped(false);
    reviewWords([{ wordId: item.wordId, quality }]);
  };

  const current = items[0];

  if (mode === "review" && items.length === 0 && done > 0) {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="brain" size={20} style={{ verticalAlign: -3 }} /> Revisão</>} onBack={() => navigate("/")} />
        <Card className="center">
          <Mascot mood="proud" size={120} />
          <h2>Memória afiada !</h2>
          <p className="muted small">Você revisou {done} palavras. Seu cérebro agradece.</p>
          <Chip variant="gold">+{done * 3 + 10} XP</Chip>
          <div className="stack mt-4">
            <Button block onClick={() => navigate("/")}>
              Voltar pra casa
            </Button>
            <Button variant="soft" block onClick={() => { setDone(0); setQueue(dueItems(state.reviewQueue)); setMode(dueItems(state.reviewQueue).length > 0 ? "review" : "practice"); }}>
              Revisar de novo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="brain" size={20} style={{ verticalAlign: -3 }} /> Revisão</>} sub="Repetição espaçada inteligente" onBack={() => navigate("/")} />
        <EmptyState
          icon="flower"
          title="Nada para revisar agora"
          text="Você está em dia! Complete mais aulas para encher sua fila de revisão — ou pratique as palavras recentes."
          action={
            <Button onClick={startPractice}>Praticar palavras recentes</Button>
          }
        />
        <div className="center mt-4">
          <Mascot mood="happy" size={100} />
        </div>
      </div>
    );
  }

  const word = wordById(current.wordId);
  if (!word) return null;
  const mood: Mood = masteryLevel(current) === "dominada" ? "proud" : "happy";

  return (
    <div className="page">
      <PageHeader
        title={<><Icon name="brain" size={20} style={{ verticalAlign: -3 }} /> Revisão</>}
        sub={`${done + 1} de ${items.length + done} · ${due.length} aguardando`}
        onBack={() => navigate("/")}
      />

      <Card className="center" onClick={() => supported && speak(word.fr)} style={{ cursor: supported ? "pointer" : "default" }}>
        <Mascot mood={mood} size={90} />
        {!flipped ? (
          <>
            <div className="bold" style={{ fontSize: "2rem" }}>{word.fr}</div>
            {word.gender && <Chip variant="accent">{word.gender === "m" ? "masculino" : "feminino"}</Chip>}
            <div className="row center mt-2" style={{ justifyContent: "center" }}>
              <AudioButton text={word.fr} label={`Ouvir ${word.fr}`} />
            </div>
            <p className="muted small mt-2">Toque para revelar a tradução</p>
            <Button variant="ghost" block onClick={() => setFlipped(true)}>
              Mostrar tradução
            </Button>
          </>
        ) : (
          <>
            <div className="bold" style={{ fontSize: "1.6rem" }}>{word.pt}</div>
            {word.exampleFr && (
              <p className="small muted mt-2">
                {word.exampleFr}
                <br />
                <em>{word.examplePt}</em>
              </p>
            )}
            <div className="small muted mt-2">Você lembrou ?</div>
            <div className="row mt-3" style={{ justifyContent: "center" }}>
              <Button variant="ghost" onClick={() => rate(current, 1)}>
                <Icon name="smileySad" size={16} /> Esqueci
              </Button>
              <Button variant="soft" onClick={() => rate(current, 3)}>
                <Icon name="smileyMeh" size={16} /> Difícil
              </Button>
              <Button onClick={() => rate(current, 5)}>
                <Icon name="smiley" size={16} /> Fácil
              </Button>
            </div>
          </>
        )}
      </Card>

      <div className="center mt-4">
        <p className="muted small">
          {mode === "practice" ? "Prática livre (não altera a fila real)" : "Revisão espaçada: palavras difíceis voltam mais cedo."}
        </p>
      </div>
    </div>
  );
}

function practiceItems(): ReviewItem[] {
  // Palavras já aprendidas (sem precisar mexer na fila real)
  const learned: string[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (Array.isArray(s.wordsLearned)) learned.push(...s.wordsLearned.slice(-10));
    }
  } catch {
    // ignore
  }
  return learned.map((w) => newReviewItem(w));
}

export { practiceItems };
