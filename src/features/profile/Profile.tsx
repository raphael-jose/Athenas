// ══════════════════════════════════════════════════════════════
// Athenas — Perfil, métricas e configurações
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { AVATARS, CEFR_LABELS, THEMES, ELEVENLABS_DEFAULT_VOICE_ID } from "@/lib/constants";
import { levelFromXp, levelName, ACHIEVEMENTS } from "@/services/gamification";
import { formatDuration, percent } from "@/lib/utils";
import { Button, Card, Chip, Modal, PageHeader, Segmented, SettingRow, StatCard, Switch } from "@/components/ui";
import { TextInput } from "@/components/ai-ui";
import { Icon } from "@/components/Icons";
import type { IconName } from "@/types";
import { Mascot } from "@/components/Mascot";
import { useSpeech } from "@/hooks/useSpeech";

export function ProfilePage() {
  const { state, setSettings, resetProgress, toast, updateProfile } = useApp();
  const { speak } = useSpeech();
  const { navigate } = useRouter();
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(state.name);
  const [resetOpen, setResetOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [vkey, setVkey] = useState(state.settings.elevenlabsKey);
  const [vvoice, setVvoice] = useState(state.settings.elevenlabsVoiceId);
  const [testingVoice, setTestingVoice] = useState(false);

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

  const voiceCfg = { key: vkey.trim(), voiceId: vvoice.trim() || ELEVENLABS_DEFAULT_VOICE_ID };
  const testVoice = () => {
    setTestingVoice(true);
    speak("Bonjour ! Je suis Lulu, ta professeure de français. On commence ?", {
      lang: "fr-FR",
      voice: voiceCfg,
      onEnd: () => setTestingVoice(false)
    });
    // trava de segurança: nunca deixa o botão preso em "Testando…"
    window.setTimeout(() => setTestingVoice(false), 12000);
  };
  const saveVoice = () => {
    setSettings({ elevenlabsKey: vkey.trim(), elevenlabsVoiceId: voiceCfg.voiceId });
    toast("Voz da Lulu salva! 🎀", "speaker");
    setVoiceOpen(false);
  };

  return (
    <div className="page">
      <PageHeader title={<><Icon name="user" size={20} style={{ verticalAlign: -3 }} /> Perfil</>} sub={`Nível ${level} · ${levelName(level)}`} />

      {/* Cabeçalho */}
      <Card className="center">
        <div style={{ color: "var(--c-primary)", display: "flex", justifyContent: "center" }}>
          <Icon name={avatarIcon} size={56} />
        </div>
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
          <Segmented
            label="Tema"
            value={state.settings.theme}
            onChange={(v) => setSettings({ theme: v })}
            options={THEMES.map((t) => ({ value: t.id, label: t.name.split(" ")[0] }))}
          />
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
        <SettingRow icon="speaker" title="Áudio (TTS)" desc="Voz nas aulas de listening">
          <Switch on={state.settings.tts} onChange={(v) => setSettings({ tts: v })} label="áudio" />
        </SettingRow>
        <SettingRow
          icon="heart"
          title="Voz da Lulu"
          desc={state.settings.elevenlabsKey ? "Voz natural ativada 🎀" : "Voz natural feminina"}
        >
          <Button
            variant="soft"
            size="sm"
            onClick={() => {
              setVkey(state.settings.elevenlabsKey);
              setVvoice(state.settings.elevenlabsVoiceId);
              setVoiceOpen(true);
            }}
          >
            {state.settings.elevenlabsKey ? "Configurada ✓" : "Configurar →"}
          </Button>
        </SettingRow>
      </Card>

      {/* IA */}
      <div className="section-title">
        <Icon name="robot" size={18} /> IA
      </div>
      <Card>
        <SettingRow icon="radio" title="Provedor" desc={state.settings.aiProvider === "mock" ? "Offline (sem chave)" : `${state.settings.aiProvider} · ${state.settings.aiModel}`}>
          <Button variant="soft" size="sm" onClick={() => navigate("/ai")}>
            Configurar →
          </Button>
        </SettingRow>
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

      {/* Modal voz da Lulu */}
      <Modal open={voiceOpen} onClose={() => setVoiceOpen(false)} title="Voz da Lulu 🎀">
        <p className="muted small">
          Com uma chave do ElevenLabs, a Lulu fala com voz <b>feminina natural</b> em todo o app —
          como uma francesa de verdade. A chave fica só no seu navegador. Sem chave, ela usa a
          melhor voz feminina do seu dispositivo.
        </p>
        <label className="small bold" htmlFor="vkey">Chave (ElevenLabs)</label>
        <TextInput id="vkey" value={vkey} onChange={setVkey} placeholder="sk_…" type="password" />
        <label className="small bold" htmlFor="vvoice">ID da voz</label>
        <TextInput id="vvoice" value={vvoice} onChange={setVvoice} placeholder={ELEVENLABS_DEFAULT_VOICE_ID} />
        <p className="muted small">
          Padrão: <b>Rachel</b> — feminina e multilíngue (francês e português naturais). Troque pelo
          ID de qualquer voz feminina da sua conta.
        </p>
        <div className="row">
          <Button variant="ghost" className="grow" onClick={testVoice} disabled={testingVoice}>
            {testingVoice ? "Testando…" : "Testar voz"}
          </Button>
          <Button className="grow" onClick={saveVoice}>
            Salvar
          </Button>
        </div>
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
