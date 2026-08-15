// ══════════════════════════════════════════════════════════════
// Athenas — Sobre mim: o que é o app + contatos
// ══════════════════════════════════════════════════════════════
import { useRouter } from "@/lib/router";
import { APP_TAGLINE, CONTACTS } from "@/lib/constants";
import { Button, Card, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";

export function AboutPage() {
  const { navigate } = useRouter();

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
            <strong>Email</strong>
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
    </div>
  );
}
