// ══════════════════════════════════════════════════════════════
// Athenas — Loja de personalização (étoiles)
// ══════════════════════════════════════════════════════════════
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { COSTUMES, THEMES } from "@/lib/constants";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";

export function CustomizePage() {
  const { state, buyTheme, buyCostume, setSettings } = useApp();
  const { navigate } = useRouter();

  return (
    <div className="page">
      <PageHeader title={<><Icon name="gift" size={20} style={{ verticalAlign: -3 }} /> Loja de étoiles</>} sub={<><Icon name="star" size={14} style={{ verticalAlign: -2, color: "var(--c-gold)" }} /> {state.stars} étoiles</>} onBack={() => navigate("/")} />

      <Card className="card-soft mb-3">
        <div className="row">
          <Mascot mood="happy" size={70} />
          <p className="small muted" style={{ margin: 0 }}>
            Ganhe étoiles estudando: aulas, revisões, missões diárias e bosses. Troque por temas e personalize o seu Athenas!
          </p>
        </div>
      </Card>

      <div className="section-title">
        <Icon name="palette" size={18} /> Temas
      </div>
      <div className="stack">
        {THEMES.map((t) => {
          const owned = state.boughtThemes.includes(t.id) || t.price === 0;
          const active = state.settings.theme === t.id;
          return (
            <Card key={t.id} className={active ? "tap" : "tap"} onClick={() => owned && setSettings({ theme: t.id })}>
              <div className="row-between">
                <div className="row">
                  <div style={{ color: "var(--c-accent-deep)", display: "inline-flex" }}>
                    <Icon name={t.icon} size={26} />
                  </div>
                  <div>
                    <div className="bold">{t.name}</div>
                    <div className="muted small">{t.desc}</div>
                  </div>
                </div>
                {!owned ? (
                  <Button size="sm" variant={state.stars >= t.price ? "gold" : "ghost"} onClick={() => buyTheme(t.id)}>
                    <Icon name="star" size={14} /> {t.price}
                  </Button>
                ) : active ? (
                  <Chip variant="green"> ativo</Chip>
                ) : (
                  <Chip variant="rose">usar</Chip>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="section-title">
        <Icon name="shirtFolded" size={18} /> Roupinhas da Lulu
      </div>
      <div className="stack">
        {COSTUMES.map((c) => {
          const owned = state.boughtCostumes.includes(c.id) || c.price === 0;
          const active = state.settings.costume === c.id;
          return (
            <Card key={c.id} className="tap" onClick={() => owned && setSettings({ costume: c.id })}>
              <div className="row-between">
                <div className="row">
                  <div
                    className="lc-emoji"
                    style={{ width: 52, height: 52, borderRadius: 16, background: "var(--c-accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 0 }}
                  >
                    <Mascot mood="happy" size={46} />
                  </div>
                  <div>
                    <div className="bold">{c.name}</div>
                    <div className="muted small">{c.desc}</div>
                  </div>
                </div>
                {!owned ? (
                  <Button size="sm" variant={state.stars >= c.price ? "gold" : "ghost"} onClick={() => buyCostume(c.id)}>
                    <Icon name="star" size={14} /> {c.price}
                  </Button>
                ) : active ? (
                  <Chip variant="green"> vestindo</Chip>
                ) : (
                  <Chip variant="rose">vestir</Chip>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="section-title">
        <Icon name="radio" size={18} /> Em breve
      </div>
      <Card className="center">
        <p className="muted small">
          Molduras, efeitos de confete e mais surpresas chegam nas próximas fases. Continue estudando para juntar étoiles!
        </p>
      </Card>
    </div>
  );
}
