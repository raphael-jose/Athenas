// ══════════════════════════════════════════════════════════════
// Athenas — Repetição espaçada (estilo SM-2, simplificado)
// Cada palavra tem dificuldade, acertos/erros, última/próxima revisão.
// ══════════════════════════════════════════════════════════════
import { clamp } from "@/lib/utils";
import type { ReviewItem } from "@/types";

export const DAY = 24 * 60 * 60 * 1000;

export function newReviewItem(wordId: string, difficulty = 3): ReviewItem {
  return {
    wordId,
    difficulty,
    reps: 0,
    ease: 2.5,
    interval: 0,
    next: Date.now(), // revisão inicial: já disponível
    last: Date.now(),
    lapses: 0
  };
}

/**
 * quality: 0-1 = esqueceu, 2-3 = difícil, 4-5 = fácil.
 * Retorna o item atualizado (SM-2).
 */
export function scheduleReview(item: ReviewItem, quality: number): ReviewItem {
  const q = clamp(Math.round(quality), 0, 5);
  const next: ReviewItem = { ...item };
  next.last = Date.now();
  next.reps += 1;

  if (q < 3) {
    // Esqueceu: recomeça a sequência, marca como lapse.
    next.lapses += 1;
    next.reps = 0;
    next.interval = 1;
    next.ease = Math.max(1.3, next.ease - 0.2);
    next.next = Date.now() + 10 * 60 * 1000; // revisa em 10 minutos (não assusta)
    next.difficulty = clamp(next.difficulty + 1, 0, 5);
    return next;
  }

  // Acertou
  if (next.reps === 1) next.interval = q >= 4 ? 2 : 1;
  else if (next.reps === 2) next.interval = q >= 4 ? 4 : 2;
  else next.interval = Math.round(next.interval * next.ease);

  if (q >= 4) next.ease = Math.min(3.0, next.ease + 0.1);
  else next.ease = Math.max(1.3, next.ease - 0.05);

  next.next = Date.now() + next.interval * DAY;
  next.difficulty = clamp(next.difficulty - (q >= 4 ? 1 : 0), 0, 5);
  return next;
}

export function dueItems(queue: ReviewItem[], now = Date.now()): ReviewItem[] {
  return queue.filter((i) => i.next <= now).sort((a, b) => a.next - b.next);
}

export function nextReviewCount(queue: ReviewItem[], now = Date.now()): number {
  return queue.filter((i) => i.next <= now).length;
}

export function masteryLevel(item: ReviewItem): "nova" | "aprendida" | "dominada" {
  if (item.reps === 0) return "nova";
  if (item.reps < 3 || item.interval < 7) return "aprendida";
  return "dominada";
}
