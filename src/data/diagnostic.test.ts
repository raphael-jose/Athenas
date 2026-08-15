import { describe, expect, it } from "vitest";
import { DIAG_QUESTIONS, DIAG_MAX_QUESTIONS, estimateBand, nextQuestionForBand, SELF_ASSESSMENT } from "./diagnostic";

describe("Diagnóstico adaptativo", () => {
  it("todas as bandas têm perguntas e respostas válidas", () => {
    for (const band of [0, 1, 2, 3, 4, 5, 6]) {
      const qs = DIAG_QUESTIONS.filter((q) => q.band === band);
      expect(qs.length, `banda ${band}`).toBeGreaterThanOrEqual(4);
      for (const q of qs) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });

  it("autodiagnóstico cobre os 5 perfis", () => {
    expect(SELF_ASSESSMENT).toHaveLength(5);
    expect(new Set(SELF_ASSESSMENT.map((s) => s.id)).size).toBe(5);
  });

  it("existe pergunta disponível para qualquer banda inicial", () => {
    for (const s of SELF_ASSESSMENT) {
      expect(nextQuestionForBand(s.startBand, [])).not.toBeNull();
    }
  });

  it("estima banda alta com desempenho alto", () => {
    const history = [5, 5, 6, 6, 6, 6];
    const est = estimateBand(history, 6, 6);
    expect(est).toBeGreaterThanOrEqual(5);
  });

  it("estima banda baixa com desempenho baixo", () => {
    const history = [1, 0, 1, 0, 1, 0];
    const est = estimateBand(history, 1, 6);
    expect(est).toBeLessThanOrEqual(2);
  });

  it("nunca sai do intervalo A0..C2", () => {
    expect(estimateBand([0, 0, 0, 0, 0, 0], 0, 6)).toBeGreaterThanOrEqual(0);
    expect(estimateBand([6, 6, 6, 6, 6, 6], 6, 6)).toBeLessThanOrEqual(6);
    expect(DIAG_MAX_QUESTIONS).toBe(10);
  });
});
