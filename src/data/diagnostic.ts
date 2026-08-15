// ══════════════════════════════════════════════════════════════
// Athenas — Diagnóstico adaptativo
// Começa na banda indicada pelo autodiagnóstico; cada acerto sobe
// de dificuldade, cada erro desce. Ao final, estima-se o CEFR.
// ══════════════════════════════════════════════════════════════
import type { CefrBand, IconName } from "@/types";

export interface DiagQuestion {
  band: CefrBand;
  prompt: string;
  options: string[];
  answer: number;
}

export const SELF_ASSESSMENT: { id: string; label: string; icon: IconName; startBand: CefrBand; note: string }[] = [
  { id: "zero", label: "Nunca estudei", icon: "leaf", startBand: 0, note: "Perfeito! Vamos do zero absoluto, com todo carinho." },
  { id: "pouco", label: "Sei um pouco", icon: "flower", startBand: 1, note: "Ótimo! Vamos descobrir exatamente o que você já sabe." },
  { id: "converso", label: "Consigo conversar", icon: "bowlFood", startBand: 2, note: "Que legal! Vamos afinar o que você já domina." },
  { id: "avancado", label: "Sou avançado", icon: "graduationCap", startBand: 4, note: "Impressionante! Prepare-se para desafios de verdade." },
  { id: "nativo", label: "Sou quase nativo", icon: "crown", startBand: 6, note: "O Modo Deus Supremo te espera." }
];

export const DIAG_QUESTIONS: DiagQuestion[] = [
  // A0
  { band: 0, prompt: "Como se diz 'olá' em francês?", options: ["Merci", "Bonjour", "Au revoir"], answer: 1 },
  { band: 0, prompt: "O que significa 'merci'?", options: ["Por favor", "Obrigado", "Desculpe"], answer: 1 },
  { band: 0, prompt: "Qual é a despedida?", options: ["Salut", "Bonjour", "Au revoir"], answer: 2 },
  { band: 0, prompt: "'Oui' significa…", options: ["Sim", "Não", "Talvez"], answer: 0 },
  // A1
  { band: 1, prompt: "Complete: Je ___ Ana. (chamo-me)", options: ["m'appelle", "suis", "aime"], answer: 0 },
  { band: 1, prompt: "'Trois' é o número…", options: ["2", "3", "5"], answer: 1 },
  { band: 1, prompt: "Qual é o feminino de 'un livre'?", options: ["une livre", "des livres", "un livre (é masculino!)"], answer: 2 },
  { band: 1, prompt: "Complete: Je ___ étudiante.", options: ["suis", "es", "ai"], answer: 0 },
  // A2
  { band: 2, prompt: "Complete: Hier, j'___ mangé une pomme.", options: ["ai", "suis", "as"], answer: 0 },
  { band: 2, prompt: "'Où est la gare ?' pergunta…", options: ["onde fica a estação", "que horas são", "como você se chama"], answer: 0 },
  { band: 2, prompt: "Complete: Nous ___ français.", options: ["sommes", "sont", "avez"], answer: 0 },
  { band: 2, prompt: "'Je vais manger' significa…", options: ["eu comi", "vou comer", "eu como sempre"], answer: 1 },
  // B1
  { band: 3, prompt: "Complete: Si j'avais le temps, je ___ plus.", options: ["voyagerais", "voyage", "voyageais"], answer: 0 },
  { band: 3, prompt: "'Je ne peux pas venir' expressa…", options: ["impossibilidade", "desejo", "obrigação"], answer: 0 },
  { band: 3, prompt: "Complete: Il faut que nous ___ tôt.", options: ["partons", "partions", "partirons"], answer: 1 },
  { band: 3, prompt: "Diferença entre 'savoir' e 'connaître'?", options: ["saber vs conhecer (pessoa/lugar)", "ser vs estar", "ir vs vir"], answer: 0 },
  // B2
  { band: 4, prompt: "Complete: Bien qu'il ___ tard, il continue.", options: ["est", "soit", "sera"], answer: 1 },
  { band: 4, prompt: "Em 'le livre dont je parle', 'dont' refere-se a…", options: ["complemento com de", "complemento com à", "o sujeito"], answer: 0 },
  { band: 4, prompt: "Complete: Si j'avais su, je ___ venu.", options: ["serais", "suis", "aurai"], answer: 0 },
  { band: 4, prompt: "O plus-que-parfait expressa…", options: ["ação anterior a outra no passado", "ação futura", "hábito presente"], answer: 0 },
  // C1
  { band: 5, prompt: "'Il n'en reste plus' significa…", options: ["não sobra mais nenhum", "ele não descansa mais", "ele não vem mais"], answer: 0 },
  { band: 5, prompt: "'T'es où ?' é um registro…", options: ["informal", "formal", "jurídico"], answer: 0 },
  { band: 5, prompt: "Complete: Je me demande ___ il pense.", options: ["ce que", "que", "qui"], answer: 0 },
  { band: 5, prompt: "'Auquel' é a contração de…", options: ["à + lequel", "de + lequel", "avec + lequel"], answer: 0 },
  // C2
  { band: 6, prompt: "'Tu viens, là ?' transmite…", options: ["impaciência/surpresa", "pura curiosidade", "um convite formal"], answer: 0 },
  { band: 6, prompt: "'Faire fi de' significa…", options: ["desprezar", "fazer parte de", "dar importância a"], answer: 0 },
  { band: 6, prompt: "Complete: C'est le livre ___ je t'ai parlé.", options: ["dont", "que", "où"], answer: 0 },
  { band: 6, prompt: "Um 'anacoluto' é…", options: ["uma ruptura sintática", "uma figura de repetição", "um tipo de poema"], answer: 0 }
];

export const DIAG_MAX_QUESTIONS = 10;
export const DIAG_MIN_QUESTIONS = 6;

/** Pega a próxima pergunta de uma banda (evitando repetir as já vistas). */
export function nextQuestionForBand(band: CefrBand, used: number[]): DiagQuestion | null {
  const pool = DIAG_QUESTIONS.filter((q) => q.band === band);
  const fresh = pool.filter((q) => !used.includes(DIAG_QUESTIONS.indexOf(q)));
  const candidates = fresh.length > 0 ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

export function estimateBand(history: number[], correct: number, total: number): CefrBand {
  if (total === 0) return 1;
  const avgBand = history.reduce((a, b) => a + b, 0) / history.length;
  const acc = correct / total;
  // Ajuste: acurácia alta empurra pra cima, baixa pra baixo.
  let est = Math.round(avgBand + (acc - 0.5));
  est = Math.max(0, Math.min(6, est));
  return est as CefrBand;
}
