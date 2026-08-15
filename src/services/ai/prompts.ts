// ══════════════════════════════════════════════════════════════
// Athenas — Perfil do aluno + prompts do sistema para a IA
// ══════════════════════════════════════════════════════════════
import { CEFR_LABELS } from "@/lib/constants";
import { AI_PERSONA } from "@/lib/constants";
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
  preferences: { theme: string; animations: boolean };
}

export function buildStudentProfile(state: StudentState): StudentProfile {
  const topicCounts = new Map<string, number>();
  for (const m of state.mistakes) {
    topicCounts.set(m.topic, (topicCounts.get(m.topic) ?? 0) + 1);
  }
  const weak = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  const strong = state.lessonsCompleted.slice(-5);

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
- Sequência de dias: ${profile.streak}
- Conquistas: ${profile.achievements}

Se o nível CEFR for C1 ou maior, aprofunde bastante (nuance, registro, subtexto, pragmática).
Se for A0/A1, seja simples, devagar e use bastante repetição e incentivo.`;
}
