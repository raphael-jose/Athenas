// ══════════════════════════════════════════════════════════════
// Athenas — Persistência (localStorage) + estado inicial
// ══════════════════════════════════════════════════════════════
import { APP_VERSION, AI_DEFAULTS, AI_ENV, CONFETTIS, FRAMES, STORAGE_KEY, THEMES } from "@/lib/constants";
import { embeddedKey } from "@/lib/embeddedKey";
import { dayKey } from "@/lib/utils";
import type { Settings, StudentState } from "@/types";

export function defaultSettings(): Settings {
  // chave: primeiro a embutida (app pronto de cara, sem configurar nada);
  // o usuário pode trocar pela própria nas Configurações → IA (BYOK).
  const embedded = embeddedKey() ?? "";
  // o "mock" do AI_ENV é o fallback de build (não uma escolha explícita)
  const envProvider = AI_ENV.provider as Settings["aiProvider"];
  // PADRÃO: cloud (Ollama). O navegador não fala direto com o ollama.com
  // (sem CORS), então com um proxy configurado o padrão vira o proxy;
  // sem proxy, fica o modo direto e o chat cai no offline com um aviso.
  const defaultProvider: Settings["aiProvider"] =
    envProvider && envProvider !== "mock"
      ? envProvider
      : AI_ENV.proxyUrl
        ? "proxy"
        : embedded
          ? "ollama"
          : "mock";
  return {
    theme: "rose",
    costume: "classic",
    frame: "simples",
    confetti: "classico",
    fontScale: 1,
    animations: true,
    sound: true,
    music: true,
    tts: true,
    aiProvider: defaultProvider,
    // no proxy, a URL padrão é a do Worker (chave vive no servidor)
    aiBaseUrl:
      defaultProvider === "proxy" && AI_ENV.proxyUrl
        ? AI_ENV.proxyUrl
        : AI_ENV.baseUrl || AI_DEFAULTS.baseUrl,
    aiModel: AI_ENV.model || AI_DEFAULTS.model,
    aiKey: embedded
  };
}

export function defaultState(): StudentState {
  const today = dayKey();
  return {
    version: APP_VERSION,
    name: "",
    avatar: "rabbit",
    photo: "",
    email: "",
    passwordHash: "",
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
    boughtCostumes: [],
    boughtFrames: [],
    boughtConfettis: [],
    notificationsSeen: {},
    lastLoginDate: "",
    lastRoute: "",
    installPromptSeen: false
  };
}

export function loadState(): StudentState {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    // confere o selo de integridade: dados corrompidos/adulterados
    // voltam ao zero em vez de quebrar o app
    const unwrapped = unwrap(raw);
    if (!unwrapped) return defaultState();
    const parsed = unwrapped as Partial<StudentState>;
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
    // tema que a pessoa não tem (ex.: bug antigo que liberava tudo) volta ao
    // padrão — os temas só ficam disponíveis depois de comprados na Loja.
    if (!THEMES.some((t) => (t.price === 0 || (state.boughtThemes ?? []).includes(t.id)) && t.id === state.settings.theme)) {
      state.settings.theme = THEMES[0].id;
    }
    // mesma regra para moldura e confete: só ficam ativos se forem grátis
    // ou tiverem sido comprados na Loja.
    if (!FRAMES.some((f) => (f.price === 0 || (state.boughtFrames ?? []).includes(f.id)) && f.id === state.settings.frame)) {
      state.settings.frame = FRAMES[0].id;
    }
    if (!CONFETTIS.some((c) => (c.price === 0 || (state.boughtConfettis ?? []).includes(c.id)) && c.id === state.settings.confetti)) {
      state.settings.confetti = CONFETTIS[0].id;
    }
    state.version = APP_VERSION;
    if (!Array.isArray(state.reviewQueue)) state.reviewQueue = [];
    if (!Array.isArray(state.conversationLogs)) state.conversationLogs = [];
    return state;
  } catch {
    return defaultState();
  }
}

// ── Integridade do banco local ─────────────────────────────────
// O "banco de dados" do Athenas é o localStorage do aparelho (não há
// servidor — o app roda no navegador/GitHub Pages). Para proteger o
// progresso de corrupção acidental (gravação cortada, versão velha,
// edição externa), cada gravação leva um selo de integridade (hash) e
// o carregamento confere o selo antes de confiar nos dados. Se algo
// não bater, recomeça limpo em vez de quebrar o app.

/** Hash rápido (djb2) — selo de integridade, não criptografia. */
function integrityHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return (h >>> 0).toString(36);
}

interface WrappedState {
  v: number;
  d: StudentState;
  c: string; // selo de integridade
}

function wrap(state: StudentState): string {
  const d = JSON.stringify(state);
  const wrapped: WrappedState = { v: APP_VERSION, d: state, c: integrityHash(d) };
  return JSON.stringify(wrapped);
}

/** Valida um JSON de backup/estado e devolve o estado, ou null. */
export function unwrap(raw: string): StudentState | null {
  try {
    const parsed = JSON.parse(raw) as WrappedState | StudentState;
    if (parsed && typeof parsed === "object" && "d" in parsed && "c" in parsed) {
      const w = parsed as WrappedState;
      if (integrityHash(JSON.stringify(w.d)) !== w.c) return null; // adulterado/corrompido
      return w.d as StudentState;
    }
    // formato antigo (sem selo): aceita como está
    return parsed as StudentState;
  } catch {
    return null;
  }
}

export function saveState(state: StudentState) {
  try {
    localStorage.setItem(STORAGE_KEY, wrap(state));
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

/** Gera o texto do backup para download. */
export function exportBackup(state: StudentState): string {
  return wrap(state);
}

/**
 * Restaura um backup. Devolve o estado pronto para uso, ou null se o
 * arquivo estiver corrompido/adulterado (o selo de integridade não bate).
 */
export function importBackup(raw: string): StudentState | null {
  const s = unwrap(raw);
  if (!s || typeof s !== "object") return null;
  const base = defaultState();
  return {
    ...base,
    ...s,
    settings: { ...base.settings, ...(s.settings ?? {}) }
  };
}
