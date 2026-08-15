import { describe, expect, it } from "vitest";
import { SOUND_FRENCH_QUESTIONS } from "@/data/soundFrench";
import {
  isSoundFrenchCorrect,
  soundFrenchQuiz,
  soundFrenchScore,
  soundFrenchTier
} from "./soundFrenchQuiz";

describe("Quiz Ça sonne français", () => {
  it("banco tem 10 pares válidos (4 opções, resposta dentro do range, única natural)", () => {
    expect(SOUND_FRENCH_QUESTIONS).toHaveLength(10);
    const ids = new Set(SOUND_FRENCH_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(SOUND_FRENCH_QUESTIONS.length);
    for (const q of SOUND_FRENCH_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(q.why.length).toBeGreaterThan(10);
      // a resposta natural nunca é igual à frase do aluno
      expect(q.options[q.answer]).not.toBe(q.learner);
    }
  });

  it("seleção é determinística e respeita o tamanho pedido", () => {
    const a = soundFrenchQuiz(8, 7);
    const b = soundFrenchQuiz(8, 7);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(a).toHaveLength(8);
    // seeds diferentes dão ordens diferentes (na prática)
    const c = soundFrenchQuiz(8, 99);
    expect(a.map((q) => q.id)).not.toEqual(c.map((q) => q.id));
  });

  it("correção acerta só a opção natural", () => {
    const q = SOUND_FRENCH_QUESTIONS[0];
    for (let i = 0; i < 4; i++) {
      expect(isSoundFrenchCorrect(q, i)).toBe(i === q.answer);
    }
  });

  it("soundFrenchScore calcula percentual arredondado", () => {
    expect(soundFrenchScore([true, true, true, true])).toEqual({ correct: 4, total: 4, pct: 100 });
    expect(soundFrenchScore([true, false, true, false])).toEqual({ correct: 2, total: 4, pct: 50 });
    expect(soundFrenchScore([true])).toEqual({ correct: 1, total: 1, pct: 100 });
    expect(soundFrenchScore([]).pct).toBe(0);
  });

  it("tiers de naturalidade: 90+, 60-89 e abaixo de 60", () => {
    expect(soundFrenchTier(100).title).toContain("sonnes");
    expect(soundFrenchTier(90).title).toContain("sonnes");
    expect(soundFrenchTier(89).title).toContain("réflexe");
    expect(soundFrenchTier(60).title).toContain("réflexe");
    expect(soundFrenchTier(59).title).toBe("Presque…");
    expect(soundFrenchTier(0).title).toBe("Presque…");
  });

  it("todas as questões do quiz têm explicação de porquê", () => {
    for (const q of soundFrenchQuiz(10)) {
      expect(q.why.length).toBeGreaterThan(20);
    }
  });
});
