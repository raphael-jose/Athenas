// ══════════════════════════════════════════════════════════════
// Athenas — Revisão de conversação: estatísticas por cenário,
// comparação de evolução entre tentativas e avaliação por
// competência (ex.: entrevista de emprego).
// ══════════════════════════════════════════════════════════════
import type { ConversationLog, IconName } from "@/types";
import type { InterviewCompetency } from "@/data/scenarios";

export interface ConversationStats {
  scenarioId: string;
  attempts: number;
  last: ConversationLog | null;
  best: number; // melhor média (natural+gram+vocab+flu)/4
  avg: number; // média geral
}

export function logsForScenario(logs: ConversationLog[], scenarioId: string): ConversationLog[] {
  return logs.filter((l) => l.scenarioId === scenarioId).sort((a, b) => a.at - b.at);
}

export function mean(log: ConversationLog): number {
  return Math.round((log.natural + log.gram + log.vocab + log.flu) / 4);
}

export function conversationStats(logs: ConversationLog[], scenarioId: string): ConversationStats {
  const mine = logsForScenario(logs, scenarioId);
  if (mine.length === 0) {
    return { scenarioId, attempts: 0, last: null, best: 0, avg: 0 };
  }
  const scores = mine.map(mean);
  return {
    scenarioId,
    attempts: mine.length,
    last: mine[mine.length - 1],
    best: Math.max(...scores),
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  };
}

/** Próxima tentativa: quantas vezes o cenário já foi feito + 1. */
export function nextAttempt(logs: ConversationLog[], scenarioId: string): number {
  return logsForScenario(logs, scenarioId).length + 1;
}

export interface Evolution {
  natural: number; // delta (novo - antigo)
  gram: number;
  vocab: number;
  flu: number;
  overall: number;
  prevOverall: number;
}

/** Compara o resultado atual com a tentativa anterior do mesmo cenário. */
export function compareEvolution(prev: ConversationLog, current: Pick<ConversationLog, "natural" | "gram" | "vocab" | "flu">): Evolution {
  return {
    natural: current.natural - prev.natural,
    gram: current.gram - prev.gram,
    vocab: current.vocab - prev.vocab,
    flu: current.flu - prev.flu,
    overall: mean(current as ConversationLog) - mean(prev),
    prevOverall: mean(prev)
  };
}

/** Última tentativa anterior ao log atual (ou null). */
export function previousLog(logs: ConversationLog[], current: ConversationLog): ConversationLog | null {
  const mine = logsForScenario(logs, current.scenarioId).filter((l) => l.at < current.at);
  return mine.length > 0 ? mine[mine.length - 1] : null;
}

/** Cenários já praticados, ordenados pelo mais recente. */
export function practicedScenarios(logs: ConversationLog[]): { scenarioId: string; at: number }[] {
  const byId = new Map<string, number>();
  for (const l of logs) {
    byId.set(l.scenarioId, Math.max(byId.get(l.scenarioId) ?? 0, l.at));
  }
  return [...byId.entries()]
    .map(([scenarioId, at]) => ({ scenarioId, at }))
    .sort((a, b) => b.at - a.at);
}

// ── Avaliação por competência (entrevista simulada) ────────────

export interface CompetencyScore {
  id: string;
  label: string;
  icon: IconName;
  score: number;
  tip: string;
}

const INFORMAL_MARKERS = ["t'as", "ouais", "mec", "grave", "tranquille", "bosse", "pote"];
const FORMAL_MARKERS = ["je voudrais", "j'aimerais", "merci", "bonjour", "monsieur", "madame", "souhaite", "veuillez"];

/** Pontua uma resposta contra uma competência (0–100). */
export function scoreCompetency(reply: string, comp: InterviewCompetency): number {
  if (!reply.trim()) return 5;
  const t = reply.toLowerCase();
  let score = 30;
  const words = reply.trim().split(/\s+/).filter(Boolean).length;
  score += Math.min(18, words * 1.2); // profundidade da resposta
  const hits = comp.hints.filter((h) => t.includes(h.toLowerCase())).length;
  score += Math.min(34, hits * 12); // palavras-chave da competência
  if (FORMAL_MARKERS.some((m) => t.includes(m))) score += 8;
  score -= INFORMAL_MARKERS.filter((m) => t.includes(m)).length * 9;
  return Math.max(5, Math.min(100, Math.round(score)));
}

/** Avalia todas as competências do cenário (line -1 = conversa inteira). */
export function computeInterviewCompetencies(
  replies: string[],
  competencies: InterviewCompetency[]
): CompetencyScore[] {
  return competencies.map((c) => {
    const text = c.line === -1 ? replies.join(" ") : replies[c.line] ?? "";
    return { id: c.id, label: c.label, icon: c.icon, score: scoreCompetency(text, c), tip: c.tip };
  });
}

/** Média das competências (0–100). */
export function overallCompetencyScore(scores: CompetencyScore[]): number {
  return scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;
}
