import { describe, expect, it } from "vitest";
import {
  ALL_EXERCISES,
  BOSSES,
  isBossUnlocked,
  isLessonUnlocked,
  isWorldUnlocked,
  LESSONS,
  worldLessons,
  worldProgress,
  WORLDS
} from "./worlds";
import { WORDS_BY_ID } from "./words";

describe("Conteúdo do curso", () => {
  it("mundos têm ids únicos e progressão ordenada", () => {
    expect(new Set(WORLDS.map((w) => w.id)).size).toBe(WORLDS.length);
    const orders = WORLDS.map((w) => w.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("15 mundos definidos (até o Modo Deus Supremo)", () => {
    expect(WORLDS).toHaveLength(15);
    expect(WORLDS[0].id).toBe("world-1");
    expect(WORLDS[14].title).toContain("Native");
  });

  it("mundos jogáveis têm 10+ lições no total e todas as referências existem", () => {
    const playable = WORLDS.filter((w) => w.lessons.length > 0);
    const total = playable.reduce((a, w) => a + w.lessons.length, 0);
    expect(total).toBeGreaterThanOrEqual(10);
    // cada mundo jogável tem conteúdo denso: 6+ aulas, exceto os finais
    // (C2/NATIF — Advanced/Mastery/Native) que são focados, com 2+
    for (const w of playable) {
      const min = w.cefr >= 6 ? 2 : 6;
      expect(w.lessons.length, `mundo ${w.id} com poucas aulas`).toBeGreaterThanOrEqual(min);
    }
    for (const w of playable) {
      for (const lid of w.lessons) {
        const l = LESSONS[lid];
        expect(l, `lição ${lid}`).toBeDefined();
        expect(l.worldId).toBe(w.id);
        expect(l.exercises.length, `lição ${lid} sem exercícios`).toBeGreaterThan(0);
        for (const wid of l.words ?? []) {
          expect(WORDS_BY_ID[wid], `palavra ${wid} da lição ${lid}`).toBeDefined();
        }
      }
      if (w.boss) {
        expect(w.boss.exercises.length).toBeGreaterThan(0);
        expect(w.boss.worldId).toBe(w.id);
      }
    }
  });

  it("todos os bosses têm ids únicos", () => {
    expect(new Set(Object.keys(BOSSES)).size).toBe(Object.keys(BOSSES).length);
  });

  it("exercícios têm respostas válidas", () => {
    for (const ex of ALL_EXERCISES) {
      if (ex.kind === "choice" || ex.kind === "listening") {
        expect(ex.answer).toBeGreaterThanOrEqual(0);
        expect(ex.answer).toBeLessThan(ex.options.length);
      }
      if (ex.kind === "speedRound") {
        for (const q of ex.questions) {
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.options.length);
        }
      }
      if (ex.kind === "wordMatch") {
        const fr = new Set(ex.pairs.map((p) => p[0]));
        expect(fr.size).toBe(ex.pairs.length);
      }
      if (ex.kind === "sentenceBuilder") {
        expect(ex.words.length).toBe(ex.answer.length);
        for (const w of ex.answer) expect(ex.words).toContain(w);
      }
    }
  });
});

describe("Desbloqueio", () => {
  it("mundo 1 sempre disponível (A0)", () => {
    const w = WORLDS[0];
    expect(isWorldUnlocked(w, 0, [])).toBe(true);
  });

  it("mundo 2 bloqueado em A0 e liberado em A1+", () => {
    const w = WORLDS[1];
    expect(isWorldUnlocked(w, 0, [])).toBe(false);
    expect(isWorldUnlocked(w, 1, [])).toBe(true);
  });

  it("mundos 13-15 (Advanced French, Mastery, Native Mode) têm conteúdo endgame liberado só no NATIF", () => {
    const [w13, w14, w15] = WORLDS.slice(12, 15);
    expect(w13.id).toBe("world-13");
    expect(w14.id).toBe("world-14");
    expect(w15.id).toBe("world-15");
    for (const w of [w13, w14, w15]) {
      expect(w.lessons.length).toBeGreaterThanOrEqual(2);
      expect(w.boss).toBeDefined();
      expect(w.cefr).toBe(7); // NATIF
      expect(isWorldUnlocked(w, 7, [])).toBe(true);
      expect(isWorldUnlocked(w, 6, [])).toBe(false); // C2 ainda não abre
    }
  });

  it("mundos 4-6 (Conversations, Voyage, Relations) têm conteúdo e desbloqueiam na faixa certa", () => {
    const [w4, w5, w6] = WORLDS.slice(3, 6);
    expect(w4.id).toBe("world-4");
    expect(w5.id).toBe("world-5");
    expect(w6.id).toBe("world-6");
    for (const w of [w4, w5, w6]) {
      expect(w.lessons.length).toBeGreaterThanOrEqual(4);
      expect(w.boss).toBeDefined();
      expect(isWorldUnlocked(w, w.unlockCefr, [])).toBe(true);
      expect(isWorldUnlocked(w, Math.max(0, w.unlockCefr - 1) as never, [])).toBe(false);
    }
    // Conversations (B1) libera ao fim do A2; Voyage/Relations no B1
    expect(w4.unlockCefr).toBe(2);
    expect(w5.unlockCefr).toBe(3);
    expect(w6.unlockCefr).toBe(3);
  });

  it("mundos 7-8 (Études, Travail) têm conteúdo B2 e desbloqueiam no B1/B2", () => {
    const [w7, w8] = WORLDS.slice(6, 8);
    expect(w7.id).toBe("world-7");
    expect(w8.id).toBe("world-8");
    for (const w of [w7, w8]) {
      expect(w.lessons.length).toBeGreaterThanOrEqual(4);
      expect(w.boss).toBeDefined();
      expect(w.cefr).toBe(4); // B2
      expect(isWorldUnlocked(w, w.unlockCefr, [])).toBe(true);
    }
    expect(w7.unlockCefr).toBe(3); // Études abre no B1
    expect(w8.unlockCefr).toBe(4); // Travail exige B2
    // subjonctif só aparece em mundos B2+
    const hasSubj = worldLessons(w7).some((l) => l.topic === "subjonctif");
    expect(hasSubj).toBe(true);
  });

  it("mundo 8 (Travail) tem as aulas de entrevista simulada, e-mail formal completo e negociação de salário", () => {
    const w8 = WORLDS[7];
    const topics = worldLessons(w8).map((l) => l.topic);
    expect(topics).toContain("entrevista-simulada");
    expect(topics).toContain("email-formal");
    expect(topics).toContain("salario");
    // as aulas novas vêm depois das 7 originais
    expect(w8.lessons.length).toBeGreaterThanOrEqual(10);
    for (const id of ["l48-entretien-simule", "l49-courriel-complet", "l50-negocier-salaire"]) {
      expect(LESSONS[id]).toBeDefined();
      expect(LESSONS[id].worldId).toBe("world-8");
    }
  });

  it("mundos 9-10 (Pensée, Culture) têm conteúdo C1 e desbloqueiam no B2/C1", () => {
    const [w9, w10] = WORLDS.slice(8, 10);
    expect(w9.id).toBe("world-9");
    expect(w10.id).toBe("world-10");
    for (const w of [w9, w10]) {
      expect(w.lessons.length).toBeGreaterThanOrEqual(4);
      expect(w.boss).toBeDefined();
      expect(w.cefr).toBe(5); // C1
      expect(isWorldUnlocked(w, w.unlockCefr, [])).toBe(true);
    }
    expect(w9.unlockCefr).toBe(4); // Pensée abre no B2
    expect(w10.unlockCefr).toBe(5); // Culture exige C1
    // condicional e subjonctif passé só nos mundos avançados
    const hasCond = worldLessons(w9).some((l) => l.topic === "condicional" || l.topic === "hipotese");
    expect(hasCond).toBe(true);
    const hasSubjPasse = worldLessons(w9).some((l) => l.topic === "subjonctif-passe");
    expect(hasSubjPasse).toBe(true);
    // Culture cobre os 5 pilares: literatura, cinema, música, história, gastronomia
    const topics = worldLessons(w10).map((l) => l.topic);
    for (const t of ["literatura", "cinema", "musica", "historia", "gastronomia"]) {
      expect(topics).toContain(t);
    }
  });

  it("mundos 11-12 (Expressions, Immersion) têm conteúdo C1 com expressões, ironia e mídia", () => {
    const [w11, w12] = WORLDS.slice(10, 12);
    expect(w11.id).toBe("world-11");
    expect(w12.id).toBe("world-12");
    for (const w of [w11, w12]) {
      expect(w.lessons.length).toBeGreaterThanOrEqual(6);
      expect(w.boss).toBeDefined();
      expect(w.cefr).toBe(5); // C1
      expect(isWorldUnlocked(w, w.unlockCefr, [])).toBe(true);
      expect(isWorldUnlocked(w, 4, [])).toBe(false); // C1 necessário
    }
    // Expressions: idiomáticas, ironia, duplo sentido, gírias e subtexto
    const t11 = worldLessons(w11).map((l) => l.topic);
    for (const t of ["expressoes", "ironia", "duplo-sentido", "giria", "subtexto"]) {
      expect(t11).toContain(t);
    }
    // Immersion: mídia, imprensa, redes, verlan e regionalismos
    const t12 = worldLessons(w12).map((l) => l.topic);
    for (const t of ["midia", "giria", "regionalismo", "conversacao"]) {
      expect(t12).toContain(t);
    }
    // boss 11 exige a pegadinha "la pêche" e o boss 12 mistura mídia + verlan + Quebec
    expect(w11.boss!.exercises.some((e) => e.kind === "fillBlank" && e.answer === "pêche")).toBe(true);
    expect(w12.boss!.exercises.some((e) => e.kind === "choice" && e.options.includes("ouf"))).toBe(true);
  });

  it("lições desbloqueiam em sequência", () => {
    const w = WORLDS[0];
    expect(isLessonUnlocked(w, w.lessons[0], [])).toBe(true);
    expect(isLessonUnlocked(w, w.lessons[1], [])).toBe(false);
    expect(isLessonUnlocked(w, w.lessons[1], [w.lessons[0]])).toBe(true);
  });

  it("boss libera só com todas as lições", () => {
    const w = WORLDS[0];
    expect(isBossUnlocked(w, [])).toBe(false);
    expect(isBossUnlocked(w, w.lessons.slice(0, -1))).toBe(false);
    expect(isBossUnlocked(w, w.lessons)).toBe(true);
  });

  it("progresso conta lições concluídas", () => {
    const w = WORLDS[0];
    expect(worldProgress(w, []).done).toBe(0);
    expect(worldProgress(w, [w.lessons[0], w.lessons[1]]).done).toBe(2);
    expect(worldProgress(w, [w.lessons[0], w.lessons[1]]).total).toBe(w.lessons.length);
  });

  it("worldLessons preserva a ordem definida", () => {
    const w = WORLDS[0];
    expect(worldLessons(w).map((l) => l.id)).toEqual(w.lessons);
  });
});
