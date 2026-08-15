// ══════════════════════════════════════════════════════════════
// Athenas — Gamificação pura: XP, níveis, streak, conquistas
// ══════════════════════════════════════════════════════════════
import { LEVEL_NAMES } from "@/lib/constants";
import type { IconName, StudentState } from "@/types";

// ── XP / Nível ────────────────────────────────────────────────
export function xpForLevel(n: number): number {
  return Math.round(120 * Math.pow(n, 1.32));
}

export function cumulativeXp(level: number): number {
  let sum = 0;
  for (let i = 1; i < level; i++) sum += xpForLevel(i);
  return sum;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let cum = 0;
  while (level < 150 && cum + xpForLevel(level) <= xp) {
    cum += xpForLevel(level);
    level++;
  }
  return level;
}

export function levelProgress(xp: number): { level: number; into: number; needed: number; pct: number } {
  const level = levelFromXp(xp);
  const start = cumulativeXp(level);
  const needed = xpForLevel(level);
  const into = xp - start;
  return { level, into, needed, pct: Math.min(100, Math.round((into / needed) * 100)) };
}

export function levelName(level: number): string {
  return LEVEL_NAMES[level] ?? `Niveau ${level}`;
}

// ── Streak ────────────────────────────────────────────────────
export function updateStreak(state: Pick<StudentState, "streak" | "bestStreak" | "lastActiveDay">, today: string): {
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  reset: boolean;
} {
  if (state.lastActiveDay === today) return { ...state, reset: false };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
    yesterday.getDate()
  ).padStart(2, "0")}`;
  if (state.lastActiveDay === yKey) {
    const streak = state.streak + 1;
    return { streak, bestStreak: Math.max(state.bestStreak, streak), lastActiveDay: today, reset: false };
  }
  // Perdeu a sequência — acolhedor, sem drama.
  return { streak: 1, bestStreak: state.bestStreak, lastActiveDay: today, reset: state.streak > 0 };
}

// ── Conquistas ────────────────────────────────────────────────
export interface AchievementDef {
  id: string;
  icon: IconName;
  title: string;
  desc: string;
  check: (s: StudentState) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "premiere-parole", icon: "chat", title: "Première Parole", desc: "Complete a sua primeira aula.", check: (s) => s.lessonsCompleted.length >= 1 },
  { id: "perfect", icon: "starFour", title: "Sans Erreur", desc: "Complete uma aula com 100% de acerto.", check: (s) => s.perfectLessons.length >= 1 },
  { id: "mots-10", icon: "hash", title: "10 Mots", desc: "Aprenda 10 palavras.", check: (s) => s.wordsLearned.length >= 10 },
  { id: "mots-50", icon: "heart", title: "50 Mots", desc: "Aprenda 50 palavras.", check: (s) => s.wordsLearned.length >= 50 },
  { id: "mots-100", icon: "books", title: "100 Mots", desc: "Aprenda 100 palavras.", check: (s) => s.wordsLearned.length >= 100 },
  { id: "mots-500", icon: "flag", title: "500 Mots", desc: "Aprenda 500 palavras.", check: (s) => s.wordsLearned.length >= 500 },
  { id: "streak-7", icon: "flame", title: "7 Jours", desc: "Estude 7 dias seguidos.", check: (s) => s.streak >= 7 },
  { id: "streak-30", icon: "sun", title: "30 Jours", desc: "Estude 30 dias seguidos.", check: (s) => s.streak >= 30 },
  { id: "streak-100", icon: "crown", title: "100 Jours", desc: "Estude 100 dias seguidos.", check: (s) => s.streak >= 100 },
  { id: "niveau-5", icon: "compass", title: "Explorateur", desc: "Alcance o nível 5.", check: (s) => levelFromXp(s.xp) >= 5 },
  { id: "niveau-10", icon: "airplane", title: "Voyageur", desc: "Alcance o nível 10.", check: (s) => levelFromXp(s.xp) >= 10 },
  { id: "niveau-25", icon: "medalMilitary", title: "Parleur", desc: "Alcance o nível 25.", check: (s) => levelFromXp(s.xp) >= 25 },
  { id: "niveau-50", icon: "medal", title: "Maître", desc: "Alcance o nível 50.", check: (s) => levelFromXp(s.xp) >= 50 },
  { id: "boss-1", icon: "sword", title: "Premier Boss", desc: "Derrote o seu primeiro boss.", check: (s) => s.bossesDefeated.length >= 1 },
  { id: "boss-3", icon: "crosshair", title: "Chasseuse de Boss", desc: "Derrote 3 bosses.", check: (s) => s.bossesDefeated.length >= 3 },
  { id: "cefr-a1", icon: "flower", title: "A1", desc: "Chegue ao nível A1.", check: (s) => s.cefr >= 1 },
  { id: "cefr-a2", icon: "flowerTulip", title: "A2", desc: "Chegue ao nível A2.", check: (s) => s.cefr >= 2 },
  { id: "cefr-b1", icon: "flowerLotus", title: "B1", desc: "Chegue ao nível B1.", check: (s) => s.cefr >= 3 },
  { id: "cefr-b2", icon: "sealCheck", title: "B2", desc: "Chegue ao nível B2.", check: (s) => s.cefr >= 4 },
  { id: "cefr-c1", icon: "graduationCap", title: "C1", desc: "Chegue ao nível C1.", check: (s) => s.cefr >= 5 },
  { id: "cefr-c2", icon: "trophy", title: "C2", desc: "Chegue ao nível C2.", check: (s) => s.cefr >= 6 },
  { id: "native", icon: "moon", title: "Native", desc: "Chegue ao Modo Nativo.", check: (s) => s.cefr >= 7 },
  { id: "dieu", icon: "crownSimple", title: "Mode Dieu", desc: "Desbloqueie o Modo Deus Supremo.", check: (s) => s.worldsUnlocked.length >= 14 },
  { id: "ai-chat", icon: "robot", title: "Premier Dialogue", desc: "Converse com a Lulu pela primeira vez.", check: (s) => s.aiMessages.filter((m) => m.role === "assistant").length >= 1 },
  { id: "ai-10", icon: "heartStraight", title: "10 Dialogues", desc: "Converse 10 vezes com a Lulu.", check: (s) => s.aiMessages.filter((m) => m.role === "assistant").length >= 10 },
  { id: "review-20", icon: "brain", title: "Mémoire d'Éléphant", desc: "Revise 20 palavras.", check: (s) => s.reviewQueue.filter((r) => r.reps > 0).length >= 20 },
  { id: "stars-100", icon: "star", title: "100 Étoiles", desc: "Acumule 100 étoiles.", check: (s) => s.stars >= 100 },
  { id: "exercices-100", icon: "target", title: "100 Exercices", desc: "Responda 100 exercícios.", check: (s) => s.exercisesTotal >= 100 },
  { id: "diagnostic", icon: "search", title: "Diagnostiquée", desc: "Complete o diagnóstico adaptativo.", check: (s) => s.diagnosticDone }
];

export function newlyUnlocked(state: StudentState): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && a.check(state));
}
