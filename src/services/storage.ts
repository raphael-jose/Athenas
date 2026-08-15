// ══════════════════════════════════════════════════════════════
// Athenas — Persistência (localStorage) + estado inicial
// ══════════════════════════════════════════════════════════════
import { APP_VERSION, AI_DEFAULTS, AI_ENV, LEGACY_STORAGE_KEY, STORAGE_KEY } from "@/lib/constants";
import { embeddedKey } from "@/lib/embeddedKey";
import { dayKey } from "@/lib/utils";
import type { Settings, StudentState } from "@/types";

export function defaultSettings(): Settings {
  return {
    theme: "rose",
    fontScale: 1,
    animations: true,
    sound: true,
    tts: true,
    aiProvider: (AI_ENV.provider as Settings["aiProvider"]) || "mock",
    // no proxy, a URL padrão é a do Worker (chave vive no servidor)
    aiBaseUrl:
      AI_ENV.provider === "proxy" && AI_ENV.proxyUrl
        ? AI_ENV.proxyUrl
        : AI_ENV.baseUrl || AI_DEFAULTS.baseUrl,
    aiModel: AI_ENV.model || AI_DEFAULTS.model,
    // chave: primeiro a embutida (app pronto de cara, sem configurar nada);
    // o usuário pode trocar pela própria nas Configurações → IA (BYOK).
    aiKey: embeddedKey() ?? ""
  };
}

export function defaultState(): StudentState {
  const today = dayKey();
  return {
    version: APP_VERSION,
    name: "",
    avatar: "rabbit",
    onboarded: false,
    diagnosticDone: false,
    startedAt: Date.now(),
    xp: 0,
    stars: 0,
    streak: 0,
    bestStreak: 0,
    lastActiveDay: today,
    cefr: 1,
    worldsUnlocked: [],
    worldsCleared: [],
    lessonsCompleted: [],
    perfectLessons: [],
    bossesDefeated: [],
    wordsLearned: [],
    reviewQueue: [],
    exercisesCorrect: 0,
    exercisesTotal: 0,
    achievements: [],
    dailyMissions: [],
    lastDailyDate: today,
    dailyProgress: {},
    mistakes: [],
    aiMessages: [],
    conversationLogs: [],
    diagnostic: null,
    timeStudied: 0,
    settings: defaultSettings(),
    boughtThemes: [],
    notificationsSeen: {},
    lastLoginDate: "",
    lastRoute: "",
    installPromptSeen: false
  };
}

export function loadState(): StudentState {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Migração do rebranding: progresso salvo na chave antiga é reaproveitado.
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<StudentState>;
    const base = defaultState();
    // Merge defensivo: dados desconhecidos são descartados, faltantes ganham o padrão.
    const state: StudentState = {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) }
    };
    // se a chave salva está vazia (ex.: perfil criado antes da chave embutida),
    // cai de volta para a embutida — o app continua funcionando de cara.
    if (!state.settings.aiKey.trim()) state.settings.aiKey = embeddedKey() ?? "";
    state.version = APP_VERSION;
    if (!Array.isArray(state.reviewQueue)) state.reviewQueue = [];
    if (!Array.isArray(state.conversationLogs)) state.conversationLogs = [];
    return state;
  } catch {
    return defaultState();
  }
}

export function saveState(state: StudentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota excedida — ignora silenciosamente (o app segue funcionando em memória)
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
