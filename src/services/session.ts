// ══════════════════════════════════════════════════════════════
// Athenas — Sessão: memória de onde o usuário parou
// O app é 100% local (localStorage) — \"login\" = lembrar quem você
// é e para onde estava indo. Este módulo decide o destino do botão
// \"Continuar\" da tela de boas-vindas.
// ══════════════════════════════════════════════════════════════
import { buildDailyPlan } from "./mentor";
import type { StudentState } from "@/types";

/**
 * Calcula para onde levar o usuário ao \"continuar\":
 *  1. a rota onde ele parou (se ainda faz sentido — ex.: aula não concluída);
 *  2. senão, a próxima aula do plano do dia;
 *  3. senão, a revisão pendente;
 *  4. senão, o mapa.
 */
export function resumeTarget(state: StudentState): string {
  const route = state.lastRoute || "";
  const [head, id] = route.replace(/^\/?/, "").split("/");
  const isDoneLesson = head === "lesson" && !!id && state.lessonsCompleted.includes(id);
  if (route && route !== "/" && !isDoneLesson) return route;

  const plan = buildDailyPlan(state);
  const lesson = plan.find((i) => i.kind === "lesson");
  if (lesson?.to) return lesson.to;
  const review = plan.find((i) => i.kind === "review");
  if (review?.to) return review.to;
  return "/map";
}
