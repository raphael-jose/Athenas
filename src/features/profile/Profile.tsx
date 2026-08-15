// ══════════════════════════════════════════════════════════════
// Athenas — Perfil, métricas e configurações
// ══════════════════════════════════════════════════════════════
import { useRef, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { AVATARS, CEFR_LABELS, THEMES } from "@/lib/constants";
import { exportBackup } from "@/services/storage";
import { levelFromXp, levelName, ACHIEVEMENTS } from "@/services/gamification";
import { formatDuration, percent } from "@/lib/utils";
import { Button, Card, Chip, Modal, PageHeader, Segmented, SettingRow, StatCard, Switch } from "@/components/ui";
import { Icon } from "@/components/Icons";
import type { IconName } from "@/types";
import { Mascot } from "@/components/Mascot";
import { AccountSection } from "./AccountSection";

/** Redimensiona a foto para 256×256 (JPEG) — leve e cabe no armazenamento local. */
function resizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("img"));
      img.onload = () => {
        const side = 256;
        const canvas = document.createElement("canvas");
        canvas.width = side;
        canvas.height = side;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        // recorte quadrado central
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, side, side);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ProfilePage() {
  const { state, setSettings, resetProgress, toast, updateProfile, restoreBackup } = useApp();
  const { navigate } = useRouter();
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(state.name);
  const [resetOpen, setResetOpen] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);

  const downloadBackup = () => {
    const blob = new Blob([exportBackup(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `athenas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup baixado! Guarde com carinho 💾", "flower");
  };

  const onRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    if (restoreBackup(text)) navigate("/");
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizePhoto(file);
      updateProfile({ photo: dataUrl });
      toast("Foto de perfil atualizada!", "flower");
    } catch {
      toast("Não consegui ler essa imagem… tenta outra!", "warning");
    }
  };

  const acc = percent(state.exercisesCorrect, state.exercisesTotal);
  const level = levelFromXp(state.xp);
  // Avatares antigos eram emojis — cai no padrão se o salvo não for um ícone válido.
  const avatarIcon: IconName = AVATARS.includes(state.avatar as IconName) ? (state.avatar as IconName) : "rabbit";
  const unlockedCount = ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id)).length;
  const weakTopics = [...new Set(state.mistakes.map((m) => m.topic))].slice(0, 3);

  const saveName = () => {
    updateProfile({ name });
    toast("Perfil atualizado!", "flower");
    setEditName(false);
  };

  return (
    <div className="page">
      <PageHeader title={<><Icon name="user" size={20} style={{ verticalAlign: -3 }} /> Perfil</>} sub={`Nível ${level} · ${levelName(level)}`} />

      {/* Cabeçalho */}
      <Card className="center">
        <div className="profile-avatar-wrap" onClick={() => photoRef.current?.click()} role="button" aria-label="Trocar foto de perfil">
          {state.photo ? (
            <img src={state.photo} alt="Foto de perfil" className="profile-photo" />
          ) : (
            <div style={{ color: "var(--c-primary)", display: "flex", justifyContent: "center" }}>
              <Icon name={avatarIcon} size={56} />
            </div>
          )}
          <span className="profile-photo-btn" title="Trocar foto">
            <Icon name="camera" size={16} />
          </span>
        </div>
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} aria-label="Escolher foto" />
        <h2 style={{ fontSize: "1.3rem", margin: "4px 0 0" }}>{state.name || "Amélie"}</h2>
        <p className="muted small">Desde {new Date(state.startedAt).toLocaleDateString("pt-BR")}</p>
        <Button variant="soft" size="sm" onClick={() => setEditName(true)}>
          Editar nome / avatar
        </Button>
      </Card>

      {/* Métricas */}
      <div className="section-title">
        <Icon name="chartBar" size={18} /> Suas métricas
      </div>
      <div className="stats-grid">
        <StatCard icon="book" value={state.wordsLearned.length} label="palavras" />
        <StatCard icon="flame" value={state.streak} label={`dias (recorde ${state.bestStreak})`} />
        <StatCard icon="clock" value={formatDuration(state.timeStudied)} label="estudado" />
        <StatCard icon="target" value={`${acc}%`} label="acerto" />
        <StatCard icon="book" value={state.lessonsCompleted.length} label="aulas" />
        <StatCard icon="sword" value={state.bossesDefeated.length} label="bosses" />
        <StatCard icon="starFour" value={state.xp} label="XP total" />
        <StatCard icon="trophy" value={unlockedCount} label="conquistas" />
      </div>

      {/* CEFR */}
      <div className="section-title">
        <Icon name="graduationCap" size={18} /> Progresso CEFR
      </div>
      <Card>
        <div className="cefr-strip">
          {CEFR_LABELS.map((c, i) => (
            <span key={c} className={`cefr-dot ${i <= state.cefr ? "on" : ""} ${i === state.cefr ? "current" : ""}`}>
              {c}
            </span>
          ))}
        </div>
        <div className="small muted mt-2">
          {state.cefr >= 7 ? "Você está no Modo Deus Supremo." : `Estimativa atual: ${CEFR_LABELS[state.cefr]}`}
        </div>
      </Card>

      {/* Tópicos */}
      <div className="section-title">
        <Icon name="brain" size={18} /> Tópicos
      </div>
      <Card>
        <div className="small bold mb-2">Para fortalecer</div>
        {weakTopics.length === 0 ? (
          <p className="muted small">Nenhum erro registrado ainda — perfeito!</p>
        ) : (
          <div className="row wrap">
            {weakTopics.map((t) => (
              <Chip key={t} variant="red">
                <Icon name="warning" size={13} /> {t}
              </Chip>
            ))}
          </div>
        )}
        <div className="small bold mt-3 mb-2">Pontos fortes</div>
        {state.lessonsCompleted.length === 0 ? (
          <p className="muted small">Complete aulas para revelar seus pontos fortes.</p>
        ) : (
          <div className="row wrap">
            {state.lessonsCompleted.slice(-4).map((l) => (
              <Chip key={l} variant="green"> {l}</Chip>
            ))}
          </div>
        )}
      </Card>

      {/* Configurações */}
      <div className="section-title">
        <Icon name="gear" size={18} /> Configurações
      </div>
      <Card>
        <SettingRow icon="palette" title="Tema" desc="Escolha sua vibe">
          <select
            className="text-input theme-select"
            aria-label="Tema"
            value={state.settings.theme}
            onChange={(e) => setSettings({ theme: e.target.value })}
          >
            {/* Só os temas que a pessoa tem (grátis ou comprados na Loja) —
                os demais ficam trancados até serem desbloqueados com étoiles. */}
            {THEMES.filter((t) => t.price === 0 || state.boughtThemes.includes(t.id)).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow icon="textAa" title="Tamanho da fonte">
          <Segmented
            label="Fonte"
            value={String(state.settings.fontScale)}
            onChange={(v) => setSettings({ fontScale: Number(v) })}
            options={[
              { value: "0.9", label: "A" },
              { value: "1", label: "A" },
              { value: "1.1", label: "A" },
              { value: "1.2", label: "A" }
            ]}
          />
        </SettingRow>
        <SettingRow icon="sparkle" title="Animações" desc="Confetes e efeitos">
          <Switch on={state.settings.animations} onChange={(v) => setSettings({ animations: v })} label="animações" />
        </SettingRow>
        <SettingRow icon="musicNote" title="Efeitos sonoros" desc="Sons de acerto, erro, level up e cliques">
          <Switch on={state.settings.sound} onChange={(v) => setSettings({ sound: v })} label="efeitos sonoros" />
        </SettingRow>
        <SettingRow icon="radio" title="Música de fundo" desc="Cada mundo tem sua trilha; o boss fica tenso">
          <Switch on={state.settings.music} onChange={(v) => setSettings({ music: v })} label="música" />
        </SettingRow>
        <SettingRow icon="speaker" title="Áudio (TTS)" desc="Voz nas aulas de listening">
          <Switch on={state.settings.tts} onChange={(v) => setSettings({ tts: v })} label="áudio" />
        </SettingRow>
      </Card>

      {/* Conta (cadastro + recuperação de senha) */}
      <AccountSection />

      {/* Feedback + Sobre */}
      <Card className="tap mt-3" onClick={() => navigate("/feedback")}>
        <div className="row-between">
          <span className="bold row" style={{ gap: 8 }}>
            <Icon name="chatText" size={18} /> Feedback
          </span>
          <span className="muted small">Sua opinião melhora o app →</span>
        </div>
      </Card>
      <Card className="tap mt-3" onClick={() => navigate("/about")}>
        <div className="row-between">
          <span className="bold row" style={{ gap: 8 }}>
            <Icon name="flower" size={18} /> Sobre mim
          </span>
          <span className="muted small">Contato e WhatsApp →</span>
        </div>
      </Card>

      {/* Conquistas */}
      <Card className="tap mt-3" onClick={() => navigate("/achievements")}>
        <div className="row-between">
          <span className="bold row" style={{ gap: 8 }}>
            <Icon name="trophy" size={18} /> Conquistas
          </span>
          <span className="muted small">{unlockedCount}/{ACHIEVEMENTS.length} →</span>
        </div>
      </Card>

      {/* Backup */}
      <Card className="mt-3">
        <div className="row-between">
          <div>
            <div className="bold small">Backup do progresso</div>
            <div className="muted small">Baixe uma cópia segura ou restaure de um arquivo.</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Button variant="soft" size="sm" onClick={downloadBackup}>
              <Icon name="arrowClockwise" size={15} /> Baixar
            </Button>
            <Button variant="soft" size="sm" onClick={() => backupRef.current?.click()}>
              <Icon name="arrowClockwise" size={15} /> Restaurar
            </Button>
          </div>
        </div>
        <input ref={backupRef} type="file" accept="application/json,.json" hidden onChange={onRestore} aria-label="Restaurar backup" />
      </Card>

      {/* Reset */}
      <Card className="mt-3" style={{ borderColor: "var(--c-red)" }}>
        <div className="row-between">
          <div>
            <div className="bold small">Resetar progresso</div>
            <div className="muted small">Apaga tudo no seu navegador.</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
            <Icon name="trash" size={15} /> Apagar
          </Button>
        </div>
      </Card>

      <div className="center mt-4">
        <Mascot mood="love" size={90} />
        <p className="muted small">On a hâte de te voir progresser !</p>
      </div>

      {/* Modal editar perfil */}
      <Modal open={editName} onClose={() => setEditName(false)} title="Seu perfil">
        <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} aria-label="Nome" />
        <div className="row wrap mt-3" style={{ justifyContent: "center" }}>
          {AVATARS.map((a) => (
            <button
              key={a}
              className="option-btn"
              style={{
                width: 50,
                padding: 8,
                justifyContent: "center",
                borderColor: state.avatar === a ? "var(--c-primary)" : undefined,
                background: state.avatar === a ? "var(--c-primary-soft)" : undefined
              }}
              onClick={() => updateProfile({ avatar: a })}
              aria-label={`avatar ${a}`}
            >
              <Icon name={a} size={22} />
            </button>
          ))}
        </div>
        <Button className="mt-3" block onClick={saveName}>
          Salvar
        </Button>
      </Modal>

      {/* Modal reset */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Tem certeza?">
        <p className="small muted">Todo seu progresso, XP, conquistas e revisões serão apagados deste navegador. Isso não pode ser desfeito.</p>
        <div className="row">
          <Button variant="ghost" className="grow" onClick={() => setResetOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="grow"
            style={{ background: "var(--c-red)" }}
            onClick={() => {
              resetProgress();
              setResetOpen(false);
              navigate("/welcome");
            }}
          >
            Apagar tudo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
