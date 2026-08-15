import { describe, expect, it } from "vitest";
import {
  compareEvolution,
  computeInterviewCompetencies,
  conversationStats,
  logsForScenario,
  mean,
  nextAttempt,
  overallCompetencyScore,
  practicedScenarios,
  previousLog,
  scoreCompetency
} from "./conversationReview";
import type { ConversationLog } from "@/types";
import { SCENARIOS, type InterviewCompetency } from "@/data/scenarios";

const comp = (line: number, hints: string[] = []): InterviewCompetency => ({
  id: "c",
  label: "C",
  icon: "star",
  line,
  desc: "",
  hints,
  tip: ""
});

const log = (id: string, at: number, n: number, g: number, v: number, f: number): ConversationLog => ({
  scenarioId: id,
  at,
  natural: n,
  gram: g,
  vocab: v,
  flu: f
});

describe("Revisão de conversação", () => {
  it("conta tentativas e calcula melhor/média por cenário", () => {
    const logs = [
      log("s-boulangerie", 1, 50, 60, 40, 55),
      log("s-boulangerie", 2, 70, 75, 65, 72),
      log("s-hotel", 3, 80, 85, 78, 82)
    ];
    const s = conversationStats(logs, "s-boulangerie");
    expect(s.attempts).toBe(2);
    expect(s.best).toBe(mean(logs[1]));
    expect(s.avg).toBe(Math.round((mean(logs[0]) + mean(logs[1])) / 2));
    expect(s.last?.at).toBe(2);
    expect(nextAttempt(logs, "s-boulangerie")).toBe(3);
    expect(nextAttempt(logs, "s-hotel")).toBe(2);
    expect(nextAttempt(logs, "s-novo")).toBe(1);
  });

  it("compara evolução entre a tentativa anterior e a atual", () => {
    const prev = log("s-cafe", 1, 60, 70, 50, 65);
    const ev = compareEvolution(prev, { natural: 80, gram: 75, vocab: 70, flu: 78 });
    expect(ev.natural).toBe(20);
    expect(ev.gram).toBe(5);
    expect(ev.vocab).toBe(20);
    expect(ev.flu).toBe(13);
    expect(ev.overall).toBe(mean({ ...prev, natural: 80, gram: 75, vocab: 70, flu: 78 } as ConversationLog) - mean(prev));
  });

  it("previousLog retorna a tentativa anterior mais próxima", () => {
    const logs = [log("s-x", 1, 50, 50, 50, 50), log("s-y", 2, 60, 60, 60, 60), log("s-x", 3, 70, 70, 70, 70)];
    const current = log("s-x", 5, 80, 80, 80, 80);
    const prev = previousLog(logs, current);
    expect(prev?.at).toBe(3);
    expect(previousLog(logs, log("s-x", 2, 0, 0, 0, 0))?.at).toBe(1);
    expect(previousLog(logs, log("s-z", 9, 0, 0, 0, 0))).toBeNull();
  });

  it("practicedScenarios ordena do mais recente e deduplica", () => {
    const logs = [log("s-a", 10, 1, 1, 1, 1), log("s-b", 20, 1, 1, 1, 1), log("s-a", 30, 1, 1, 1, 1)];
    const p = practicedScenarios(logs);
    expect(p).toEqual([
      { scenarioId: "s-a", at: 30 },
      { scenarioId: "s-b", at: 20 }
    ]);
  });

  it("logsForScenario preserva ordem cronológica", () => {
    const logs = [log("s-a", 30, 1, 1, 1, 1), log("s-a", 10, 1, 1, 1, 1)];
    expect(logsForScenario(logs, "s-a").map((l) => l.at)).toEqual([10, 30]);
  });
});

describe("Avaliação por competência (entrevista)", () => {
  it("premia respostas profundas com palavras-chave da competência", () => {
    const c = comp(0, ["je suis", "j'ai", "mon parcours"]);
    const rich = scoreCompetency("Bonjour, je suis Ana. J'ai travaillé comme designer pendant 5 ans, voici mon parcours.", c);
    const thin = scoreCompetency("Oui.", c);
    expect(rich).toBeGreaterThan(70);
    expect(thin).toBeLessThan(40);
  });

  it("penaliza registro informal e premia o formal", () => {
    const c = comp(-1, ["vous", "merci"]);
    const formal = scoreCompetency("Merci beaucoup, je vous remercie de votre temps.", c);
    const informal = scoreCompetency("ouais mec, tranquille, t'as vu ?", c);
    expect(formal).toBeGreaterThan(60);
    expect(informal).toBeLessThan(40);
  });

  it("line -1 avalia a conversa inteira", () => {
    const c = comp(-1, ["merci"]);
    const scores = computeInterviewCompetencies(["Bonjour", "non"], [c]);
    expect(scores[0].score).toBe(scoreCompetency("Bonjour non", c));
  });

  it("cada competência usa a resposta correspondente", () => {
    const c1 = comp(0, ["bonjour"]);
    const c2 = comp(1, ["équipe"]);
    const scores = computeInterviewCompetencies(["Bonjour madame", "J'adore cette équipe"], [c1, c2]);
    expect(scores[0].score).toBe(scoreCompetency("Bonjour madame", c1));
    expect(scores[1].score).toBe(scoreCompetency("J'adore cette équipe", c2));
    // a resposta da linha 0 não pode elevar a competência da linha 1
    expect(scores[1].score).toBe(scoreCompetency("J'adore cette équipe", c2));
  });

  it("resposta ausente fica com nota mínima", () => {
    const c = comp(2, ["situation"]);
    const scores = computeInterviewCompetencies(["a", "b"], [c]);
    expect(scores[0].score).toBe(5);
  });

  it("overallCompetencyScore calcula a média arredondada", () => {
    expect(
      overallCompetencyScore([
        { id: "a", label: "", icon: "star", score: 70, tip: "" },
        { id: "b", label: "", icon: "star", score: 80, tip: "" }
      ])
    ).toBe(75);
    expect(overallCompetencyScore([])).toBe(0);
  });

  it("a entrevista do jogo tem 7 competências e pontua respostas reais", () => {
    const interview = SCENARIOS.find((s) => s.id === "s-entretien")!;
    expect(interview.competencies?.length).toBe(7);
    const replies = [
      "Bonjour, je suis Ana. J'ai travaillé comme développeuse pendant 5 ans.",
      "Je veux rejoindre votre entreprise car j'adore vos projets.",
      "Une situation difficile : j'ai géré un projet en retard et le résultat a été positif.",
      "Je suis organisée, mais parfois perfectionniste.",
      "Je pense à une fourchette entre 3 500 et 4 000 euros.",
      "Quelles sont les missions du poste et comment est l'équipe ?",
      "Merci beaucoup, bonne journée !"
    ];
    const scores = computeInterviewCompetencies(replies, interview.competencies!);
    expect(scores.length).toBe(7);
    expect(overallCompetencyScore(scores)).toBeGreaterThanOrEqual(60);
    expect(scores.find((s) => s.id === "professionnalisme")!.score).toBeGreaterThanOrEqual(70);
  });
});
