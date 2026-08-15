// ══════════════════════════════════════════════════════════════
// Athenas — Grammar Duel: motor puro do duelo de gramática
// O aluno enfrenta a Lulu em rounds rápidos. As perguntas vêm dos
// tópicos de gramática liberados para o CEFR do aluno.
// ══════════════════════════════════════════════════════════════
import { GRAMMAR_PRACTICE } from "@/data/grammarPractice";
import { GRAMMAR_TREE } from "@/data/grammar";
import type { ChoiceExercise, FillBlankExercise } from "@/types";

/** CEFR mínimo (0=A0 … 7=Natif) para cada nó da árvore de gramática. */
export const NODE_CEFR: Record<string, number> = {
  "g-pronoms": 0,
  "g-articles": 0,
  "g-genre": 1,
  "g-etre": 0,
  "g-avoir": 0,
  "g-present": 1,
  "g-negation": 1,
  "g-passe-compose": 2,
  "g-imparfait": 3,
  "g-futur": 1,
  "g-conditionnel": 3,
  "g-subjonctif": 4,
  "g-plus-que-parfait": 4,
  "g-hypotheses": 5,
  "g-subjonctif-passe": 5,
  "g-concordance": 5,
  "g-nuances": 6
};

export type DuelExercise = ChoiceExercise | FillBlankExercise;

export interface DuelQuestion {
  exercise: DuelExercise;
  nodeId: string;
  nodeTitle: string;
  timeMax: number; // segundos
}

export interface DuelState {
  round: number; // 0-based
  totalRounds: number;
  luluHp: number;
  lives: number;
  score: number;
  correctCount: number;
}

export interface RoundOutcome {
  state: DuelState;
  correct: boolean;
  points: number;
  damage: number;
  result: "continue" | "win" | "lose";
}

export const DUEL_CONFIG = {
  totalRounds: 10,
  luluHpMax: 100,
  livesMax: 3,
  timeMax: 15,
  baseDamage: 10,
  speedBonusMax: 5
} as const;

// ── Seleção de perguntas ──────────────────────────────────────
export function duelQuestions(cefr: number, count: number = DUEL_CONFIG.totalRounds, seed = 42): DuelQuestion[] {
  // Perguntas rápidas (choice / fillBlank) dos nós liberados para o CEFR
  const pool: { ex: DuelExercise; nodeId: string; nodeTitle: string }[] = [];
  for (const node of GRAMMAR_TREE) {
    const minCefr = NODE_CEFR[node.id] ?? 0;
    if (minCefr > cefr) continue;
    for (const ex of GRAMMAR_PRACTICE[node.id] ?? []) {
      if (ex.kind === "choice" || ex.kind === "fillBlank") {
        pool.push({ ex, nodeId: node.id, nodeTitle: node.title });
      }
    }
  }
  if (pool.length === 0) return [];

  // Amostragem estratificada: garante perguntas da FAIXA atual do aluno
  // (ex.: C1 sempre vê hipóteses, subjonctif passé e concordância).
  const bandPool = pool.filter((p) => NODE_CEFR[p.nodeId] === cefr);
  const advanced = shuffle(bandPool, seed ^ 0x9e3779b9).slice(0, Math.min(3, Math.max(1, Math.floor(count / 3)), bandPool.length));
  const rest = shuffle(pool.filter((p) => !advanced.includes(p)), seed);
  const picked = [...advanced, ...rest].slice(0, count);
  return shuffle(picked, seed ^ 0x85ebca6b).map((p) => ({
    exercise: p.ex,
    nodeId: p.nodeId,
    nodeTitle: p.nodeTitle,
    timeMax: DUEL_CONFIG.timeMax
  }));
}

/** Embaralha com PRNG determinístico (mulberry32). */
function shuffle<T>(arr: T[], seed: number): T[] {
  let s = seed >>> 0;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Pontuação ─────────────────────────────────────────────────
/** Pontos por acerto: 10 base + até 5 de bônus por rapidez. */
export function roundScore(correct: boolean, timeLeftSec: number, timeMaxSec: number): number {
  if (!correct) return 0;
  const ratio = Math.max(0, Math.min(1, timeLeftSec / Math.max(1, timeMaxSec)));
  return DUEL_CONFIG.baseDamage + Math.round(ratio * DUEL_CONFIG.speedBonusMax);
}

/** Dano na Lulu = pontos do round. */
export function resolveRound(prev: DuelState, correct: boolean, timeLeftSec: number, timeMaxSec: number): RoundOutcome {
  const points = roundScore(correct, timeLeftSec, timeMaxSec);
  const nextRound = prev.round + 1;
  const next: DuelState = {
    round: nextRound,
    totalRounds: prev.totalRounds,
    luluHp: correct ? Math.max(0, prev.luluHp - points) : prev.luluHp,
    lives: correct ? prev.lives : prev.lives - 1,
    score: prev.score + points,
    correctCount: prev.correctCount + (correct ? 1 : 0)
  };
  let result: RoundOutcome["result"] = "continue";
  if (next.luluHp <= 0) result = "win";
  else if (next.lives <= 0 || nextRound >= next.totalRounds) result = next.score > 0 && next.lives > 0 ? "win" : "lose";
  return { state: next, correct, points, damage: points, result };
}

/** Vence se derrubou a Lulu OU terminou os rounds com pontos e vida. */
export function isVictory(state: DuelState): boolean {
  return state.luluHp <= 0 || (state.round >= state.totalRounds && state.lives > 0 && state.score > 0);
}

// ── Falas da Lulu ─────────────────────────────────────────────
export function luluTaunt(kind: "fast" | "slow" | "wrong" | "timeout" | "danger" | "low" | "win" | "lose" | "intro"): string {
  const LINES: Record<string, string[]> = {
    intro: [
      "Prête ? Je connais ma grammaire sur le bout des doigts… mais je te laisse une chance !",
      "Un duel de grammaire ? Mignonne, mais attention, je suis rapide !"
    ],
    fast: [
      "Wahou, trop rapide ! J'en ai le vertige !",
      "Bien joué ! Cette fois, c'est à moi de trembler…",
      "Incroyable ! Où as-tu appris ça ?"
    ],
    slow: [
      "Pas mal… mais j'aurais répondu avant toi !",
      "Correct, mais le chrono fond comme un sorbet au soleil !"
    ],
    wrong: [
      "Presque ! Ne te décourage pas, la grammaire s'apprivoise.",
      "Oups… je connaissais celle-là. Retente ta chance !",
      "C'est en se trompant qu'on apprend, tu sais !"
    ],
    timeout: [
      "Le temps file ! Cette fois, c'est moi qui marque !",
      "Trop de réflexion… la grammaire aime les réponses vives !"
    ],
    danger: [
      "Tu me fais vraiment peur… mes circuits chauffent !",
      "Je ne tiens plus qu'à un fil… mais je me bats !"
    ],
    low: [
      "Allez, encore un effort, tu y es presque !",
      "C'est la dernière ligne droite, ne lâche rien !"
    ],
    win: [
      "Je m'incline. Tu es plus forte que moi, chapeau !",
      "Victoire ! Mes circuits sont en pâmoison. Bravo !"
    ],
    lose: [
      "Ne t'inquiète pas, on retente ! La grammaire se gagne avec le cœur.",
      "Cette fois c'est moi ! Mais demain, je te sens dangereuse…"
    ]
  };
  const arr = LINES[kind];
  return arr[Math.floor(Math.random() * arr.length)];
}

export function tauntFor(correct: boolean, timedOut: boolean, points: number, luluHp: number, round: number, total: number): string {
  if (timedOut) return luluTaunt("timeout");
  if (!correct) return luluTaunt("wrong");
  if (luluHp <= 30) return luluTaunt("danger");
  if (round >= total - 1) return luluTaunt("low");
  return points >= DUEL_CONFIG.baseDamage + 3 ? luluTaunt("fast") : luluTaunt("slow");
}
