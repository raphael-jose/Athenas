import { describe, expect, it } from "vitest";
import {
  DUEL_CONFIG,
  duelQuestions,
  isVictory,
  resolveRound,
  roundScore,
  type DuelState
} from "./duel";

const base = (): DuelState => ({
  round: 0,
  totalRounds: DUEL_CONFIG.totalRounds,
  luluHp: DUEL_CONFIG.luluHpMax,
  lives: DUEL_CONFIG.livesMax,
  score: 0,
  correctCount: 0
});

describe("Grammar Duel", () => {
  it("seleciona perguntas rápidas (choice/fillBlank) apenas", () => {
    const qs = duelQuestions(1, 12);
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      expect(["choice", "fillBlank"]).toContain(q.exercise.kind);
    }
  });

  it("respeita o CEFR: nível baixo não recebe subjonctif/nuances", () => {
    const low = duelQuestions(1, 50);
    const advancedIds = ["g-subjonctif", "g-plus-que-parfait", "g-hypotheses", "g-subjonctif-passe", "g-concordance", "g-nuances"];
    for (const q of low) {
      expect(advancedIds).not.toContain(q.nodeId);
    }
    // CEFR alto tem acesso aos avançados
    const high = duelQuestions(6, 50);
    const hasAdvanced = high.some((q) => advancedIds.includes(q.nodeId));
    expect(hasAdvanced).toBe(true);
  });

  it("tópicos C1 (hipóteses, subjonctif passé) só aparecem a partir do C1", () => {
    const c1Ids = ["g-hypotheses", "g-subjonctif-passe"];
    // B2 (CEFR 4) não recebe os tópicos C1
    const b2 = duelQuestions(4, 60);
    for (const q of b2) {
      expect(c1Ids).not.toContain(q.nodeId);
    }
    // C1 (CEFR 5) recebe ambos
    const c1 = duelQuestions(5, 60);
    expect(c1.some((q) => q.nodeId === "g-hypotheses")).toBe(true);
    expect(c1.some((q) => q.nodeId === "g-subjonctif-passe")).toBe(true);
    // C2 (CEFR 6) continua com tudo
    const c2 = duelQuestions(6, 60);
    expect(c2.some((q) => q.nodeId === "g-hypotheses")).toBe(true);
    expect(c2.some((q) => q.nodeId === "g-subjonctif-passe")).toBe(true);
  });

  it("duelo C1 garante perguntas da faixa atual (hipóteses/concordância)", () => {
    const c1 = duelQuestions(5, DUEL_CONFIG.totalRounds);
    const band = ["g-hypotheses", "g-subjonctif-passe", "g-concordance"];
    expect(c1.some((q) => band.includes(q.nodeId))).toBe(true);
    // e nunca traz tópicos acima do nível (g-nuances é C2)
    for (const q of c1) {
      expect(q.nodeId).not.toBe("g-nuances");
    }
  });

  it("as perguntas C1 do duelo são todas choice/fillBlank", () => {
    const c1 = duelQuestions(5, 60);
    const c1qs = c1.filter((q) => ["g-hypotheses", "g-subjonctif-passe"].includes(q.nodeId));
    expect(c1qs.length).toBeGreaterThan(0);
    for (const q of c1qs) {
      expect(["choice", "fillBlank"]).toContain(q.exercise.kind);
    }
  });

  it("seleção é determinística para a mesma seed", () => {
    const a = duelQuestions(3, 8, 7);
    const b = duelQuestions(3, 8, 7);
    expect(a.map((q) => q.exercise.prompt)).toEqual(b.map((q) => q.exercise.prompt));
  });

  it("pontua por rapidez: resposta imediata vale mais", () => {
    expect(roundScore(true, 15, 15)).toBe(DUEL_CONFIG.baseDamage + DUEL_CONFIG.speedBonusMax);
    expect(roundScore(true, 0, 15)).toBe(DUEL_CONFIG.baseDamage);
    expect(roundScore(false, 15, 15)).toBe(0);
  });

  it("acertos danificam a Lulu e erros custam vida", () => {
    const r1 = resolveRound(base(), true, 15, 15);
    expect(r1.state.luluHp).toBeLessThan(DUEL_CONFIG.luluHpMax);
    expect(r1.state.lives).toBe(DUEL_CONFIG.livesMax);
    expect(r1.state.correctCount).toBe(1);

    const r2 = resolveRound(r1.state, false, 15, 15);
    expect(r2.state.lives).toBe(DUEL_CONFIG.livesMax - 1);
    expect(r2.state.luluHp).toBe(r1.state.luluHp);
  });

  it("vitória por nocaute quando a Lulu chega a 0 HP", () => {
    let s = base();
    // 8 acertos rápidos (15 de dano cada) > 100 HP
    for (let i = 0; i < 8; i++) {
      const r = resolveRound(s, true, 15, 15);
      s = r.state;
      if (r.result === "win") break;
    }
    expect(s.luluHp).toBe(0);
    expect(isVictory(s)).toBe(true);
  });

  it("derrota ao perder todas as vidas", () => {
    let s = base();
    for (let i = 0; i < DUEL_CONFIG.livesMax; i++) {
      const r = resolveRound(s, false, 0, 15);
      s = r.state;
    }
    expect(s.lives).toBe(0);
    expect(isVictory(s)).toBe(false);
  });

  it("resolveRound sinaliza o resultado correto", () => {
    const win = resolveRound(base(), true, 15, 15);
    // 1 acerto não basta para vencer
    expect(win.result).toBe("continue");
    // perder a última vida = derrota
    const hurt = resolveRound({ ...base(), lives: 1 }, false, 0, 15);
    expect(hurt.result).toBe("lose");
  });
});
