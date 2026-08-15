import { describe, expect, it } from "vitest";
import {
  bestChoiceIndex,
  maxNegotiationScore,
  NEGOTIATION_OUTCOMES,
  NEGOTIATION_ROUNDS,
  negotiationScore,
  outcomeFor,
  reviewTips
} from "./negotiation";

describe("Negociação salarial", () => {
  it("tem 8 rounds com 3 escolhas cada e pontuação 0–3", () => {
    expect(NEGOTIATION_ROUNDS).toHaveLength(8);
    for (const r of NEGOTIATION_ROUNDS) {
      expect(r.choices).toHaveLength(3);
      for (const c of r.choices) {
        expect(c.score).toBeGreaterThanOrEqual(0);
        expect(c.score).toBeLessThanOrEqual(3);
        expect(c.text.length).toBeGreaterThan(0);
        expect(c.feedback.length).toBeGreaterThan(0);
      }
      // sempre há exatamente UMA resposta ótima
      const best = bestChoiceIndex(r);
      expect(r.choices[best].score).toBe(3);
      expect(r.choices.filter((c) => c.score === 3)).toHaveLength(1);
    }
    expect(maxNegotiationScore()).toBe(24);
  });

  it("soma a pontuação das escolhas", () => {
    const perfect = NEGOTIATION_ROUNDS.map((r) => bestChoiceIndex(r));
    expect(negotiationScore(perfect)).toBe(24);
    const worst = NEGOTIATION_ROUNDS.map((r) =>
      r.choices.reduce((bi, c, i, arr) => (c.score < arr[bi].score ? i : bi), 0)
    );
    const expectedWorst = NEGOTIATION_ROUNDS.reduce(
      (acc, r) => acc + Math.min(...r.choices.map((c) => c.score)),
      0
    );
    expect(negotiationScore(worst)).toBe(expectedWorst);
    // índice inválido não soma
    expect(negotiationScore([99, 99, 99, 99, 99, 99, 99, 99])).toBe(0);
  });

  it("mapeia pontuação para o desfecho certo", () => {
    expect(outcomeFor(24).title).toBe("Négociateur·rice d'élite");
    expect(outcomeFor(21).title).toBe("Négociateur·rice d'élite");
    expect(outcomeFor(20).title).toBe("Bon·ne négociateur·rice");
    expect(outcomeFor(15).title).toBe("Bon·ne négociateur·rice");
    expect(outcomeFor(14).title).toBe("Négociation correcte");
    expect(outcomeFor(9).title).toBe("Négociation correcte");
    expect(outcomeFor(8).title).toBe("Trop gentil·le !");
    expect(outcomeFor(0).title).toBe("Trop gentil·le !");
  });

  it("outcomes estão ordenados do melhor para o pior e têm recompensas", () => {
    for (let i = 0; i < NEGOTIATION_OUTCOMES.length - 1; i++) {
      expect(NEGOTIATION_OUTCOMES[i].min).toBeGreaterThan(NEGOTIATION_OUTCOMES[i + 1].min);
    }
    expect(NEGOTIATION_OUTCOMES[0].xp).toBeGreaterThanOrEqual(NEGOTIATION_OUTCOMES[2].xp);
  });

  it("reviewTips devolve dicas só para escolhas não-ótimas", () => {
    expect(reviewTips(NEGOTIATION_ROUNDS.map((r) => bestChoiceIndex(r)))).toHaveLength(0);
    const worst = NEGOTIATION_ROUNDS.map((r) =>
      r.choices.reduce((bi, c, i, arr) => (c.score < arr[bi].score ? i : bi), 0)
    );
    const tips = reviewTips(worst);
    expect(tips).toHaveLength(8);
    expect(tips[0].tip).toBe(NEGOTIATION_ROUNDS[0].choices[worst[0]].feedback);
    // escolha média (score 1) também gera dica
    const oneBad = NEGOTIATION_ROUNDS.map((r) => bestChoiceIndex(r));
    oneBad[3] = 1; // "Non merci…" (0 pts) na rodada do pacote
    expect(reviewTips(oneBad)).toHaveLength(1);
  });
});
