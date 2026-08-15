import { describe, expect, it } from "vitest";
import { resumeTarget } from "./session";
import { defaultState } from "./storage";
import { WORLDS } from "@/data/worlds";

describe("resumeTarget — memória de onde o usuário parou", () => {
  it("volta para a rota onde o usuário parou (aula em andamento)", () => {
    const s = defaultState();
    s.lastRoute = "/lesson/l1-bonjour";
    expect(resumeTarget(s)).toBe("/lesson/l1-bonjour");
  });

  it("não volta para aula já concluída — usa a próxima do plano", () => {
    const s = defaultState();
    s.lastRoute = "/lesson/l1-bonjour";
    s.lessonsCompleted = ["l1-bonjour"];
    s.worldsUnlocked = ["world-1"];
    expect(resumeTarget(s)).toBe("/lesson/l2-merci");
  });

  it("ignora a home como destino — vai para a próxima aula", () => {
    const s = defaultState();
    s.lastRoute = "/";
    s.worldsUnlocked = ["world-1"];
    expect(resumeTarget(s)).toBe("/lesson/l1-bonjour");
  });

  it("sem aulas disponíveis, cai para a revisão pendente", () => {
    const s = defaultState();
    s.lastRoute = "/";
    // sem mundos desbloqueados → sem aula no plano; sem revisões → mapa
    expect(resumeTarget(s)).toBe("/map");
  });

  it("vai para o mapa quando não há nada pendente", () => {
    const s = defaultState();
    s.worldsUnlocked = ["world-1"];
    // todas as aulas do mundo 1 concluídas
    const w = WORLDS.find((x) => x.id === "world-1");
    s.lessonsCompleted = [...w!.lessons];
    s.reviewQueue = [];
    expect(resumeTarget(s)).toBe("/map");
  });
});
