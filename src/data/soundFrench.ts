// ══════════════════════════════════════════════════════════════
// Athenas — "Ça sonne français ?" — quiz de naturalidade
// Cada questão mostra uma frase que um aluno escreveria (correta,
// mas artificial) e pede para escolher a versão que um francês
// de verdade diria em conversa.
// ══════════════════════════════════════════════════════════════

export interface SoundFrenchQuestion {
  id: string;
  /** Frase que um aluno provavelmente escreveria (correta, mas artificial). */
  learner: string;
  learnerPt: string;
  /** 4 opções em francês — uma é a natural. */
  options: string[];
  /** Índice da versão natural. */
  answer: number;
  /** Explicação em PT: por que a natural é a escolha real. */
  why: string;
}

export const SOUND_FRENCH_QUESTIONS: SoundFrenchQuestion[] = [
  {
    id: "sf-ne-delation",
    learner: "Je ne sais pas où il est.",
    learnerPt: "Eu não sei onde ele está.",
    options: ["Je sais pas où il est.", "Je ne sais pas où il est.", "Je ne sais où il est pas.", "Je sais ne pas où il est."],
    answer: 0,
    why: "Na conversa informal, o 'ne' da negação desaparece: 'Je sais pas'. Só se diz 'Je ne sais pas' por escrito ou para enfatizar."
  },
  {
    id: "sf-on-nous",
    learner: "Nous allons au cinéma ce soir.",
    learnerPt: "Nós vamos ao cinema hoje à noite.",
    options: ["On va au cinéma ce soir.", "Nous allons au cinéma ce soir.", "On allons au cinéma ce soir.", "Nous va au cinéma ce soir."],
    answer: 0,
    why: "Em conversa, 'on' substitui 'nous': 'On va', 'on a mangé'. O 'nous' soa escrito ou formal."
  },
  {
    id: "sf-dislocation",
    learner: "Mon frère habite à Lyon.",
    learnerPt: "Meu irmão mora em Lyon.",
    options: ["Mon frère, il habite à Lyon.", "Mon frère habite à Lyon.", "Il mon frère habite à Lyon.", "Mon frère il habite Lyon."],
    answer: 0,
    why: "Repetir o sujeito com pronome ('Mon frère, il…') é super natural na fala: destaca o assunto e soa vivo."
  },
  {
    id: "sf-intonation",
    learner: "Est-ce que tu viens demain ?",
    learnerPt: "Você vem amanhã?",
    options: ["Tu viens demain ?", "Est-ce que tu viens demain ?", "Viens-tu demain ?", "Tu est-ce que viens demain ?"],
    answer: 0,
    why: "Pergunta oral é só entonação: 'Tu viens demain ?'. O 'est-ce que' e a inversão ('Viens-tu ?') são mais formais."
  },
  {
    id: "sf-present-futur",
    learner: "Je téléphonerai à Marie demain.",
    learnerPt: "Vou telefonar para a Marie amanhã.",
    options: ["Je téléphone à Marie demain.", "Je téléphonerai à Marie demain.", "Je téléphonerais à Marie demain.", "Je téléphone Marie demain."],
    answer: 0,
    why: "Futuro planejado no presente é o mais natural na fala: 'Je téléphone demain'. O futur simple soa escrito."
  },
  {
    id: "sf-trop",
    learner: "Il est très gentil.",
    learnerPt: "Ele é muito gentil.",
    options: ["Il est trop gentil.", "Il est très gentil.", "Il est beaucoup gentil.", "Il est trop de gentil."],
    answer: 0,
    why: "'Trop' é o intensificador da fala real — 'trop bien', 'trop gentil' — bem mais vivo que 'très'."
  },
  {
    id: "sf-t-as",
    learner: "Tu as compris ?",
    learnerPt: "Você entendeu?",
    options: ["T'as compris ?", "Tu as compris ?", "Tu as compris pas ?", "T'a compris ?"],
    answer: 0,
    why: "'Tu' vira 't'' antes de vogal: 'T'as vu ?', 'T'as compris ?' — coloquial e super comum."
  },
  {
    id: "sf-ca-reprise",
    learner: "Cela est très intéressant.",
    learnerPt: "Isso é muito interessante.",
    options: ["Ça, c'est très intéressant.", "Cela est très intéressant.", "Ça est très intéressant.", "Cela, c'est très intéressant."],
    answer: 0,
    why: "'Cela' quase não existe na fala. Os franceses dizem 'ça', muitas vezes com reforço: 'Ça, c'est…'"
  },
  {
    id: "sf-c-est-moi",
    learner: "Le dîner a été préparé par moi.",
    learnerPt: "O jantar foi preparado por mim.",
    options: ["C'est moi qui ai préparé le dîner.", "Le dîner a été préparé par moi.", "Le dîner est préparé par moi.", "C'est moi qui a préparé le dîner."],
    answer: 0,
    why: "A voz passiva é rara na fala. O francês prefere 'c'est… qui' para destacar quem fez a ação."
  },
  {
    id: "sf-en-fait",
    learner: "En réalité, je préfère le thé.",
    learnerPt: "Na verdade, eu prefiro chá.",
    options: ["En fait, je préfère le thé.", "En réalité, je préfère le thé.", "En fait, je préfère le thé ?", "De fait, je préfère le thé."],
    answer: 0,
    why: "'En fait' é o marcador da conversa real; 'en réalité' soa ensaiado. E 'de fait' fica para o registro formal."
  }
];
