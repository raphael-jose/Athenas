// ══════════════════════════════════════════════════════════════
// Athenas — Banco de exercícios de gramática (por tópico)
// Cada nó da árvore de gramática pode ter exercícios de prática.
// ══════════════════════════════════════════════════════════════
import type { Exercise } from "@/types";

export const GRAMMAR_PRACTICE: Record<string, Exercise[]> = {
  "g-pronoms": [
    { kind: "choice", prompt: "Qual pronome substitui 'Maria'?", options: ["elle", "il", "nous"], answer: 0, explanation: "Maria é feminino → elle." },
    { kind: "fillBlank", prompt: "___ es brésilien ? (você, informal)", answer: "Tu", accept: ["tu"], explanation: "Tu = você (informal)." },
    { kind: "choice", prompt: "'Nous' significa…", options: ["nós", "vocês", "ele"], answer: 0 },
    { kind: "fillBlank", prompt: "___ parlons français. (nós)", answer: "Nous", accept: ["nous"], explanation: "Nous + verbo na 1ª pessoa do plural." }
  ],
  "g-articles": [
    { kind: "choice", prompt: "Qual o artigo definido de 'livre'?", options: ["le", "la", "les"], answer: 0, explanation: "livre é masculino: le livre." },
    { kind: "fillBlank", prompt: "___ table (a mesa)", answer: "La", accept: ["la"], explanation: "table é feminino: la table." },
    { kind: "choice", prompt: "Plural de 'un chat'?", options: ["des chats", "un chats", "la chats"], answer: 0 },
    { kind: "fillBlank", prompt: "___ école (a escola)", answer: "L'", accept: ["l'", "L’"], explanation: "Vogal + vogal: l'école (elidido)." }
  ],
  "g-genre": [
    { kind: "choice", prompt: "Qual é FEMININO?", options: ["le problème", "la gare", "le musée"], answer: 1, explanation: "la gare é feminino; problème e musée são masculinos (exceções)." },
    { kind: "fillBlank", prompt: "___ fille (uma menina)", answer: "Une", accept: ["une"], explanation: "fille é feminino → une." },
    { kind: "fillBlank", prompt: "___ garçon (um menino)", answer: "Un", accept: ["un"], explanation: "garçon é masculino → un." },
    { kind: "choice", prompt: "Termina em -e. Na maioria dos casos é…", options: ["feminino", "masculino", "plural"], answer: 0, explanation: "Regra geral: -e → feminino (mas cuidado com exceções como 'le livre')." }
  ],
  "g-etre": [
    { kind: "fillBlank", prompt: "Je ___ (être) étudiante.", answer: "suis", explanation: "je suis." },
    { kind: "choice", prompt: "Complete a frase: Elle ___ française.", options: ["est", "es", "sont"], answer: 0 },
    { kind: "fillBlank", prompt: "Nous ___ (être) contents.", answer: "sommes", accept: ["sommes"], explanation: "nous sommes." },
    { kind: "choice", prompt: "Complete a frase: Ils ___ à Paris.", options: ["sont", "sommes", "est"], answer: 0 }
  ],
  "g-avoir": [
    { kind: "fillBlank", prompt: "J'___ (avoir) un chat.", answer: "ai", accept: ["ai"], explanation: "j'ai." },
    { kind: "choice", prompt: "Complete a frase: Tu ___ 20 ans.", options: ["as", "es", "a"], answer: 0 },
    { kind: "fillBlank", prompt: "Elle ___ (avoir) soif.", answer: "a", accept: ["a"], explanation: "il/elle a." },
    { kind: "choice", prompt: "Como se diz 'estou com fome'?", options: ["J'ai faim", "Je suis faim", "Je suis faim"], answer: 0, explanation: "Fome/sede usam AVOIR." }
  ],
  "g-present": [
    { kind: "fillBlank", prompt: "Je ___ (manger) une pomme.", answer: "mange", explanation: "je mange (verbo -er)." },
    { kind: "choice", prompt: "Complete a frase: Tu ___ (parler) bien.", options: ["parles", "parle", "parlez"], answer: 0, explanation: "com tu: -es." },
    { kind: "choice", prompt: "Complete a frase: Elle ___ (aimer) le chocolat.", options: ["aime", "aimes", "aimons"], answer: 0 },
    { kind: "fillBlank", prompt: "Nous ___ (habiter) à Paris.", answer: "habitons", accept: ["habitons"], explanation: "nous habitons." }
  ],
  "g-negation": [
    { kind: "fillBlank", prompt: "Je ___ suis pas fatigué. (não)", answer: "ne", accept: ["ne"], explanation: "ne… pas." },
    { kind: "sentenceBuilder", prompt: "Monte: 'Eu não gosto de café.'", words: ["Je", "n'aime", "pas", "le", "café", "."], answer: ["Je", "n'aime", "pas", "le", "café", "."] },
    { kind: "choice", prompt: "Na fala informal, o que costuma sumir?", options: ["o 'ne'", "o 'pas'", "o verbo"], answer: 0, explanation: "Je sais pas — super natural!" },
    { kind: "fillBlank", prompt: "Tu n'___ pas le chocolat ? (não gostas)", answer: "aimes", accept: ["aime pas"], explanation: "tu n'aimes pas." }
  ],
  "g-passe-compose": [
    { kind: "fillBlank", prompt: "Hier, j'___ mangé une pizza.", answer: "ai", accept: ["ai"], explanation: "passé composé = avoir + particípio." },
    { kind: "choice", prompt: "Complete a frase: Tu ___ parlé avec Marie.", options: ["as", "es", "a"], answer: 0 },
    { kind: "fillBlank", prompt: "Elle a ___ (finir) son travail.", answer: "fini", accept: ["fini"], explanation: "verbo -ir → -i." },
    { kind: "translation", prompt: "Ontem, eu comi uma pizza.", answer: "Hier, j'ai mangé une pizza.", accept: ["Hier j'ai mangé une pizza"], explanation: "Hier + passé composé." }
  ],
  "g-imparfait": [
    { kind: "fillBlank", prompt: "Quand j'___ petit, je mangeais des pizzas.", answer: "étais", accept: ["étais"], explanation: "imparfait de être: j'étais." },
    { kind: "choice", prompt: "O imparfait descreve…", options: ["hábitos e cenários do passado", "ações pontuais", "o futuro"], answer: 0 },
    { kind: "fillBlank", prompt: "Nous ___ (habiter) à Lyon avant.", answer: "habitions", accept: ["habitions"], explanation: "nous habitions." }
  ],
  "g-futur": [
    { kind: "fillBlank", prompt: "Je ___ (aller) manger.", answer: "vais", accept: ["vais"], explanation: "futur proche: aller + infinitivo." },
    { kind: "choice", prompt: "'On va voir' significa…", options: ["a gente vai ver", "a gente viu", "a gente vai embora"], answer: 0 },
    { kind: "fillBlank", prompt: "Tu ___ (aller) partir demain.", answer: "vas", accept: ["vas"], explanation: "tu vas partir." }
  ],
  "g-conditionnel": [
    { kind: "fillBlank", prompt: "Je ___ (voudrais) un café.", answer: "voudrais", accept: ["voudrais"], explanation: "je voudrais = eu gostaria (educado)." },
    { kind: "choice", prompt: "Complete a frase: Si j'avais le temps, je ___ voyager.", options: ["pourrais", "peux", "pourrai"], answer: 0, explanation: "condicional: je pourrais." },
    { kind: "fillBlank", prompt: "Tu ___ (devrais) étudier plus.", answer: "devrais", accept: ["devrais"], explanation: "tu devrais = você deveria." },
    { kind: "choice", prompt: "O conditionnel de 'aller' (eu iria) é…", options: ["j'irais", "j'allais", "j'irai"], answer: 0, explanation: "aller é irregular no conditionnel: j'irais." },
    { kind: "fillBlank", prompt: "Je ___ (être, conditionnel) très content.", answer: "serais", accept: ["serais"], explanation: "je serais = eu seria/estaria." },
    { kind: "choice", prompt: "Conditionnel passé: 'j'aurais pu' significa…", options: ["eu teria podido", "eu posso", "eu poderia (agora)"], answer: 0, explanation: "aurais + particípio = condicional passado." },
    { kind: "fillBlank", prompt: "On ___ (devoir, cond. passé) partir plus tôt.", answer: "aurait dû", accept: ["aurait du", "on aurait dû"], explanation: "on aurait dû = a gente deveria ter." }
  ],
  "g-subjonctif": [
    { kind: "fillBlank", prompt: "Il faut que tu ___ (partir) tôt.", answer: "partes", accept: ["partes"], explanation: "subjonctif de partir: que tu partes." },
    { kind: "choice", prompt: "Complete a frase: Bien qu'il ___ tard…", options: ["soit", "est", "sera"], answer: 0, explanation: "bien que + subjonctif: qu'il soit." },
    { kind: "fillBlank", prompt: "Il faut que nous ___ (finir).", answer: "finissions", accept: ["finissions"], explanation: "que nous finissions." }
  ],
  "g-plus-que-parfait": [
    { kind: "choice", prompt: "O plus-que-parfait expressa…", options: ["ação anterior a outra no passado", "ação futura", "hábito presente"], answer: 0 },
    { kind: "fillBlank", prompt: "J'___ (avoir) mangé avant de partir.", answer: "avais", accept: ["avais"], explanation: "j'avais mangé." },
    { kind: "choice", prompt: "Complete a frase: Elle ___ déjà fini quand je suis arrivé.", options: ["avait", "a", "avais"], answer: 0 },
    { kind: "fillBlank", prompt: "J'___ (avoir) oublié mes clés à la maison.", answer: "avais", accept: ["avais"], explanation: "j'avais oublié = eu tinha esquecido." },
    { kind: "choice", prompt: "Complete a frase: Ils étaient ___ (partir) avant la pluie.", options: ["partis", "parti", "partie"], answer: 0, explanation: "être + particípio concorda: ils étaient partis." },
    { kind: "fillBlank", prompt: "Elle n'___ jamais visité Paris avant.", answer: "avait", accept: ["avait"], explanation: "elle n'avait jamais visité." }
  ],
  "g-hypotheses": [
    { kind: "choice", prompt: "Hipótese imaginária: Si j'avais le temps, je ___ plus.", options: ["voyagerais", "voyagerai", "voyageais"], answer: 0, explanation: "si + imparfait → conditionnel." },
    { kind: "fillBlank", prompt: "Si tu étudi___ plus, tu réussirais. (estudasses)", answer: "étudiais", accept: ["étudiais"], explanation: "si + imparfait: tu étudiais." },
    { kind: "choice", prompt: "Hipótese irreal no passado: Si j'avais su, je ___ venu.", options: ["serais", "suis", "serai"], answer: 0, explanation: "si + plus-que-parfait → conditionnel passé." },
    { kind: "fillBlank", prompt: "Si j'étais riche, j'___ (acheter, cond.) une maison.", answer: "achèterais", accept: ["acheterais", "achèterais"], explanation: "j'achèterais = eu compraria." },
    { kind: "choice", prompt: "O que vem depois de 'si' na hipótese do presente?", options: ["o imparfait", "o conditionnel", "o futuro"], answer: 0, explanation: "si + imparfait → conditionnel na outra oração." },
    { kind: "fillBlank", prompt: "Si j'avais pu, je ___ (venir, cond. passé) plus tôt.", answer: "serais venu", accept: ["serais venu"], explanation: "serais venu = eu teria vindo." }
  ],
  "g-subjonctif-passe": [
    { kind: "choice", prompt: "Complete a frase: Bien qu'il ___ plu, on a marché.", options: ["ait", "a", "avait"], answer: 0, explanation: "bien que + subjonctif passé: qu'il ait plu." },
    { kind: "fillBlank", prompt: "Je suis contente qu'elle ___ (être) venue.", answer: "soit", accept: ["soit"], explanation: "subjonctif passé de être: qu'elle soit venue." },
    { kind: "choice", prompt: "Complete a frase: Je doute qu'ils ___ compris.", options: ["aient", "ont", "avaient"], answer: 0, explanation: "doute + subjonctif passé: qu'ils aient compris." },
    { kind: "fillBlank", prompt: "Il est possible qu'il ___ (avoir) oublié.", answer: "ait", accept: ["ait"], explanation: "qu'il ait oublié." },
    { kind: "choice", prompt: "Subjonctif passé é formado com…", options: ["subjonctif de avoir/être + particípio", "imparfait + infinitivo", "futur + particípio"], answer: 0 },
    { kind: "fillBlank", prompt: "Je suis triste qu'elles ___ (partir) si tôt.", answer: "soient parties", accept: ["soient parties"], explanation: "qu'elles soient parties." }
  ],
  "g-concordance": [
    { kind: "choice", prompt: "Após 'si + imparfait', o verbo principal vai…", options: ["no conditionnel", "no présent", "no futur"], answer: 0, explanation: "Si j'avais le temps, je voyagerais." },
    { kind: "choice", prompt: "Após 'quand + futur', o verbo principal vai…", options: ["no futur", "no passé", "no subjonctif"], answer: 0, explanation: "Quand je serai grand, je serai pilote." }
  ],
  "g-nuances": [
    { kind: "choice", prompt: "'Tu viens, là ?' transmite…", options: ["impaciência/surpresa", "pura curiosidade", "convite formal"], answer: 0, explanation: "O 'là' no fim muda o tom: impaciência." },
    { kind: "choice", prompt: "Em 'Il n'en reste plus', 'en' substitui…", options: ["um complemento com 'de'", "o sujeito", "o verbo"], answer: 0, explanation: "'en' = 'disso/dele(s)'." },
    { kind: "fillBlank", prompt: "C'est le livre ___ je t'ai parlé. (de que)", answer: "dont", accept: ["dont"], explanation: "'parler de' → dont." }
  ]
};

export function grammarExercises(nodeId: string): Exercise[] {
  return GRAMMAR_PRACTICE[nodeId] ?? [];
}
