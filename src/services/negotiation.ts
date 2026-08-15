// ══════════════════════════════════════════════════════════════
// Athenas — Négociation salariale: mini-game de negociação
// A Lulu interpreta a recrutadora; o aluno escolhe a resposta
// mais estratégica. Cada escolha vale 0–3 pontos de estratégia.
// ══════════════════════════════════════════════════════════════
import type { IconName } from "@/types";

export interface NegotiationChoice {
  /** Resposta em francês. */
  text: string;
  pt: string;
  /** Pontos estratégicos: 0 (ruim) a 3 (ótimo). */
  score: number;
  /** Explicação em PT de por que é boa/ruim. */
  feedback: string;
  /** Reação da recrutadora (FR). */
  lulu: string;
  luluPt: string;
}

export interface NegotiationRound {
  id: string;
  /** Narração do momento (PT). */
  context: string;
  /** Fala da recrutadora (FR). */
  line: string;
  linePt: string;
  choices: NegotiationChoice[];
}

export interface NegotiationOutcome {
  /** Pontuação mínima (inclusiva) para este desfecho. */
  min: number;
  title: string;
  icon: IconName;
  desc: string;
  xp: number;
  stars: number;
}

export const NEGOTIATION_ROUNDS: NegotiationRound[] = [
  {
    id: "n-offre-initiale",
    context: "A entrevista terminou e a recrutadora faz a primeira oferta. Respire fundo…",
    line: "Nous sommes prêts à vous offrir 2 800 € brut par mois. Ça vous convient ?",
    linePt: "Estamos prontos para lhe oferecer 2 800 € brutos por mês. Serve para você?",
    choices: [
      {
        text: "Hmm… 2 800, c'est un peu en dessous de mes attentes.",
        pt: "Hmm… 2 800 está um pouco abaixo das minhas expectativas.",
        score: 3,
        feedback: "Perfeito: mostrou desconforto sem rejeitar e fez o recrutador revelar mais. Nunca aceite a primeira oferta.",
        lulu: "Je vois… Et vous pensiez à quelle fourchette ?",
        luluPt: "Entendo… E você pensava em qual faixa?"
      },
      {
        text: "Oui, c'est parfait, merci beaucoup !",
        pt: "Sim, é perfeito, muito obrigada!",
        score: 0,
        feedback: "Aceitar a primeira oferta é o erro clássico: quase sempre há margem para negociar.",
        lulu: "Parfait, je vous envoie le contrat aujourd'hui !",
        luluPt: "Perfeito, mando o contrato ainda hoje!"
      },
      {
        text: "Je veux 4 000 € minimum, sinon je pars.",
        pt: "Quero no mínimo 4 000 €, senão vou embora.",
        score: 1,
        feedback: "Âncora agressiva demais, sem dados, quase queima a ponte. Comece alto, mas com uma faixa.",
        lulu: "Oh… c'est un peu au-dessus de notre budget.",
        luluPt: "Ah… está um pouco acima do nosso orçamento."
      }
    ]
  },
  {
    id: "n-pretentions",
    context: "A recrutadora devolve a pergunta para você. Momento decisivo da negociação.",
    line: "D'accord. Quelles sont vos prétentions salariales exactement ?",
    linePt: "Certo. Quais são exatamente suas pretensões salariais?",
    choices: [
      {
        text: "Je pense à une fourchette entre 3 200 et 3 500 € selon le poste.",
        pt: "Penso numa faixa entre 3 200 e 3 500 €, conforme a vaga.",
        score: 3,
        feedback: "Faixa razoável com 'selon le poste': dá margem sem parecer indeciso.",
        lulu: "Très bien, c'est noté. Et c'est négociable ?",
        luluPt: "Muito bem, anotado. E é negociável?"
      },
      {
        text: "3 000 €, pas un centime de moins.",
        pt: "3 000 €, nem um centavo a menos.",
        score: 1,
        feedback: "Número único e rígido, e baixo: você se prende a um valor sem âncora alta.",
        lulu: "Compris… je transmets votre demande.",
        luluPt: "Entendido… vou transmitir seu pedido."
      },
      {
        text: "Je ne sais pas… vous proposez combien, vous ?",
        pt: "Não sei… quanto vocês propõem?",
        score: 2,
        feedback: "Inverter a pergunta funciona — mas a recrutadora ancorou baixo antes de você. Use com cuidado.",
        lulu: "Disons que nous avons un budget autour de 3 000 €.",
        luluPt: "Digamos que temos um orçamento em torno de 3 000 €."
      }
    ]
  },
  {
    id: "n-pression",
    context: "A recrutadora aperta: diz que é a melhor oferta. É um teste clássico.",
    line: "Écoutez, c'est notre meilleure offre. On ne peut pas faire plus, désolée.",
    linePt: "Ouça, é a nossa melhor oferta. Não podemos fazer mais, desculpe.",
    choices: [
      {
        text: "Je comprends. Laissez-moi réfléchir et je reviens vers vous demain.",
        pt: "Entendo. Deixe-me pensar e volto a falar com vocês amanhã.",
        score: 3,
        feedback: "Silêncio e tempo são suas maiores armas: não decida sob pressão.",
        lulu: "Bien sûr, prenez votre temps. Je vous appelle demain.",
        luluPt: "Claro, com calma. Eu te ligo amanhã."
      },
      {
        text: "Bon, d'accord, j'accepte alors.",
        pt: "Bom, tudo bem, então aceito.",
        score: 0,
        feedback: "Cedeu à pressão na hora: o recrutador percebeu que você aceita o primeiro 'não'.",
        lulu: "Parfait, j'étais sûre que vous seriez raisonnable !",
        luluPt: "Perfeito, sabia que você seria razoável!"
      },
      {
        text: "Ah bon ? Pourquoi exactement ?",
        pt: "Sério? Por que exatamente?",
        score: 2,
        feedback: "Boa pergunta! Explorar o orçamento pode revelar margem — mas não garante nada.",
        lulu: "Notre budget est un peu serré cette année…",
        luluPt: "Nosso orçamento está um pouco apertado este ano…"
      }
    ]
  },
  {
    id: "n-package",
    context: "Sobre o salário, o recrutador endurece. Mas há mais no jogo…",
    line: "Le salaire est fixe, mais on peut parler des avantages.",
    linePt: "O salário é fixo, mas podemos falar dos benefícios.",
    choices: [
      {
        text: "Parfait ! Parlons du télétravail, des tickets resto et de la prime.",
        pt: "Perfeito! Vamos falar do home office, dos vales-refeição e do bônus.",
        score: 3,
        feedback: "Negociar o pacote total (benefícios, bônus, flexibilidade) aumenta o valor real sem tocar no salário.",
        lulu: "Bonne idée. On peut faire deux jours de télétravail et 5 € de tickets resto.",
        luluPt: "Boa ideia. Podemos fazer dois dias de home office e 5 € de vale-refeição."
      },
      {
        text: "Non merci, je veux juste un meilleur salaire.",
        pt: "Não, obrigada, só quero um salário melhor.",
        score: 0,
        feedback: "Ignorar benefícios joga fora dinheiro real: vale a pena explorar o pacote.",
        lulu: "Je comprends… mais le budget est verrouillé.",
        luluPt: "Entendo… mas o orçamento está travado."
      },
      {
        text: "Quels avantages proposez-vous exactement ?",
        pt: "Quais benefícios vocês oferecem exatamente?",
        score: 2,
        feedback: "Boa pergunta exploratória. Você descobriu itens valiosos — agora peça mais um.",
        lulu: "Tickets resto, mutuelle, deux jours de télétravail par semaine.",
        luluPt: "Vale-refeição, plano de saúde, dois dias de home office por semana."
      }
    ]
  },
  {
    id: "n-contrepartie",
    context: "O recrutador faz uma oferta intermediária. Hora de trocar valor.",
    line: "Je peux vous proposer 3 100 € brut. C'est vraiment le maximum.",
    linePt: "Posso lhe oferecer 3 100 € brutos. É realmente o máximo.",
    choices: [
      {
        text: "Et si on ajoute une prime d'intéressement et une formation, je signe tout de suite.",
        pt: "E se vocês acrescentarem um bônus de participação e uma formação, eu assino na hora.",
        score: 3,
        feedback: "Troque itens de valor: formação, bônus e flexibilidade custam pouco à empresa e valem muito para você.",
        lulu: "Top là ! On peut ajouter la formation. Bienvenue dans l'équipe !",
        luluPt: "Fechado! Podemos incluir a formação. Bem-vindo(a) à equipe!"
      },
      {
        text: "D'accord, 3 100 € alors.",
        pt: "Certo, então 3 100 €.",
        score: 1,
        feedback: "Aceitou sem contrapor: sempre peça uma troca antes de aceitar.",
        lulu: "Très bien, je vous envoie le contrat.",
        luluPt: "Muito bem, mando o contrato."
      },
      {
        text: "Non, c'est non. Au revoir !",
        pt: "Não, é não. Tchau!",
        score: 0,
        feedback: "Queimar a ponte destrói a negociação: saia com elegância, nunca com raiva.",
        lulu: "Oh… je suis désolée d'entendre ça.",
        luluPt: "Ah… sinto muito ouvir isso."
      }
    ]
  },
  {
    id: "n-ancrage",
    context: "O recrutador pede justificativa. É aqui que os dados vencem.",
    line: "Et comment justifiez-vous cette demande ?",
    linePt: "E como você justifica esse pedido?",
    choices: [
      {
        text: "Selon les études de marché et mon expérience, ce poste vaut entre 3 300 et 3 600 €.",
        pt: "Segundo estudos de mercado e minha experiência, essa vaga vale entre 3 300 e 3 600 €.",
        score: 3,
        feedback: "Ancorar com dados (mercado + experiência) é o argumento mais forte que existe.",
        lulu: "Intéressant… on peut peut-être se rapprocher de 3 400 €.",
        luluPt: "Interessante… talvez possamos nos aproximar de 3 400 €."
      },
      {
        text: "Parce que j'en ai besoin.",
        pt: "Porque eu preciso.",
        score: 0,
        feedback: "Necessidade pessoal não é argumento de mercado: o recrutador só ouve dados e valor.",
        lulu: "Je comprends, mais le budget suit le poste, pas les besoins…",
        luluPt: "Entendo, mas o orçamento segue a vaga, não as necessidades…"
      },
      {
        text: "Mon ancien salaire était plus élevé.",
        pt: "Meu salário anterior era mais alto.",
        score: 1,
        feedback: "Salário antigo é referência fraca — o que importa é o valor do cargo e do mercado.",
        lulu: "Je vois. Mais on ne peut pas toujours suivre l'ancien salaire.",
        luluPt: "Entendo. Mas nem sempre dá para seguir o salário anterior."
      }
    ]
  },
  {
    id: "n-conclusion",
    context: "O acordo está perto. Feche com elegância.",
    line: "Je crois qu'on peut trouver un accord à 3 400 €.",
    linePt: "Acredito que podemos chegar a um acordo de 3 400 €.",
    choices: [
      {
        text: "Parfait ! Si on est d'accord, je peux commencer dès lundi. Et on garde les deux jours de télétravail ?",
        pt: "Perfeito! Se estamos de acordo, posso começar na segunda. E mantemos os dois dias de home office?",
        score: 3,
        feedback: "Fechou com uma última troca leve e confirmou o início: o melhor jeito de fechar um acordo.",
        lulu: "Bien sûr, tout est noté. À lundi, alors !",
        luluPt: "Claro, tudo anotado. Então, até segunda!"
      },
      {
        text: "Attendez, je veux encore 500 € de plus.",
        pt: "Espera, quero mais 500 €.",
        score: 0,
        feedback: "Reabrir a negociação depois de 'fechado' quebra a confiança. Mude só detalhes menores.",
        lulu: "Hmm… on avait presque signé, là.",
        luluPt: "Hmm… a gente quase tinha assinado, hein."
      },
      {
        text: "Très bien, merci beaucoup !",
        pt: "Muito bem, muito obrigada!",
        score: 2,
        feedback: "Bom fechamento! Só faltou pedir uma última moeda (benefício ou detalhe) antes do aperto de mão.",
        lulu: "Parfait, je vous envoie le contrat !",
        luluPt: "Perfeito, mando o contrato!"
      }
    ]
  },
  {
    id: "n-apres-accord",
    context: "Parabéns! Mas a negociação ainda não acabou…",
    line: "Bienvenue dans l'équipe ! Vous avez des questions ?",
    linePt: "Bem-vindo(a) à equipe! Você tem perguntas?",
    choices: [
      {
        text: "Merci ! Quand est-ce que je reçois le contrat écrit ? Et quelles sont les prochaines étapes ?",
        pt: "Obrigada! Quando recebo o contrato por escrito? E quais são os próximos passos?",
        score: 3,
        feedback: "Formalizar por escrito tudo o que foi combinado evita surpresas — sempre peça o contrato.",
        lulu: "Je vous l'envoie demain par e-mail, avec tout ce qu'on a dit.",
        luluPt: "Mando amanhã por e-mail, com tudo o que combinamos."
      },
      {
        text: "Non, tout est clair, à lundi !",
        pt: "Não, está tudo claro, até segunda!",
        score: 1,
        feedback: "Confiar na memória é arriscado: o que não está no papel não existe.",
        lulu: "Parfait, à lundi !",
        luluPt: "Perfeito, até segunda!"
      },
      {
        text: "Une dernière chose : vous pouvez ajouter 200 € ?",
        pt: "Uma última coisa: vocês podem acrescentar 200 €?",
        score: 0,
        feedback: "Renegociar depois do acordo é a pior jogada: você perde a confiança do recrutador.",
        lulu: "Hmm… on avait dit 3 400, non ?",
        luluPt: "Hmm… a gente tinha combinado 3 400, não?"
      }
    ]
  }
];

export const NEGOTIATION_OUTCOMES: NegotiationOutcome[] = [
  {
    min: 21,
    title: "Négociateur·rice d'élite",
    icon: "crown",
    desc: "Fechou em 3 600 € com formação, télétravail e prime. A recrutadora pediu seu contato para outras vagas !",
    xp: 30,
    stars: 8
  },
  {
    min: 15,
    title: "Bon·ne négociateur·rice",
    icon: "medalMilitary",
    desc: "Fechou em 3 400 € + prime d'intéressement. Negociação sólida, com margem para evoluir.",
    xp: 30,
    stars: 8
  },
  {
    min: 9,
    title: "Négociation correcte",
    icon: "sealCheck",
    desc: "Fechou em 3 100 €. Você foi simpático(a), mas deixou dinheiro na mesa.",
    xp: 15,
    stars: 4
  },
  {
    min: 0,
    title: "Trop gentil·le !",
    icon: "smiley",
    desc: "Fechou em 2 900 €. A recrutadora adorou seu entusiasmo… e seu salário baixo.",
    xp: 10,
    stars: 0
  }
];

/** Pontuação máxima possível (soma dos melhores de cada round). */
export function maxNegotiationScore(): number {
  return NEGOTIATION_ROUNDS.reduce((acc, r) => acc + Math.max(...r.choices.map((c) => c.score)), 0);
}

/** Pontuação do jogador a partir das escolhas (índices por round). */
export function negotiationScore(answers: number[]): number {
  return NEGOTIATION_ROUNDS.reduce((acc, r, i) => {
    const c = r.choices[answers[i]];
    return acc + (c ? c.score : 0);
  }, 0);
}

/** Desfecho para uma pontuação. */
export function outcomeFor(score: number): NegotiationOutcome {
  return NEGOTIATION_OUTCOMES.find((o) => score >= o.min) ?? NEGOTIATION_OUTCOMES[NEGOTIATION_OUTCOMES.length - 1];
}

/** Dicas das rodadas onde a escolha não foi a melhor (score < 3). */
export function reviewTips(answers: number[]): { round: number; title: string; tip: string }[] {
  const tips: { round: number; title: string; tip: string }[] = [];
  NEGOTIATION_ROUNDS.forEach((r, i) => {
    const c = r.choices[answers[i]];
    if (c && c.score < 3) {
      tips.push({ round: i + 1, title: r.id.replace(/-/g, " "), tip: c.feedback });
    }
  });
  return tips;
}

/** A resposta mais estratégica de um round (score máximo). */
export function bestChoiceIndex(round: NegotiationRound): number {
  return round.choices.reduce((best, c, i) => (c.score > round.choices[best].score ? i : best), 0);
}
