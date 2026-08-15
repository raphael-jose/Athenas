// ══════════════════════════════════════════════════════════════
// Athenas — Tipos centrais do domínio
// ══════════════════════════════════════════════════════════════

/** Índices CEFR: 0=A0 … 6=C2, 7=NATIF (Modo Deus Supremo). */
export type CefrBand = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Nomes dos ícones do Athenas (biblioteca Phosphor, via components/Icons). */
export type IconName =
  | "home" | "map" | "brain" | "chat" | "user" | "flame" | "star" | "trophy"
  | "book" | "mic" | "speaker" | "back" | "gear" | "lock" | "check" | "shield"
  | "crown" | "sparkle" | "play" | "x" | "heart" | "search" | "sword" | "compass"
  | "leaf" | "bowlFood" | "city" | "airplane" | "graduationCap" | "briefcase"
  | "books" | "maskHappy" | "globe" | "fire" | "moon" | "handWaving" | "handHeart"
  | "checkCircle" | "hash" | "palette" | "calendar" | "scales" | "users" | "forkKnife"
  | "lightning" | "clock" | "xCircle" | "hourglass" | "signpost" | "train" | "rocket"
  | "target" | "starFour" | "flower" | "flowerTulip" | "flowerLotus" | "drop" | "cake"
  | "sun" | "flag" | "medal" | "medalMilitary" | "crosshair" | "crownSimple" | "robot"
  | "heartStraight" | "arrowClockwise" | "chatCircleDots" | "chalkboardTeacher" | "magicWand"
  | "lightbulb" | "confetti" | "bird" | "gift" | "trash" | "smileySad" | "playCircle"
  | "ear" | "musicNote" | "radio" | "wifiHigh" | "pawPrint" | "bug"
  | "butterfly" | "fish" | "dog" | "horse" | "cow" | "coffee" | "rabbit" | "cat"
  | "question" | "warning" | "info" | "genderFemale" | "bed" | "tornado" | "videoCamera"
  | "arrowRight" | "arrowLeft" | "smiley" | "smileyMeh" | "smileyXEyes" | "heartbeat"
  | "starHalf" | "sunDim" | "chatText" | "infinity" | "chartBar" | "sealCheck"
  | "textAa" | "pencilSimple" | "wrench" | "notePencil" | "phoneCall" | "shirtFolded" | "house" | "cloudSun" | "storefront" | "basket" | "camera" | "car" | "student" | "desk";

// ── Exercícios ────────────────────────────────────────────────
export type ExerciseKind =
  | "choice"
  | "fillBlank"
  | "sentenceBuilder"
  | "wordMatch"
  | "translation"
  | "listening"
  | "speedRound";

export interface ChoiceExercise {
  kind: "choice";
  prompt: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface FillBlankExercise {
  kind: "fillBlank";
  prompt: string; // use ___ para a lacuna
  answer: string;
  accept?: string[];
  hint?: string;
  explanation?: string;
}

export interface SentenceBuilderExercise {
  kind: "sentenceBuilder";
  prompt: string; // instrução / tradução alvo
  words: string[]; // palavras embaralhadas (tap em ordem)
  answer: string[]; // ordem correta
  explanation?: string;
}

export interface WordMatchExercise {
  kind: "wordMatch";
  pairs: [string, string][]; // [francês, português]
}

export interface TranslationExercise {
  kind: "translation";
  prompt: string; // frase em PT → traduzir para FR
  answer: string;
  accept?: string[];
  explanation?: string;
}

export interface ListeningExercise {
  kind: "listening";
  prompt: string;
  text: string; // texto falado (TTS)
  options: string[];
  answer: number;
  explanation?: string;
}

export interface SpeedQuestion {
  prompt: string;
  options: string[];
  answer: number;
}

export interface SpeedRoundExercise {
  kind: "speedRound";
  time?: number; // segundos por questão (padrão 10)
  questions: SpeedQuestion[];
}

export type Exercise =
  | ChoiceExercise
  | FillBlankExercise
  | SentenceBuilderExercise
  | WordMatchExercise
  | TranslationExercise
  | ListeningExercise
  | SpeedRoundExercise;

// ── Aulas / Mundos / Boss ─────────────────────────────────────
export interface Lesson {
  id: string;
  worldId: string;
  title: string;
  icon: IconName;
  topic: string; // usado para detectar tópicos fracos ("gender", "verbes", …)
  objective: string;
  theory: string[];
  examples: { fr: string; pt: string }[];
  exercises: Exercise[];
  words?: string[]; // ids de palavras a aprender
  xp?: number;
}

export interface Boss {
  id: string;
  worldId: string;
  title: string;
  icon: IconName;
  intro: string;
  exercises: Exercise[];
  xp: number;
}

export interface World {
  id: string;
  order: number;
  title: string;
  icon: IconName;
  cefr: CefrBand;
  description: string;
  color: string; // accent (classe CSS)
  unlockCefr: CefrBand;
  lessons: string[]; // ids de lições
  boss?: Boss;
}

// ── Vocabulário ───────────────────────────────────────────────
export interface WordEntry {
  id: string;
  fr: string;
  pt: string;
  gender?: "m" | "f";
  cls?: string; // classe gramatical
  exampleFr?: string;
  examplePt?: string;
  diff: 1 | 2 | 3 | 4 | 5;
}

// ── Repetição espaçada ────────────────────────────────────────
export interface ReviewItem {
  wordId: string;
  difficulty: number; // 0..5
  reps: number;
  ease: number; // SM-2 ease factor (2.5 base)
  interval: number; // dias
  next: number; // timestamp
  last: number;
  lapses: number;
}

// ── Gamificação ───────────────────────────────────────────────
export interface DailyMission {
  id: string;
  date: string; // yyyy-mm-dd
  label: string;
  icon: IconName;
  metric: string;
  target: number;
  progress: number;
  done: boolean;
  xp: number;
  stars: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  at: number;
}

export interface Settings {
  theme: string;
  /** Roupinha da Lulu (id de COSTUMES — afeta a boina e a echarpe). */
  costume: string;
  fontScale: number; // 0.9 | 1 | 1.1 | 1.2
  animations: boolean;
  sound: boolean;
  /** Música de fundo (por mundo + trilha tensa no boss). */
  music: boolean;
  tts: boolean;
  aiProvider: "mock" | "ollama" | "proxy";
  aiBaseUrl: string;
  aiModel: string;
  aiKey: string; // guardada só no navegador do usuário
}

export interface MistakeEntry {
  lessonId: string;
  topic: string;
  at: number;
}

export interface DiagnosticResult {
  band: CefrBand;
  correct: number;
  total: number;
  history: number[]; // bandas visitadas
}

/** Resultado de uma conversa simulada (Modo Conversa / revisão). */
export interface ConversationLog {
  scenarioId: string;
  at: number;
  natural: number;
  gram: number;
  vocab: number;
  flu: number;
}

export interface StudentState {
  version: number;
  name: string;
  avatar: string;
  /** Foto de perfil (dataURL) — vazia = sem foto (usa o avatar). */
  photo: string;
  /** Conta local: email para recuperação ("" = sem conta cadastrada). */
  email: string;
  /** Hash da senha (nunca guardamos a senha em claro). */
  passwordHash: string;
  onboarded: boolean;
  diagnosticDone: boolean;
  startedAt: number;
  xp: number;
  stars: number;
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  cefr: CefrBand;
  worldsUnlocked: string[];
  worldsCleared: string[];
  lessonsCompleted: string[];
  perfectLessons: string[];
  bossesDefeated: string[];
  wordsLearned: string[];
  reviewQueue: ReviewItem[];
  exercisesCorrect: number;
  exercisesTotal: number;
  achievements: string[];
  dailyMissions: DailyMission[];
  lastDailyDate: string;
  /** Progresso diário por métrica (chave: yyyy-mm-dd → métrica → contador) */
  dailyProgress: Record<string, Record<string, number>>;
  mistakes: MistakeEntry[];
  aiMessages: ChatMessage[];
  conversationLogs: ConversationLog[];
  diagnostic: DiagnosticResult | null;
  timeStudied: number; // segundos
  settings: Settings;
  boughtThemes: string[];
  /** Roupinhas da Lulu compradas na Loja. */
  boughtCostumes: string[];
  notificationsSeen: Record<string, number>;
  /** Sessão: último dia em que o usuário fez login (yyyy-mm-dd) — controla a tela de boas-vindas. */
  lastLoginDate: string;
  /** Rota onde o usuário parou — para continuar de onde parou ao reabrir. */
  lastRoute: string;
  /** Se o modal de "atalho na tela inicial" (PWA) já foi visto/respondido. */
  installPromptSeen: boolean;
}
