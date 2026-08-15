import { describe, expect, it } from "vitest";
import { dueItems, masteryLevel, newReviewItem, scheduleReview, DAY } from "./srs";

describe("Repetição espaçada", () => {
  it("item novo está devido para revisão", () => {
    const item = newReviewItem("w-bonjour");
    expect(dueItems([item]).length).toBe(1);
    expect(masteryLevel(item)).toBe("nova");
  });

  it("acertar fácil aumenta o intervalo e a facilidade", () => {
    let item = newReviewItem("w-table", 2);
    item = scheduleReview(item, 5);
    expect(item.reps).toBe(1);
    expect(item.interval).toBeGreaterThanOrEqual(1);
    expect(item.ease).toBeGreaterThan(2.5);
    expect(dueItems([item])).toEqual([]); // não está mais devido
  });

  it("esquecer reinicia a sequência e marca lapse", () => {
    let item = newReviewItem("w-croissant", 3);
    item = scheduleReview(item, 5);
    const before = { ...item };
    item = scheduleReview(item, 1);
    expect(item.lapses).toBe(1);
    expect(item.reps).toBe(0);
    expect(item.next).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000); // volta logo
    expect(item.difficulty).toBeGreaterThan(before.difficulty);
  });

  it("revisões repetidas aumentam o intervalo (memória de longo prazo)", () => {
    let item = newReviewItem("w-famille", 3);
    for (let i = 0; i < 5; i++) item = scheduleReview(item, 5);
    expect(item.interval).toBeGreaterThanOrEqual(7);
    expect(masteryLevel(item)).toBe("dominada");
  });

  it("dueItems ordena por data e respeita o limite", () => {
    const now = Date.now();
    const a = { ...newReviewItem("a"), next: now - 1000 };
    const b = { ...newReviewItem("b"), next: now - 5000 };
    const c = { ...newReviewItem("c"), next: now + DAY };
    const due = dueItems([a, b, c], now);
    expect(due.map((d) => d.wordId)).toEqual(["b", "a"]);
  });
});
