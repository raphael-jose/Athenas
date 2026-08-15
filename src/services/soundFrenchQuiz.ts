// ══════════════════════════════════════════════════════════════
// Athenas — Quiz "Ça sonne français ?"
// Seleção determinística de questões, correção e níveis de
// naturalidade. Motor puro e testável.
// ══════════════════════════════════════════════════════════════
import { SOUND_FRENCH_QUESTIONS, type SoundFrenchQuestion } from "@/data/soundFrench";
import type { IconName } from "@/types";

/** Sorteia `count` questões com PRNG determinístico (mulberry32). */
export function soundFrenchQuiz(count = 8, seed = 42): SoundFrenchQuestion[] {
  return shuffle(SOUND_FRENCH_QUESTIONS, seed).slice(0, Math.min(count, SOUND_FRENCH_QUESTIONS.length));
}

/** A escolha do aluno acerta a versão natural? */
export function isSoundFrenchCorrect(q: SoundFrenchQuestion, choice: number): boolean {
  return choice === q.answer;
}

export interface SoundFrenchScore {
  correct: number;
  total: number;
  pct: number;
}

export function soundFrenchScore(results: boolean[]): SoundFrenchScore {
  const correct = results.filter(Boolean).length;
  const total = results.length;
  return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0 };
}

export interface SoundFrenchTier {
  title: string;
  icon: IconName;
  desc: string;
}

export function soundFrenchTier(pct: number): SoundFrenchTier {
  if (pct >= 90) return { title: "Tu sonnes français !", icon: "sparkle", desc: "A Lulu ouviria você na rua sem estranhar. Impressionant !" };
  if (pct >= 60) return { title: "Bon réflexe !", icon: "maskHappy", desc: "Você já pega o jeito natural — só faltam alguns detalhes." };
  return { title: "Presque…", icon: "smileyMeh", desc: "Seu francês é correto, mas ainda soa de livro. Revise as explicações e tente de novo." };
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
