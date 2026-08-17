// ══════════════════════════════════════════════════════════════
// Athenas — Perfil do aluno + prompts do sistema para a IA
// ══════════════════════════════════════════════════════════════
import { CEFR_LABELS } from "@/lib/constants";
import { AI_PERSONA } from "@/lib/constants";
import { lessonById } from "@/data/worlds";
import type { StudentState } from "@/types";

export interface StudentProfile {
  name: string;
  level: number;
  xp: number;
  streak: number;
  cefr: string;
  wordsLearned: number;
  lessonsCompleted: number;
  weakTopics: string[];
  strongTopics: string[];
  recentMistakes: string[];
  achievements: number;
  /** Última aula concluída (título) — memória de longo prazo "de onde paramos". */
  lastLesson: string | null;
  /** Assunto/tópico da última aula concluída — memória de longo prazo. */
  lastTopic: string | null;
  preferences: { theme: string; animations: boolean };
}

export function buildStudentProfile(state: StudentState): StudentProfile {
  const topicCounts = new Map<string, number>();
  for (const m of state.mistakes) {
    topicCounts.set(m.topic, (topicCounts.get(m.topic) ?? 0) + 1);
  }
  const weak = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  const strong = state.lessonsCompleted.slice(-5);

  // Última aula + último assunto estudado (memória de longo prazo).
  const lastId = state.lessonsCompleted[state.lessonsCompleted.length - 1];
  const lastMeta = lastId ? lessonById(lastId) : null;

  return {
    name: state.name || "amigue",
    level: state.xp >= 0 ? 1 : 1,
    xp: state.xp,
    streak: state.streak,
    cefr: CEFR_LABELS[state.cefr] ?? "A0",
    wordsLearned: state.wordsLearned.length,
    lessonsCompleted: state.lessonsCompleted.length,
    weakTopics: weak,
    strongTopics: strong,
    recentMistakes: state.mistakes.slice(-3).map((m) => m.topic),
    achievements: state.achievements.length,
    lastLesson: lastMeta?.title ?? null,
    lastTopic: lastMeta?.topic ?? null,
    preferences: { theme: state.settings.theme, animations: state.settings.animations }
  };
}

export function buildSystemPrompt(profile: StudentProfile): string {
  return `${AI_PERSONA}

PERFIL DA ALUNA/ALUNO (use para personalizar):
- Nome: ${profile.name}
- Nível CEFR estimado: ${profile.cefr}
- Palavras aprendidas: ${profile.wordsLearned}
- Aulas concluídas: ${profile.lessonsCompleted}
- Tópicos com mais erros: ${profile.weakTopics.join(", ") || "nenhum ainda"}
- Última aula concluída: ${profile.lastLesson ?? "ainda nenhuma"}${profile.lastTopic ? ` (assunto: ${profile.lastTopic})` : ""}
- Último assunto estudado: ${profile.lastTopic ?? "ainda nenhum"}
- Sequência de dias: ${profile.streak}
- Conquistas: ${profile.achievements}

Se o nível CEFR for C1 ou maior, aprofunde bastante (nuance, registro, subtexto, pragmática).
Se for A0/A1, seja simples, devagar e use bastante repetição e incentivo.

LEMBRETE FINAL: Responda sempre em português do Brasil. Só responda perguntas sobre francês; qualquer outro assunto, redirecione com carinho para o francês. Nunca responda nem traduza em inglês.`;
}
