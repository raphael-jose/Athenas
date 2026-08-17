// ══════════════════════════════════════════════════════════════
// Athenas — Saudação da Lulu com memória de longo prazo
// Depois de "Limpar conversa" (ou na primeira vez), a saudação usa o
// perfil da aluna para retomar de onde ela parou.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { buildGreeting } from "./AIHub";
import { buildStudentProfile } from "@/services/ai/prompts";
import { defaultState } from "@/services/storage";

describe("buildGreeting — saudação com memória de longo prazo", () => {
  it("aluna com progresso: pergunta 'bora continuar de onde paramos' com nível e estatísticas", () => {
    const s = defaultState();
    s.name = "Amélie";
    s.lessonsCompleted = ["l1-bonjour", "l2-merci"];
    s.wordsLearned = ["w-bonjour"];
    s.streak = 3;
    const g = buildGreeting(buildStudentProfile(s), s.name);
    expect(g).toContain("Amélie");
    expect(g).toContain("continuar de onde paramos");
    expect(g).toContain("nível");
  });

  it("cita o título da ÚLTIMA aula concluída (memória de longo prazo)", () => {
    const s = defaultState();
    s.name = "Pedro";
    s.lessonsCompleted = ["l1-bonjour", "l2-merci"];
    const g = buildGreeting(buildStudentProfile(s), s.name);
    expect(g).toContain("Merci beaucoup");
    expect(g).not.toContain("Bonjour !"); // a última é "Merci beaucoup", não a primeira
  });

  it("perfil guarda o assunto da última aula", () => {
    const s = defaultState();
    s.lessonsCompleted = ["l1-bonjour"];
    const p = buildStudentProfile(s);
    expect(p.lastLesson).toBe("Bonjour !");
    expect(p.lastTopic).toBe("saudacoes");
  });

  it("aluna nova (sem progresso): boas-vindas clássicas, sem 'de onde paramos'", () => {
    const s = defaultState();
    s.name = "Ana";
    const g = buildGreeting(buildStudentProfile(s), s.name);
    expect(g).toContain("Eu sou a Lulu");
    expect(g).not.toContain("continuar de onde paramos");
  });


});
