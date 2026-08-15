// ══════════════════════════════════════════════════════════════
// Athenas — Cenários do Modo Conversa
// A IA interpreta o papel; o aluno responde em francês.
// Em modo mock, usamos o roteiro; com Ollama, a IA improvisa.
// ══════════════════════════════════════════════════════════════
import type { IconName } from "@/types";

export interface ScenarioLine {
  fr: string;
  pt: string;
  hint?: string;
}

export interface Scenario {
  id: string;
  title: string;
  icon: IconName;
  setting: string; // descrição em PT do contexto
  role: string; // quem a IA interpreta
  level: string; // CEFR sugerido
  lines: ScenarioLine[];
  /** Falas alternativas — usadas ao REVISAR o cenário (variações). */
  variant?: ScenarioLine[];
  tip: string;
  /** Competências avaliadas por resposta (ex.: entrevista de emprego). */
  competencies?: InterviewCompetency[];
}

/** Competência avaliada numa conversa simulada (por linha de resposta). */
export interface InterviewCompetency {
  id: string;
  label: string;
  icon: IconName;
  /** Índice da resposta que avalia; -1 = a conversa inteira. */
  line: number;
  desc: string;
  /** Palavras-chave em francês que indicam domínio da competência. */
  hints: string[];
  tip: string;
}

/** Linhas do cenário conforme a tentativa: 1ª vez usa o roteiro, revisões usam a variação. */
export function scenarioLines(s: Scenario, attempt: number): ScenarioLine[] {
  if (attempt > 1 && s.variant && s.variant.length > 0) return s.variant;
  return s.lines;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "s-boulangerie",
    title: "Na padaria",
    icon: "bowlFood",
    setting: "Você acabou de entrar numa boulangerie parisiense. A pâtissière sorri para você.",
    role: "La pâtissière",
    level: "A1",
    lines: [
      { fr: "Bonjour ! Qu'est-ce que je vous sers ?", pt: "Olá! O que posso lhe servir?" },
      { fr: "Bien sûr. Une baguette et un croissant ? Autre chose ?", pt: "Claro. Uma baguete e um croissant? Mais alguma coisa?" },
      { fr: "D'accord. Ça fera trois euros cinquante.", pt: "Certo. Dá três euros e cinquenta." },
      { fr: "Merci ! Et voilà votre monnaie. Bonne journée !", pt: "Obrigada! Aqui está seu troco. Bom dia!" }
    ],
    variant: [
      { fr: "Bonjour ! Vous désirez ?", pt: "Olá! O que deseja?" },
      { fr: "Bien entendu. Un pain au chocolat, peut-être ?", pt: "Claro. Um pain au chocolat, talvez?" },
      { fr: "Parfait. Ça vous fera deux euros soixante.", pt: "Perfeito. Vai ser dois euros e sessenta." },
      { fr: "Voilà. Merci et à bientôt !", pt: "Aqui está. Obrigada e até logo!" }
    ],
    tip: "Use 'Je voudrais…' para pedir educadamente e 'Merci beaucoup !' para agradecer."
  },
  {
    id: "s-arrivee",
    title: "Chegada a Paris",
    icon: "airplane",
    setting: "Você acabou de desembarcar no aeroporto Charles de Gaulle e precisa chegar ao hotel no centro.",
    role: "Une passante",
    level: "A1-A2",
    lines: [
      { fr: "Bonjour ! Vous cherchez quelque chose ?", pt: "Olá! Está procurando alguma coisa?" },
      { fr: "Le métro ? C'est tout droit, à gauche, puis à droite. Vous verrez l'entrée.", pt: "O metrô? É em frente, à esquerda, depois à direita. Você vai ver a entrada." },
      { fr: "Oui, la ligne 1 va direct au centre-ville. Un ticket, s'il vous plaît.", pt: "Sim, a linha 1 vai direto ao centro. Uma passagem, por favor." },
      { fr: "De rien ! Bon séjour à Paris !", pt: "De nada! Tenha uma boa estadia em Paris!" }
    ],
    variant: [
      { fr: "Bonjour ! Vous êtes perdu·e, peut-être ?", pt: "Olá! Está perdido(a), talvez?" },
      { fr: "Ah, le métro ! Prenez la première à gauche, puis tout droit.", pt: "Ah, o metrô! Pegue a primeira à esquerda, depois em frente." },
      { fr: "Oui, la ligne 4 vous y emmène. Prenez un ticket, c'est simple.", pt: "Sim, a linha 4 te leva lá. Pegue uma passagem, é simples." },
      { fr: "Je vous en prie. Profitez bien de la ville !", pt: "De nada. Aproveite bem a cidade!" }
    ],
    tip: "Para pedir direções: 'Pardon, où est… ?' e agradeça com 'Merci beaucoup !'"
  },
  {
    id: "s-hotel",
    title: "Check-in no hotel",
    icon: "bed",
    setting: "Você chega ao hotel. A recepcionista confirma sua reserva.",
    role: "La réceptionniste",
    level: "A2",
    lines: [
      { fr: "Bonjour, bienvenue ! Vous avez une réservation ?", pt: "Olá, bem-vindo! Você tem uma reserva?" },
      { fr: "Oui, je vois. Une chambre pour deux nuits, c'est bien ça ?", pt: "Sim, vejo aqui. Um quarto para duas noites, certo?" },
      { fr: "Parfait. Voici votre clé. Le petit-déjeuner est servi de 7h à 10h.", pt: "Perfeito. Aqui está sua chave. O café da manhã é servido das 7h às 10h." },
      { fr: "Avec plaisir ! Bonne nuit !", pt: "Com prazer! Boa noite!" }
    ],
    variant: [
      { fr: "Bonsoir, bienvenue ! Vous avez réservé chez nous ?", pt: "Boa noite, bem-vindo! Reservou conosco?" },
      { fr: "Je vois, une chambre avec vue. Pour trois nuits, c'est ça ?", pt: "Vejo aqui, um quarto com vista. Para três noites, certo?" },
      { fr: "Voilà votre clé. Le wifi, c'est le mot de passe sur la carte.", pt: "Aqui está sua chave. O wifi tem a senha no cartão." },
      { fr: "Avec joie ! À demain matin pour le petit-déjeuner.", pt: "Com alegria! Até amanhã de manhã no café da manhã." }
    ],
    tip: "'Je voudrais…' e 'C'est parfait, merci !' resolvem 90% das situações de viagem."
  },
  {
    id: "s-cafe",
    title: "Conversa num café",
    icon: "coffee",
    setting: "Você conhece alguém num café parisiense. A pessoa é simpática e começa a conversa.",
    role: "Un·e parisien·ne",
    level: "A2-B1",
    lines: [
      { fr: "Salut ! Tu viens d'où ?", pt: "Oi! De onde você vem?" },
      { fr: "Ah, le Brésil ! J'adore. Tu aimes Paris ?", pt: "Ah, o Brasil! Adoro. Você gosta de Paris?" },
      { fr: "Génial ! On pourrait se revoir un de ces jours, non ?", pt: "Que legal! A gente poderia se ver um dia desses, né?" },
      { fr: "C'est noté ! À bientôt, j'espère !", pt: "Anotado! Até logo, espero!" }
    ],
    variant: [
      { fr: "Coucou ! Tu passes un bon séjour ?", pt: "Oi! Está aproveitando bem a estadia?" },
      { fr: "Le Brésil ? J'y suis allé·e une fois, c'était magnifique. Et toi, tu aimes ici ?", pt: "O Brasil? Já fui uma vez, era magnífico. E você, gosta daqui?" },
      { fr: "Super ! On échange nos numéros, alors ?", pt: "Que ótimo! Então a gente troca os números?" },
      { fr: "Parfait. Appelle-moi quand tu veux !", pt: "Perfeito. Me liga quando quiser!" }
    ],
    tip: "Perguntas simples: 'Tu viens d'où ?', 'Tu aimes… ?' e respostas com 'J'adore' / 'Moi aussi !'"
  },
  {
    id: "s-entretien",
    title: "Entrevista de emprego simulada",
    icon: "briefcase",
    setting: "Você está numa entrevista para uma vaga numa empresa francesa. A recrutadora faz 7 perguntas clássicas — responda com profissionalismo e o feedback avalia cada competência.",
    role: "La recruteuse",
    level: "B2",
    lines: [
      { fr: "Bonjour, merci d'être venu·e. Commençons : présentez-vous en quelques mots.", pt: "Olá, obrigada por vir. Vamos começar: apresente-se em poucas palavras." },
      { fr: "Très bien. Pourquoi voulez-vous rejoindre notre entreprise ?", pt: "Muito bem. Por que você quer fazer parte da nossa empresa?" },
      { fr: "Intéressant. Parlez-moi d'une situation difficile au travail et comment vous l'avez gérée.", pt: "Interessante. Fale sobre uma situação difícil no trabalho e como você a administrou." },
      { fr: "D'accord. Quelles sont vos principales qualités ? Et vos défauts ?", pt: "Certo. Quais são suas principais qualidades? E seus defeitos?" },
      { fr: "Compris. Quelles sont vos prétentions salariales ?", pt: "Entendido. Quais são suas pretensões salariais?" },
      { fr: "Bien. Avez-vous des questions sur le poste ou sur l'équipe ?", pt: "Bem. Você tem perguntas sobre a vaga ou sobre a equipe?" },
      { fr: "Merci beaucoup. Nous reviendrons vers vous la semaine prochaine. Bonne journée !", pt: "Muito obrigada. Voltaremos a falar com você na semana que vem. Bom dia!" }
    ],
    variant: [
      { fr: "Bonjour, ravie de vous rencontrer. Parlez-moi de votre parcours.", pt: "Olá, prazer em conhecê-lo(a). Fale sobre sua trajetória." },
      { fr: "C'est noté. Pourquoi ce poste plutôt qu'un autre ?", pt: "Anotado. Por que esta vaga em vez de outra?" },
      { fr: "Pouvez-vous me raconter un échec et ce que vous en avez appris ?", pt: "Pode me contar um fracasso e o que você aprendeu com ele?" },
      { fr: "Comment réagissez-vous sous pression ?", pt: "Como você reage sob pressão?" },
      { fr: "Et financièrement, vous pensez à quoi ?", pt: "E financeiramente, em que você pensa?" },
      { fr: "Qu'attendez-vous de ce poste ?", pt: "O que você espera desta vaga?" },
      { fr: "Merci pour cet échange. On vous recontacte très vite. Bonne journée !", pt: "Obrigada pelo bate-papo. Falamos com você muito em breve. Bom dia!" }
    ],
    tip: "Formal: mantenha o 'vous', agradeça com 'Merci' e responda com 'Je pense que…' / 'J'aimerais savoir…'",
    competencies: [
      {
        id: "presentation",
        label: "Apresentação",
        icon: "user",
        line: 0,
        desc: "Falar do seu percurso com clareza",
        hints: ["je suis", "j'ai", "mon parcours", "je m'appelle", "je travaille", "je viens de", "depuis"],
        tip: "Apresente-se com 'Je suis…' e cite o percurso: 'J'ai travaillé comme… / J'ai étudié…'"
      },
      {
        id: "motivation",
        label: "Motivação",
        icon: "target",
        line: 1,
        desc: "Justificar por que quer a vaga",
        hints: ["j'adore", "passion", "entreprise", "équipe", "projet", "secteur", "apprendre", "rejoindre", "poste"],
        tip: "Ligue seu interesse à empresa: 'Je veux rejoindre votre équipe parce que…'"
      },
      {
        id: "experience",
        label: "Experiência",
        icon: "briefcase",
        line: 2,
        desc: "Contar uma situação real com resultado",
        hints: ["situation", "projet", "équipe", "problème", "réussi", "géré", "objectif", "résultat", "solution"],
        tip: "Use o método STAR: Situação → Tarefa → Ação → Resultado ('Le résultat était…')"
      },
      {
        id: "conscience",
        label: "Pontos fortes",
        icon: "star",
        line: 3,
        desc: "Falar de qualidades e defeitos com honestidade",
        hints: ["qualité", "défaut", "rigoureux", "organisé", "créatif", "perfectionniste", "patience", "sérieux", "sérieuse", "honnête"],
        tip: "Um ponto forte e um fraco com contexto: 'Je suis organisé·e, mais parfois perfectionniste.'"
      },
      {
        id: "salaire",
        label: "Negociação",
        icon: "scales",
        line: 4,
        desc: "Responder sobre salário com elegância",
        hints: ["fourchette", "entre", "budget", "prétention", "négociable", "selon", "expérience", "proposez"],
        tip: "Dê uma faixa, não um valor único: 'Je pense à une fourchette entre 3 500 et 4 000 euros.'"
      },
      {
        id: "interet",
        label: "Interesse no posto",
        icon: "question",
        line: 5,
        desc: "Fazer perguntas ao recrutador",
        hints: ["équipe", "mission", "responsabilité", "formation", "évoluer", "question", "projet", "journée"],
        tip: "Pergunte com interesse: 'Quelles sont les missions ? Comment est l'équipe ?'"
      },
      {
        id: "professionnalisme",
        label: "Profissionalismo",
        icon: "shield",
        line: -1,
        desc: "Registro formal do início ao fim",
        hints: ["vous", "merci", "bonjour", "je voudrais", "j'aimerais", "souhaite", "monsieur", "madame"],
        tip: "Mantenha o 'vous' e o tom formal: 'Je vous remercie…' / 'J'aimerais savoir…'"
      }
    ]
  },
  {
    id: "s-medecin",
    title: "No médico",
    icon: "heartbeat",
    setting: "Você não está se sentindo bem e foi ao médico em Paris.",
    role: "Le médecin",
    level: "A2-B1",
    lines: [
      { fr: "Bonjour, asseyez-vous. Qu'est-ce qui ne va pas ?", pt: "Olá, sente-se. O que está acontecendo?" },
      { fr: "D'accord. Avez-vous de la fièvre ?", pt: "Certo. Você está com febre?" },
      { fr: "Je vais vous prescrire quelque chose. Reposez-vous bien.", pt: "Vou te receitar algo. Descanse bem." },
      { fr: "Avec plaisir. Ne vous inquiétez pas, ça va aller !", pt: "Com prazer. Não se preocupe, vai ficar tudo bem!" }
    ],
    variant: [
      { fr: "Bonjour, installez-vous. Qu'est-ce qui vous amène ?", pt: "Olá, pode se acomodar. O que traz você aqui?" },
      { fr: "Je vois. Depuis quand ça dure, ce mal de tête ?", pt: "Entendo. Há quanto tempo dura essa dor de cabeça?" },
      { fr: "On va traiter ça doucement. Buvez beaucoup d'eau et reposez-vous.", pt: "Vamos tratar isso com calma. Beba bastante água e descanse." },
      { fr: "Je vous en prie. Si ça continue, revenez me voir.", pt: "De nada. Se continuar, volte a me ver." }
    ],
    tip: "Sintomas: 'J'ai mal à la tête', 'J'ai de la fièvre', 'Je suis fatigué·e'."
  },
  {
    id: "s-restaurant",
    title: "No restaurante",
    icon: "forkKnife",
    setting: "Você está num bistrô parisiense e o garçom chega com o cardápio.",
    role: "Le serveur",
    level: "A2-B1",
    lines: [
      { fr: "Bonsoir ! Vous avez choisi ?", pt: "Boa noite! Já escolheram?" },
      { fr: "Bien sûr. Et comme plat, je vous recommande le plat du jour.", pt: "Claro. E de prato, recomendo o prato do dia." },
      { fr: "Parfait. Attention, le plat contient des noix — allergie ?", pt: "Perfeito. Atenção, o prato contém nozes — alergia?" },
      { fr: "Très bien. Je vous apporte ça tout de suite !", pt: "Muito bem. Já trago tudo!" }
    ],
    variant: [
      { fr: "Bonsoir ! Prêts à commander ?", pt: "Boa noite! Prontos para pedir?" },
      { fr: "Bien sûr. Je vous conseille le steak-frites, c'est la spécialité.", pt: "Claro. Recomendo o steak-frites, é a especialidade." },
      { fr: "Très bon choix. Il y a des fruits de mer dans ce plat, ça va ?", pt: "Ótima escolha. Tem frutos do mar nesse prato, tudo bem?" },
      { fr: "C'est parti ! L'addition sera sur la table à la fin.", pt: "Já vai! A conta vem no final." }
    ],
    tip: "Peça com 'Je voudrais…', avise alergias com 'J'ai une allergie aux…' e peça a conta: 'L'addition, s'il vous plaît.'"
  },
  {
    id: "s-rencontre",
    title: "Marcando um encontro",
    icon: "heartStraight",
    setting: "Você quer convidar alguém simpático(a) para sair. A conversa esquenta…",
    role: "Ton·ta nouvelle rencontre",
    level: "B1-B2",
    lines: [
      { fr: "Salut ! Tu fais quoi ce week-end ?", pt: "Oi! O que você vai fazer no fim de semana?" },
      { fr: "Ah, je n'ai encore rien prévu… Pourquoi ?", pt: "Ah, ainda não tenho planos… Por quê?" },
      { fr: "Ça me ferait vraiment plaisir ! On se retrouve où ?", pt: "Isso me faria muito prazer! A gente se encontra onde?" },
      { fr: "Génial ! J'ai hâte. À samedi, alors !", pt: "Que máximo! Estou ansioso(a). Então, até sábado!" }
    ],
    variant: [
      { fr: "Coucou, toi ! Des projets pour ce soir ?", pt: "Oi, você! Planos para hoje à noite?" },
      { fr: "Rien de prévu ? Tant mieux, parce que j'ai une idée…", pt: "Nada planejado? Que bom, porque tenho uma ideia…" },
      { fr: "Ça me tente beaucoup, oui ! On se donne rendez-vous où ?", pt: "Me anima muito, sim! A gente marca onde?" },
      { fr: "Parfait, j'ai hâte ! À tout à l'heure, alors !", pt: "Perfeito, mal posso esperar! Então, até daqui a pouco!" }
    ],
    tip: "Convide com 'Ça te dit de… ?' e confirme com 'Ça me ferait plaisir !' ou 'Avec plaisir !'"
  },
  {
    id: "s-imprevus",
    title: "O trem atrasou",
    icon: "tornado",
    setting: "Você está na Gare de Lyon e o seu trem acabou de ser anunciado com uma hora de atraso. Você precisa de ajuda.",
    role: "Un·e agent de la gare",
    level: "B1",
    lines: [
      { fr: "Bonjour, comment puis-je vous aider ?", pt: "Olá, como posso ajudá-lo(a)?" },
      { fr: "Oui, le train a une heure de retard à cause d'une panne. Vous pouvez prendre le suivant.", pt: "Sim, o trem está uma hora atrasado por causa de uma pane. Você pode pegar o próximo." },
      { fr: "Bien sûr. Avec ce billet, vous pouvez prendre n'importe quel train aujourd'hui.", pt: "Claro. Com essa passagem, você pode pegar qualquer trem hoje." },
      { fr: "Je vous en prie. Bon voyage, et désolé pour le contretemps !", pt: "De nada. Boa viagem, e desculpe pelo imprevisto!" }
    ],
    variant: [
      { fr: "Bonjour, monsieur, madame. Que se passe-t-il ?", pt: "Olá, senhor(a). O que aconteceu?" },
      { fr: "Je suis désolé, le train suivant part à 14h12. Vous avez un billet ?", pt: "Sinto muito, o próximo trem parte às 14h12. Você tem passagem?" },
      { fr: "Avec ce billet, la correspondance est incluse. Pas de souci.", pt: "Com essa passagem, a baldeação está incluída. Sem problema." },
      { fr: "Avec plaisir. Courage, l'attente sera courte !", pt: "De nada. Coragem, a espera será curta!" }
    ],
    tip: "Imprevistos: 'Le train a du retard', 'J'ai perdu mon billet', 'Il y a une panne'. Peça ajuda com 'Vous pouvez m'aider ?'"
  }
];
