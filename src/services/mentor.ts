// ══════════════════════════════════════════════════════════════
// Athenas — Mentor 
// Motor (puro, offline) que analisa o perfil da aluna e monta um
// plano de estudos do dia + insights personalizados.
// ══════════════════════════════════════════════════════════════
import { CEFR_LABELS, CEFR_BAND_NAMES, DAILY_XP_GOAL } from "@/lib/constants";
import { levelFromXp, levelName, levelProgress } from "./gamification";
import { dueItems, masteryLevel } from "./srs";
import { LESSONS, WORLDS, nextLessonInWorld } from "@/data/worlds";
import { GRAMMAR_TREE } from "@/data/grammar";
import { grammarExercises } from "@/data/grammarPractice";
import { percent } from "@/lib/utils";
import type { IconName, StudentState } from "@/types";

export interface MentorPlanItem {
  id: string;
  kind: "review" | "grammar" | "lesson" | "mission" | "pronunciation" | "ai" | "done";
  icon: IconName;
  title: string;
  desc: string;
  to?: string;
  priority: number;
}

/** Mapeia tópico de lição (onde a aluna erra) → nó de gramática com prática. */
const TOPIC_GRAMMAR: Record<string, string> = {
  genero: "g-genre",
  artigos: "g-articles",
  "etre-avoir": "g-etre",
  verbes: "g-present",
  negacao: "g-negation",
  "passe-compose": "g-passe-compose",
  futur: "g-futur"
};

function weakTopicNodes(state: StudentState): { nodeId: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const m of state.mistakes) {
    const nodeId = TOPIC_GRAMMAR[m.topic];
    if (nodeId) counts.set(nodeId, (counts.get(nodeId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([nodeId, count]) => ({ nodeId, count }))
    .sort((a, b) => b.count - a.count);
}

function nextLesson(state: StudentState): { lessonId: string; title: string; icon: IconName } | null {
  for (const w of WORLDS) {
    if (w.lessons.length === 0) continue;
    if (!state.worldsUnlocked.includes(w.id) && !state.worldsCleared.includes(w.id)) continue;
    if (state.worldsCleared.includes(w.id)) continue; // já "sabido" pelo diagnóstico
    const next = nextLessonInWorld(w, state.lessonsCompleted);
    if (next) {
      const meta = LESSONS[next.id];
      return { lessonId: next.id, title: next.title, icon: meta?.icon ?? "book" };
    }
  }
  return null;
}

export function buildDailyPlan(state: StudentState, maxItems = 4): MentorPlanItem[] {
  const items: MentorPlanItem[] = [];

  // 1. Revisão espaçada (prioridade máxima — o cérebro está pedindo)
  const due = dueItems(state.reviewQueue).length;
  if (due > 0) {
    items.push({
      id: "plan-review",
      kind: "review",
      icon: "brain",
      title: `Revisar ${due} palavra${due > 1 ? "s" : ""}`,
      desc: "Seu cérebro quer fixar isso hoje — 3 minutinhos bastam.",
      to: "/review",
      priority: 10
    });
  }

  // 2. Prática de gramática nos tópicos fracos
  const weak = weakTopicNodes(state);
  for (const w of weak.slice(0, 2)) {
    const node = GRAMMAR_TREE.find((g) => g.id === w.nodeId);
    if (!node || grammarExercises(node.id).length === 0) continue;
    items.push({
      id: `plan-grammar-${node.id}`,
      kind: "grammar",
      icon: node.icon,
      title: `Praticar ${node.title.toLowerCase()}`,
      desc: w.count > 1 ? `Notei que esse tópico tem dado trabalho. Vamos treinar?` : "Um treino rápido fortalece esse tópico.",
      to: `/practice/grammar/${node.id}`,
      priority: 20
    });
  }

  // 3. Próxima aula (avanço do conteúdo)
  const next = nextLesson(state);
  if (next) {
    items.push({
      id: "plan-lesson",
      kind: "lesson",
      icon: next.icon,
      title: `Aula: ${next.title}`,
      desc: "Continue a aventura — cada aula destrava a próxima.",
      to: `/lesson/${next.lessonId}`,
      priority: 30
    });
  }

  // 4. Missões do dia
  const undone = state.dailyMissions.filter((m) => !m.done);
  if (undone.length > 0) {
    items.push({
      id: "plan-mission",
      kind: "mission",
      icon: "target",
      title: `Missão do dia: ${undone[0].label.toLowerCase()}`,
      desc: `${undone.length} missão(ões) te esperando — recompensa em XP e étoiles.`,
      to: "/",
      priority: 40
    });
  }

  // 5. Alternativas leves
  items.push({
    id: "plan-pronunciation",
    kind: "pronunciation",
    icon: "speaker",
    title: "Treinar pronúncia",
    desc: "24 frases com voz francesa — 5 minutinhos e pronto.",
    to: "/practice/pronunciation",
    priority: 50
  });
  items.push({
    id: "plan-ai",
    kind: "ai",
    icon: "chat",
    title: "Conversar com a Lulu",
    desc: "Simule uma situação real em francês.",
    to: "/ai",
    priority: 60
  });

  if (items.length === 0) {
    items.push({
      id: "plan-done",
      kind: "done",
      icon: "flower",
      title: "Você está em dia!",
      desc: "Aproveite para explorar o mapa ou revisar por conta própria.",
      to: "/map",
      priority: 100
    });
  }

  return items.slice(0, maxItems);
}

export interface MentorInsight {
  icon: IconName;
  title: string;
  text: string;
  to?: string;
}

export function buildMentorInsights(state: StudentState): MentorInsight[] {
  const insights: MentorInsight[] = [];
  const acc = percent(state.exercisesCorrect, state.exercisesTotal);

  // Precisão
  if (state.exercisesTotal > 0) {
    insights.push({
      icon: acc >= 80 ? "starFour" : acc >= 60 ? "flowerTulip" : "leaf",
      title: acc >= 80 ? "Precisão de dar orgulho" : "Precisão em evolução",
      text:
        acc >= 80
          ? `Você acertou ${acc}% dos exercícios. Continua assim, princesa!`
          : `Você acerta ${acc}% por enquanto — normal! Errar é como o cérebro aprende.`,
      to: "/profile"
    });
  }

  // Tópicos fracos
  const weak = weakTopicNodes(state);
  if (weak.length > 0) {
    const nodes = weak
      .slice(0, 2)
      .map((w) => GRAMMAR_TREE.find((g) => g.id === w.nodeId)?.title)
      .filter(Boolean);
    if (nodes.length > 0) {
      insights.push({
        icon: "target",
        title: "Tópicos para fortalecer",
        text: `${nodes.join(" e ")} — vou te dar um treino especial.`,
        to: `/practice/grammar/${weak[0].nodeId}`
      });
    }
  }

  // Streak
  if (state.streak >= 7) {
    insights.push({
      icon: "flame",
      title: `${state.streak} dias seguidos`,
      text: "Consistência é o superpoder do idioma. Estou orgulhosa!",
      to: "/profile"
    });
  }

  // Próximo marco CEFR
  if (state.cefr < 7) {
    const nextBand = state.cefr + 1;
    const world = WORLDS.find((w) => w.lessons.length > 0 && w.unlockCefr === nextBand);
    insights.push({
      icon: "graduationCap",
      title: `Próximo marco: ${CEFR_LABELS[nextBand]}`,
      text: world
        ? `Complete o mundo ${world.title} para alcançar ${CEFR_BAND_NAMES[nextBand]}.`
        : `Continue as aulas para alcançar ${CEFR_BAND_NAMES[nextBand]}.`,
      to: world ? `/world/${world.id}` : "/map"
    });
  }

  // Palavras dominadas
  const mastered = state.reviewQueue.filter((r) => masteryLevel(r) === "dominada").length;
  if (mastered >= 3) {
    insights.push({
      icon: "medal",
      title: `${mastered} palavras dominadas`,
      text: "Essas já estão na memória de longo prazo. O vocabulário cresce!",
      to: "/vocabulary"
    });
  }

  // XP de hoje
  const xpToday = state.dailyProgress[state.lastDailyDate]?.xp ?? 0;
  if (xpToday >= DAILY_XP_GOAL) {
    insights.push({
      icon: "starFour",
      title: "Meta diária batida!",
      text: `${xpToday} XP hoje — além da meta. Hoje é dia de orgulho.`,
      to: "/"
    });
  }

  return insights;
}

export function mentorGreeting(state: StudentState): string {
  const hour = new Date().getHours();
  const base = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const lvl = levelFromXp(state.xp);
  const p = levelProgress(state.xp);
  return `${base}, ${state.name || "amigue"}! Nível ${lvl} (${levelName(lvl)}), a ${p.pct}% do próximo. Vamos planejar seu dia?`;
}

// ── Conselho rápido (mini-chat de estudos) ────────────────────
export interface MentorAdvice {
  icon: IconName;
  text: string;
}

function weakTopicTitles(state: StudentState): string[] {
  return weakTopicNodes(state)
    .slice(0, 2)
    .map((w) => GRAMMAR_TREE.find((g) => g.id === w.nodeId)?.title ?? "um tópico");
}

export function mentorAdvice(state: StudentState, topic: string): MentorAdvice {
  const due = dueItems(state.reviewQueue).length;
  const acc = percent(state.exercisesCorrect, state.exercisesTotal);
  const xpToday = state.dailyProgress[state.lastDailyDate]?.xp ?? 0;
  const weak = weakTopicNodes(state);
  const t = topic.toLowerCase();

  if (/(revis|fixar|lembr)/.test(t)) {
    if (due === 0)
      return {
        icon: "brain",
        text: "Sua fila de revisão está vazia hoje — mas revisar o que você aprendeu dias atrás consolida tudo. Que tal um treino de pronúncia no lugar?"
      };
    return {
      icon: "brain",
      text: `Você tem ${due} palavra(s) te esperando. Faça agora, leva 3 minutinhos: a repetição espaçada é o que mais fortalece a memória. Depois me conta como foi!`
    };
  }
  if (/(gram|trav|dif[ií]cil|erro|confus)/.test(t)) {
    if (weak.length === 0)
      return {
        icon: "flower",
        text: "Sem tópicos fracos detectados até agora — ótimo sinal! Escolha um tópico da árvore de gramática e pratique por curiosidade."
      };
    return {
      icon: "target",
      text: `Percebi que ${weakTopicTitles(state).join(" e ")} têm dado trabalho. Errar faz parte do algoritmo aprender: o treino especial já está no seu plano do dia.`
    };
  }
  if (/(motiv|cans|desist|pregui|parar|sem vontade|to sem)/.test(t)) {
    return {
      icon: "heart",
      text: "Respira. Você não precisa de 2 horas — precisa de 5 minutinhos. Abre uma aula, sente o gostinho e pare se quiser. Voltar amanhã é o que conta."
    };
  }
  if (/(plano|estudar|organiz|rotina|como estudar)/.test(t)) {
    return {
      icon: "compass",
      text: `Estudar pouco e todo dia vence. Hoje você já fez ${xpToday} XP. Minha sugestão: 1 revisão → 1 treino de gramática → 1 aula nova. Deixo tudo pronto no seu plano do dia.`
    };
  }
  if (/(falar|convers|pronunc|ouvir|audio)/.test(t)) {
    return {
      icon: "chatCircleDots",
      text: "Língua se aprende com a boca e o ouvido: ouça a pronúncia e fale em voz alta comparando. Tem 24 frases prontas no treino de pronúncia!"
    };
  }
  return {
    icon: "sparkle",
    text: `Você está com ${acc}% de precisão nos exercícios. Meu conselho: siga o plano do dia — consistência pequena, todo dia, vence qualquer maratona.`
  };
}

export const MENTOR_TIPS: string[] = [
  "Estudar 10 minutinhos todo dia rende mais que 2 horas uma vez por semana.",
  "A repetição espaçada é o segredo: revise antes de esquecer, não depois.",
  "Errar faz parte do algoritmo: cada erro novo é uma revisão futura que acerta.",
  "Fale em voz alta mesmo sozinha — a pronúncia se aprende com a boca.",
  "Troque 10 minutos de rede social por 10 de francês hoje. Seu eu do futuro agradece.",
  "O passado se aprende ouvindo: assista 5 minutos de qualquer coisa em francês por dia.",
  "Você não precisa aprender tudo hoje — precisa aprender um pouquinho hoje.",
  "Combine revisão + aula nova: fixa o velho e avança no novo."
];
