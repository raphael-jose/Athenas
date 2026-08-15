import { describe, expect, it } from "vitest";
import { PRONUNCIATION_DECK } from "./pronunciation";
import { GRAMMAR_PRACTICE, grammarExercises } from "./grammarPractice";
import { GRAMMAR_TREE } from "./grammar";

describe("Prática de pronúncia", () => {
  it("deck tem conteúdo e ids únicos", () => {
    expect(PRONUNCIATION_DECK.length).toBeGreaterThanOrEqual(15);
    expect(new Set(PRONUNCIATION_DECK.map((p) => p.id)).size).toBe(PRONUNCIATION_DECK.length);
  });

  it("todos os itens têm significado em português", () => {
    for (const p of PRONUNCIATION_DECK) {
      expect(p.pt.length, p.id).toBeGreaterThan(2);
      expect(p.phon.length, p.id).toBeGreaterThan(2);
    }
  });
});

describe("Prática de gramática", () => {
  it("cada tópico da árvore tem exercícios ou está sinalizado", () => {
    for (const node of GRAMMAR_TREE) {
      const exs = grammarExercises(node.id);
      expect(exs.length, `tópico ${node.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("exercícios de gramática têm respostas válidas", () => {
    for (const [nodeId, exs] of Object.entries(GRAMMAR_PRACTICE)) {
      expect(GRAMMAR_TREE.some((g) => g.id === nodeId), `tópico ${nodeId} não existe`).toBe(true);
      for (const ex of exs) {
        if (ex.kind === "choice" || ex.kind === "listening") {
          expect(ex.answer).toBeGreaterThanOrEqual(0);
          expect(ex.answer).toBeLessThan(ex.options.length);
        }
        if (ex.kind === "sentenceBuilder") {
          expect(ex.words.length).toBe(ex.answer.length);
        }
      }
    }
  });

  it("nenhum tópico duplicado no banco", () => {
    expect(Object.keys(GRAMMAR_PRACTICE).length).toBe(new Set(Object.keys(GRAMMAR_PRACTICE)).size);
  });
});
