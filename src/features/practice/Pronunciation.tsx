// ══════════════════════════════════════════════════════════════
// Athenas — Prática de pronúncia
// Ouça com a voz francesa (fr-FR) e fale para comparar.
// ══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { useSpeech } from "@/hooks/useSpeech";
import { PRONUNCIATION_DECK, type PronItem } from "@/data/pronunciation";
import { shuffle, fuzzyMatch } from "@/lib/utils";
import { Button, Card, Chip, EmptyState, PageHeader } from "@/components/ui";
import { Mascot } from "@/components/Mascot";
import { AudioButton } from "@/components/AudioButton";
import { Icon } from "@/components/Icons";
import { fireSparkle } from "@/lib/confetti";

export function PronunciationPage() {
  const { addXp, addStars, toast } = useApp();
  const { navigate } = useRouter();
  const { speak, stop, canListen, listen, supported } = useSpeech();

  const [deck, setDeck] = useState<PronItem[]>(() => shuffle(PRONUNCIATION_DECK));
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const item = deck[idx];

  useEffect(() => {
    if (item && autoPlay && supported) speak(item.fr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (finished) {
    return (
      <div className="page">
        <PageHeader title={<><Icon name="speaker" size={20} style={{ verticalAlign: -3 }} /> Pronúncia</>} onBack={() => navigate("/")} />
        <Card className="center">
          <Mascot mood="proud" size={120} />
          <h2 className="row" style={{ justifyContent: "center", gap: 8 }}>Bravo ! <Icon name="confetti" size={22} /></h2>
          <p className="muted small">Você treinou {deck.length} frases de pronúncia.</p>
          <Chip variant="gold">+20 XP · +5 étoiles</Chip>
          <div className="stack mt-4">
            <Button block onClick={() => navigate("/")}>
              Voltar pra casa
            </Button>
            <Button
              variant="soft"
              block
              onClick={() => {
                setDeck(shuffle(PRONUNCIATION_DECK));
                setIdx(0);
                setDone(0);
                setHeard(null);
                setFinished(false);
              }}
            >
              Treinar de novo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!item) {
    return <EmptyState icon="radio" title="Sem conteúdo de pronúncia" />;
  }

  const advance = (perfect: boolean) => {
    setDone((d) => d + 1);
    setHeard(null);
    if (perfect) fireSparkle();
    if (idx + 1 >= deck.length) {
      setFinished(true);
      addXp(20);
      addStars(5);
      toast("Pronúncia treinada!", "speaker");
    } else {
      setIdx((i) => i + 1);
    }
  };

  const startListen = () => {
    // Para qualquer áudio tocando (a frase que tocou sozinha!) — senão o
    // microfone ouve o alto-falante e "captura" a frase que ninguém disse.
    stop();
    setHeard(null);
    setListening(true);
    const ok = listen({
      onResult: (transcript) => {
        setListening(false);
        setHeard(transcript);
        const clean = transcript.replace(/[?.!]$/, "");
        const perfect = fuzzyMatch(clean, item.fr.replace(/[?!.]/g, ""), [item.fr]);
        if (perfect) {
          toast("Parfait ! Muito bem!", "mic");
          setTimeout(() => advance(true), 600);
        }
      },
      onError: (code) => {
        setListening(false);
        toast(
          code === "not-allowed"
            ? "Sem acesso ao microfone… mas pode ouvir e repetir mentalmente!"
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

  return (
    <div className="page">
      <PageHeader title={<><Icon name="speaker" size={20} style={{ verticalAlign: -3 }} /> Pronúncia</>} sub={`Ouça com a voz francesa e repita · ${done + 1} de ${deck.length}`} onBack={() => navigate("/")} />

      <Card className="center">
        <Mascot mood={listening ? "thinking" : "explaining"} size={90} />
        <div className="bold" style={{ fontSize: "1.9rem", marginTop: 8 }}>
          {item.fr}
        </div>
        <div className="muted small mt-1 row" style={{ justifyContent: "center", gap: 5 }}>
          <Icon name="chatCircleDots" size={15} /> como soa: {item.phon}
        </div>
        <Chip variant="accent">{item.pt}</Chip>
        {item.tip && (
          <p className="muted small mt-3 row" style={{ justifyContent: "center", gap: 5 }}>
            <Icon name="lightbulb" size={15} /> {item.tip}
          </p>
        )}

        <div className="row center mt-4" style={{ justifyContent: "center" }}>
          <AudioButton text={item.fr} label="Ouvir" />
          {canListen && (
            <Button size="sm" variant={listening ? "accent" : "primary"} onClick={startListen} disabled={listening}>
              <Icon name="mic" size={16} /> {listening ? "Ouvindo…" : "Falar e comparar"}
            </Button>
          )}
          {!canListen && supported && (
            <Button size="sm" variant="soft" onClick={() => speak(item.fr)}>
              <Icon name="speaker" size={16} /> Ouvir de novo
            </Button>
          )}
        </div>

        {listening && <p className="muted small mt-3">Fale a frase em francês agora…</p>}
        {heard && !listening && (
          <div className={`feedback ${heard ? "bad" : ""} mt-3`}>
            <strong>Ouvi:</strong> «{heard}»
            <div className="small mt-1">
              Quase ! Tenta de novo — preste atenção em <em>{item.phon}</em>.
            </div>
          </div>
        )}

        <div className="row mt-4" style={{ justifyContent: "center" }}>
          <Button variant="ghost" size="sm" onClick={() => advance(true)}>
            Já sei essa →
          </Button>
        </div>
      </Card>

      <div className="center mt-4">
        <label className="small muted">
          <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} /> tocar automaticamente
        </label>
      </div>

      <div className="mt-4">
        <div className="section-title">
          <Icon name="chatCircleDots" size={18} /> Todas as frases
        </div>
        <Card>
          <div className="stack">
            {deck.map((d) => (
              <div key={d.id} className="row-between">
                <div className="grow">
                  <div className="bold small">{d.fr}</div>
                  <div className="muted small">{d.pt}</div>
                </div>
                <AudioButton text={d.fr} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
