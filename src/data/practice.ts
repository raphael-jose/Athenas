// ══════════════════════════════════════════════════════════════
// Athenas — Gerador de aulas de prática (reforço por mundo)
// Cria aulas de vocabulário, frases e treino misto a partir do
// banco de palavras de cada mundo. Determinístico (seed fixa por
// mundo): o conteúdo nunca muda entre builds e não repete
// perguntas dentro da mesma aula. 100% data-driven.
// ══════════════════════════════════════════════════════════════
import type {
  ChoiceExercise,
  Exercise,
  IconName,
  Lesson,
  WordEntry
} from "@/types";
import { WORDS } from "@/data/words";

// ── Utilidades determinísticas ────────────────────────────────
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Passo de amostragem que garante itens distintos dentro do grupo. */
function coprimeStep(n: number): number {
  for (let s = 5; ; s++) if (gcd(s, n) === 1) return s;
}

function sShuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqStr(list: string[]): string[] {
  return [...new Set(list)];
}

function pickN<T>(pool: T[], n: number, rnd: () => number): T[] {
  return sShuffle(pool, rnd).slice(0, n);
}

function genChoice(prompt: string, correct: string, distractors: string[], rnd: () => number): ChoiceExercise {
  const dist = pickN(uniqStr(distractors.filter((d) => d && d !== correct)), 2, rnd);
  const opts = sShuffle([correct, ...dist], rnd);
  return { kind: "choice", prompt, options: opts, answer: opts.indexOf(correct) };
}

const cleanFill = (s: string): boolean => !/[/(),]/.test(s);

const PRACTICE_ICONS: IconName[] = [
  "book", "sparkle", "target", "starFour", "brain", "lightbulb", "magicWand", "clock"
];

const ROMAN: Array<[number, string]> = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
function roman(n: number): string {
  let out = "";
  let v = n;
  for (const [num, str] of ROMAN) while (v >= num) { out += str; v -= num; }
  return out;
}

// ── Construtores compactos (iguais aos de worlds.ts) ──────────
const match = (pairs: Array<[string, string]>): { kind: "wordMatch"; pairs: Array<[string, string]> } => ({ kind: "wordMatch", pairs });
const build = (prompt: string, words: string[], answer: string[]): { kind: "sentenceBuilder"; prompt: string; words: string[]; answer: string[] } => ({
  kind: "sentenceBuilder", prompt, words, answer
});
const trans = (prompt: string, answer: string): { kind: "translation"; prompt: string; answer: string } => ({
  kind: "translation", prompt, answer
});
const listen = (prompt: string, text: string, options: string[], answer: number): { kind: "listening"; prompt: string; text: string; options: string[]; answer: number } => ({
  kind: "listening", prompt, text, options, answer
});
const fill = (prompt: string, answer: string, extra?: { hint?: string }): { kind: "fillBlank"; prompt: string; answer: string; hint?: string } => ({
  kind: "fillBlank", prompt, answer, ...extra
});

// ── Estrutura comum de aula de prática ────────────────────────
export interface PracticeOpts {
  worldId: string;
  /** rótulo PT do mundo, usado na objective */
  topic: string;
  /** palavras extras além das já usadas pelas aulas do mundo */
  extraWordIds?: string[];
}

export function buildPool(base: Lesson[], extraIds: string[] | undefined): WordEntry[] {
  const ids = new Set<string>();
  for (const l of base) for (const w of l.words ?? []) ids.add(w);
  for (const w of extraIds ?? []) ids.add(w);
  return WORDS.filter((w) => ids.has(w.id));
}

function practiceShape(
  opts: PracticeOpts,
  idN: number,
  title: string,
  topic: string,
  grp: WordEntry[],
  objective: string,
  exercises: Exercise[]
): Lesson {
  return {
    id: `${opts.worldId.replace("world-", "g")}-${idN}`,
    worldId: opts.worldId,
    title,
    icon: PRACTICE_ICONS[idN % PRACTICE_ICONS.length],
    topic,
    objective,
    theory: [
      `"${grp[0].fr}" = ${grp[0].pt}`,
      `"${grp[1].fr}" = ${grp[1].pt}`,
      "Dica: toque no alto-falante para ouvir a pronúncia."
    ],
    examples: grp
      .filter((w) => w.exampleFr && w.examplePt)
      .slice(0, 2)
      .map((w) => ({ fr: w.exampleFr!, pt: w.examplePt! })),
    exercises,
    words: grp.slice(0, 4).map((w) => w.id)
  };
}

// ── Templates de aula ─────────────────────────────────────────
function vocabLesson(opts: PracticeOpts, idN: number, n: number, grp: WordEntry[], pool: WordEntry[], rnd: () => number): Lesson {
  const others = pool.filter((w) => !grp.includes(w));
  const fillable = grp.find((w) => cleanFill(w.pt));
  const exercises: Exercise[] = [
    match(grp.slice(0, 4).map((w) => [w.fr, w.pt])),
    genChoice(`O que significa "${grp[0].fr}"?`, grp[0].pt, others.map((w) => w.pt), rnd),
    genChoice(`Como se diz "${grp[1].pt}" em francês?`, grp[1].fr, others.map((w) => w.fr), rnd),
    ...(fillable
      ? [fill(`Complete a frase: "${fillable.fr}" = ___`, fillable.pt, { hint: `começa com ${fillable.pt[0].toUpperCase()}...` })]
      : []),
    trans(`Como se diz "${grp[2].pt}"?`, grp[2].fr)
  ];
  return practiceShape(
    opts, idN, `Palavras para guardar ${roman(n)}`, "pratica-vocabulario", grp,
    `Praticar ${opts.topic} com exercícios variados de vocabulário.`, exercises
  );
}

function sentenceLesson(opts: PracticeOpts, idN: number, n: number, grp: WordEntry[], rnd: () => number): Lesson {
  const w = grp[0];
  const sent = w.exampleFr!.split(/\s+/);
  const distPt = grp.slice(1).map((x) => x.examplePt!).filter(Boolean);
  const distFr = grp.slice(1).map((x) => x.exampleFr!).filter(Boolean);
  const exercises: Exercise[] = [
    build(`Monte a frase: "${w.examplePt}"`, sent, sent),
    trans(`Como se diz "${w.examplePt}"?`, w.exampleFr!),
    genChoice(`O que significa "${w.exampleFr}"?`, w.examplePt!, distPt, rnd),
    listen(`O que você ouviu?`, w.exampleFr!, [w.exampleFr!, ...pickN(uniqStr(distFr.filter((f) => f !== w.exampleFr)), 2, rnd)], 0),
    match(grp.slice(0, 4).map((x) => [x.fr, x.pt]))
  ];
  return practiceShape(
    opts, idN, `Frases para usar hoje ${roman(n)}`, "pratica-frases", grp,
    `Praticar ${opts.topic} construindo e traduzindo frases.`, exercises
  );
}

function mixedLesson(opts: PracticeOpts, idN: number, n: number, grp: WordEntry[], pool: WordEntry[], rnd: () => number): Lesson {
  const others = pool.filter((w) => !grp.includes(w));
  const fillable = grp.find((w) => cleanFill(w.pt));
  const core = grp.find((w) => w.exampleFr && w.examplePt) ?? grp[0];
  const sf = core.exampleFr;
  const sp = core.examplePt;
  const exercises: Exercise[] = [
    match(grp.slice(0, 4).map((w) => [w.fr, w.pt])),
    genChoice(`O que significa "${grp[1].fr}"?`, grp[1].pt, others.map((w) => w.pt), rnd),
    ...(fillable
      ? [fill(`Complete a frase: "${fillable.fr}" = ___`, fillable.pt, { hint: `começa com ${fillable.pt[0].toUpperCase()}...` })]
      : []),
    ...(sf && sp ? [build(`Monte a frase: "${sp}"`, sf.split(/\s+/), sf.split(/\s+/))] : []),
    trans(`Como se diz "${sp ?? core.pt}"?`, sf ?? core.fr)
  ];
  return practiceShape(
    opts, idN, `Treino completo ${roman(n)}`, "pratica-mista", grp,
    `Praticar ${opts.topic} com um treino misto completo.`, exercises
  );
}

// ── Gerador principal ─────────────────────────────────────────
export function generatePracticeLessons(base: Lesson[], opts: PracticeOpts, count: number): Lesson[] {
  const pool = buildPool(base, opts.extraWordIds);
  const spool = pool.filter((w) => w.exampleFr && w.examplePt);
  const step = coprimeStep(pool.length);
  const worldNum = Number(opts.worldId.split("-")[1] ?? 0);
  const rnd = seededRng(worldNum * 7919 + count * 131 + pool.length * 17);
  const lessons: Lesson[] = [];
  let v = 0;
  let s = 0;
  let m = 0;
  let seq = 0;
  for (let i = 0; i < count; i++) {
    const grp = Array.from({ length: 6 }, (_, k) => pool[(i * step + k) % pool.length]);
    const tpl = i % 3;
    if (tpl === 1 && spool.length >= 4) {
      s++;
      const sStep = coprimeStep(spool.length);
      const sgrp = Array.from({ length: 6 }, (_, k) => spool[(i * sStep + k) % spool.length]);
      lessons.push(sentenceLesson(opts, ++seq, s, sgrp, rnd));
    } else if (tpl === 0) {
      v++;
      lessons.push(vocabLesson(opts, ++seq, v, grp, pool, rnd));
    } else {
      m++;
      lessons.push(mixedLesson(opts, ++seq, m, grp, pool, rnd));
    }
  }
  return lessons;
}
