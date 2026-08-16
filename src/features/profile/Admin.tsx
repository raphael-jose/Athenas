// ══════════════════════════════════════════════════════════════
// Athenas — Área administrativa secreta (criador)
// Acesso: toque 7× na versão na página "Sobre" → digite o PIN.
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { ADMIN_PIN, CONFETTIS, COSTUMES, FRAMES, THEMES } from "@/lib/constants";
import { generateItemCode, generateStarCode, type ItemCategory } from "@/lib/giftCode";

type GiftKind = "stars" | ItemCategory;
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";

export function AdminPage() {
  const { state, adminAddStars, adminUnlockAll, redeemGiftCode } = useApp();
  const { navigate } = useRouter();

  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(() => typeof sessionStorage !== "undefined" && sessionStorage.getItem("athenas:admin") === "1");
  const [generated, setGenerated] = useState("");
  const [starsAmount, setStarsAmount] = useState(100);
  const [itemCat, setItemCat] = useState<GiftKind>("costume");
  const [itemId, setItemId] = useState(COSTUMES[1]?.id ?? "");
  const [redeemInput, setRedeemInput] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");

  const tryUnlock = () => {
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
      sessionStorage.setItem("athenas:admin", "1");
    } else {
      setPin("");
      setRedeemMsg("PIN errado.");
    }
  };

  const items = {
    theme: THEMES,
    costume: COSTUMES,
    frame: FRAMES,
    confetti: CONFETTIS
  } as const;

  const doGenerate = () => {
    const code =
      itemCat === "stars"
        ? generateStarCode(starsAmount)
        : generateItemCode(itemCat, itemId);
    setGenerated(code);
  };

  const copy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setRedeemMsg("Código copiado! 🎁");
    } catch {
      setRedeemMsg("Selecione e copie o código manualmente.");
    }
  };

  if (!unlocked) {
    return (
      <div className="page">
        <PageHeader title="Área restrita" onBack={() => navigate("/about")} />
        <Card className="center">
          <Icon name="lock" size={40} style={{ color: "var(--c-muted)" }} />
          <p className="muted small mt-2">Digite o PIN do criador para continuar.</p>
          <input
            type="password"
            className="text-input mt-3"
            style={{ textAlign: "center", maxWidth: 140 }}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
            placeholder="••••"
            aria-label="PIN do criador"
          />
          <Button className="mt-3" block onClick={tryUnlock}>
            Entrar
          </Button>
          {redeemMsg && <p className="small mt-2" style={{ color: "var(--c-red)" }}>{redeemMsg}</p>}
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title={<><Icon name="shield" size={20} style={{ verticalAlign: -3 }} /> Área do criador</>} sub="Presenteie, desbloqueie e gere códigos" onBack={() => navigate("/about")} />

      {/* Quem está usando (aviso honesto) */}
      <Card className="mb-3">
        <div className="row" style={{ gap: 8 }}>
          <Icon name="users" size={20} style={{ color: "var(--c-accent-deep)" }} />
          <div>
            <div className="bold small">Quem está usando o app</div>
            <p className="muted small" style={{ margin: "2px 0 0" }}>
              Os dados de cada pessoa ficam <strong>só no aparelho dela</strong> — não existe banco central. Para ver usuários de verdade (nome, nível, tempo de uso), precisaríamos de um backend com login. Aqui você vê a conta deste aparelho:
            </p>
          </div>
        </div>
        <div className="row mt-2" style={{ gap: 6, flexWrap: "wrap" }}>
          <Chip variant="accent">{state.name || "Amélie"}</Chip>
          <Chip variant="gold"><Icon name="star" size={13} /> {state.stars} étoiles</Chip>
          <Chip variant="rose">temas {state.boughtThemes.length}/{THEMES.length}</Chip>
          <Chip variant="rose">roupas {state.boughtCostumes.length}/{COSTUMES.length}</Chip>
          <Chip variant="rose">molduras {state.boughtFrames.length}/{FRAMES.length}</Chip>
          <Chip variant="rose">confetes {state.boughtConfettis.length}/{CONFETTIS.length}</Chip>
        </div>
      </Card>

      {/* Presentear étoiles neste aparelho */}
      <div className="section-title">
        <Icon name="gift" size={18} /> Presentear étoiles (neste aparelho)
      </div>
      <Card className="mb-3">
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {[100, 500, 1000].map((n) => (
            <Button key={n} size="sm" variant="gold" onClick={() => adminAddStars(n)}>
              +{n} ⭐
            </Button>
          ))}
          <input
            type="number"
            className="text-input"
            style={{ width: 110 }}
            min={1}
            value={starsAmount}
            onChange={(e) => setStarsAmount(Number(e.target.value) || 0)}
            aria-label="Quantidade de étoiles"
          />
          <Button size="sm" onClick={() => adminAddStars(starsAmount)}>
            Presentear
          </Button>
          <Button size="sm" variant="soft" onClick={adminUnlockAll}>
            Desbloquear tudo da loja
          </Button>
        </div>
        <p className="muted small mt-2" style={{ margin: 0 }}>
          Dica: com o celular dela na mão, entre nesta tela (7× na versão no Sobre) e presenteie direto. De longe, use o código de presente abaixo.
        </p>
      </Card>

      {/* Gerar código de presente */}
      <div className="section-title">
        <Icon name="storefront" size={18} /> Código de presente (manda por WhatsApp)
      </div>
      <Card className="mb-3">
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <select
            className="text-input"
            style={{ width: 150 }}
            value={itemCat}
            onChange={(e) => {
              const cat = e.target.value as GiftKind;
              setItemCat(cat);
              if (cat !== "stars") setItemId(items[cat][0]?.id ?? "");
            }}
            aria-label="Tipo de presente"
          >
            <option value="stars">Étoiles</option>
            <option value="theme">Tema</option>
            <option value="costume">Roupinha</option>
            <option value="frame">Moldura</option>
            <option value="confetti">Confete</option>
          </select>
          {itemCat === "stars" ? (
            <input
              type="number"
              className="text-input"
              style={{ width: 110 }}
              min={1}
              value={starsAmount}
              onChange={(e) => setStarsAmount(Number(e.target.value) || 0)}
              aria-label="Quantidade de étoiles do presente"
            />
          ) : (
            <select
              className="text-input"
              style={{ flex: 1, minWidth: 150 }}
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              aria-label="Item de presente"
            >
              {items[itemCat].map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.price} ⭐)
                </option>
              ))}
            </select>
          )}
          <Button size="sm" variant="primary" onClick={doGenerate}>
            Gerar código
          </Button>
        </div>
        {generated && (
          <div className="mt-3">
            <div className="bold small">Código gerado:</div>
            <div className="code-chip" style={{ fontSize: "0.95rem", userSelect: "all" }}>{generated}</div>
            <Button size="sm" variant="soft" className="mt-2" onClick={copy}>
              <Icon name="sealCheck" size={14} /> Copiar
            </Button>
          </div>
        )}
      </Card>

      {/* Testar resgate */}
      <div className="section-title">
        <Icon name="check" size={18} /> Testar resgate
      </div>
      <Card className="mb-3">
        <div className="row" style={{ gap: 8 }}>
          <input
            className="text-input grow"
            placeholder="Colar código (ATH-…)"
            value={redeemInput}
            onChange={(e) => setRedeemInput(e.target.value)}
            aria-label="Código para testar"
          />
          <Button
            size="sm"
            onClick={() => {
              const r = redeemGiftCode(redeemInput);
              setRedeemMsg(r.message);
            }}
          >
            Resgatar
          </Button>
        </div>
        {redeemMsg && <p className="small mt-2">{redeemMsg}</p>}
      </Card>

      <Card className="center">
        <p className="muted small">Seu PIN ({ADMIN_PIN}) vale para gerar códigos e validar resgates — troque em <code>src/lib/constants.ts</code> se quiser.</p>
      </Card>
    </div>
  );
}
