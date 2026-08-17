// ══════════════════════════════════════════════════════════════
// Athenas — Sobre mim: o que é o app + contatos
// ══════════════════════════════════════════════════════════════
import { useRef } from "react";
import { useRouter } from "@/lib/router";
import { APP_TAGLINE, CONTACTS } from "@/lib/constants";
import { Button, Card, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";

export function AboutPage() {
  const { navigate } = useRouter();
  // Botão secreto do criador: 7 toques na versão em até 3,5s → /admin
  const versionTaps = useRef(0);
  const versionTimer = useRef<number | null>(null);
  const onVersionTap = () => {
    versionTaps.current += 1;
    if (versionTimer.current) window.clearTimeout(versionTimer.current);
    versionTimer.current = window.setTimeout(() => (versionTaps.current = 0), 3500);
    if (versionTaps.current >= 7) {
      versionTaps.current = 0;
      navigate("/admin");
    }
  };

  const waMessage = encodeURIComponent("Olá ! Vim pelo app Athenas 🌸");
  const waHref = `https://wa.me/${CONTACTS.whatsapp}?text=${waMessage}`;
  const mailHref = `mailto:${CONTACTS.email}?subject=${encodeURIComponent("Contato — Athenas")}`;

  return (
    <div className="page">
      <PageHeader title={<><Icon name="flower" size={20} style={{ verticalAlign: -3 }} /> Sobre mim</>} sub="A gente por trás do Athenas" onBack={() => navigate("/profile")} />

      <Card className="center">
        <Mascot mood="love" size={120} />
        <h2 style={{ fontSize: "1.3rem", margin: "4px 0 0" }}>Athenas</h2>
        <p className="muted small" style={{ maxWidth: 320, margin: "10px auto 0" }}>{APP_TAGLINE}</p>
        <p className="muted small" style={{ maxWidth: 320, margin: "8px auto 0" }}>
          Feito com carinho para quem quer aprender francês do zero, no ritmo da vida real — com a Lulu ao lado em cada passo.
        </p>
      </Card>

      <div className="section-title">
        <Icon name="phoneCall" size={18} /> Fala com a gente
      </div>
      <Card>
        <a className="contact-row" href={mailHref}>
          <span className="s-ico tint-lilac"><Icon name="chat" size={20} /></span>
          <span className="grow">
            <strong>E-mail</strong>
            <span className="muted small" style={{ display: "block" }}>{CONTACTS.email}</span>
          </span>
          <span>→</span>
        </a>
        <a className="contact-row" href={waHref} target="_blank" rel="noreferrer">
          <span className="s-ico tint-green"><Icon name="heartbeat" size={20} /></span>
          <span className="grow">
            <strong>WhatsApp</strong>
            <span className="muted small" style={{ display: "block" }}>Mensagem direta (clica aqui)</span>
          </span>
          <span>→</span>
        </a>
      </Card>

      <Card className="mt-3 center">
        <p className="muted small">Tem uma ideia, achou um bug ou quer pedir uma aula nova? A gente adora ouvir você.</p>
        <Button variant="soft" block onClick={() => navigate("/feedback")}>
          <Icon name="chatText" size={16} /> Mandar feedback
        </Button>
      </Card>

      <p className="muted small center mt-4" onClick={onVersionTap} style={{ cursor: "pointer", userSelect: "none" }}>
        Athenas v2 🌸
      </p>
    </div>
  );
}
