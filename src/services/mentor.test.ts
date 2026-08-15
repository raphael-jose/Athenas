// ══════════════════════════════════════════════════════════════
// Athenas — Testes do Mentor 
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { buildDailyPlan, buildMentorInsights, mentorAdvice, mentorGreeting } from "./mentor";
import { defaultState } from "./storage";
import type { ReviewItem, StudentState } from "@/types";

function withDueReview(state: StudentState): StudentState {
  const item: ReviewItem = {
    wordId: "w1",
    difficulty: 2,
    reps: 1,
    ease: 2.5,
    interval: 1,
    next: Date.now() - 1000,
    last: Date.now() - 86_400_000,
    lapses: 0
  };
  return { ...state, reviewQueue: [item] };
}

describe("buildDailyPlan", () => {
  it("coloca a revisão espaçada como prioridade máxima", () => {
    const state = withDueReview(defaultState());
    const plan = buildDailyPlan(state);
    expect(plan[0].kind).toBe("review");
    expect(plan[0].to).toBe("/review");
  });

  it("inclui a próxima aula disponível", () => {
    const state = withDueReview(defaultState());
    state.worldsUnlocked = ["world-1"];
    const plan = buildDailyPlan(state);
    expect(plan.some((p) => p.kind === "lesson" && p.to?.startsWith("/lesson/"))).toBe(true);
  });

  it("sugere prática de gramática para tópicos fracos", () => {
    const state = defaultState();
    state.mistakes.push({ lessonId: "l1", topic: "genero", at: Date.now() });
    state.mistakes.push({ lessonId: "l2", topic: "genero", at: Date.now() });
    const plan = buildDailyPlan(state);
    const g = plan.find((p) => p.kind === "grammar");
    expect(g).toBeDefined();
    expect(g!.to).toContain("/practice/grammar/");
  });

  it("não estoura o limite de itens", () => {
    const plan = buildDailyPlan(withDueReview(defaultState()), 4);
    expect(plan.length).toBeLessThanOrEqual(4);
  });

  it("oferece alternativa quando não há nada a fazer", () => {
    const state = defaultState();
    state.lessonsCompleted = ["l1-bonjour", "l2-salut"];
    const plan = buildDailyPlan(state);
    expect(plan.length).toBeGreaterThan(0);
  });
});

describe("buildMentorInsights", () => {
  it("elogia a precisão alta", () => {
    const state = defaultState();
    state.exercisesCorrect = 90;
    state.exercisesTotal = 100;
    const insights = buildMentorInsights(state);
    expect(insights.some((i) => i.title.includes("Precisão"))).toBe(true);
  });

  it("aponta os tópicos fracos", () => {
    const state = defaultState();
    state.mistakes.push({ lessonId: "l1", topic: "artigos", at: Date.now() });
    const insights = buildMentorInsights(state);
    expect(insights.some((i) => i.title.includes("Tópicos"))).toBe(true);
  });

  it("celebra streak longo", () => {
    const state = { ...defaultState(), streak: 14 };
    const insights = buildMentorInsights(state);
    expect(insights.some((i) => i.title.includes("14 dias"))).toBe(true);
  });
});

describe("mentorGreeting", () => {
  it("saúda pelo nome da aluna", () => {
    const state = { ...defaultState(), name: "Camille" };
    expect(mentorGreeting(state)).toContain("Camille");
  });
});

describe("mentorAdvice", () => {
  it("responde sobre revisão com a quantidade devida", () => {
    const state = withDueReview(defaultState());
    expect(mentorAdvice(state, "O que revisar hoje?").text).toContain("1");
  });

  it("responde sobre gramática citando tópico fraco", () => {
    const state = defaultState();
    state.mistakes.push({ lessonId: "l1", topic: "genero", at: Date.now() });
    const advice = mentorAdvice(state, "Estou travando na gramática");
    expect(advice.text.toLowerCase()).toContain("genre");
  });

  it("acolhe em momento de desmotivação", () => {
    const advice = mentorAdvice(defaultState(), "Sem motivação hoje");
    expect(advice.icon).toBe("heart");
  });
});
