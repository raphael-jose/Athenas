// ══════════════════════════════════════════════════════════════
// Athenas — Estado global (contexto + localStorage)
// ══════════════════════════════════════════════════════════════
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { COSTUMES, STARS, XP } from "@/lib/constants";
import { fireConfetti, fireSparkle } from "@/lib/confetti";
import { setSfxEnabled, sfxAchievement, sfxLevelUp, sfxVictory } from "@/lib/sfx";
import { dayKey, uid } from "@/lib/utils";
import { missionsForDate, type MissionDef } from "@/data/missions";
import { WORLDS, worldById } from "@/data/worlds";
import { newlyUnlocked, levelFromXp, levelName, updateStreak, type AchievementDef } from "@/services/gamification";
import { newReviewItem, scheduleReview } from "@/services/srs";
import { defaultState, loadState, saveState, clearState, importBackup } from "@/services/storage";
import type { CefrBand, ChatMessage, ConversationLog, DailyMission, IconName, StudentState, Settings } from "@/types";
import { Icon } from "@/components/Icons";

export interface Toast {
  id: string;
  icon: IconName;
  text: string;
}

export interface AppApi {
  state: StudentState;
  toast: (text: string, icon?: IconName) => void;
  addXp: (amount: number, opts?: { silent?: boolean }) => void;
  addStars: (amount: number) => void;
  touchStreak: () => void;
  completeLesson: (lessonId: string, opts: { correct: number; total: number; topic: string; wordIds: string[]; xp: number }) => void;
  completeBoss: (bossId: string, worldId: string, xp: number) => void;
  reviewWords: (ratings: { wordId: string; quality: number }[]) => void;
  sendAiMessage: (role: "user" | "assistant", content: string) => void;
  logConversation: (log: ConversationLog) => void;
  buyTheme: (themeId: string) => boolean;
  /** Compra uma roupinha da Lulu (desconta étoiles e aplica na hora). */
  buyCostume: (costumeId: string) => boolean;
  setSettings: (patch: Partial<Settings>) => void;
  finishOnboarding: (opts: { name: string; avatar: string; band: CefrBand }) => void;
  updateProfile: (opts: { name?: string; avatar?: string; photo?: string; email?: string; passwordHash?: string }) => void;
  finishDiagnostic: (result: { band: CefrBand; correct: number; total: number; history: number[] }) => void;
  resetProgress: () => void;
  /** Marca o login do dia (fecha a tela de boas-vindas até amanhã). */
  markLoggedIn: () => void;
  /** Registra a rota atual para "continuar de onde parou". */
  setLastRoute: (route: string) => void;
  /** Marca o modal de atalho (PWA) como visto/respondido. */
  markInstallPrompt: () => void;
  /** Restaura um backup (valida o selo de integridade). Devolve false se inválido. */
  restoreBackup: (raw: string) => boolean;
  addStudyTime: (seconds: number) => void;
  levelUpEvent: LevelUpEvent | null;
  dismissLevelUp: () => void;
  achievementEvent: AchievementDef | null;
  dismissAchievement: () => void;
}

export interface LevelUpEvent {
  level: number;
  name: string;
}

const AppCtx = createContext<AppApi | null>(null);

// ── Helpers puros sobre o estado ──────────────────────────────
function buildDaily(state: StudentState, today: string): StudentState {
  if (state.lastDailyDate === today && state.dailyMissions.length > 0) return state;
  const missions: DailyMission[] = missionsForDate(today).map((m: MissionDef) => ({
    id: m.id,
    date: today,
    label: m.label,
    icon: m.icon,
    metric: m.metric,
    target: m.target,
    progress: 0,
    done: false,
    xp: m.xp,
    stars: m.stars
  }));
  return { ...state, dailyMissions: missions, lastDailyDate: today };
}

function bumpDaily(state: StudentState, metric: string, amount: number, onToast: (t: string, e?: IconName) => void): StudentState {
  const today = dayKey();
  let s = buildDaily(state, today);
  const key = s.dailyProgress[today] ?? {};
  key[metric] = (key[metric] ?? 0) + amount;
  s = { ...s, dailyProgress: { ...s.dailyProgress, [today]: key } };

  let changed = false;
  let xpGain = 0;
  let starGain = 0;
  let labels: string[] = [];
  const missions = s.dailyMissions.map((m) => {
    if (m.done || m.metric !== metric) return m;
    const progress = Math.min(m.target, m.progress + amount);
    if (progress >= m.target) {
      changed = true;
      xpGain += m.xp;
      starGain += m.stars;
      labels.push(m.label);
      return { ...m, progress, done: true };
    }
    return { ...m, progress };
  });
  if (!changed) return { ...s, dailyMissions: missions };
  s = { ...s, dailyMissions: missions, xp: s.xp + xpGain, stars: s.stars + starGain };
  labels.forEach((l) => {
    onToast(`Missão concluída! ${l}`, "confetti");
    fireSparkle();
  });
  return s;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudentState>(() => loadState());
  const stateRef = useRef(state);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [achievementEvent, setAchievementEvent] = useState<AchievementDef | null>(null);

  const commit = useCallback((next: StudentState) => {
    stateRef.current = next;
    setState(next);
    saveState(next);
  }, []);

  const toast = useCallback((text: string, icon: IconName = "sparkle") => {
    const id = uid();
    setToasts((t) => [...t, { id, icon, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  /** Checa conquistas; dispara evento + confete. Retorna estado atualizado. */
  const withAchievements = useCallback(
    (s: StudentState): StudentState => {
      const fresh = newlyUnlocked(s);
      if (fresh.length === 0) return s;
      const next = { ...s, achievements: [...s.achievements, ...fresh.map((a) => a.id)] };
      setAchievementEvent(fresh[0]);
      if (fresh.length > 1) {
        fresh.slice(1).forEach((a) => toast(`${a.title}`, "trophy"));
      }
      fireConfetti(true);
      sfxAchievement();
      return next;
    },
    [toast]
  );

  // Abertura: missões do dia + streak acolhedor
  useEffect(() => {
    const today = dayKey();
    let s = buildDaily(stateRef.current, today);
    const res = updateStreak(s, today);
    s = { ...s, ...res };
    commit(s);
    if (res.reset && res.streak === 1 && stateRef.current.streak > 1) {
      toast("Sua sequência descansou… mas hoje é um novo começo!", "bird");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tempo de estudo
  useEffect(() => {
    const t = setInterval(() => {
      commit({ ...stateRef.current, timeStudied: stateRef.current.timeStudied + 60 });
    }, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efeitos sonoros ligados/desligados conforme as configurações
  useEffect(() => {
    setSfxEnabled(state.settings.sound);
  }, [state.settings.sound]);

  const api = useMemo<AppApi>(
    () => ({
      state: stateRef.current,
      toast,
      addXp: (amount, opts) => {
        const s0 = stateRef.current;
        const before = levelFromXp(s0.xp);
        let s: StudentState = { ...s0, xp: s0.xp + amount };
        s = bumpDaily(s, "xp", amount, toast);
        s = withAchievements(s);
        commit(s);
        const after = levelFromXp(s.xp);
        if (after > before) {
          setLevelUpEvent({ level: after, name: levelName(after) });
          if (!opts?.silent) toast(`Nível ${after} — ${levelName(after)}!`, "confetti");
          fireConfetti(true);
          sfxLevelUp();
        }
      },
      addStars: (amount) => {
        commit({ ...stateRef.current, stars: stateRef.current.stars + amount });
      },
      touchStreak: () => {
        const res = updateStreak(stateRef.current, dayKey());
        commit({ ...stateRef.current, ...res });
      },
      completeLesson: (lessonId, opts) => {
        const s0 = stateRef.current;
        const firstTime = !s0.lessonsCompleted.includes(lessonId);
        let s: StudentState = { ...s0 };
        if (firstTime) {
          s = {
            ...s,
            lessonsCompleted: [...s.lessonsCompleted, lessonId],
            xp: s.xp + opts.xp,
            stars: s.stars + STARS.LESSON
          };
          if (opts.wordIds.length > 0) {
            const newWords = opts.wordIds.filter((w) => !s.wordsLearned.includes(w));
            s = { ...s, wordsLearned: [...s.wordsLearned, ...newWords] };
            const queue = [...s.reviewQueue];
            for (const w of newWords) {
              if (!queue.some((q) => q.wordId === w)) queue.push(newReviewItem(w, 3));
            }
            s = { ...s, reviewQueue: queue };
            s = bumpDaily(s, "words", newWords.length, toast);
            if (newWords.length > 0) fireSparkle();
          }
        } else {
          s = { ...s, xp: s.xp + 5 }; // treino leve
        }
        if (opts.correct === opts.total && opts.total > 0 && !s.perfectLessons.includes(lessonId)) {
          s = {
            ...s,
            perfectLessons: [...s.perfectLessons, lessonId],
            xp: s.xp + XP.PERFECT_BONUS,
            stars: s.stars + STARS.PERFECT_BONUS
          };
        }
        s = { ...s, exercisesTotal: s.exercisesTotal + opts.total, exercisesCorrect: s.exercisesCorrect + opts.correct };
        const wrong = opts.total - opts.correct;
        if (wrong > 0) {
          const mistakes = [...s.mistakes];
          for (let i = 0; i < Math.min(wrong, 4); i++) mistakes.push({ lessonId, topic: opts.topic, at: Date.now() });
          s = { ...s, mistakes: mistakes.slice(-20) };
        }
        s = bumpDaily(s, "lesson", 1, toast);
        s = bumpDaily(s, "correct", opts.correct, toast);
        s = withAchievements(s);
        commit(s);
        if (firstTime) toast("Aula concluída!", "book");
      },
      completeBoss: (bossId, worldId, xp) => {
        const s0 = stateRef.current;
        if (s0.bossesDefeated.includes(bossId)) {
          commit({ ...s0, xp: s0.xp + 25 });
          toast("Boss já derrotado — treino +25 XP", "sword");
          return;
        }
        const world = worldById(worldId);
        let s: StudentState = {
          ...s0,
          bossesDefeated: [...s0.bossesDefeated, bossId],
          xp: s0.xp + xp,
          stars: s0.stars + STARS.BOSS,
          worldsCleared: s0.worldsCleared.includes(worldId) ? s0.worldsCleared : [...s0.worldsCleared, worldId]
        };
        if (world && world.cefr + 1 > s.cefr) {
          s = { ...s, cefr: Math.min(7, world.cefr + 1) as CefrBand };
          const unlocked = WORLDS.filter((w) => w.lessons.length > 0 && w.unlockCefr <= s.cefr).map((w) => w.id);
          s = { ...s, worldsUnlocked: Array.from(new Set([...s.worldsUnlocked, ...unlocked])) };
          toast(`Novo nível CEFR: ${s.cefr >= 7 ? "NATIF" : "A" + s.cefr}`, "graduationCap");
        }
        s = withAchievements(s);
        commit(s);
        fireConfetti(true);
        sfxVictory();
      },
      reviewWords: (ratings) => {
        const s0 = stateRef.current;
        const queue = [...s0.reviewQueue];
        let xpGain = 0;
        for (const r of ratings) {
          const idx = queue.findIndex((q) => q.wordId === r.wordId);
          if (idx >= 0) {
            const updated = scheduleReview(queue[idx], r.quality);
            queue[idx] = updated;
            if (r.quality >= 3) xpGain += XP.REVIEW_CARD;
          }
        }
        let s: StudentState = {
          ...s0,
          reviewQueue: queue,
          xp: s0.xp + xpGain + XP.REVIEW_COMPLETE,
          stars: s0.stars + STARS.REVIEW
        };
        s = bumpDaily(s, "review", ratings.length, toast);
        s = withAchievements(s);
        commit(s);
        toast("Revisão completa! Memória afiada", "brain");
      },
      sendAiMessage: (role, content) => {
        const s0 = stateRef.current;
        const msg: ChatMessage = { role, content, at: Date.now() };
        let s: StudentState = { ...s0, aiMessages: [...s0.aiMessages.slice(-40), msg] };
        if (role === "user") {
          s = { ...s, xp: s.xp + XP.AI_MESSAGE };
          s = bumpDaily(s, "ai", 1, toast);
        }
        s = withAchievements(s);
        commit(s);
      },
      logConversation: (log) => {
        const s0 = stateRef.current;
        const logs = [...s0.conversationLogs.slice(-60), log];
        commit({ ...s0, conversationLogs: logs });
      },
      buyTheme: (themeId) => {
        const s0 = stateRef.current;
        if (s0.boughtThemes.includes(themeId)) return true;
        const PRICE: Record<string, number> = { lavande: 100, bleuet: 120, creme: 150, nuit: 200 };
        const price = PRICE[themeId] ?? 0;
        if (s0.stars < price) {
          toast("Étoiles insuficientes… continue estudando!", "starFour");
          return false;
        }
        commit({
          ...s0,
          stars: s0.stars - price,
          boughtThemes: [...s0.boughtThemes, themeId],
          settings: { ...s0.settings, theme: themeId }
        });
        toast("Tema desbloqueado!", "gift");
        return true;
      },
      buyCostume: (costumeId) => {
        const s0 = stateRef.current;
        if (s0.boughtCostumes.includes(costumeId)) return true;
        const def = COSTUMES.find((c) => c.id === costumeId);
        const price = def?.price ?? 0;
        if (s0.stars < price) {
          toast("Étoiles insuficientes… continue estudando!", "starFour");
          return false;
        }
        commit({
          ...s0,
          stars: s0.stars - price,
          boughtCostumes: [...s0.boughtCostumes, costumeId],
          settings: { ...s0.settings, costume: costumeId }
        });
        toast("Roupinha desbloqueada!", "gift");
        return true;
      },
      setSettings: (patch) => {
        commit({ ...stateRef.current, settings: { ...stateRef.current.settings, ...patch } });
      },
      updateProfile: ({ name, avatar, photo, email, passwordHash }) => {
        const s0 = stateRef.current;
        commit({
          ...s0,
          name: name !== undefined ? (name.trim() || s0.name || "Amélie") : s0.name,
          avatar: avatar ?? s0.avatar,
          photo: photo !== undefined ? photo : s0.photo,
          email: email !== undefined ? email.trim() : s0.email,
          passwordHash: passwordHash !== undefined ? passwordHash : s0.passwordHash
        });
      },
      finishOnboarding: ({ name, avatar, band }) => {
        let s: StudentState = {
          ...stateRef.current,
          name: name.trim() || "Amélie",
          avatar,
          onboarded: true,
          cefr: band,
          lastLoginDate: dayKey(),
          lastRoute: "/map",
          worldsUnlocked: WORLDS.filter((w) => w.lessons.length > 0 && w.unlockCefr <= band).map((w) => w.id),
          worldsCleared: WORLDS.filter((w) => w.lessons.length > 0 && w.cefr < band).map((w) => w.id)
        };
        s = withAchievements(s);
        commit(s);
      },
      markLoggedIn: () => {
        commit({ ...stateRef.current, lastLoginDate: dayKey() });
      },
      setLastRoute: (route) => {
        const cur = stateRef.current;
        if (cur.lastRoute === route) return;
        commit({ ...cur, lastRoute: route });
      },
      markInstallPrompt: () => {
        if (stateRef.current.installPromptSeen) return;
        commit({ ...stateRef.current, installPromptSeen: true });
      },
      finishDiagnostic: ({ band, correct, total, history }) => {
        let s: StudentState = {
          ...stateRef.current,
          diagnosticDone: true,
          cefr: band,
          diagnostic: { band, correct, total, history },
          worldsUnlocked: WORLDS.filter((w) => w.lessons.length > 0 && w.unlockCefr <= band).map((w) => w.id),
          worldsCleared: WORLDS.filter((w) => w.lessons.length > 0 && w.cefr < band).map((w) => w.id)
        };
        s = withAchievements(s);
        commit(s);
        fireConfetti(true);
      },
      resetProgress: () => {
        clearState();
        commit(defaultState());
        toast("Progresso resetado. Nova aventura!", "leaf");
      },
      restoreBackup: (raw) => {
        const restored = importBackup(raw);
        if (!restored) {
          toast("Backup inválido ou adulterado — não restaurado.", "warning");
          return false;
        }
        commit(restored);
        toast("Backup restaurado! Bem-vinda de volta 🌸", "flower");
        return true;
      },
      addStudyTime: (seconds) => {
        commit({ ...stateRef.current, timeStudied: stateRef.current.timeStudied + seconds });
      },
      levelUpEvent,
      dismissLevelUp: () => setLevelUpEvent(null),
      achievementEvent,
      dismissAchievement: () => setAchievementEvent(null)
    }),
    [toast, withAchievements, commit, levelUpEvent, achievementEvent]
  );

  return (
    <AppCtx.Provider value={{ ...api, state, toast }}>
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span className="t-emoji">
              <Icon name={t.icon} size={18} />
            </span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp(): AppApi {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return ctx;
}
