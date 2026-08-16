// ══════════════════════════════════════════════════════════════
// Athenas — Revisão inteligente
// "Aujourd'hui, ton cerveau veut réviser ça"
// ══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { dueItems, masteryLevel, newReviewItem } from "@/services/srs";
import { wordById } from "@/data/words";
import { Button, Card, Chip, EmptyState, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot, type Mood } from "@/components/Mascot";
import { AudioButton } from "@/components/AudioButton";
import { useSpeech } from "@/hooks/useSpeech";
import { STORAGE_KEY } from "@/lib/constants";
import { fuzzyMatch } from "@/lib/utils";
import { fireSparkle } from "@/lib/confetti";
import type { ReviewItem } from "@/types";

export function ReviewPage() {
  const { state, reviewWords, addStars, toast } = useApp();
  const { navigate } = useRouter();
  const { speak, supported, stop, listen, canListen } = useSpeech();

  const due = useMemo(() => dueItems(state.reviewQueue), [state.reviewQueue]);
  const [queue, setQueue] = useState<ReviewItem[]>(() => due);
  const [mode, setMode] = useState<"review" | "practice">(due.length > 0 ? "review" : "practice");
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  // Reforço: palavras que a pessoa errou NESTA sessão voltam no final,
  // com a pronúncia tocando sozinha para gravar o som na memória. 
  const [missed, setMissed] = useState<string[]>([]);
  const [reinfIdx, setReinfIdx] = useState(-1); // -1 = não está reforçando
  // Pronúncia validada pelo microfone: +1 étoile por palavra correta.
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [starsEarned, setStarsEarned] = useState(0);
  const [pronounced, setPronounced] = useState<Set<string>>(new Set());

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
    // Errou? A palavra entra no reforço e a pronúncia toca na hora.
    if (quality < 3) {
      setMissed((m) => (m.includes(item.wordId) ? m : [...m, item.wordId]));
      const w = wordById(item.wordId);
      if (w) speak(w.fr);
    }
  };

  const current = items[0];

  // ── Validação de pronúncia (repete a palavra → +1 étoile) ────
  const checkPronunciation = (item: ReviewItem) => {
    const w = wordById(item.wordId);
    if (!w) return;
    if (pronounced.has(item.wordId)) {
      toast("Você já ganhou a étoile dessa palavra ⭐", "mic");
      return;
    }
    // Para qualquer áudio tocando — senão o microfone ouve o alto-falante.
    stop();
    setHeard(null);
    setVerdict(null);
    setListening(true);
    const ok = listen({
      onResult: (transcript) => {
        setListening(false);
        setHeard(transcript);
        const clean = transcript.replace(/[?.!]$/, "");
        const perfect = fuzzyMatch(clean, w.fr.replace(/[?!.]/g, ""), [w.fr]);
        if (perfect) {
          setVerdict("correct");
          setPronounced((p) => new Set(p).add(item.wordId));
          setStarsEarned((n) => n + 1);
          addStars(1);
          fireSparkle();
          toast("Parfait ! +1 étoile ⭐", "mic");
        } else {
          setVerdict("wrong");
        }
      },
      onError: (code) => {
        setListening(false);
        toast(
          code === "not-allowed"
            ? "Sem acesso ao microfone… pode repetir mentalmente!"
            : code === "no-speech"
              ? "Não ouvi nada… fala um pouco mais alto e mais perto do microfone!"
              : "Não entendi… tenta de novo!",
          "mic"
        );
      }
    });
    if (!ok) {
      setListening(false);
      toast("Seu navegador não tem reconhecimento de voz… ouvir já ajuda muito!", "mic");
    }
  };

  // ── Reforço das palavras erradas (toca o áudio sozinho) ──────
  const reinforcing = reinfIdx >= 0 && reinfIdx < missed.length;
  const reinforceWord = reinforcing ? wordById(missed[reinfIdx]) : undefined;
  useEffect(() => {
    if (reinforcing && reinforceWord && supported) speak(reinforceWord.fr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinfIdx]);

  // Quando a fila acaba com palavras erradas, o reforço começa sozinho.
  useEffect(() => {
    if (mode === "review" && items.length === 0 && done > 0 && missed.length > 0 && reinfIdx === -1) {
      setReinfIdx(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, items.length, done, missed.length, reinfIdx]);

  if (mode === "review" && items.length === 0 && done > 0) {
    // Ainda há palavras erradas? Reforça primeiro — com som e carinho.
    if (reinforceWord) {
      return (
        <div className="page">
          <PageHeader
            title={<><Icon name="brain" size={20} style={{ verticalAlign: -3 }} /> Reforço</>}
            sub={`${reinfIdx + 1} de ${missed.length} palavras para fixar`}
            onBack={() => navigate("/")}
          />
          <Card className="center">
            <Mascot mood="explaining" size={90} />
            <div className="bold" style={{ fontSize: "1.9rem" }}>{reinforceWord.fr}</div>
            {reinforceWord.gender && <Chip variant="accent">{reinforceWord.gender === "m" ? "masculino" : "feminino"}</Chip>}
            <div className="row center mt-2" style={{ justifyContent: "center" }}>
              <AudioButton text={reinforceWord.fr} label={`Ouvir ${reinforceWord.fr}`} />
              <Button variant="soft" size="sm" onClick={() => speak(reinforceWord.fr)}>
                <Icon name="speaker" size={15} /> Ouvir de novo
              </Button>
            </div>
            {reinforceWord.exampleFr && (
              <p className="small muted mt-2">
                {reinforceWord.exampleFr}
                <br />
                <em>{reinforceWord.examplePt}</em>
              </p>
            )}
            <div className="bold mt-3" style={{ fontSize: "1.4rem" }}>{reinforceWord.pt}</div>
            <p className="muted small mt-2">Ouviu o som? Agora essa palavra vai ficar na memória !</p>
            <Button
              className="mt-4"
              block
              onClick={() => {
                setReinfIdx((i) => i + 1);
                setFlipped(false);
              }}
            >
              {reinfIdx + 1 >= missed.length ? "Concluir reforço" : "Próxima palavra →"}
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="page">
        <PageHeader title={<><Icon name="brain" size={20} style={{ verticalAlign: -3 }} /> Revisão</>} onBack={() => navigate("/")} />
        <Card className="center">
          <Mascot mood="proud" size={120} />
          <h2>Memória afiada !</h2>
          <p className="muted small">Você revisou {done} palavras. Seu cérebro agradece.</p>
          <div className="row center mt-2" style={{ justifyContent: "center", gap: 6 }}>
            <Chip variant="gold">+{done * 3 + 10} XP</Chip>
            {starsEarned > 0 && <Chip variant="accent">+{starsEarned} étoile{starsEarned > 1 ? "s" : ""} ⭐</Chip>}
          </div>
          <div className="stack mt-4">
            <Button block onClick={() => navigate("/")}>
              Voltar pra casa
            </Button>
            <Button variant="soft" block onClick={() => { setDone(0); setMissed([]); setReinfIdx(-1); setQueue(dueItems(state.reviewQueue)); setMode(dueItems(state.reviewQueue).length > 0 ? "review" : "practice"); }}>
              Revisar de novo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!current) {
    const hasWords = state.wordsLearned.length > 0;
    return (
      <div className="page">
        <PageHeader title={<><Icon name="brain" size={20} style={{ verticalAlign: -3 }} /> Revisão</>} sub="Repetição espaçada inteligente" onBack={() => navigate("/")} />
        {hasWords ? (
          <EmptyState
            icon="flower"
            title="Nada para revisar agora"
            text="Você está em dia! Complete mais aulas para encher sua fila de revisão — ou pratique as palavras recentes."
            action={
              <Button onClick={startPractice}>Praticar palavras recentes</Button>
            }
          />
        ) : (
          <EmptyState
            icon="flower"
            title="Vamos aprender as primeiras palavras !"
            text="Sua fila de revisão está vazia porque você ainda não aprendeu nenhuma palavra — complete a primeira aula e elas entram aqui automaticamente."
            action={
              <Button onClick={() => navigate("/map")}>Ir para a primeira aula</Button>
            }
          />
        )}
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
              {canListen && (
                <Button
                  size="sm"
                  variant={listening ? "accent" : "soft"}
                  onClick={() => checkPronunciation(current)}
                  disabled={listening}
                >
                  <Icon name="mic" size={15} /> {listening ? "Ouvindo…" : "Repetir · +1 ⭐"}
                </Button>
              )}
            </div>
            {heard && verdict === "wrong" && !listening && (
              <div className="feedback bad mt-3">
                <strong>Ouvi:</strong> «{heard}»
                <div className="small mt-1">Quase ! Tenta de novo — ouça bem e repita a palavra.</div>
              </div>
            )}
            {verdict === "correct" && !listening && (
              <div className="feedback good mt-3">
                <strong>Parfait !</strong> +1 étoile ⭐
              </div>
            )}
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
    const raw = localStorage.getItem(STORAGE_KEY);
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
