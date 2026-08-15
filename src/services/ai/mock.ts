// ══════════════════════════════════════════════════════════════
// Athenas — MockProvider: a professora Lulu funciona OFFLINE.
// Detecta intenção da mensagem e responde com conteúdo didático.
// ══════════════════════════════════════════════════════════════
import { sample } from "@/lib/utils";
import { analyzeFrench } from "./corrections";
import type { AIProvider, AIRequestContext } from "./types";

const GREETING_RE = /\b(bonjour|salut|oi|olá|ola|hello|hey|e aí|eai|bom dia|boa noite)\b/i;
const THANKS_RE = /\b(obrigad[oa]?|merci|valeu|thanks)\b/i;

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
    keys: ["si", "oui", "não", "negativa", "negativa"],
    text: "**Oui** responde a pergunta afirmativa: *Tu viens ? — Oui !*\n**Si** responde a pergunta NEGATIVA: *Tu ne viens pas ? — Si !* (sim, eu vou!)\n\nO 'si' é o 'sim' que contraria. Muito francês! "
  },
  {
    keys: ["masculin", "feminin", "gênero", "genero", "genero"],
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

const CONJUGATIONS: Record<string, string> = {
  etre: "ÊTRE (ser/estar): je suis · tu es · il/elle est · nous sommes · vous êtes · ils/elles sont",
  avoir: "AVOIR (ter): j'ai · tu as · il/elle a · nous avons · vous avez · ils/elles ont",
  aller: "ALLER (ir): je vais · tu vas · il/elle va · nous allons · vous allez · ils/elles vont",
  manger: "MANGER (comer): je mange · tu manges · il/elle mange · nous mangeons · vous mangez · ils/elles mangent",
  parler: "PARLER (falar): je parle · tu parles · il/elle parle · nous parlons · vous parlez · ils/elles parlent",
  finir: "FINIR (terminar): je finis · tu finis · il/elle finit · nous finissons · vous finissez · ils/elles finissent"
};

function guessWord(text: string): { fr: string } | null {
  // 1) palavra entre aspas, se houver
  const quoted = text.match(/["“'‘]([a-zàâçéèêëîïôûùüÿœ'-]{2,40})["”'’]/i);
  if (quoted) return { fr: quoted[1] };
  // 2) senão, o último token parecido com palavra
  const tokens = text.match(/[a-zàâçéèêëîïôûùüÿœ'-]{2,40}/gi);
  if (!tokens || tokens.length === 0) return null;
  return { fr: tokens[tokens.length - 1] };
}

function lookupWord(fr: string): string | null {
  // Lookup básico offline (banca pequena embutida)
  const BANK: Record<string, string> = {
    bonjour: "bonjour = olá / bom dia",
    salut: "salut = oi (informal)",
    merci: "merci = obrigado(a)",
    "au revoir": "au revoir = até logo / tchau",
    oui: "oui = sim",
    non: "non = não",
    chat: "chat = gato (masc.)",
    table: "table = mesa (fem.)",
    pain: "pain = pão (masc.)",
    eau: "eau = água (fem.)",
    croissant: "croissant = croissant (masc.)",
    baguette: "baguette = baguete (fem.)",
    fromage: "fromage = queijo (masc.)",
    café: "café = café (masc.)",
    maison: "maison = casa (fem.)",
    livre: "livre = livro (masc.)",
    fille: "fille = menina / filha (fem.)",
    garçon: "garçon = menino / garçom (masc.)",
    mère: "mère = mãe (fem.)",
    père: "père = pai (masc.)",
    soeur: "sœur = irmã (fem.)",
    frere: "frère = irmão (masc.)",
    famille: "famille = família (fem.)",
    ami: "ami = amigo (masc.)",
    amie: "amie = amiga (fem.)",
    école: "école = escola (fem.)",
    métro: "métro = metrô (masc.)",
    gare: "gare = estação (fem.)",
    merci_beaucoup: ""
  };
  const key = fr.toLowerCase().trim();
  return BANK[key] ?? null;
}

export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly label = "Modo offline (Lulu local)";

  ready(): boolean {
    return true;
  }

  async chat(ctx: AIRequestContext): Promise<string> {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
    const last = [...ctx.messages].reverse().find((m) => m.role === "user");
    if (!last) return this.intro(ctx);
    return this.answer(last.content);
  }

  private intro(ctx: AIRequestContext): string {
    const name = /Nome: ([^\n]+)/.exec(ctx.system)?.[1] ?? "amigue";
    return `Bonjour, ${name.trim()} !  Eu sou a Lulu, sua professora de francês da Athenas. \n\nPode me perguntar qualquer coisa: significados, conjugações, diferenças entre palavras, correções… ou me pedir um mini exercício!\n\nPor onde começamos ?`;
  }

  private answer(text: string): string {
    const t = text.toLowerCase();

    const isQuestion = /significa|o que é|o que e|como se diz|traduz|diferença|diferenca|conjuga|conjugar|exerc/.test(t);
    if (GREETING_RE.test(t) && !isQuestion) {
      return `Bonjour bonjour !  Que alegria te ver por aqui!\n\n${sample(TIPS)}`;
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
      const verb = Object.keys(CONJUGATIONS).find((v) => t.includes(v));
      if (verb) return CONJUGATIONS[verb] + "\n\nQuer que eu monte frases de exemplo? ";
      return `Me diz o verbo (ex.: "conjuga être") que eu te mostro a tabela completa! `;
    }
    if (t.includes("gênero") || t.includes("genero") || t.includes("masculin") || t.includes("feminin")) {
      return DIFFERENCES.find((d) => d.keys.some((k) => t.includes(k)))!.text;
    }
    if (t.includes("traduz") || t.includes("como se diz") || t.includes("como é")) {
      const g = guessWord(text);
      if (g) {
        const hit = lookupWord(g.fr);
        if (hit) return `"${g.fr}" → ${hit.split("=")[1]?.trim() ?? ""}\n\nQuer ouvir a pronúncia? Temos o botão de áudio nas aulas! `;
      }
      return `Hmm, essa eu ainda não tenho no meu caderninho offline…  Mas me escreve a palavra em francês que eu tento, ou pergunta para a Lulu online (configura a chave do Ollama nas Configurações)!`;
    }
    if (t.includes("significa") || t.includes("o que é") || t.includes("o que e")) {
      const g = guessWord(text);
      if (g) {
        const hit = lookupWord(g.fr);
        if (hit) {
          const [, pt] = hit.split("=");
          return `"${g.fr}" significa "${pt?.trim()}". \n\nDica: aprenda sempre com o artigo — assim o gênero fica guardado! (ex.: "une table" )`;
        }
      }
      return `Me passa a palavra exata (ex.: "o que significa 'bonjour'?") que eu explico com exemplo! `;
    }
    if (t.includes("exemplo")) {
      return `Claro! \n\nExemplos do dia a dia:\n• Bonjour, comment ça va ? (Olá, como vai?)\n• Je voudrais un café, s'il vous plaît. (Eu gostaria de um café, por favor.)\n• On se voit demain ? (A gente se vê amanhã?)\n\nQuer que eu explique alguma dessas frases? `;
    }
    if (t.includes("exerc") || t.includes("quiz") || t.includes("test")) {
      return `Bora treinar! \n\n1) Como se diz "obrigado"?  → merci\n2) Complete: "Je ___ une pomme." (eu como) → mange\n3) "J'ai faim" significa… → estou com fome\n\nMe responde aí e eu corrijo! `;
    }
    if (t.includes("pronúncia") || t.includes("pronuncia") || t.includes("fonética") || t.includes("fonetica")) {
      return `Dicas de pronúncia: \n• O 'r' francês é gutural, suave — como se estivesse gargarejando de leve.\n• 'u' é com lábios em "u" mas língua em "i" (não é o nosso "u"!)\n• Consoantes finais geralmente não soam: "petit" → "p'ti".\n\nNas aulas de listening tem áudio real (Web Speech API) para treinar o ouvido! `;
    }
    if (t.includes("plano de aula") || t.includes("aula") && t.includes("professor")) {
      return `Aqui vai um mini plano de aula (nível A1): \n\n**Objetivo:** cumprimentar e se apresentar.\n1. Aquecimento: ouvir "Bonjour !" e repetir (3x).\n2. Vocabulário: bonjour, salut, je m'appelle, enchanté(e).\n3. Gramática: pronomes je/tu + verbo être.\n4. Prática: aluno se apresenta em voz alta.\n5. Desafio: mini diálogo com a Lulu no modo Conversa!\n\nQuer outro tema? Me pede! `;
    }

    // Conteúdo em francês? Tenta correção natural.
    const hasFrenchChars = /[àâçéèêëîïôûùüÿœ]/.test(text);
    if (hasFrenchChars) return this.correctSentence(text);

    return `${sample(TIPS)}\n\nMe conta o que você quer estudar hoje: significado de uma palavra, conjugação, diferença entre duas palavras, correção de frase… ou um mini exercício! `;
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
