// ══════════════════════════════════════════════════════════════
// Athenas — Missões diárias (3 sorteadas por dia, de forma estável)
// ══════════════════════════════════════════════════════════════
import type { IconName } from "@/types";

export interface MissionDef {
  id: string;
  icon: IconName;
  label: string;
  metric: "lesson" | "review" | "ai" | "correct" | "words" | "xp";
  target: number;
  xp: number;
  stars: number;
}

export const MISSION_POOL: MissionDef[] = [
  { id: "m-words-5", icon: "target", label: "Aprenda 5 palavras novas", metric: "words", target: 5, xp: 30, stars: 8 },
  { id: "m-lesson-1", icon: "book", label: "Complete uma aula", metric: "lesson", target: 1, xp: 30, stars: 8 },
  { id: "m-review-10", icon: "brain", label: "Revise 10 palavras", metric: "review", target: 10, xp: 30, stars: 8 },
  { id: "m-ai-3", icon: "chat", label: "Converse 3 vezes com a Lulu", metric: "ai", target: 3, xp: 30, stars: 8 },
  { id: "m-correct-10", icon: "checkCircle", label: "Acerte 10 exercícios", metric: "correct", target: 10, xp: 30, stars: 8 },
  { id: "m-xp-50", icon: "starFour", label: "Ganhe 50 XP", metric: "xp", target: 50, xp: 30, stars: 8 },
  { id: "m-words-3", icon: "flower", label: "Aprenda uma expressão francesa", metric: "words", target: 3, xp: 25, stars: 6 }
];

export function missionsForDate(date: string): MissionDef[] {
  // Sorteio estável por dia: 3 missões diferentes.
  const dayNum = date.split("-").map(Number).reduce((a, b) => a * 31 + b, 7);
  const picked: MissionDef[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = (dayNum + i * 3) % MISSION_POOL.length;
    const m = MISSION_POOL[idx];
    if (!picked.some((p) => p.id === m.id)) picked.push(m);
  }
  return picked;
}
