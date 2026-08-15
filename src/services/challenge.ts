// ══════════════════════════════════════════════════════════════
// Athenas — Desafio Relâmpago: perguntas de vocabulário com tempo
// ══════════════════════════════════════════════════════════════
import { WORDS } from "@/data/words";
import { shuffle } from "@/lib/utils";

export interface ChallengeQuestion {
  prompt: string; // palavra em francês
  options: string[]; // traduções
  answer: number; // índice certo
}

export const CHALLENGE_DEFAULTS = {
  questions: 12,
  seconds: 12, // tempo por pergunta
  hearts: 5
} as const;

/** Monta o desafio: N perguntas de tradução (FR → PT) sorteadas. */
export function buildChallenge(count = CHALLENGE_DEFAULTS.questions): ChallengeQuestion[] {
  const pool = shuffle(WORDS.filter((w) => w.fr.length > 0 && w.pt.length > 0));
  const questions: ChallengeQuestion[] = [];
  for (const w of pool.slice(0, count)) {
    const distractors = shuffle(
      pool.filter((o) => o.id !== w.id && o.pt !== w.pt)
    )
      .slice(0, 3)
      .map((o) => o.pt);
    // remove duplicados de tradução entre os distratores
    const uniq: string[] = [];
    for (const d of distractors) if (!uniq.includes(d)) uniq.push(d);
    const options = shuffle([w.pt, ...uniq.slice(0, 3)]);
    questions.push({ prompt: w.fr, options, answer: options.indexOf(w.pt) });
  }
  return questions;
}
