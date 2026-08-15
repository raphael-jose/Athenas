// ══════════════════════════════════════════════════════════════
// Athenas — Central de IA 
// Chat, Conversa e "Ça sonne français?" — todos com a Lulu online
// quando há chave/proxy configurado (fallback offline embutido).
// ══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { buildStudentProfile, buildSystemPrompt } from "@/services/ai/prompts";
import { createProvider, providerErrorToMessage, MockProvider } from "@/services/ai";
import { relayChat } from "@/services/ai/relay";
import { analyzeFrench, SOUND_FRENCH_TIPS } from "@/services/ai/corrections";
import { SCENARIOS, scenarioLines, type Scenario } from "@/data/scenarios";
import { compareEvolution, computeInterviewCompetencies, conversationStats, nextAttempt, overallCompetencyScore, practicedScenarios, previousLog, type CompetencyScore } from "@/services/conversationReview";
import { round } from "@/lib/utils";
import { Button, Card, Chip, PageHeader, Segmented } from "@/components/ai-ui";
import { Mascot } from "@/components/Mascot";
import { Icon } from "@/components/Icons";
import { AudioButton } from "@/components/AudioButton";
import { useSpeech } from "@/hooks/useSpeech";
import { usePushToTalk } from "@/hooks/usePushToTalk";
import { cleanSpokenText } from "@/services/speechClean";
import { sfxComplete, sfxCorrect, sfxVictory, sfxWrong } from "@/lib/sfx";
import { fireConfetti } from "@/lib/confetti";
import { soundFrenchQuiz, isSoundFrenchCorrect, soundFrenchScore, soundFrenchTier } from "@/services/soundFrenchQuiz";
import type { SoundFrenchQuestion } from "@/data/soundFrench";
import type { ChatMessage, ConversationLog, IconName } from "@/types";

type Tab = "chat" | "conversa" | "sonne";

// ── Áudio nas falas da Lulu ────────────────────────────────────
// Fala mista (português com exemplos em francês entre aspas): extrai
// os trechos em francês para o aluno ouvir como um francês diria.
const FR_QUOTE_RE = /«([^»]+)»|"([^"]+)"|'((?:[^']|'(?=[a-zà-ÿ]))+)'/g;
const FR_MARKERS =
  /\b(je|tu|il|elle|on|nous|vous|ils|elles|est|sont|avec|pour|très|pas|oui|non|mais|bien|bonjour|merci|comment|quoi|ça|une|des|au|aux|du|dans|sur|c'est|qu'est|voudrais|plaisir|plaît|salut)\b|[àâçéèêëîïôûùœ]/i;

/** Texto para a Lulu falar: só o francês das falas; sem trechos, a fala inteira. */
function frenchSpeakText(text: string): string {
  const segs: string[] = [];
  for (const m of text.replace(/’/g, "'").matchAll(FR_QUOTE_RE)) {
    const seg = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    if (seg.length >= 3 && FR_MARKERS.test(seg)) segs.push(seg);
  }
  return segs.length > 0 ? segs.join(". ") : text;
}

/** Sugestão "Mais natural" para uma frase do aluno (mesma regra do modo de análise). */
function naturalSuggestion(text: string): string | null {
  const res = analyzeFrench(text);
  return res.suggestion && res.suggestion !== res.original ? res.suggestion : null;
}

export function AIHub() {
  const { state } = useApp();
  const { navigate } = useRouter();
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="page">
      <PageHeader
        title={<><Icon name="robot" size={20} style={{ verticalAlign: -3 }} /> Lulu IA</>}
        sub="Sua professora particular de francês"
        onBack={() => navigate("/")}
      />

      <div className="mb-3">
        <Segmented
          label="Modos da Lulu"
          options={[
            { value: "chat", label: <><Icon name="chat" size={15} /> Chat</> },
            { value: "conversa", label: <><Icon name="maskHappy" size={15} /> Conversa</> },
            { value: "sonne", label: <><Icon name="magicWand" size={15} /> Sonne?</> }
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "chat" && <ChatMode />}
      {tab === "conversa" && <ConversationMode />}
      {tab === "sonne" && <SoundFrenchMode />}

      <div className="center mt-4">
        <p className="muted small">
          {state.settings.aiProvider === "mock"
            ? "Modo offline: a Lulu responde sem internet. Ative o modo online para respostas ilimitadas!"
            : "Modo online: a Lulu responde com a IA na nuvem ✨"}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Chat
// ══════════════════════════════════════════════════════════════
function ChatMode() {
  const { state, sendAiMessage, toast } = useApp();
  const { navigate } = useRouter();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const provider = useMemo(() => createProvider(state.settings), [state.settings]);
  const profile = useMemo(() => buildStudentProfile(state), [state]);
  const system = useMemo(() => buildSystemPrompt(profile), [profile]);

  const messages = state.aiMessages.filter((m) => m.role !== "system");
  const history: ChatMessage[] = messages.length > 0 ? messages : [{ role: "assistant", content: `Bonjour, ${state.name || "amigue"} ! Eu sou a Lulu, sua professora de francês. Pode me perguntar qualquer coisa — significados, conjugações, diferenças entre palavras, correções… ou me pedir um mini exercício !`, at: Date.now() }];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    setError(null);
    sendAiMessage("user", text);
    setTyping(true);
    const historyForLulu: ChatMessage[] = [...state.aiMessages, { role: "user", content: text, at: Date.now() }];
    try {
      // 1) Lulu NA NUVEM direto (proxy/Worker configurado) — a melhor resposta
      const reply = await provider.chat({ messages: historyForLulu, system });
      sendAiMessage("assistant", reply);
    } catch (err) {
      try {
        // 2) O navegador não fala direto com o ollama.com (sem CORS). O relay
        // leva a mensagem à NUVEM com a chave — a Lulu online funciona de verdade.
        if (state.settings.aiProvider === "mock") throw new Error("offline_mode");
        const reply = await relayChat(
          { baseUrl: state.settings.aiBaseUrl, model: state.settings.aiModel, apiKey: state.settings.aiKey },
          { messages: historyForLulu, system }
        );
        sendAiMessage("assistant", reply);
      } catch {
        try {
          // 3) Último recurso: Lulu offline (banco de vocabulário local)
          const offlineReply = await new MockProvider().chat({ messages: historyForLulu, system });
          sendAiMessage("assistant", offlineReply);
          toast("Sem sinal com a Lulu online — respondi pelo modo offline 🌸", "radio");
        } catch {
          setError(providerErrorToMessage(err));
        }
      }
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <div className="chat-list">
        {history.map((m, i) => {
          const prev = history[i - 1];
          const sug = m.role === "assistant" && prev && prev.role === "user" ? naturalSuggestion(prev.content) : null;
          return (
            <div key={i}>
              <div className={`msg ${m.role === "user" ? "user" : "assistant"}`}>
                {m.content}
                {m.role === "assistant" && (
                  <span className="msg-audio">
                    <AudioButton text={frenchSpeakText(m.content)} size="sm" label="Ouvir o francês desta resposta" />
                  </span>
                )}
              </div>
              {sug && (
                <div className="card-soft mt-2" style={{ textAlign: "left" }}>
                  <div className="small bold mb-1 row" style={{ gap: 5 }}>
                    <Icon name="sparkle" size={14} /> Mais natural:
                  </div>
                  <div className="row" style={{ gap: 8, alignItems: "center" }}>
                    <span className="bold grow">{sug}</span>
                    <AudioButton text={sug} size="sm" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {typing && (
          <div className="msg assistant">
            <div className="typing-dots" aria-label="Lulu está pensando">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <div className="feedback bad row mb-3">
          <span style={{ color: "var(--c-red)", display: "inline-flex" }}>
            <Icon name="radio" size={22} />
          </span>
          <div className="grow">
            <strong>Minha anteninha está sem sinal…</strong>
            <div className="small">{error}</div>
          </div>
          <Button variant="soft" size="sm" onClick={() => navigate("/map")}>Aulas</Button>
        </div>
      )}

      <div className="chat-input-bar">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={provider.ready() ? "Pergunte à Lulu…" : "Lulu offline: pergunte mesmo assim!"}
          rows={1}
          aria-label="Mensagem para a Lulu"
        />
        <Button onClick={send} disabled={!input.trim() || typing} aria-label="Enviar">
          <Icon name="arrowRight" size={18} />
        </Button>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// Conversa
// ══════════════════════════════════════════════════════════════
function ConversationMode() {
  const { state, sendAiMessage, logConversation, toast, addXp } = useApp();
  const ptt = usePushToTalk();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<null | { natural: number; gram: number; vocab: number; flu: number; text: string; comps?: CompetencyScore[] }>(null);
  const [evolution, setEvolution] = useState<ReturnType<typeof compareEvolution> | null>(null);
  const [pt, setPt] = useState(false);
  const [attempt, setAttempt] = useState(1);

  const provider = useMemo(() => createProvider(state.settings), [state.settings]);
  const practiced = useMemo(() => practicedScenarios(state.conversationLogs), [state.conversationLogs]);

  const openScenario = (s: Scenario) => {
    setScenario(s);
    setStep(0);
    setReplies([]);
    setFeedback(null);
    setEvolution(null);
    setAttempt(nextAttempt(state.conversationLogs, s.id));
  };

  if (!scenario) {
    return (
      <div className="stack">
        <Card className="center">
          <Mascot mood="explaining" size={100} />
          <h3>Simulação de situações reais</h3>
          <p className="muted small">
            A Lulu interpreta um papel. Você responde em francês — sem roteiro, sem medo.
          </p>
        </Card>

        {practiced.length > 0 && (
          <>
            <div className="section-title">
              <Icon name="arrowClockwise" size={18} /> Revisar conversas passadas
            </div>
            <div className="card-soft mb-2" style={{ background: "var(--c-accent-soft)" }}>
              <p className="small mb-0" style={{ marginBottom: 0 }}>
                <Icon name="sparkle" size={14} style={{ verticalAlign: -2 }} /> {" "}
                Refazer um cenário usa <strong>variações</strong> — a Lulu muda as falas — e você vê sua evolução no feedback.
              </p>
            </div>
            {practiced.map(({ scenarioId }) => {
              const s = SCENARIOS.find((x) => x.id === scenarioId);
              if (!s) return null;
              const stats = conversationStats(state.conversationLogs, s.id);
              return (
                <button key={s.id} className="choice-btn" onClick={() => openScenario(s)}>
                  <span className="cb-emoji" style={{ color: "var(--c-gold)" }}>
                    <Icon name="arrowClockwise" size={22} />
                  </span>
                  <span className="grow">
                    {s.title}
                    <small>Refazer com variação · melhor nota {stats.best}%</small>
                  </span>
                  <Chip variant="gold">
                    <Icon name="arrowClockwise" size={13} /> +{stats.attempts}
                  </Chip>
                </button>
              );
            })}
          </>
        )}

        <div className="section-title">
          <Icon name="chat" size={18} /> Cenários novos
        </div>
        {SCENARIOS.map((s) => {
          const stats = conversationStats(state.conversationLogs, s.id);
          return (
            <button key={s.id} className="choice-btn" onClick={() => openScenario(s)}>
              <span className="cb-emoji" style={{ color: "var(--c-accent-deep)" }}>
                <Icon name={s.icon} size={22} />
              </span>
              <span className="grow">
                {s.title}
                <small>{s.setting}</small>
              </span>
              {stats.attempts > 0 ? <Chip variant="green">feito {stats.attempts}×</Chip> : <Chip variant="rose">{s.level}</Chip>}
            </button>
          );
        })}
      </div>
    );
  }

  const lines = scenarioLines(scenario, attempt);
  const line = lines[Math.min(step, lines.length - 1)];
  const isLast = step >= lines.length - 1;

  const send = (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;
    setInput("");
    const nextReplies = [...replies, text];
    setReplies(nextReplies);
    sendAiMessage("user", text);
    if (isLast) {
      // fim: feedback + recompensa + log de evolução
      const fb = computeFeedback(nextReplies, state);
      const comps = scenario.competencies ? computeInterviewCompetencies(nextReplies, scenario.competencies) : undefined;
      if (comps) {
        // entrevista: a média das competências refina a nota de fluência
        const overall = overallCompetencyScore(comps);
        fb.flu = round((fb.flu + overall) / 2);
      }
      setFeedback({ ...fb, comps });
      const log: ConversationLog = { scenarioId: scenario.id, at: Date.now(), natural: fb.natural, gram: fb.gram, vocab: fb.vocab, flu: fb.flu };
      logConversation(log);
      const prev = previousLog(state.conversationLogs, log);
      if (prev) setEvolution(compareEvolution(prev, log));
      addXp(attempt > 1 ? 12 : 15, { silent: true }); // revisão dá um pouco menos
      sfxComplete();
      if (provider.ready()) {
        provider
          .chat({
            messages: [
              { role: "user", content: `Cenário: ${scenario.title}. Respostas do aluno em francês:\n${nextReplies.join("\n")}\n\nDê um feedback curto e encorajador em português: 2 pontos fortes e 1 sugestão.` , at: Date.now() }
            ],
            system: "Você é a Lulu, professora fofa de francês."
          })
          .then((t) => setFeedback((f) => (f ? { ...f, text: t } : f)))
          .catch(() => {
            // Direto sem sinal? O relay leva à nuvem com a chave.
            void relayChat(
              { baseUrl: state.settings.aiBaseUrl, model: state.settings.aiModel, apiKey: state.settings.aiKey },
              {
                messages: [
                  {
                    role: "user",
                    content: `Cenário: ${scenario.title}. Respostas do aluno em francês:\n${nextReplies.join("\n")}\n\nDê um feedback curto e encorajador em português: 2 pontos fortes e 1 sugestão.`,
                    at: Date.now()
                  }
                ],
                system: "Você é a Lulu, professora fofa de francês."
              }
            )
              .then((t) => setFeedback((f) => (f ? { ...f, text: t } : f)))
              .catch(() => undefined);
          });
      }
      toast(attempt > 1 ? "Revisão de conversa concluída! +12 XP" : "Conversa concluída! +15 XP", "maskHappy");
    } else {
      setStep((s) => s + 1);
    }
  };

  if (feedback) {
    return (
      <div className="stack">
        <Card className="center">
          <Mascot mood="proud" size={110} />
          <h3>Feedback da conversa</h3>
          {attempt > 1 && (
            <p className="small" style={{ color: "var(--c-accent-deep)" }}>
              <Icon name="arrowClockwise" size={14} style={{ verticalAlign: -2 }} /> Revisão com variações · tentativa {attempt}
            </p>
          )}
          <div className="stats-grid mt-3">
            <StatMini label="Naturalidade" value={feedback.natural} icon="chatCircleDots" />
            <StatMini label="Gramática" value={feedback.gram} icon="book" />
            <StatMini label="Vocabulário" value={feedback.vocab} icon="books" />
            <StatMini label="Fluência" value={feedback.flu} icon="lightning" />
          </div>
          {feedback.comps && (
            <div className="card-soft mt-3" style={{ textAlign: "left" }}>
              <div className="small bold row mb-2" style={{ gap: 6 }}>
                <Icon name="briefcase" size={14} /> Avaliação por competência — entrevista
              </div>
              {feedback.comps.map((c) => (
                <div key={c.id} className="comp-row">
                  <div className="row-between small">
                    <span className="row" style={{ gap: 6 }}>
                      <Icon name={c.icon} size={15} style={{ color: "var(--c-accent-deep)" }} /> {c.label}
                    </span>
                    <strong
                      style={{
                        color: c.score >= 70 ? "var(--c-green)" : c.score >= 45 ? "var(--c-gold)" : "var(--c-red)"
                      }}
                    >
                      {c.score}%
                    </strong>
                  </div>
                  <div className="progress thin mt-1">
                    <span
                      style={{
                        width: `${c.score}%`,
                        background: c.score >= 70 ? "linear-gradient(90deg, #7ed6ab, var(--c-green))" : c.score >= 45 ? "linear-gradient(90deg, #f5c96b, var(--c-gold))" : "linear-gradient(90deg, #f2a6ab, var(--c-red))"
                      }}
                    />
                  </div>
                  {c.score < 70 && <p className="small muted mt-1 mb-0" style={{ marginBottom: 0 }}>{c.tip}</p>}
                </div>
              ))}
              <p className="small mt-2 mb-0" style={{ marginBottom: 0 }}>
                <strong>Perfil:</strong>{" "}
                <span style={{ color: "var(--c-accent-deep)" }}>
                  {overallCompetencyScore(feedback.comps) >= 70
                    ? "Candidato forte — a recrutadora ficou impressionada !"
                    : overallCompetencyScore(feedback.comps) >= 45
                      ? "Bom potencial — revise as dicas abaixo e tente de novo."
                      : "Precisa de preparação — refaça a entrevista e pratique as dicas."}
                </span>
              </p>
            </div>
          )}
          {evolution && (
            <div className="card-soft mt-3" style={{ textAlign: "left" }}>
              <div className="small bold row mb-2" style={{ gap: 6 }}>
                <Icon name="chartBar" size={14} /> Evolução desde a última vez
              </div>
              <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <EvoCell label="Natural" delta={evolution.natural} />
                <EvoCell label="Gramática" delta={evolution.gram} />
                <EvoCell label="Vocabulário" delta={evolution.vocab} />
                <EvoCell label="Fluência" delta={evolution.flu} />
              </div>
              <p className="small mt-2 mb-0" style={{ marginBottom: 0 }}>
                <strong>Geral:</strong> {" "}
                <span style={{ color: evolution.overall >= 0 ? "var(--c-green)" : "var(--c-red)" }}>
                  {evolution.overall >= 0 ? "▲" : "▼"} {Math.abs(evolution.overall)} pontos vs {evolution.prevOverall}%
                </span>
              </p>
            </div>
          )}
          <p className="muted small mt-3" style={{ textAlign: "left" }}>
            Estimativa local carinhosa {provider.ready() ? "(a Lulu está refinando…)" : "(demo — configure a IA online para análise real)"}
          </p>
          {feedback.text && <div className="card-soft mt-2 small" style={{ textAlign: "left" }}>{feedback.text}</div>}
          <div className="card-soft mt-3" style={{ textAlign: "left" }}>
            <div className="small bold mb-2 row" style={{ gap: 6 }}>
              <Icon name="chatCircleDots" size={14} /> Como um francês diria — ouça de novo
            </div>
            {lines.map((l, i) => (
              <div key={i} className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <span className="grow small">{l.fr}</span>
                <AudioButton text={l.fr} size="sm" />
              </div>
            ))}
          </div>
          <Button className="mt-4" block onClick={() => setScenario(null)}>
            Nova conversa
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack">
      <Card className="card-soft">
        <div className="row-between small">
          <Chip variant="rose"><Icon name={scenario.icon} size={14} /> {scenario.title}</Chip>
          <span className="row" style={{ gap: 6 }}>
            {attempt > 1 && <Chip variant="gold"><Icon name="arrowClockwise" size={13} /> Variação</Chip>}
            <Chip>{step + 1}/{lines.length}</Chip>
          </span>
        </div>
        <p className="muted small mt-2" style={{ marginBottom: 0 }}>{scenario.setting}</p>
      </Card>

      <div className="chat-list">
        {replies.length === 0 && (
          <div className="msg assistant">
            <strong>{scenario.role}:</strong> {pt ? line.pt : line.fr}
            <span className="msg-audio">
              <AudioButton text={line.fr} size="sm" />
            </span>
          </div>
        )}
        {replies.map((r, i) => (
          <div key={i}>
            <div className="msg assistant">
              <strong>{scenario.role}:</strong>{" "}
              {pt ? lines[Math.min(i, lines.length - 1)].pt : lines[Math.min(i, lines.length - 1)].fr}
              <span className="msg-audio">
                <AudioButton text={lines[Math.min(i, lines.length - 1)].fr} size="sm" />
              </span>
            </div>
            <div className="msg user">{r}</div>
          </div>
        ))}
        {!isLast && replies.length > 0 && (
          <div className="msg assistant">
            <strong>{scenario.role}:</strong> {pt ? line.pt : line.fr}
            <span className="msg-audio">
              <AudioButton text={line.fr} size="sm" />
            </span>
          </div>
        )}
      </div>

      <div className="row-between">
        <Button variant="ghost" size="sm" onClick={() => setPt(!pt)}>
          {pt ? "Ver em francês" : "Ver tradução"}
        </Button>
        <span className="muted small row" style={{ gap: 5 }}>
          <Icon name="lightbulb" size={14} /> {scenario.tip}
        </span>
      </div>

      {ptt.recording && (
        <div className="ptt-live" role="status">
          <span className="dot" aria-hidden />
          <span className="grow">{ptt.interim || "Fale em francês…"}</span>
        </div>
      )}
      {ptt.error && !ptt.recording && <p className="ptt-error">{ptt.error}</p>}

      <div className="chat-input-bar" style={{ position: "static" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Responda em francês…"
          rows={1}
          aria-label="Resposta em francês"
        />
        <button
          type="button"
          className={`ptt-btn ${ptt.recording ? "recording" : ""} ${!ptt.supported ? "disabled" : ""}`}
          onPointerDown={(e) => {
            if (!ptt.supported) return;
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* ok */
            }
            ptt.start("fr-FR");
          }}
          onPointerUp={() => {
            if (!ptt.recording) return;
            void ptt.stop().then((t) => {
              const clean = cleanSpokenText(t);
              if (clean) send(clean);
            });
          }}
          onPointerCancel={() => ptt.cancel()}
          onContextMenu={(e) => e.preventDefault()}
          aria-label={ptt.recording ? "Gravando — solte para enviar" : "Segure para falar em francês"}
          title={ptt.supported ? "Segure para falar em francês" : "Seu navegador não suporta reconhecimento de fala"}
          disabled={!ptt.supported}
        >
          <Icon name="mic" size={18} />
        </button>
        <Button onClick={() => send()} disabled={!input.trim() || ptt.recording}>
          {isLast ? "Finalizar" : <Icon name="arrowRight" size={18} />}
        </Button>
      </div>
    </div>
  );
}

function StatMini({ label, value, icon }: { label: string; value: number; icon: IconName }) {
  return (
    <div className="stat-card">
      <div className="s-emoji">
        <Icon name={icon} size={26} />
      </div>
      <div className="s-val">{value}%</div>
      <div className="s-lbl">{label}</div>
    </div>
  );
}

function EvoCell({ label, delta }: { label: string; delta: number }) {
  const up = delta > 0;
  const flat = delta === 0;
  return (
    <div className="stat-card" style={{ padding: "6px 4px", minHeight: 0 }}>
      <div className="s-val" style={{ fontSize: "1.05rem", color: flat ? "var(--c-muted)" : up ? "var(--c-green)" : "var(--c-red)" }}>
        {flat ? "—" : up ? `▲ ${delta}` : `▼ ${Math.abs(delta)}`}
      </div>
      <div className="s-lbl">{label}</div>
    </div>
  );
}

function computeFeedback(replies: string[], state: StudentStateLite) {
  const all = replies.join(" ");
  const len = all.length;
  const funcWords = ["je", "tu", "il", "elle", "le", "la", "les", "de", "à", "est", "ai", "suis", "pas", "avec", "pour", "et", "ou", "un", "une"];
  const found = funcWords.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(all)).length;
  const grammarScore = Math.min(100, 45 + found * 7 + (replies.length >= 3 ? 12 : 0));
  const learned = state.wordsLearned.length;
  const vocabScore = Math.min(100, 40 + learned * 0.4 + Math.min(30, replies.reduce((a, r) => a + Math.min(4, r.split(/\s+/).length), 0)));
  const fluScore = Math.min(100, 30 + len * 0.25 + replies.length * 4);
  const natural = Math.min(100, 45 + (replies.length >= 4 ? 20 : 10) + (found >= 3 ? 15 : 5));
  return {
    natural: round(natural),
    gram: round(grammarScore),
    vocab: round(vocabScore),
    flu: round(fluScore),
    text: ""
  };
}

// ══════════════════════════════════════════════════════════════
// Ça sonne français ?
// ══════════════════════════════════════════════════════════════
function SoundFrenchMode() {
  const { state } = useApp();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeFrench> | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  const provider = useMemo(() => createProvider(state.settings), [state.settings]);

  const analyze = async () => {
    const phrase = text.trim();
    if (!phrase || thinking) return;
    setThinking(true);
    setAiNote(null);
    setResult(null);
    // Resposta local imediata (funciona sempre, até offline)
    const res = analyzeFrench(phrase);
    setResult(res);
    if (res.isNatural) sfxCorrect();
    else sfxWrong();
    // A Lulu ONLINE entende a frase de verdade (chave/proxy configurado);
    // sem sinal, o cérebro local analisa; e o resultado de regras acima
    // é a rede de segurança final.
    try {
      const ai = await provider.chat({
        messages: [
          {
            role: "user",
            content: `Analise esta frase em francês: "${phrase}".\nResponda em português do Brasil, em no máximo 3 frases: 1) a frase está correta e natural? 2) se não estiver, qual é a versão mais natural? 3) uma dica rápida.`,
            at: Date.now()
          }
        ],
        system: "Você é a Lulu, professora fofa de francês."
      });
      setAiNote(ai);
    } catch {
      try {
        const ai = await relayChat(
          { baseUrl: state.settings.aiBaseUrl, model: state.settings.aiModel, apiKey: state.settings.aiKey },
          {
            messages: [
              {
                role: "user",
                content: `Analise esta frase em francês: "${phrase}".\nResponda em português do Brasil, em no máximo 3 frases: 1) a frase está correta e natural? 2) se não estiver, qual é a versão mais natural? 3) uma dica rápida.`,
                at: Date.now()
              }
            ],
            system: "Você é a Lulu, professora fofa de francês."
          }
        );
        setAiNote(ai);
      } catch {
        // offline: o resultado local continua valendo
      }
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="stack">
      <Card>
        <h3 className="row" style={{ gap: 8 }}><Icon name="magicWand" size={20} /> "Ça sonne français ?"</h3>
        <p className="muted small">
          Escreva uma frase em francês. A Lulu diz se está correta… e se um francês de verdade diria assim.
        </p>
        <textarea
          className="text-input"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex.: Je suis très fatigué aujourd'hui."
          aria-label="Frase em francês"
        />
        <Button className="mt-3" block onClick={analyze} disabled={!text.trim() || thinking}>
          {thinking ? "Lulu está pensando…" : "Analisar"}
        </Button>
      </Card>

      {thinking && (
        <Card className="center muted small">
          A Lulu está analisando sua frase…
        </Card>
      )}

      {aiNote && (
        <Card className="pop-in">
          <div className="feedback good">
            <Icon name="sparkle" size={15} style={{ verticalAlign: -2 }} /> <strong>Lulu (online) analisou:</strong>
          </div>
          <p className="mt-2 mb-0" style={{ whiteSpace: "pre-wrap" }}>{aiNote}</p>
        </Card>
      )}

      {!aiNote && result && (
        <Card className="pop-in">
          {result.isNatural && (
            <div className="feedback good">
              <strong>Parfait !</strong> {result.note}
            </div>
          )}
          {!result.isNatural && (
            <div className="feedback bad">
              <strong>Quase !</strong> {result.note}
            </div>
          )}
          {result.suggestion && (
            <div className="card-soft mt-3">
              <div className="small bold mb-1 row" style={{ gap: 5 }}>
                <Icon name="sparkle" size={14} /> Mais natural:
              </div>
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <span className="bold grow" style={{ fontSize: "1.1rem" }}>{result.suggestion}</span>
                <AudioButton text={result.suggestion} size="sm" />
              </div>
            </div>
          )}
        </Card>
      )}

      <SoundFrenchQuiz />

      <Card>
        <div className="small bold mb-2">Dicas de naturalidade</div>
        <div className="stack">
          {SOUND_FRENCH_TIPS.map((t, i) => (
            <div key={i} className="row" style={{ alignItems: "flex-start" }}>
              <span aria-hidden style={{ color: "var(--c-accent-deep)", display: "inline-flex" }}>
                <Icon name="lightbulb" size={15} />
              </span>
              <span className="small">{t}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Quiz "Qui sonne français ?"
// ══════════════════════════════════════════════════════════════
function SoundFrenchQuiz() {
  const { state, addXp, addStars, toast } = useApp();
  const { speak } = useSpeech();
  const [phase, setPhase] = useState<"intro" | "play" | "feedback" | "done">("intro");
  const [questions, setQuestions] = useState<SoundFrenchQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  // Auto-toca a versão natural no feedback de cada questão
  useEffect(() => {
    if (phase === "feedback" && picked !== null && questions[idx] && state.settings.tts !== false) {
      speak(questions[idx].options[questions[idx].answer]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, picked, idx]);

  const start = () => {
    setQuestions(soundFrenchQuiz(8, Math.floor(Math.random() * 1e9)));
    setIdx(0);
    setPicked(null);
    setResults([]);
    setPhase("play");
  };

  const pick = (i: number) => {
    if (phase !== "play") return;
    const q = questions[idx];
    const ok = isSoundFrenchCorrect(q, i);
    setPicked(i);
    setResults((r) => [...r, ok]);
    if (ok) sfxCorrect();
    else sfxWrong();
    setPhase("feedback");
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const score = soundFrenchScore(results);
      if (score.pct >= 80) {
        addXp(15, { silent: true });
        addStars(4);
        if (score.pct >= 90) {
          fireConfetti(true);
          sfxVictory();
        }
        toast("Desafio sonne français! +15 XP e +4 étoiles", "sparkle");
      } else {
        addXp(10, { silent: true });
        toast("Desafio concluído! +10 XP", "magicWand");
      }
      setPhase("done");
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setPhase("play");
    }
  };

  if (phase === "intro") {
    return (
      <Card className="center">
        <div className="row" style={{ justifyContent: "center" }}>
          <Icon name="magicWand" size={20} />
          <h3 style={{ margin: 0 }}>Qui sonne français ?</h3>
        </div>
        <p className="muted small mt-2">
          Cada frase está <strong>gramaticalmente correta</strong>… mas um francês não diria assim.
          Escolha a versão <strong>natural</strong> que ele usaria na conversa real.
        </p>
        <div className="row center" style={{ justifyContent: "center" }}>
          <Chip variant="rose"><Icon name="question" size={13} /> 8 perguntas</Chip>
          <Chip variant="gold"><Icon name="sparkle" size={13} /> +15 XP</Chip>
        </div>
        <Button className="mt-3" block onClick={start}>
          <Icon name="play" size={15} /> Começar o desafio
        </Button>
      </Card>
    );
  }

  if (phase === "done") {
    const score = soundFrenchScore(results);
    const tier = soundFrenchTier(score.pct);
    return (
      <Card className="center pop-in">
        <Mascot mood={score.pct >= 80 ? "excited" : "happy"} size={96} />
        <h3 className="row" style={{ justifyContent: "center", gap: 8 }}>
          <Icon name={tier.icon} size={20} style={{ color: "var(--c-gold)" }} /> {tier.title}
        </h3>
        <p className="muted small">{tier.desc}</p>
        <div className="stats-grid mt-3">
          <div className="stat-card"><strong>{score.correct}/{score.total}</strong><small>certas</small></div>
          <div className="stat-card"><strong>{score.pct}%</strong><small>naturalidade</small></div>
        </div>
        <div className="row center mt-3" style={{ justifyContent: "center" }}>
          <Chip variant={score.pct >= 80 ? "gold" : "rose"}>{score.pct >= 80 ? "+15 XP · +4 étoiles" : "+10 XP"}</Chip>
        </div>
        <div className="stack mt-3">
          <Button block onClick={start}>Jogar de novo</Button>
        </div>
      </Card>
    );
  }

  const q = questions[idx];
  if (!q) return null;
  const isFeedback = phase === "feedback" && picked !== null;
  const ok = isFeedback ? isSoundFrenchCorrect(q, picked) : false;

  return (
    <Card>
      <div className="row-between small mb-2">
        <span className="row" style={{ gap: 6 }}>
          <Icon name="sparkle" size={14} style={{ color: "var(--c-gold)" }} /> Qui sonne français ?
        </span>
        <Chip>{idx + 1}/{questions.length}</Chip>
      </div>
      <p className="small bold mb-0" style={{ marginBottom: 2 }}>{q.learner}</p>
      <p className="muted small mb-2" style={{ marginBottom: 8 }}>{q.learnerPt}</p>
      <div className="stack">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${isFeedback ? (i === q.answer ? "correct" : i === picked ? "wrong" : "") : ""}`}
            disabled={isFeedback}
            onClick={() => pick(i)}
          >
            <span className="opt-letter">{["A", "B", "C", "D"][i]}</span>
            {opt}
          </button>
        ))}
      </div>
      {isFeedback && (
        <div className="mt-3">
          <div className={`feedback ${ok ? "good" : "bad"}`}>
            <strong>{ok ? "C'est naturel !" : "Presque…"}</strong>
          </div>
          <div className="card-soft mt-2">
            <div className="small bold mb-1 row" style={{ gap: 5 }}>
              <Icon name="sparkle" size={13} /> Um francês diria assim — ouça:
            </div>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <span className="bold" style={{ fontSize: "1.05rem" }}>{q.options[q.answer]}</span>
              <AudioButton text={q.options[q.answer]} size="sm" />
            </div>
          </div>
          <div className="card-soft mt-2 small">
            <Icon name="lightbulb" size={13} style={{ verticalAlign: -2 }} /> {q.why}
          </div>
          <Button className="mt-3" block onClick={next}>
            {idx + 1 >= questions.length ? "Ver resultado" : "Próxima frase"}
          </Button>
        </div>
      )}
    </Card>
  );
}

type StudentStateLite = { wordsLearned: string[] };
