// ══════════════════════════════════════════════════════════════
// Athenas — MockProvider: a professora Lulu funciona OFFLINE.
// Detecta intenção da mensagem e responde com conteúdo didático,
// consultando o banco completo de vocabulário do app.
// ══════════════════════════════════════════════════════════════
import { sample } from "@/lib/utils";
import { WORDS } from "@/data/words";
import type { WordEntry } from "@/types";
import { analyzeFrench } from "./corrections";
import type { AIProvider, AIRequestContext } from "./types";

const GREETING_RE = /\b(bonjour|salut|oi|olá|ola|hello|hey|e aí|eai|bom dia|boa noite)\b/i;
const THANKS_RE = /\b(obrigad[oa]?|merci|valeu|thanks)\b/i;

// ── Índice de vocabulário (banco completo do app, sem acento) ──
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[’']/g, " ")
    .replace(/-/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const WORD_INDEX: { key: string; fr: string; pt: string; entry: WordEntry }[] = WORDS.map((entry) => ({
  key: norm(entry.fr),
  fr: entry.fr,
  pt: entry.pt,
  entry
}));

// Conjugações (irregulares à mão + regulares em -er)
const CONJUGATIONS: Record<string, string[]> = {
  "être": ["suis", "es", "est", "sommes", "êtes", "sont"],
  "avoir": ["ai", "as", "a", "avons", "avez", "ont"],
  "aller": ["vais", "vas", "va", "allons", "allez", "vont"],
  "faire": ["fais", "fais", "fait", "faisons", "faites", "font"],
  "dire": ["dis", "dis", "dit", "disons", "dites", "disent"],
  "savoir": ["sais", "sais", "sait", "savons", "savez", "savent"],
  "pouvoir": ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"],
  "vouloir": ["veux", "veux", "veut", "voulons", "voulez", "veulent"],
  "devoir": ["dois", "dois", "doit", "devons", "devez", "doivent"],
  "prendre": ["prends", "prends", "prend", "prenons", "prenez", "prement"],
  "comprendre": ["comprends", "comprends", "comprend", "comprenons", "comprenez", "comprennent"],
  "boire": ["bois", "bois", "boit", "buvons", "buvez", "boivent"],
  "dormir": ["dors", "dors", "dort", "dormons", "dormez", "dorment"],
  "finir": ["finis", "finis", "finit", "finissons", "finissez", "finissent"],
  "réussir": ["réussis", "réussis", "réussit", "réussissons", "réussissez", "réussissent"],
  "s'appeler": ["m'appelle", "t'appelles", "s'appelle", "nous appelons", "vous appelez", "s'appellent"],
  "parler": ["parle", "parles", "parle", "parlons", "parlez", "parlent"],
  "manger": ["mange", "manges", "mange", "mangeons", "mangez", "mangent"],
  "aimer": ["aime", "aimes", "aime", "aimons", "aimez", "aiment"],
  "habiter": ["habite", "habites", "habite", "habitons", "habitez", "habitent"],
  "chercher": ["cherche", "cherches", "cherche", "cherchons", "cherchez", "cherchent"],
  "répondre": ["réponds", "réponds", "répond", "répondons", "répondez", "répondent"],
  "attendre": ["attends", "attends", "attend", "attendons", "attendez", "attendent"],
  "payer": ["paie", "paies", "paie", "payons", "payez", "paient"],
  "visiter": ["visite", "visites", "visite", "visitons", "visitez", "visitent"],
  "aider": ["aide", "aides", "aide", "aidons", "aidez", "aident"],
  "préférer": ["préfère", "préfères", "préfère", "préférons", "préférez", "préfèrent"],
  "adorer": ["adore", "adores", "adore", "adorons", "adorez", "adorent"]
};

const FORM_INDEX: { form: string; verb: string }[] = Object.entries(CONJUGATIONS).flatMap(([verb, forms]) =>
  forms.map((f) => ({ form: norm(f), verb }))
);

const PRONOUNS = ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];

function conjugationLine(verb: string): string {
  const forms = CONJUGATIONS[verb];
  return `${verb.toUpperCase()}: ${forms.map((f, i) => `${PRONOUNS[i]} ${f}`).join(" · ")}`;
}

function lookupFr(q: string): WordEntry | null {
  const key = norm(q);
  if (!key) return null;
  const exact = WORD_INDEX.find((w) => w.key === key);
  if (exact) return exact.entry;
  // palavra dentro de uma expressão (ex.: "gare" dentro de "à gauche"? não — procura a palavra sozinha)
  if (key.length >= 3) {
    const partial = WORD_INDEX.find((w) => w.key.includes(key));
    if (partial) return partial.entry;
  }
  return null;
}

function lookupPt(q: string): WordEntry | null {
  const key = norm(q);
  if (!key) return null;
  const exact = WORD_INDEX.find((w) => norm(w.pt) === key);
  if (exact) return exact.entry;
  if (key.length >= 3) {
    const contains = WORD_INDEX.find((w) => norm(w.pt).includes(key));
    if (contains) return contains.entry;
    const contained = WORD_INDEX.find((w) => norm(w.pt).length >= 3 && key.includes(norm(w.pt)));
    if (contained) return contained.entry;
  }
  return null;
}

function lookupAny(q: string): { entry: WordEntry; side: "fr" | "pt" } | null {
  const fr = lookupFr(q);
  if (fr) return { entry: fr, side: "fr" };
  const pt = lookupPt(q);
  if (pt) return { entry: pt, side: "pt" };
  return null;
}

function lookupForm(q: string): { form: string; verb: string } | null {
  const key = norm(q);
  return FORM_INDEX.find((f) => f.form === key) ?? null;
}

function formatLookup(res: { entry: WordEntry; side: "fr" | "pt" }): string {
  const { entry, side } = res;
  const line =
    side === "fr"
      ? `"${entry.fr}" significa "${entry.pt}".`
      : `"${entry.pt}" em francês é "${entry.fr}".`;
  const gender = entry.gender ? (entry.gender === "f" ? " (feminino) 🌸" : " (masculino) 🌿") : "";
  const example = entry.exampleFr ? `\n\nExemplo: ${entry.exampleFr}${entry.examplePt ? ` — ${entry.examplePt}` : ""}` : "";
  return `${line}${gender}${example}\n\nQuer ouvir a pronúncia? Temos o botão de áudio nas aulas! 🔊`;
}

function formatForm(f: { form: string; verb: string }): string {
  return `"${f.form}" é uma forma do verbo ${f.verb}.\n\n${conjugationLine(f.verb)}`;
}

// Extrai a palavra/frase que o usuário quer saber
function extractQuery(raw: string): string | null {
  const text = raw.toLowerCase();
  const quoted = text.match(/["“'‘]([^"”'‘]{1,40})["”'’]/);
  if (quoted) return quoted[1].trim();
  const lang = text.match(/([\wà-ÿ' -]{2,30})\s+em\s+(franc[eê]s|portugu[eê]s)/);
  if (lang) {
    return lang[1]
      .replace(/\b(como se (diz|fala|escreve)|como é que se (diz|fala)|traduz|traduza|diga|fala|qual é|qual e|o que é|o que e|significa|quer dizer|para)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const cleaned = text
    .replace(/\b(como se (diz|fala|escreve)|como é que se (diz|fala)|traduz|traduza|diga|fala|significa|o que é|o que e|quer dizer|em franc[eê]s|em portugu[eê]s|para o franc[eê]s|para o portugu[eê]s|por favor|me explica|explique|qual é|qual e)\b/g, " ")
    .replace(/[^a-zà-ÿ' -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  const LEAD = /^(o|a|os|as|um|uma|de|do|da|que|é|e|em|no|na|para|por|me|se|diz|fala|significa|traduz|quero|eu|gostaria)$/;
  const TRAIL = /^(o|a|os|as|um|uma|de|do|da|que|é|e|em|no|na|para|por|muito|aqui|hoje|ainda|pode|pf|por)$/;
  while (words.length && LEAD.test(words[0])) words.shift();
  while (words.length && TRAIL.test(words[words.length - 1])) words.pop();
  return words.join(" ").trim() || null;
}

const DIFFERENCES: { keys: string[]; text: string }[] = [
  {
    keys: ["savoir", "connaitre", "conhecer"],
    text: "Ótima pergunta! \n\n**Savoir** = saber um FATO ou uma habilidade: *Je sais parler français* (sei falar francês).\n**Connaître** = conhecer PESSOA, LUGAR ou COISA (familiaridade): *Je connais Paris*.\n\nMini teste: «Je ___ très bien cette chanson.» → connais (familiaridade)! "
  },
  {
    keys: ["etre", "avoir", "ser", "estar", "ter"],
    text: "Être e avoir são os dois pilares! \n\n**Être** (ser/estar): je suis, tu es, il est, nous sommes, vous êtes, ils sont.\n**Avoir** (ter): j'ai, tu as, il a, nous avons, vous avez, ils ont.\n\nRegrinha: fome, sede, idade e frio/calor usam AVOIR — *j'ai faim*, *j'ai 25 ans*. "
  },
  {
    keys: ["tu", "vous", "formal"],
    text: "**Tu** = informal (amigos, família, crianças, colegas).\n**Vous** = formal OU plural (estranhos, chefe, pessoa mais velha, várias pessoas).\n\nNa dúvida, use *vous* — é sempre respeitoso. E o verbo concorda: *Tu vas* / *Vous allez*. "
  },
  {
    keys: ["passé", "compose", "imparfait", "pretérito", "passado"],
    text: "Os dois passados mais importantes:\n\n**Passé composé** = ação pontual, concluída: *Hier, j'ai mangé une pizza*.\n**Imparfait** = hábito, descrição, cenário: *Quand j'étais petit, je mangeais des pizzas*.\n\nMental: composé = «foto da ação», imparfait = «filme de fundo». "
  },
  {
    keys: ["an", "année", "ano"],
    text: "Nuance fofa: **an** = ponto no tempo (idade, datas): *J'ai 25 ans*.\n**Année** = duração (o ano inteiro): *toute l'année* (o ano todo).\n\nÉ a mesma diferença de jour/journée e soir/soirée: ponto vs duração. "
  },
  {
    keys: ["si", "oui", "não", "negativa"],
    text: "**Oui** responde a pergunta afirmativa: *Tu viens ? — Oui !*\n**Si** responde a pergunta NEGATIVA: *Tu ne viens pas ? — Si !* (sim, eu vou!)\n\nO 'si' é o 'sim' que contraria. Muito francês! "
  },
  {
    keys: ["masculin", "feminin", "gênero", "genero"],
    text: "O gênero dos substantivos é a 'alma' do francês! \n\nDicas: termina em **-e**? Muitas vezes feminino (*la table, la maison*)… mas CUIDADO: *le livre, le musée, le problème* são masculinos!\n\nSempre aprenda a palavra COM o artigo: *un livre*, *une table*. Assim o cérebro guarda o gênero junto. "
  }
];

const TIPS = [
  "Dica do dia: aprenda palavras com o artigo junto — 'une table', não 'table'. O gênero gruda na memória! ",
  "Dica do dia: em conversa, o 'ne' da negação costuma sumir: 'Je sais pas' é super natural. ",
  "Dica do dia: 'Enchantée !' é o 'prazer em conhecer' — responda sempre com um sorriso. ",
  "Dica do dia: para pedir algo educadamente: 'Je voudrais…, s'il vous plaît'. ",
  "Dica do dia: fome e sede usam avoir: j'ai faim, j'ai soif. ",
  "Dica do dia: 'Ça va ?' é 'tudo bem?' — responda 'Ça va bien, et toi ?' "
];

const GREETINGS = [
  "Bonjour bonjour !  Que alegria te ver por aqui!\n\n",
  "Salut !  Bom te ver de novo — bora praticar um pouquinho?\n\n",
  "Enchantée de te voir !  Como vai o francês hoje?\n\n"
];

const FALLBACKS = [
  "Me conta o que você quer estudar hoje: significado de uma palavra, conjugação, diferença entre duas, correção de frase… ou um mini exercício! ",
  "Pode me perguntar qualquer coisa do francês — palavra, verbo, pronúncia — ou pedir um exercício que a gente treina juntos! ",
  "Estou aqui para te ajudar! Pergunta uma palavra que você viu por aí, ou me manda uma frase para eu corrigir. ",
  "Hmm, deixa eu te ajudar melhor: escreve a palavra exata entre aspas (ex.: \"o que significa 'bonjour'?\") que eu explico direitinho! "
];

const QUIZZES: { q: string; a: string; hint: string }[] = [
  { q: "Como se diz \"obrigado(a)\" em francês?", a: "merci", hint: "Começa com 'm'…" },
  { q: "E \"tudo bem?\" (informal), como é?", a: "ça va", hint: "É aquela que a gente já viu na primeira aula 😉" },
  { q: "Como se pergunta \"como você se chama?\" em francês?", a: "comment tu t'appelles", hint: "Começa com 'Comment'…" },
  { q: "Traduza \"eu gosto de chocolate\" para o francês.", a: "j'aime le chocolat", hint: "Gostar = aimer. Começa com 'J'…" },
  { q: "Agora uma com verbo: \"eu tenho 25 anos\", em francês.", a: "j'ai 25 ans", hint: "Idade usa AVOIR. Começa com 'J'…" },
  { q: "Como se diz \"bom dia\" em francês?", a: "bonjour", hint: "Começa com 'b' e tem 'jour' no meio…" }
];

// Pergunta sempre com o mesmo marcador, para a Lulu reconhecer a continuação
function quizPrompt(quiz: { q: string; hint: string }): string {
  return `Perguntinha: ${quiz.q}\n\nDica: ${quiz.hint}`;
}

function matchesAnswer(userText: string, answer: string): boolean {
  const t = norm(userText);
  const tokens = norm(answer).split(" ").filter((w) => w.length > 1);
  return tokens.length > 0 && tokens.every((w) => t.includes(w));
}

export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly label = "Modo offline (Lulu local)";

  ready(): boolean {
    return true;
  }

  async chat(ctx: AIRequestContext): Promise<string> {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
    const msgs = ctx.messages;
    const lastIdx = [...msgs].reverse().findIndex((m) => m.role === "user");
    if (lastIdx === -1) return this.intro(ctx);
    const last = msgs[msgs.length - 1 - lastIdx];
    let prevLulu: string | undefined;
    for (let i = msgs.length - 2 - lastIdx; i >= 0; i--) {
      if (msgs[i].role === "assistant") {
        prevLulu = msgs[i].content;
        break;
      }
    }
    return this.answer(last.content, prevLulu);
  }

  private intro(ctx: AIRequestContext): string {
    const name = /Nome: ([^\n]+)/.exec(ctx.system)?.[1] ?? "amigue";
    return `Bonjour, ${name.trim()} !  Eu sou a Lulu, sua professora de francês da Athenas. \n\nPode me perguntar qualquer coisa: significados, conjugações, diferenças entre palavras, correções… ou me pedir um mini exercício!\n\nPor onde começamos ?`;
  }

  private answer(text: string, prevLulu?: string): string {
    const t = text.toLowerCase();

    // 1) Continuação de mini-pergunta (conversa de verdade).
    //    Só trata como resposta se a mensagem PARECER resposta (curta e
    //    sem pergunta) — senão a pessoa fez outra pergunta e a Lulu
    //    responde de verdade em vez de repetir o quiz.
    const looksLikeAnswer = !/[?¿]/.test(text) && t.split(/\s+/).length <= 8 && !/\b(como|o que|o que e|qual|por que|porque|pode|me ajuda|duvida|significa|conjuga|traduz|exerc|aula|dica)\b/.test(t);
    if (prevLulu && prevLulu.includes("Perguntinha:") && looksLikeAnswer) {
      const quiz = QUIZZES.find((q) => prevLulu.includes(q.q));
      if (quiz) {
        if (/pular|pula|não sei|nao sei|desisto|passo/.test(t)) {
          const next = QUIZZES[(QUIZZES.indexOf(quiz) + 1) % QUIZZES.length];
          return `Sem problema!  A resposta era "${quiz.a}".\n\n${quizPrompt(next)}`;
        }
        if (matchesAnswer(text, quiz.a)) {
          const next = QUIZZES[(QUIZZES.indexOf(quiz) + 1) % QUIZZES.length];
          return `Bravo ! 🎉  Exatamente: "${quiz.a}"!\n\n${quizPrompt(next)}`;
        }
        return `Quase!  Tenta de novo…\n\n${quizPrompt(quiz)}  (ou me manda "pular" para a próxima)`;
      }
    }

    const isQuestion = /significa|o que é|o que e|como se diz|traduz|diferença|diferenca|conjuga|conjugar|exerc/.test(t);
    if (GREETING_RE.test(t) && !isQuestion) {
      return `${sample(GREETINGS)}${sample(TIPS)}`;
    }
    if (THANKS_RE.test(t)) {
      return "Avec plaisir !  Foi um prazer ajudar. Sempre que quiser, estou aqui — e lembra: praticar um pouquinho todo dia vale mais que muito de uma vez. ";
    }
    if (t.includes("corrig") || t.includes("corrija") || t.includes("frase") || t.includes("phrase")) {
      return this.correctSentence(text);
    }
    if (t.includes("diferença") || t.includes("diferenca") || t.includes("diferen") || t.includes("vs")) {
      const diff = DIFFERENCES.find((d) => d.keys.some((k) => t.includes(k)));
      if (diff) return diff.text;
      return `Depende do que você quer comparar!  Me conta as duas palavras (ex.: "diferença entre savoir e connaître") que eu te explico com exemplos.`;
    }
    if (t.includes("conjuga") || t.includes("conjugar")) {
      const nt = norm(t);
      const verb = Object.keys(CONJUGATIONS).find((v) => nt.includes(norm(v)));
      if (verb) return `${conjugationLine(verb)}\n\nQuer que eu monte frases de exemplo? `;
      return `Me diz o verbo (ex.: "conjuga être") que eu te mostro a tabela completa! `;
    }
    if (t.includes("gênero") || t.includes("genero") || t.includes("masculin") || t.includes("feminin")) {
      return DIFFERENCES.find((d) => d.keys.some((k) => t.includes(k)))!.text;
    }
    if (t.includes("pronúncia") || t.includes("pronuncia") || t.includes("fonética") || t.includes("fonetica")) {
      return `Dicas de pronúncia: \n• O 'r' francês é gutural, suave — como se estivesse gargarejando de leve.\n• 'u' é com lábios em "u" mas língua em "i" (não é o nosso "u"!)\n• Consoantes finais geralmente não soam: "petit" → "p'ti".\n\nNas aulas tem áudio real para treinar o ouvido! `;
    }
    if (t.includes("plano de aula") || (t.includes("aula") && t.includes("professor"))) {
      return `Aqui vai um mini plano de aula (nível A1): \n\n**Objetivo:** cumprimentar e se apresentar.\n1. Aquecimento: ouvir "Bonjour !" e repetir (3x).\n2. Vocabulário: bonjour, salut, je m'appelle, enchanté(e).\n3. Gramática: pronomes je/tu + verbo être.\n4. Prática: aluno se apresenta em voz alta.\n5. Desafio: mini diálogo com a Lulu no modo Conversa!\n\nQuer outro tema? Me pede! `;
    }
    if (t.includes("exerc") || t.includes("quiz") || t.includes("test")) {
      const quiz = sample(QUIZZES);
      return `Bora treinar um pouquinho! 💪\n\n${quizPrompt(quiz)}`;
    }
    if (/significa|o que é|o que e|quer dizer|traduz|traduza|como se (diz|fala|escreve)|como é que se|em (franc[eê]s|portugu[eê]s)/.test(t)) {
      const q = extractQuery(text);
      if (q) {
        const hit = lookupAny(q);
        if (hit) return formatLookup(hit);
        const form = lookupForm(q);
        if (form) return formatForm(form);
      }
      return `Hmm, essa palavra ainda não está no meu caderninho offline…  Me escreve exatamente como está no app (ex.: "o que significa 'bonjour'?"), ou pergunta com outra palavra!`;
    }

    // Mensagem curta = provável consulta de palavra ("table?", "bonjour")
    const tokens = text.trim().split(/\s+/);
    if (tokens.length <= 3) {
      const hit = lookupAny(text.trim());
      if (hit) return formatLookup(hit);
      const form = lookupForm(text.trim());
      if (form) return formatForm(form);
    }

    // Conteúdo em francês? Tenta correção natural.
    const hasFrenchChars = /[àâçéèêëîïôûùüÿœ]/.test(text);
    if (hasFrenchChars) return this.correctSentence(text);

    return `${sample(FALLBACKS)}`;
  }

  private correctSentence(text: string): string {
    const res = analyzeFrench(text);
    if (res.suggestion && res.suggestion !== res.original) {
      return `Quase!  A ideia está certa, mas temos um pequeno detalhe:\n\n Você escreveu: "${res.original}"\n Mais natural: "${res.suggestion}"\n\n${res.note}`;
    }
    if (!res.isNatural) return res.note;
    return `${res.note}\n\nE se quiser, me manda outra frase que eu analiso também! `;
  }
}
