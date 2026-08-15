// ══════════════════════════════════════════════════════════════
// Athenas — Feedback: como você está se sentindo no app?
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { CONTACTS } from "@/lib/constants";
import { Button, Card, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";

const MOODS = [
  { icon: "smileySad" as const, label: "Não curti" },
  { icon: "smileyMeh" as const, label: "Mais ou menos" },
  { icon: "smiley" as const, label: "Tô gostando" },
  { icon: "heartStraight" as const, label: "Amo demais !" }
];

export function FeedbackPage() {
  const { state, toast } = useApp();
  const { navigate } = useRouter();
  const [mood, setMood] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    if (mood === null) {
      toast("Escolhe como você está se sentindo!", "smiley");
      return;
    }
    const subject = encodeURIComponent(`Feedback Athenas — ${MOODS[mood].label}`);
    const body = encodeURIComponent(
      `Olá ! Aqui vai meu feedback sobre o Athenas:\n\nSentimento: ${MOODS[mood].label}\n\n${text || "(sem detalhes)"}\n\n— ${state.name || "Alune"}`
    );
    // Salva uma cópia local e abre o app de email pronto pra enviar.
    try {
      const key = "athenas:feedback:v1";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
      prev.push({ mood: MOODS[mood].label, text, at: Date.now() });
      localStorage.setItem(key, JSON.stringify(prev.slice(-30)));
    } catch {
      // sem localStorage — segue o jogo
    }
    setSent(true);
    toast("Obrigada pelo carinho! 💌", "heartStraight");
    window.location.href = `mailto:${CONTACTS.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="page">
      <PageHeader title={<><Icon name="chatText" size={20} style={{ verticalAlign: -3 }} /> Feedback</>} sub="Sua opinião faz o Athenas melhorar" onBack={() => navigate("/profile")} />

      <Card className="center">
        <Mascot mood={sent ? "love" : "explaining"} size={110} />
        {!sent ? (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>Como está sendo sua experiência ?</h2>
            <div className="row center mt-3" style={{ justifyContent: "center", gap: 10 }}>
              {MOODS.map((m, i) => (
                <button
                  key={m.label}
                  className={`mood-btn ${mood === i ? "selected" : ""}`}
                  onClick={() => setMood(i)}
                  aria-label={m.label}
                  title={m.label}
                >
                  <Icon name={m.icon} size={26} />
                  <span className="mood-lbl">{m.label}</span>
                </button>
              ))}
            </div>
            <textarea
              className="text-input mt-4"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Conta pra gente: o que você ama, o que te confundiu, o que sonha aprender…"
              aria-label="Seu feedback"
              style={{ width: "100%", resize: "vertical" }}
            />
            <Button className="mt-4" block onClick={send}>
              <Icon name="heartStraight" size={16} /> Enviar feedback
            </Button>
            <p className="muted small mt-3" style={{ maxWidth: 320, margin: "12px auto 0" }}>
              Enviamos por email (abre seu app de email prontinho) e guardamos uma cópia no seu aparelho.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>Merci beaucoup !</h2>
            <p className="muted small">Seu feedback foi preparado. Confirma o envio no seu email 💌</p>
            <Button className="mt-4" block onClick={() => navigate("/")}>
              Voltar pra casa
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
