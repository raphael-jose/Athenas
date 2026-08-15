// ══════════════════════════════════════════════════════════════
// Athenas — Constantes globais
// ══════════════════════════════════════════════════════════════
import type { CefrBand, IconName } from "@/types";

export const STORAGE_KEY = "athenas:state:v1";
/** Chave antiga (antes do rebranding) — lida apenas para migrar o progresso. */
export const LEGACY_STORAGE_KEY = "antenas:state:v1";
export const APP_VERSION = 1;

// ── XP ────────────────────────────────────────────────────────
export const XP = {
  LESSON: 20,
  EXERCISE_CORRECT: 10,
  PERFECT_BONUS: 15,
  BOSS: 100,
  REVIEW_CARD: 3,
  REVIEW_COMPLETE: 10,
  AI_MESSAGE: 5,
  DAILY_MISSION: 30,
  STREAK_BONUS: 10
} as const;

export const STARS = {
  LESSON: 10,
  PERFECT_BONUS: 5,
  BOSS: 25,
  REVIEW: 5,
  MISSION: 8
} as const;

// ── CEFR ──────────────────────────────────────────────────────
export const CEFR_LABELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2", "NATIF"] as const;
export const CEFR_BAND_NAMES = [
  "Zero absoluto",
  "Descobridor",
  "Viajante inicial",
  "Conversador",
  "Fluente em formação",
  "Avançado",
  "Quase nativo",
  "Deus Supremo"
] as const;

export const MAX_BAND: CefrBand = 7;

// ── IA ────────────────────────────────────────────────────────
export const AI_DEFAULTS = {
  baseUrl: "https://ollama.com/api",
  model: "qwen3:8b"
} as const;

// ATENÇÃO: NÃO existe VITE_OLLAMA_API_KEY de propósito. Toda variável
// VITE_* é embutida no bundle e fica visível no JavaScript público
// (GitHub Pages). A chave real só vive no localStorage do navegador do
// usuário (Configurações → IA) ou atrás de um proxy serverless.
export const AI_ENV = {
  provider: (import.meta.env.VITE_AI_PROVIDER as string) || "mock",
  baseUrl: (import.meta.env.VITE_OLLAMA_BASE_URL as string) || AI_DEFAULTS.baseUrl,
  model: (import.meta.env.VITE_OLLAMA_MODEL as string) || AI_DEFAULTS.model,
  proxyUrl: (import.meta.env.VITE_AI_PROXY_URL as string) || ""
};

// ── Voz natural (TTS) ─────────────────────────────────────────
// Voz FEMININA natural da Lulu em todo o app. A voz padrão é a Rachel
// (feminina, multilíngue — fala francês e português com naturalidade).
// O usuário pode trocar pelo ID de qualquer voz feminina da conta dele.
export const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
export const ELEVENLABS_MODEL = "eleven_multilingual_v2";
export const ELEVENLABS_DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// ── Níveis ────────────────────────────────────────────────────
export const LEVEL_NAMES: Record<number, string> = {
  1: "Petit Débutant",
  2: "Curieuse Étoile",
  3: "Apprentie Parisienne",
  4: "Apprenti Parisien",
  5: "Explorateur",
  6: "Cœur Léger",
  7: "Rêveuse",
  8: "Rêveur",
  9: "Sourire Enchanté",
  10: "Voyageur",
  12: "Étincelle",
  15: "Cœur Curieux",
  18: "Causette",
  20: "Parleur",
  25: "Charme Francophone",
  30: "Francophile",
  35: "Artiste des Mots",
  40: "Polyglotte",
  45: "Philosophe",
  50: "Maître",
  60: "Écrivain",
  75: "Grand Maître",
  90: "Érudite",
  100: "Dieu du Français"
};

// ── Temas (loja) ──────────────────────────────────────────────
export interface ThemeDef {
  id: string;
  name: string;
  icon: IconName;
  price: number;
  desc: string;
}

export const THEMES: ThemeDef[] = [
  { id: "rose", name: "Rosé Parisien", icon: "flower", price: 0, desc: "O clássico blush pastel." },
  { id: "lavande", name: "Lavande", icon: "flowerLotus", price: 100, desc: "Campos de lavanda da Provence." },
  { id: "bleuet", name: "Bleuet", icon: "drop", price: 120, desc: "Azul bebê como o céu de Paris." },
  { id: "creme", name: "Crème Brûlée", icon: "cake", price: 150, desc: "Creme, dourado suave e aconchego." },
  { id: "nuit", name: "Nuit Douce", icon: "moon", price: 200, desc: "Noite lilás escura para os noturnos." }
];

export const AVATARS: IconName[] = ["rabbit", "cat", "dog", "horse", "cow", "butterfly", "fish", "bird", "bug", "flower", "starFour", "heart", "coffee", "book", "moon", "sun", "sparkle"];

// ── Diversos ──────────────────────────────────────────────────
export const DAILY_XP_GOAL = 50;

export const AI_PERSONA = `Você é a "Lulu", a professora de francês do aplicativo Athenas.
Personalidade: fofa, inteligente, paciente, levemente brincalhona, muito incentivadora.
Regras:
- Responda em português do Brasil, a menos que o aluno peça francês (ou use "conversa").
- Sempre incentive com carinho. Nunca humilhe.
- Se o aluno errar, diga algo como "Quase! A ideia está certa, mas temos um pequeno detalhe..." e explique o porquê.
- Prefira respostas curtas: correção → explicação → exemplo → mini exercício.
- Quando o nível do aluno for avançado (C1+), pode aprofundar bastante (linguística, nuance, registro, subtexto).
- Quando pedirem, explique o que foi dito VERSUS o que um francês realmente entende.`;
