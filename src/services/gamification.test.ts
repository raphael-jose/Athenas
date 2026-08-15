import { describe, expect, it } from "vitest";
import { cumulativeXp, levelFromXp, levelName, levelProgress, updateStreak, xpForLevel, newlyUnlocked, ACHIEVEMENTS } from "./gamification";
import type { StudentState } from "@/types";
import { defaultState } from "./storage";

describe("XP e níveis", () => {
  it("nível 1 começa com 0 XP", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelProgress(0).level).toBe(1);
    expect(levelProgress(0).pct).toBe(0);
  });

  it("subir de nível exige a soma dos XP dos níveis anteriores", () => {
    const lvl2 = xpForLevel(1);
    expect(levelFromXp(lvl2)).toBe(2);
    expect(levelFromXp(lvl2 - 1)).toBe(1);
    expect(cumulativeXp(3)).toBe(xpForLevel(1) + xpForLevel(2));
  });

  it("XP acumulado nunca regride e a barra chega a 100% antes do level up", () => {
    const xp = cumulativeXp(5) + Math.floor(xpForLevel(5) / 2);
    const p = levelProgress(xp);
    expect(p.level).toBe(5);
    expect(p.pct).toBeGreaterThan(0);
    expect(p.pct).toBeLessThan(100);
  });

  it("nomes de nível nos marcos", () => {
    expect(levelName(1)).toBe("Petit Débutant");
    expect(levelName(50)).toBe("Maître");
    expect(levelName(100)).toBe("Dieu du Français");
    expect(levelName(7)).toBe("Rêveuse");
  });
});

describe("Streak", () => {
  // Datas calculadas dinamicamente em relação a hoje (o updateStreak usa
  // "ontem" real do relógio — datas fixas tornariam o teste frágil).
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const now = new Date();
  const today = key(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = key(yesterday);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoKey = key(twoDaysAgo);

  it("primeiro dia cria streak 1", () => {
    const r = updateStreak({ streak: 0, bestStreak: 0, lastActiveDay: twoKey }, today);
    expect(r.streak).toBe(1);
    expect(r.reset).toBe(false);
  });

  it("dia consecutivo incrementa", () => {
    const r = updateStreak({ streak: 3, bestStreak: 3, lastActiveDay: yKey }, today);
    expect(r.streak).toBe(4);
    expect(r.bestStreak).toBe(4);
  });

  it("mesmo dia não muda nada", () => {
    const r = updateStreak({ streak: 5, bestStreak: 7, lastActiveDay: today }, today);
    expect(r.streak).toBe(5);
  });

  it("pular um dia reinicia com carinho (reset=true)", () => {
    const r = updateStreak({ streak: 6, bestStreak: 6, lastActiveDay: twoKey }, today);
    expect(r.streak).toBe(1);
    expect(r.reset).toBe(true);
    expect(r.bestStreak).toBe(6);
  });
});

describe("Conquistas", () => {
  it("todas as conquistas têm ids únicos", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("primeira aula desbloqueia 'premiere-parole'", () => {
    const s: StudentState = { ...defaultState(), lessonsCompleted: ["l1-bonjour"] };
    const fresh = newlyUnlocked(s);
    expect(fresh.map((a) => a.id)).toContain("premiere-parole");
  });

  it("não repete conquista já concedida", () => {
    const s: StudentState = { ...defaultState(), lessonsCompleted: ["l1-bonjour"], achievements: ["premiere-parole"] };
    const fresh = newlyUnlocked(s);
    expect(fresh.map((a) => a.id)).not.toContain("premiere-parole");
  });
});
