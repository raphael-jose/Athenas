// ══════════════════════════════════════════════════════════════
// Athenas — Constantes globais
// ══════════════════════════════════════════════════════════════
import type { CefrBand, IconName } from "@/types";

// v2: reset geral — todos os usuários começam do zero nesta versão.
// O progresso antigo (athenas:state:v1) fica para trás de propósito.
export const STORAGE_KEY = "athenas:state:v2";
export const APP_VERSION = 2;

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
// Ollama Cloud: o endpoint OpenAI-compatível vive em https://ollama.com
// (NÃO em /api — esse prefixo é a API nativa). E o navegador não pode
// chamar o ollama.com direto (sem CORS): o caminho online real é o proxy
// (Cloudflare Worker), que fala com a nuvem pelo servidor.
export const AI_DEFAULTS = {
  baseUrl: "https://ollama.com",
  model: "gpt-oss:20b"
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
  { id: "nuit", name: "Nuit Douce", icon: "moon", price: 200, desc: "Noite lilás escura para os noturnos." },
  { id: "spidey", name: "Homem-Aranha", icon: "maskHappy", price: 220, desc: "Vermelho e azul na teia do Homem-Aranha." },
  { id: "ironman", name: "Homem de Ferro", icon: "robot", price: 240, desc: "Dourado e vermelho do Homem de Ferro." },
  { id: "captain", name: "Capitão América", icon: "shield", price: 230, desc: "Azul, vermelho e a estrela do Capitão." },
  { id: "thor", name: "Thor", icon: "lightning", price: 250, desc: "O trovão e o dourado de Asgard." },
  { id: "hulk", name: "Hulk", icon: "pawPrint", price: 240, desc: "O verde da força do Hulk." },
  { id: "widow", name: "Viúva Negra", icon: "hourglass", price: 260, desc: "Preto e vermelho da Viúva Negra." }
];

export const AVATARS: IconName[] = ["rabbit", "cat", "dog", "horse", "cow", "butterfly", "fish", "bird", "bug", "flower", "starFour", "heart", "coffee", "book", "moon", "sun", "sparkle"];

// ── Roupinhas da Lulu (loja) ──────────────────────────────────
export interface CostumeDef {
  id: string;
  name: string;
  icon: IconName;
  price: number;
  desc: string;
}

export const COSTUMES: CostumeDef[] = [
  { id: "classic", name: "Rosé Classique", icon: "flower", price: 0, desc: "A boina vermelha e a echarpe rosa de sempre." },
  { id: "lavande", name: "Mystère Lavande", icon: "flowerLotus", price: 90, desc: "Boina lilás e echarpe de lavanda da Provence." },
  { id: "bleuet", name: "Bleuet Étoilé", icon: "drop", price: 110, desc: "Azul céu com estrelinhas — perfeita pra sonhar." },
  { id: "chocolat", name: "Chocolat Fondant", icon: "cake", price: 130, desc: "Tons quentinhos de chocolate francês." },
  { id: "emeraude", name: "Émeraude Parisienne", icon: "sparkle", price: 160, desc: "Verde esmeralda elegante, estilo museu." },
  { id: "spidey", name: "Teia do Aranha", icon: "maskHappy", price: 170, desc: "Cosplay do Aranha: máscara vermelha com teias e olhos grandes — de boina!" },
  { id: "ironman", name: "Arc Reator", icon: "robot", price: 190, desc: "Cosplay do Homem de Ferro: capacete com olhos brilhantes e a boina por cima." },
  { id: "captain", name: "Escudo Estrela", icon: "shield", price: 180, desc: "Cosplay do Capitão: faixa azul com 'A', asinhas e estrela — de boina!" },
  { id: "thor", name: "Mjolnir", icon: "lightning", price: 200, desc: "Cosplay do Thor: faixa prateada com asas e o martelo Mjolnir pendurado." },
  { id: "hulk", name: "Fúria Gamma", icon: "pawPrint", price: 190, desc: "Cosplay do Hulk: a Lulu fica verde com raio gamma na bochecha e cabelo espetado." },
  { id: "widow", name: "Ampulheta", icon: "hourglass", price: 210, desc: "Cosplay da Viúva: cabelo ruivo, faixa preta na testa e ampulheta de broche." }
];

// ── Molduras do avatar (loja) ─────────────────────────────────
export interface FrameDef {
  id: string;
  name: string;
  icon: IconName;
  price: number;
  desc: string;
}

export const FRAMES: FrameDef[] = [
  { id: "simples", name: "Anel Rosé", icon: "heartStraight", price: 0, desc: "O anel delicado de sempre." },
  { id: "ouro", name: "Étoile d'Or", icon: "starFour", price: 120, desc: "Dourado brilhante para você brilhar." },
  { id: "galaxia", name: "Galaxie", icon: "moon", price: 140, desc: "Noite estrelada com estrelinhas." },
  { id: "flor", name: "Jardin de Provence", icon: "flowerTulip", price: 130, desc: "Flores delicadas para emoldurar o sorriso." },
  { id: "arcoiris", name: "Arc-en-ciel", icon: "sparkle", price: 150, desc: "Um arco-íris inteiro para você." },
  { id: "coracao", name: "Cœur", icon: "heart", price: 160, desc: "Corações de carinho ao redor." },
  { id: "spidey", name: "Teia do Aranha", icon: "maskHappy", price: 170, desc: "Anel vermelho com teias de aranha." },
  { id: "ironman", name: "Arc Reator", icon: "robot", price: 190, desc: "Anel dourado com o reator brilhando." },
  { id: "captain", name: "Escudo", icon: "shield", price: 180, desc: "Anel azul com a estrela do escudo." },
  { id: "thor", name: "Trovão", icon: "lightning", price: 200, desc: "Anel prateado com raios de trovão." },
  { id: "hulk", name: "Gamma", icon: "pawPrint", price: 190, desc: "Anel verde de pura força." },
  { id: "widow", name: "Viúva", icon: "hourglass", price: 210, desc: "Anel escuro com detalhes vermelhos." }
];

// ── Efeitos de confete (loja) ─────────────────────────────────
export interface ConfettiDef {
  id: string;
  name: string;
  icon: IconName;
  price: number;
  desc: string;
  colors: string[];
}

export const CONFETTIS: ConfettiDef[] = [
  { id: "classico", name: "Confete Clássico", icon: "sparkle", price: 0, desc: "O mix rosé-lilás de sempre.", colors: ["#f28bb4", "#b9a5f0", "#f5c96b", "#8fd3c0", "#8fc3f0", "#ffffff"] },
  { id: "ouro", name: "Pluie d'Or", icon: "starFour", price: 90, desc: "Chuva de ouro para comemorar em grande.", colors: ["#ffe28a", "#f5c96b", "#fff3c0", "#e9b44c", "#ffffff"] },
  { id: "arcoiris", name: "Arc-en-ciel", icon: "maskHappy", price: 110, desc: "Todas as cores do arco-íris de uma vez.", colors: ["#f5484d", "#f5a623", "#f5c96b", "#6fbf73", "#4a90d9", "#8b5fc9"] },
  { id: "festa", name: "Fête", icon: "confetti", price: 120, desc: "Cores de festa francesa.", colors: ["#ff6b9d", "#5fc9e8", "#c9a3ff", "#7ed6ab", "#ffd166", "#ffffff"] },
  { id: "coracoes", name: "Cœurs", icon: "heart", price: 140, desc: "Confete de corações apaixonados.", colors: ["#e5484d", "#ff8fa3", "#ffb3c8", "#ffd3de", "#ffffff"] }
];

export const STICKERS = ["🌹", "🥐", "🗼", "❤️", "✨", "😘", "🍷", "🐌"];

// ── Área administrativa secreta ───────────────────────────────
// PIN do criador (toque 7× na versão no "Sobre" → digite o PIN).
// Troque por um de sua preferência — o mesmo PIN valida os códigos
// de presente, então não esqueça de trocar em todos os lugares.
export const ADMIN_PIN = "1202";

// ── Contatos (Sobre + Feedback) ───────────────────────────────
export const CONTACTS = {
  email: "raphaeltaylor60@gmail.com",
  whatsapp: "5521998097932" // só números, com DDI (55) e DDD
} as const;

export const APP_TAGLINE =
  "Athenas é sua escola de francês de bolso: aulas, pronúncia, Lulu (sua professora IA), revisão inteligente e muito carinho.";

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
