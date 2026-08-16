// ══════════════════════════════════════════════════════════════
// Athenas — Conteúdo do curso (data-driven: novas aulas não exigem
// mudanças na interface, basta adicionar itens aqui).
// ══════════════════════════════════════════════════════════════
import type {
  ChoiceExercise,
  Exercise,
  FillBlankExercise,
  Lesson,
  ListeningExercise,
  SentenceBuilderExercise,
  TranslationExercise,
  WordMatchExercise,
  World
} from "@/types";
import { generatePracticeLessons } from "./practice";

// ── Construtores compactos ────────────────────────────────────
const choice = (prompt: string, options: string[], answer: number, explanation?: string): ChoiceExercise => ({
  kind: "choice",
  prompt,
  options,
  answer,
  explanation
});
const fill = (prompt: string, answer: string, extra?: Partial<FillBlankExercise>): FillBlankExercise => ({
  kind: "fillBlank",
  prompt,
  answer,
  ...extra
});
const match = (pairs: [string, string][]): WordMatchExercise => ({ kind: "wordMatch", pairs });
const build = (prompt: string, words: string[], answer: string[], explanation?: string): SentenceBuilderExercise => ({
  kind: "sentenceBuilder",
  prompt,
  words,
  answer,
  explanation
});
const trans = (prompt: string, answer: string, extra?: Partial<TranslationExercise>): TranslationExercise => ({
  kind: "translation",
  prompt,
  answer,
  ...extra
});
const listen = (prompt: string, text: string, options: string[], answer: number, explanation?: string): ListeningExercise => ({
  kind: "listening",
  prompt,
  text,
  options,
  answer,
  explanation
});

// ══════════════════════════════════════════════════════════════
// WORLD 1 —  Première Rencontre
// ══════════════════════════════════════════════════════════════
const world1Lessons: Lesson[] = [
  {
    id: "l1-bonjour",
    worldId: "world-1",
    title: "Bonjour !",
    icon: "handWaving",
    topic: "saudacoes",
    objective: "Cumprimentar e se despedir em francês.",
    theory: [
      "Bonjour = olá / bom dia (usado o dia inteiro até o anoitecer).",
      "Bonsoir = boa noite (quando CHEGA à noite).",
      "Salut = oi / tchau (informal, para amigos).",
      "Ça va ? = tudo bem? (pergunta carinhosa, informal).",
      "Au revoir = até logo / tchau (ao SAIR)."
    ],
    examples: [
      { fr: "Bonjour, madame !", pt: "Olá, senhora!" },
      { fr: "Salut ! Ça va ?", pt: "Oi! Tudo bem?" },
      { fr: "Au revoir, à demain !", pt: "Tchau, até amanhã!" }
    ],
    exercises: [
      choice("São 9h da manhã. Como você cumprimenta?", ["Bonsoir", "Bonjour", "Au revoir"], 1, "Bonjour é usado de manhã até o fim da tarde."),
      choice("Qual é a saudação INFORMAL?", ["Salut", "Bonjour", "Bonsoir"], 0, "Salut é para amigos — informal e fofo."),
      fill("B___jour ! (complete)", "Bonjour", { hint: "Começa com B e é a saudação do dia." }),
      choice("Você está indo embora. O que diz?", ["Salut !", "Bonjour !", "Au revoir !"], 2, "Ao sair: au revoir!"),
      trans("Oi! Tudo bem? (informal)", "Salut ! Ça va ?", { accept: ["Salut, ça va ?", "Salut ! Ça va !", "Salut ça va"] })
    ],
    words: ["w-bonjour", "w-salu", "w-bonsoir", "w-au-revoir"]
  },
  {
    id: "l2-merci",
    worldId: "world-1",
    title: "Merci beaucoup",
    icon: "handHeart",
    topic: "polidez",
    objective: "Ser educada(o): agradecer, pedir e pedir desculpas.",
    theory: [
      "Merci = obrigado(a) · Merci beaucoup = muito obrigado(a).",
      "S'il vous plaît = por favor (formal) · S'il te plaît = por favor (informal).",
      "Pardon / Excusez-moi = desculpe / com licença.",
      "De rien = de nada."
    ],
    examples: [
      { fr: "Merci beaucoup !", pt: "Muito obrigado!" },
      { fr: "Un café, s'il vous plaît.", pt: "Um café, por favor." },
      { fr: "Pardon, je suis perdue.", pt: "Com licença, estou perdida." }
    ],
    exercises: [
      match([["merci", "obrigado"], ["pardon", "desculpe"], ["de rien", "de nada"], ["s'il vous plaît", "por favor"]]),
      choice("Como se diz 'muito obrigado'?", ["Merci beaucoup", "De rien", "Pardon"], 0),
      fill("De r___ ! (resposta para 'merci')", "rien", { accept: ["De rien"], hint: "Começa com r…" }),
      trans("Um café, por favor.", "Un café, s'il vous plaît.", { accept: ["Un café s'il vous plaît"] }),
      choice("Você esbarrou em alguém. O que diz?", ["Merci", "Pardon", "Au revoir"], 1)
    ],
    words: ["w-merci", "w-pardon", "w-svp", "w-de-rien"]
  },
  {
    id: "l3-oui-non",
    worldId: "world-1",
    title: "Oui et non",
    icon: "checkCircle",
    topic: "particulas",
    objective: "Dizer sim, não e usar os pronomes je, tu, il, elle.",
    theory: [
      "Oui = sim · Non = não · Si = sim (quando a pergunta é negativa!).",
      "Je = eu · Tu = você (informal) · Il = ele · Elle = ela.",
      "'Tu viens ?' — Oui ! / Non !"
    ],
    examples: [
      { fr: "Tu aimes le chocolat ? — Oui !", pt: "Você gosta de chocolate? — Sim!" },
      { fr: "Elle s'appelle Marie.", pt: "Ela se chama Marie." },
      { fr: "Il est français.", pt: "Ele é francês." }
    ],
    exercises: [
      choice("O que significa 'oui'?", ["não", "sim", "talvez"], 1),
      choice("'Elle' significa…", ["ele", "ela", "você"], 1),
      fill("Oui = ___, Non = ___", "sim, não", { accept: ["sim não", "sim, não"] }),
      build("Monte: 'Ele é francês.'", ["Il", "est", "français", "."], ["Il", "est", "français", "."]),
      choice("A pergunta 'Tu n'aimes pas ?' — você GOSTA. Responda com:", ["Oui", "Si", "Non"], 1, "Pergunta negativa? Use 'si' para contrariar! ")
    ],
    words: ["w-oui", "w-non", "w-si", "w-je", "w-tu", "w-il", "w-elle"]
  },
  {
    id: "l4-presentation",
    worldId: "world-1",
    title: "Je m'appelle…",
    icon: "user",
    topic: "apresentacao",
    objective: "Se apresentar e perguntar o nome.",
    theory: [
      "Je m'appelle + nome = eu me chamo…",
      "Comment tu t'appelles ? = como você se chama?",
      "Enchanté(e) ! = prazer em conhecer!",
      "Je suis brésilien / brésilienne = sou brasileiro(a)."
    ],
    examples: [
      { fr: "Je m'appelle Ana. Et toi ?", pt: "Eu me chamo Ana. E você?" },
      { fr: "Enchantée !", pt: "Prazer em te conhecer!" },
      { fr: "Je suis brésilienne.", pt: "Eu sou brasileira." }
    ],
    exercises: [
      fill("Je m'a___ Ana.", "m'appelle", { hint: "m'a + pella…" }),
      build("Monte: 'Eu me chamo Ana.'", ["Je", "m'appelle", "Ana", "."], ["Je", "m'appelle", "Ana", "."]),
      choice("Como perguntar o nome de alguém (informal)?", ["Comment tu t'appelles ?", "Quelle heure est-il ?", "Où est la gare ?"], 0),
      trans("Prazer em conhecer! (feminino)", "Enchantée !", { accept: ["Enchanté !", "Enchantee !"] }),
      choice("'Je suis brésilienne' é dito por…", ["um homem", "uma mulher", "uma criança"], 1, "O -e no final indica feminino!")
    ],
    words: ["w-appeler", "w-je"]
  },
  {
    id: "l5-nombres",
    worldId: "world-1",
    title: "Les nombres 1-10",
    icon: "hash",
    topic: "numeros",
    objective: "Contar de 1 a 10 em francês.",
    theory: [
      "1 un · 2 deux · 3 trois · 4 quatre · 5 cinq",
      "6 six · 7 sept · 8 huit · 9 neuf · 10 dix",
      "Atenção: o 'x' de six/dix só soa no fim da frase ou sozinho."
    ],
    examples: [
      { fr: "J'ai deux chats.", pt: "Eu tenho dois gatos." },
      { fr: "Trois croissants, s'il vous plaît.", pt: "Três croissants, por favor." }
    ],
    exercises: [
      choice("'Trois' é o número…", ["2", "3", "4"], 1),
      choice("Qual é 'cinq'?", ["5", "7", "9"], 0),
      match([["un", "1"], ["quatre", "4"], ["sept", "7"], ["dix", "10"]]),
      fill("Sept = ___", "7", { accept: ["sete"] }),
      trans("Eu tenho dois gatos.", "J'ai deux chats.", { accept: ["J'ai 2 chats"] })
    ],
    words: ["w-un", "w-deux", "w-trois", "w-quatre", "w-cinq", "w-six", "w-sept", "w-huit", "w-neuf", "w-dix"]
  },
  {
    id: "l6-articles",
    worldId: "world-1",
    title: "Un, une, le, la",
    icon: "book",
    topic: "artigos",
    objective: "Usar os artigos definidos e indefinidos.",
    theory: [
      "Le / un = masculino · La / une = feminino.",
      "Les = os/as (plural) · Des = uns/umas (plural indefinido).",
      "Sempre aprenda a palavra COM o artigo: une table, un livre."
    ],
    examples: [
      { fr: "Le chat dort.", pt: "O gato dorme." },
      { fr: "Une fille sympa.", pt: "Uma menina legal." }
    ],
    exercises: [
      choice("Qual artigo para 'table' (mesa)?", ["un", "une", "le"], 1, "table é feminino: une table"),
      choice("Qual artigo para 'livre' (livro)?", ["la", "une", "le"], 2, "livre é masculino: le livre"),
      fill("___ maison (a casa)", "La", { accept: ["la"] }),
      match([["le", "o"], ["la", "a"], ["les", "os/as"], ["un", "um"]]),
      choice("Plural de 'le livre'?", ["des livres", "un livres", "la livres"], 0)
    ],
    words: ["w-le", "w-la", "w-un-art", "w-une"]
  },
  {
    id: "l7-genre",
    worldId: "world-1",
    title: "Le genre des mots",
    icon: "genderFemale",
    topic: "genero",
    objective: "Descobrir o gênero (masculino/feminino) dos substantivos.",
    theory: [
      "Termina em -e? Muitas vezes é feminino: une table, une maison.",
      "Mas cuidado com exceções: le livre, le musée, le problème são MASCULINOS.",
      "O gênero muda o artigo e às vezes o adjetivo: un grand garçon / une grande fille."
    ],
    examples: [
      { fr: "une table · le livre", pt: "uma mesa · o livro" },
      { fr: "un chat noir / une chatte noire", pt: "um gato preto / uma gata preta" }
    ],
    exercises: [
      choice("Qual o gênero de 'maison'?", ["masculino", "feminino"], 1),
      choice("E de 'livre'?", ["masculino", "feminino"], 0, "Exceção! Termina em -e mas é masculino."),
      fill("___ fille (uma menina)", "Une", { accept: ["une"] }),
      fill("___ garçon (um menino)", "Un", { accept: ["un"] }),
      choice("Qual é masculino?", ["la table", "le problème", "la maison"], 1),
      match([["un chat", "um gato"], ["une fille", "uma menina"], ["le livre", "o livro"], ["la gare", "a estação"]])
    ],
    words: ["w-table", "w-livre", "w-maison", "w-chat", "w-fille", "w-garcon"]
  },
  {
    id: "l8-couleurs",
    worldId: "world-1",
    title: "Les couleurs",
    icon: "palette",
    topic: "cores",
    objective: "Falar as cores e concordar com o substantivo.",
    theory: [
      "rouge, bleu, vert, jaune, rose, noir, blanc.",
      "O adjetivo concorda: un chat noir / une robe noire.",
      "'Rose' é invariable: une robe rose (sem -e extra)."
    ],
    examples: [
      { fr: "Le ciel est bleu.", pt: "O céu é azul." },
      { fr: "J'aime la robe rose.", pt: "Eu gosto do vestido rosa." }
    ],
    exercises: [
      match([["rouge", "vermelho"], ["bleu", "azul"], ["vert", "verde"], ["jaune", "amarelo"]]),
      choice("'La robe rose' — por que 'rose' não muda?", ["é invariable", "é masculino", "é plural"], 0),
      fill("Le ciel est b___ (azul).", "bleu", { hint: "b + leu" }),
      choice("Como fica 'noir' com 'une robe'?", ["noir", "noire", "noirs"], 1),
      trans("O céu é azul.", "Le ciel est bleu.", { accept: ["Le ciel est bleu"] })
    ],
    words: ["w-rouge", "w-bleu", "w-vert", "w-jaune", "w-rose", "w-noir", "w-blanc"]
  },
  {
    id: "l9-jours",
    worldId: "world-1",
    title: "Les jours de la semaine",
    icon: "calendar",
    topic: "dias",
    objective: "Falar os dias da semana.",
    theory: [
      "lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.",
      "A semana francesa começa na SEGUNDA (lundi).",
      "Aujourd'hui c'est… = hoje é…"
    ],
    examples: [
      { fr: "Aujourd'hui, c'est lundi.", pt: "Hoje é segunda-feira." },
      { fr: "À samedi !", pt: "Até sábado!" }
    ],
    exercises: [
      choice("Qual é o primeiro dia da semana francesa?", ["dimanche", "lundi", "jeudi"], 1),
      choice("'Vendredi' é…", ["quarta", "sexta", "sábado"], 1),
      match([["lundi", "segunda"], ["mercredi", "quarta"], ["samedi", "sábado"], ["dimanche", "domingo"]]),
      build("Monte: 'Hoje é segunda.'", ["Aujourd'hui", "c'est", "lundi", "."], ["Aujourd'hui", "c'est", "lundi", "."]),
      fill("Le week-end = samedi et d___", "dimanche", { hint: "domingo" })
    ],
    words: ["w-lundi", "w-mardi", "w-mercredi", "w-jeudi", "w-vendredi", "w-samedi", "w-dimanche", "w-aujourdhui"]
  },
  {
    id: "l10-etre-avoir",
    worldId: "world-1",
    title: "Être et avoir",
    icon: "scales",
    topic: "etre-avoir",
    objective: "Conjugar être e avoir no presente (je, tu, il, elle).",
    theory: [
      "ÊTRE: je suis, tu es, il/elle est.",
      "AVOIR: j'ai, tu as, il/elle a.",
      "Fome, sede e idade usam AVOIR: j'ai faim, j'ai 20 ans."
    ],
    examples: [
      { fr: "Je suis contente.", pt: "Estou feliz." },
      { fr: "J'ai deux chats.", pt: "Eu tenho dois gatos." }
    ],
    exercises: [
      fill("Je ___ (être) étudiante.", "suis", { hint: "je suis" }),
      fill("Tu ___ (avoir) un chat.", "as", { hint: "tu as" }),
      choice("Complete: Elle ___ brésilienne.", ["est", "es", "ai"], 0),
      build("Monte: 'Eu tenho um gato.'", ["J'ai", "un", "chat", "."], ["J'ai", "un", "chat", "."]),
      choice("Como se diz 'estou com fome'?", ["Je suis faim", "J'ai faim", "Je suis faim!"], 1, "Fome usa AVOIR!"),
      trans("Ela é francesa.", "Elle est française.", { accept: ["Elle est française."] })
    ],
    words: ["w-etre", "w-avoir"]
  },
  {
    id: "l11-alphabet",
    worldId: "world-1",
    title: "L'alphabet et les sons",
    icon: "textAa",
    topic: "fonetica",
    objective: "Conhecer as letras e os sons mais importantes do francês.",
    theory: [
      "O 'e' final quase nunca soa: table → 'tabl'.",
      "-er no fim soa 'é': manger → 'manjé'.",
      "-et soa 'é': le ticket → 'lé tiké' · -ent no fim do verbo não soa: ils parlent → 'il parl'.",
      "O 'r' francês é gutural, mais atrás da garganta que o português."
    ],
    examples: [
      { fr: "une table · le café · parler", pt: "uma mesa · o café · falar" },
      { fr: "Ils parlent français.", pt: "Eles falam francês (o -ent não soa)." },
      { fr: "Le petit ticket.", pt: "O ticketzinho (-et soa 'é')." }
    ],
    exercises: [
      choice("Como soa '-er' no fim de 'manger'?", ["é", "ê", "er"], 0, "manger → 'manjé'!"),
      choice("O 'e' final de 'table'…", ["não soa", "soa 'e'", "soa 'a'"], 0),
      choice("Em 'ils parlent', o '-ent'…", ["não soa", "soa 'ant'", "soa 'en'"], 0),
      fill("O som do 'r' francês é mais ___ (gutural/na garganta).", "gutural", { accept: ["garganta"] }),
      choice("Como se lê 'le ticket'?", ["lé tiké", "lé tiket", "li tik"] , 0, "-et final soa 'é'.")
    ],
    words: []
  },
  {
    id: "l12-animaux",
    worldId: "world-1",
    title: "Les animaux",
    icon: "pawPrint",
    topic: "animais",
    objective: "Nomear animais de estimação e da fazenda.",
    theory: [
      "le chien (cachorro), le chat (gato), le lapin (coelho), l'oiseau (pássaro).",
      "le poisson (peixe), le cheval (cavalo), la vache (vaca).",
      "J'ai un… · J'aimerais avoir… (gostaria de ter…)"
    ],
    examples: [
      { fr: "J'ai un chien et deux chats.", pt: "Tenho um cachorro e dois gatos." },
      { fr: "Le lapin mange des carottes.", pt: "O coelho come cenouras." },
      { fr: "J'aimerais avoir un cheval !", pt: "Gostaria de ter um cavalo!" }
    ],
    exercises: [
      match([["le chien", "o cachorro"], ["le chat", "o gato"], ["l'oiseau", "o pássaro"], ["le lapin", "o coelho"]]),
      choice("Qual animal mia?", ["le chien", "le chat", "la vache"], 1),
      fill("J'ai un c___ (cachorro).", "chien", { hint: "c + hien" }),
      trans("Tenho um cachorro e dois gatos.", "J'ai un chien et deux chats.", { accept: ["J'ai un chien et deux chats"] }),
      choice("A vaca em francês é…", ["la vache", "le cheval", "le poisson"], 0)
    ],
    words: ["w-chien", "w-oiseau", "w-poisson", "w-cheval", "w-vache", "w-lapin"]
  },
  {
    id: "l13-vetements",
    worldId: "world-1",
    title: "Les vêtements",
    icon: "shirtFolded",
    topic: "roupas",
    objective: "Falar de roupas e concordar cores com o gênero.",
    theory: [
      "la robe (vestido), la jupe (saia), les chaussures (sapatos), le manteau (casaco).",
      "Porter = vestir/usar: Je porte une robe rouge.",
      "A cor concorda: une robe rouge · un manteau rouge (invariable)."
    ],
    examples: [
      { fr: "Je porte une robe rose.", pt: "Estou usando um vestido rosa." },
      { fr: "Prends ton manteau, il fait froid !", pt: "Pega seu casaco, está frio!" },
      { fr: "Ces chaussures sont très belles.", pt: "Esses sapatos são muito bonitos." }
    ],
    exercises: [
      match([["la robe", "o vestido"], ["la jupe", "a saia"], ["le manteau", "o casaco"], ["les chaussures", "os sapatos"]]),
      fill("Je p___ (uso) une robe rouge.", "porte", { hint: "porter" }),
      trans("Estou usando um vestido rosa.", "Je porte une robe rose.", { accept: ["Je porte une robe rose"] }),
      choice("Qual é feminino?", ["le manteau", "la jupe", "le pantalon"], 1),
      choice("Il fait froid ! O que você pega?", ["le manteau", "la jupe", "les sandales"], 0)
    ],
    words: ["w-robe", "w-chaussures", "w-manteau", "w-jupe"]
  },
  {
    id: "l14-nationalites",
    worldId: "world-1",
    title: "Les nationalités",
    icon: "globe",
    topic: "nacionalidades",
    objective: "Dizer de onde você é e falar nacionalidades com o gênero certo.",
    theory: [
      "Je suis + nacionalidade: Je suis brésilienne. / Je suis français.",
      "Feminino: -ien → -ienne (italien → italienne) · -ais → -aise (français → française).",
      "Tu es d'où ? = de onde você é? · Je suis du Brésil = sou do Brasil."
    ],
    examples: [
      { fr: "Tu es d'où ? — Je suis du Brésil.", pt: "De onde você é? — Sou do Brasil." },
      { fr: "Elle est italienne et lui est espagnol.", pt: "Ela é italiana e ele é espanhol." },
      { fr: "Nous sommes françaises.", pt: "Nós somos francesas." }
    ],
    exercises: [
      choice("Feminino de 'italien' é…", ["italienne", "italien", "italiène"], 0),
      fill("Je suis b___ (brasileira).", "brésilienne", { accept: ["bresilienne"], hint: "br + ésilienne" }),
      choice("Como perguntar de onde a pessoa é?", ["Tu es d'où ?", "Tu as quel âge ?", "Tu manges quoi ?"], 0),
      match([["français", "francês"], ["italienne", "italiana"], ["espagnol", "espanhol"], ["allemande", "alemã"]]),
      trans("Eu sou do Brasil.", "Je suis du Brésil.", { accept: ["Je suis du Bresil", "Je suis brésilienne", "Je suis brésilien"] })
    ],
    words: ["w-bresilien", "w-francais-nat", "w-italien", "w-espagnol", "w-allemand"]
  },
  {
    id: "l15-metiers",
    worldId: "world-1",
    title: "Les métiers",
    icon: "briefcase",
    topic: "profissoes",
    objective: "Dizer sua profissão e a dos outros com o artigo certo.",
    theory: [
      "Je suis + profissão: Je suis étudiante. / Je suis cuisinier.",
      "Il est professeur. / Elle est infirmière. (com être, sem artigo!)",
      "O gênero muda: un médecin (m) · une pharmacienne (f)."
    ],
    examples: [
      { fr: "Je suis étudiante à Lyon.", pt: "Sou estudante em Lyon." },
      { fr: "Il est médecin à l'hôpital.", pt: "Ele é médico no hospital." },
      { fr: "Elle veut devenir pharmacienne.", pt: "Ela quer ser farmacêutica." }
    ],
    exercises: [
      choice("Para dizer sua profissão: Je suis…", ["étudiante", "une étudiante", "le étudiant"], 0, "Com être, a profissão vai sem artigo!"),
      fill("Il est m___ (médico) à l'hôpital.", "médecin", { accept: ["medecin"], hint: "m + édecin" }),
      match([["le médecin", "o médico"], ["l'infirmière", "a enfermeira"], ["le boulanger", "o padeiro"], ["le cuisinier", "o cozinheiro"]]),
      trans("Ela é enfermeira.", "Elle est infirmière.", { accept: ["Elle est infirmiere"] }),
      choice("Quem trabalha com pão todo dia?", ["le boulanger", "le médecin", "l'infirmière"], 0)
    ],
    words: ["w-professeur", "w-medecin", "w-infirmiere", "w-cuisinier", "w-boulanger", "w-pharmacien"]
  },
  {
    id: "l16-dialogue",
    worldId: "world-1",
    title: "Un petit dialogue",
    icon: "chatCircleDots",
    topic: "dialogo",
    objective: "Costurar tudo: cumprimentar, se apresentar e se despedir numa conversa curta.",
    theory: [
      "Sequência clássica: Bonjour ! → Comment tu t'appelles ? → Je m'appelle… → Enchantée ! → Au revoir !",
      "Ça va ? → Ça va bien, merci ! (resposta natural)",
      "Et toi ? = e você? — devolve a pergunta com carinho."
    ],
    examples: [
      { fr: "— Bonjour ! Ça va ? — Ça va bien, merci ! Et toi ?", pt: "— Olá! Tudo bem? — Tudo bem, obrigada! E você?" },
      { fr: "— Comment tu t'appelles ? — Je m'appelle Ana, enchantée !", pt: "— Como você se chama? — Eu me chamo Ana, prazer!" },
      { fr: "— Au revoir, à demain ! — À demain !", pt: "— Tchau, até amanhã! — Até amanhã!" }
    ],
    exercises: [
      build("Monte: 'Tudo bem, obrigada! E você?'", ["Ça va", "bien", "merci", ".", "Et", "toi", "?"], ["Ça va", "bien", "merci", ".", "Et", "toi", "?"]),
      choice("Qual vem PRIMEIRO numa conversa?", ["Bonjour", "Au revoir", "Merci beaucoup"], 0),
      fill("Ench___ ! (prazer em conhecer)", "antée", { accept: ["antee", "anté"], hint: "enchantée" }),
      choice("'Et toi ?' serve para…", ["devolver a pergunta", "pedir desculpa", "se despedir"], 0),
      trans("Eu me chamo Ana, prazer!", "Je m'appelle Ana, enchantée !", { accept: ["Je m'appelle Ana, enchantee", "Je m'appelle Ana enchanté"] })
    ],
    words: ["w-bonjour", "w-salu", "w-au-revoir", "w-appeler"]
  }
];

const world1Boss: World["boss"] = {
  id: "boss-1",
  worldId: "world-1",
  title: "Le Dragon du Vocabulaire",
  icon: "sword",
  intro: "Um dragão dorminhoco bloqueia o caminho! Ele só acorda se você responder tudo certo. Respira fundo — você sabe mais do que imagina! ",
  xp: 100,
  exercises: [
    choice("Como você cumprimenta à noite?", ["Bonsoir", "Bonjour", "Salut"], 0),
    choice("'Une table' — o artigo certo é…", ["un", "une", "le"], 1),
    fill("Complete: Je ___ (chamo-me) Léa.", "m'appelle", { hint: "m'a…" }),
    choice("Qual número é 'sept'?", ["6", "7", "8"], 1),
    match([["merci", "obrigado"], ["au revoir", "tchau"], ["bleu", "azul"], ["dimanche", "domingo"]]),
    build("Monte: 'Eu estou com fome.'", ["J'ai", "faim", "."], ["J'ai", "faim", "."]),
    choice("Complete: Elle ___ contente.", ["es", "est", "ai"], 1),
    trans("Oi! Tudo bem?", "Salut ! Ça va ?", { accept: ["Salut, ça va ?", "Salut ! Ça va !"] }),
    listen("O que você ouviu?", "Bonjour madame !", ["Bonjour madame", "Bonsoir monsieur", "Au revoir madame"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 2 —  La Vie Quotidienne
// ══════════════════════════════════════════════════════════════
const world2Lessons: Lesson[] = [
  {
    id: "l11-famille",
    worldId: "world-2",
    title: "Ma famille",
    icon: "users",
    topic: "familia",
    objective: "Falar sobre a família e usar mon/ma.",
    theory: [
      "la famille, la mère, le père, la sœur, le frère, les parents.",
      "Mon + masculino (mon frère) · Ma + feminino (ma sœur).",
      "Mes = meus/minhas (plural)."
    ],
    examples: [
      { fr: "Ma sœur s'appelle Camille.", pt: "Minha irmã se chama Camille." },
      { fr: "Mon père est professeur.", pt: "Meu pai é professor." }
    ],
    exercises: [
      match([["la mère", "a mãe"], ["le père", "o pai"], ["la sœur", "a irmã"], ["le frère", "o irmão"]]),
      fill("___ sœur (minha irmã)", "Ma", { accept: ["ma"] }),
      fill("___ frère (meu irmão)", "Mon", { accept: ["mon"] }),
      choice("'Les parents' são…", ["os pais", "os primos", "os avós"], 0),
      build("Monte: 'Minha irmã se chama Camille.'", ["Ma", "sœur", "s'appelle", "Camille", "."], ["Ma", "sœur", "s'appelle", "Camille", "."])
    ],
    words: ["w-famille", "w-mere", "w-pere", "w-soeur", "w-frere", "w-parents", "w-mon", "w-ma"]
  },
  {
    id: "l12-boulangerie",
    worldId: "world-2",
    title: "À la boulangerie",
    icon: "forkKnife",
    topic: "comida",
    objective: "Pedir comida e bebida na padaria.",
    theory: [
      "le pain (pão), la baguette, le croissant, le fromage (queijo), le café, l'eau (água).",
      "Je voudrais… = eu gostaria de… (educado).",
      "Pedir: 'Je voudrais un croissant, s'il vous plaît.'"
    ],
    examples: [
      { fr: "Je voudrais une baguette, s'il vous plaît.", pt: "Eu gostaria de uma baguete, por favor." },
      { fr: "Un café, s'il vous plaît !", pt: "Um café, por favor!" }
    ],
    exercises: [
      match([["le pain", "o pão"], ["la baguette", "a baguete"], ["le croissant", "o croissant"], ["le fromage", "o queijo"]]),
      choice("Como pedir educadamente?", ["Je veux un café", "Je voudrais un café", "Donne un café"], 1, "Je voudrais é o educado do dia a dia."),
      fill("Je voudrais une b___ (baguete).", "baguette", { hint: "b + aguette" }),
      choice("Qual é feminino?", ["le pain", "l'eau", "le café"], 1, "l'eau é feminino: une eau"),
      trans("Eu gostaria de um croissant, por favor.", "Je voudrais un croissant, s'il vous plaît.", { accept: ["Je voudrais un croissant s'il vous plaît"] })
    ],
    words: ["w-pain", "w-baguette", "w-croissant", "w-fromage", "w-cafe", "w-eau", "w-chocolat"]
  },
  {
    id: "l13-verbes",
    worldId: "world-2",
    title: "Les verbes du quotidien",
    icon: "lightning",
    topic: "verbes",
    objective: "Conjugar verbos -er no presente (je, tu, il, elle).",
    theory: [
      "-ER: manger, parler, aimer, habiter, regarder.",
      "Je mange · tu manges · il/elle mange (a terminação muda só no tu: -es).",
      "Irregulares: aller (je vais), boire (je bois), dormir (je dors)."
    ],
    examples: [
      { fr: "Je mange une baguette.", pt: "Eu como uma baguete." },
      { fr: "J'habite à Paris.", pt: "Eu moro em Paris." }
    ],
    exercises: [
      fill("Je ___ (manger) une pomme.", "mange", { hint: "je mange" }),
      choice("Complete: Tu ___ (aimer) le chocolat ?", ["aime", "aimes", "aimez"], 1, "com tu: -es"),
      choice("'Je vais à l'école' significa…", ["eu vou à escola", "eu comi na escola", "eu moro na escola"], 0),
      match([["manger", "comer"], ["boire", "beber"], ["dormir", "dormir"], ["habiter", "morar"]]),
      trans("Eu moro em Paris.", "J'habite à Paris.", { accept: ["J'habite à Paris."] })
    ],
    words: ["w-manger", "w-boire", "w-dormir", "w-aimer", "w-habiter", "w-aller"]
  },
  {
    id: "l14-heure",
    worldId: "world-2",
    title: "Quelle heure est-il ?",
    icon: "clock",
    topic: "horas",
    objective: "Perguntar e dizer as horas.",
    theory: [
      "Quelle heure est-il ? = que horas são?",
      "Il est une heure (1h) · Il est deux heures (2h).",
      "le matin (manhã), midi (meio-dia), le soir (noite), la nuit (madrugada)."
    ],
    examples: [
      { fr: "Il est trois heures.", pt: "São três horas." },
      { fr: "À demain matin !", pt: "Até amanhã de manhã!" }
    ],
    exercises: [
      choice("Como perguntar as horas?", ["Quelle heure est-il ?", "Comment tu t'appelles ?", "Où est la gare ?"], 0),
      choice("'Il est midi' é…", ["meio-dia", "meia-noite", "uma hora"], 0),
      fill("Il est deux h___ (horas).", "heures", { hint: "h + eures" }),
      match([["le matin", "a manhã"], ["midi", "o meio-dia"], ["le soir", "a noite"], ["la nuit", "a madrugada"]])
    ],
    words: ["w-heure", "w-matin", "w-midi", "w-soir", "w-nuit", "w-jour"]
  },
  {
    id: "l15-negation",
    worldId: "world-2",
    title: "Ne… pas",
    icon: "xCircle",
    topic: "negacao",
    objective: "Negar frases com ne… pas.",
    theory: [
      "Je ne suis pas… = eu não sou/estou…",
      "Je n'aime pas… = eu não gosto… (n' antes de vogal).",
      "O 'ne' costuma sumir na fala: 'Je sais pas' (informal)."
    ],
    examples: [
      { fr: "Je ne suis pas fatiguée.", pt: "Eu não estou cansada." },
      { fr: "Je n'aime pas le café.", pt: "Eu não gosto de café." }
    ],
    exercises: [
      build("Monte: 'Eu não estou cansada.'", ["Je", "ne", "suis", "pas", "fatiguée", "."], ["Je", "ne", "suis", "pas", "fatiguée", "."]),
      fill("Je n'___ pas le café. (não gosto)", "aime", { hint: "aimer" }),
      choice("Em conversa informal, o que costuma sumir?", ["o 'ne'", "o 'pas'", "o verbo"], 0, "Je sais pas — natural!"),
      choice("'Je ne suis pas' significa…", ["eu não sou/estou", "eu sou", "eu não tenho"], 0),
      fill("Je ___ sais pas. (não sei)", "ne", { hint: "ne… pas" })
    ],
    words: ["w-pas", "w-bien"]
  },
  {
    id: "l16-passe",
    worldId: "world-2",
    title: "Le passé composé",
    icon: "hourglass",
    topic: "passe-compose",
    objective: "Falar de ações passadas com avoir + particípio.",
    theory: [
      "Passé composé = avoir (presente) + particípio passado.",
      "j'ai mangé · tu as parlé · il a fini.",
      "Verbos -er → -é · -ir → -i · -re → -u (muitos casos)."
    ],
    examples: [
      { fr: "Hier, j'ai mangé une pizza.", pt: "Ontem, eu comi uma pizza." },
      { fr: "J'ai parlé avec Léa.", pt: "Eu falei com a Léa." }
    ],
    exercises: [
      fill("Hier, j'___ mangé une pizza.", "ai", { hint: "avoir no presente" }),
      choice("Complete: Tu ___ parlé avec Marie.", ["as", "es", "est"], 0),
      match([["mangé", "comido"], ["parlé", "falado"], ["fini", "terminado"]]),
      choice("'J'ai fini' significa…", ["eu terminei", "eu comecei", "eu vou terminar"], 0),
      trans("Ontem, eu comi uma pizza.", "Hier, j'ai mangé une pizza.", { accept: ["Hier j'ai mangé une pizza"] })
    ],
    words: ["w-etre", "w-avoir"]
  },
  {
    id: "l17-maison",
    worldId: "world-2",
    title: "La maison",
    icon: "house",
    topic: "casa",
    objective: "Nomear os cômodos da casa e dizer onde você mora.",
    theory: [
      "la maison, le salon (sala), la cuisine (cozinha), la salle de bain (banheiro).",
      "la chambre (quarto), le jardin (jardim), au premier étage (no 1º andar).",
      "Habiter = morar: J'habite dans un petit appartement."
    ],
    examples: [
      { fr: "Ma cuisine est toute petite.", pt: "Minha cozinha é pequenininha." },
      { fr: "On mange au salon ce soir.", pt: "Comemos na sala hoje à noite." },
      { fr: "La salle de bain est à l'étage.", pt: "O banheiro fica no andar de cima." }
    ],
    exercises: [
      match([["le salon", "a sala"], ["la cuisine", "a cozinha"], ["la chambre", "o quarto"], ["la salle de bain", "o banheiro"]]),
      choice("Onde você toma banho?", ["dans la salle de bain", "dans la cuisine", "dans le jardin"], 0),
      fill("Ma c___ (cozinha) est petite.", "cuisine", { hint: "c + uisine" }),
      trans("Comemos na sala hoje à noite.", "On mange au salon ce soir.", { accept: ["On mange au salon ce soir"] }),
      choice("'Habiter' significa…", ["morar", "comer", "trabalhar"], 0)
    ],
    words: ["w-salon", "w-cuisine", "w-salle-de-bain", "w-chambre"]
  },
  {
    id: "l18-meteo",
    worldId: "world-2",
    title: "Quel temps fait-il ?",
    icon: "cloudSun",
    topic: "clima",
    objective: "Falar do clima: sol, chuva, neve e vento.",
    theory: [
      "Il fait beau (faz bonito) · Il pleut (chove) · Il neige (neva).",
      "Il y a du soleil (tem sol) · du vent (vento) · des nuages (nuvens).",
      "Quel temps fait-il ? = como está o tempo?"
    ],
    examples: [
      { fr: "Il fait beau aujourd'hui, il y a du soleil.", pt: "Está bonito hoje, tem sol." },
      { fr: "Il pleut, n'oublie pas ton parapluie.", pt: "Está chovendo, não esqueça seu guarda-chuva." },
      { fr: "Il neige à Paris en hiver.", pt: "Nevou em Paris no inverno." }
    ],
    exercises: [
      choice("Como perguntar o tempo?", ["Quel temps fait-il ?", "Quelle heure est-il ?", "Où est la gare ?"], 0),
      fill("Il p___ (chove), prends ton parapluie.", "pleut", { hint: "pleuvoir" }),
      match([["le soleil", "o sol"], ["la pluie", "a chuva"], ["la neige", "a neve"], ["le vent", "o vento"]]),
      trans("Está chovendo, não esqueça seu guarda-chuva.", "Il pleut, n'oublie pas ton parapluie.", { accept: ["Il pleut, n'oublie pas ton parapluie"] }),
      choice("'Il fait beau' significa…", ["está bonito", "está frio", "está chovendo"], 0)
    ],
    words: ["w-soleil", "w-pluie", "w-neige", "w-vent"]
  },
  {
    id: "l19-journee",
    worldId: "world-2",
    title: "Ma journée",
    icon: "sun",
    topic: "rotina",
    objective: "Contar sua rotina diária com verbos reflexivos e horas.",
    theory: [
      "Se réveiller (acordar) · se lever (levantar) · se coucher (deitar).",
      "Je me réveille à 7h · je travaille · je dîne · je me couche à 23h.",
      "Normalmente (geralmente) · parfois (às vezes) · jamais (nunca)."
    ],
    examples: [
      { fr: "Je me réveille à sept heures.", pt: "Acordo às sete horas." },
      { fr: "Normalement, je travaille jusqu'à 18h.", pt: "Geralmente, trabalho até as 18h." },
      { fr: "Je me couche tard le week-end.", pt: "Deito tarde no fim de semana." }
    ],
    exercises: [
      fill("Je me r___ (acordo) à sept heures.", "réveille", { accept: ["reveille"], hint: "se réveiller" }),
      choice("'Normalement' significa…", ["geralmente", "nunca", "agora"], 0),
      build("Monte: 'Deito tarde no fim de semana.'", ["Je", "me", "couche", "tard", "le", "week-end", "."], ["Je", "me", "couche", "tard", "le", "week-end", "."]),
      trans("Acordo às sete horas.", "Je me réveille à sept heures.", { accept: ["Je me réveille à 7h"] }),
      choice("O oposto de 'jamais' é…", ["souvent", "parfois", "toujours"], 2, "jamais = nunca · toujours = sempre")
    ],
    words: ["w-reveiller", "w-diner", "w-travail"]
  }
];

const world2Boss: World["boss"] = {
  id: "boss-2",
  worldId: "world-2",
  title: "Le Croissant Géant",
  icon: "bowlFood",
  intro: "Um croissant do tamanho de uma casa quer te comer de volta! Mostre quem manda: responda com tudo o que aprendeu sobre a vida cotidiana. ",
  xp: 100,
  exercises: [
    fill("Ma ___ (irmã) s'appelle Camille.", "sœur", { accept: ["soeur"], hint: "s + œur" }),
    choice("Como pedir educadamente na padaria?", ["Je voudrais une baguette", "Je veux une baguette", "Donne une baguette"], 0),
    fill("Je ___ (manger) une pomme.", "mange"),
    choice("'Il est midi' é…", ["meio-dia", "meia-noite", "uma hora"], 0),
    build("Monte: 'Eu não gosto de café.'", ["Je", "n'aime", "pas", "le", "café", "."], ["Je", "n'aime", "pas", "le", "café", "."]),
    trans("Ontem, eu comi uma pizza.", "Hier, j'ai mangé une pizza.", { accept: ["Hier j'ai mangé une pizza"] }),
    listen("O que você ouviu?", "Je voudrais un croissant.", ["Je voudrais un croissant", "Je voudrais un pain", "Je veux un café"], 0),
    choice("'Je n'aime pas le café' — o que sumiu na fala informal?", ["o 'ne'", "o 'pas'", "o verbo"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 3 —  La Ville
// ══════════════════════════════════════════════════════════════
const world3Lessons: Lesson[] = [
  {
    id: "l17-ville",
    worldId: "world-3",
    title: "Dans la ville",
    icon: "city",
    topic: "cidade",
    objective: "Nomear lugares da cidade.",
    theory: [
      "la rue (rua), la place (praça), le parc (parque), l'école, la gare (estação).",
      "l'hôpital (hospital), le magasin (loja), le cinéma.",
      "Où est… ? = onde fica… ?"
    ],
    examples: [
      { fr: "Où est la gare ?", pt: "Onde fica a estação?" },
      { fr: "Le parc est près de l'école.", pt: "O parque fica perto da escola." }
    ],
    exercises: [
      match([["la rue", "a rua"], ["la gare", "a estação"], ["le parc", "o parque"], ["l'école", "a escola"]]),
      choice("'Où est la gare ?' pergunta…", ["onde fica a estação", "que horas são", "como você se chama"], 0),
      choice("'La place' é…", ["a praça", "o prato", "a porta"], 0),
      fill("La g___ (estação) est près du parc.", "gare", { hint: "g + are" }),
      trans("Onde fica a estação?", "Où est la gare ?", { accept: ["Où est la gare ?"] })
    ],
    words: ["w-ville", "w-rue", "w-place", "w-parc", "w-gare", "w-ecole"]
  },
  {
    id: "l18-directions",
    worldId: "world-3",
    title: "Où est… ?",
    icon: "compass",
    topic: "direcoes",
    objective: "Perguntar e dar direções.",
    theory: [
      "à gauche (à esquerda), à droite (à direita), tout droit (em frente).",
      "près de (perto de), loin de (longe de).",
      "'Où est… ?' + 'C'est à droite.'"
    ],
    examples: [
      { fr: "La boulangerie est à droite.", pt: "A padaria fica à direita." },
      { fr: "Le métro est tout droit.", pt: "O metrô é em frente." }
    ],
    exercises: [
      match([["à gauche", "à esquerda"], ["à droite", "à direita"], ["tout droit", "em frente"], ["près de", "perto de"]]),
      choice("'Loin de' significa…", ["longe de", "perto de", "em frente"], 0),
      fill("La boulangerie est à d___ (direita).", "droite", { hint: "d + roite" }),
      build("Monte: 'O metrô é em frente.'", ["Le", "métro", "est", "tout", "droit", "."], ["Le", "métro", "est", "tout", "droit", "."]),
      choice("Para pedir informações, comece com…", ["Pardon, où est… ?", "Je voudrais…", "Merci beaucoup"], 0)
    ],
    words: ["w-gauche", "w-droite", "w-tout-droit", "w-pres", "w-loin", "w-ou"]
  },
  {
    id: "l19-transports",
    worldId: "world-3",
    title: "Les transports",
    icon: "train",
    topic: "transporte",
    objective: "Falar de meios de transporte.",
    theory: [
      "le métro, le bus, le train (trem), la voiture (carro), le vélo (bicicleta).",
      "Prendre le métro = pegar o metrô.",
      "Le ticket, s'il vous plaît. (a passagem)"
    ],
    examples: [
      { fr: "Je prends le métro tous les jours.", pt: "Eu pego o metrô todos os dias." },
      { fr: "Un ticket pour Paris, s'il vous plaît.", pt: "Uma passagem para Paris, por favor." }
    ],
    exercises: [
      match([["le métro", "o metrô"], ["le train", "o trem"], ["la voiture", "o carro"], ["le vélo", "a bicicleta"]]),
      choice("'Prendre le métro' significa…", ["pegar o metrô", "perder o metrô", "pagar o metrô"], 0),
      choice("Qual é feminino?", ["le bus", "la voiture", "le train"], 1),
      fill("Je prends le m___ (metrô).", "métro", { accept: ["metro"], hint: "m + étro" }),
      trans("Uma passagem para Paris, por favor.", "Un ticket pour Paris, s'il vous plaît.", { accept: ["Un ticket pour Paris s'il vous plaît"] })
    ],
    words: ["w-metro", "w-bus", "w-train", "w-voiture", "w-velo"]
  },
  {
    id: "l20-futur-proche",
    worldId: "world-3",
    title: "Le futur proche",
    icon: "rocket",
    topic: "futur",
    objective: "Falar do futuro próximo com aller + infinitivo.",
    theory: [
      "Futur proche = aller (presente) + verbo no infinitivo.",
      "Je vais manger · tu vas partir · on va voir.",
      "É o jeito mais natural de falar do futuro no dia a dia."
    ],
    examples: [
      { fr: "Je vais étudier ce soir.", pt: "Vou estudar esta noite." },
      { fr: "On va au cinéma demain.", pt: "A gente vai ao cinema amanhã." }
    ],
    exercises: [
      fill("Je ___ (aller) manger.", "vais", { hint: "je vais" }),
      choice("'On va voir' significa…", ["a gente vai ver", "a gente viu", "a gente vai embora"], 0),
      build("Monte: 'Vou estudar esta noite.'", ["Je", "vais", "étudier", "ce", "soir", "."], ["Je", "vais", "étudier", "ce", "soir", "."]),
      choice("Futur proche é formado com…", ["aller + infinitivo", "avoir + particípio", "être + adjetivo"], 0),
      trans("Vou comer uma baguete.", "Je vais manger une baguette.", { accept: ["Je vais manger une baguette."] })
    ],
    words: ["w-aller", "w-va"]
  },
  {
    id: "l21-magasins",
    worldId: "world-3",
    title: "Les magasins",
    icon: "storefront",
    topic: "compras",
    objective: "Nomear lojas e fazer compras simples na cidade.",
    theory: [
      "la boutique (loja), le marché (feira), le supermarché (supermercado).",
      "Ouvrir (abrir) · fermer (fechar): le magasin ouvre à 9h.",
      "Faire des achats = fazer compras · à prix réduit (com desconto)."
    ],
    examples: [
      { fr: "La boutique de vêtements ouvre à 10h.", pt: "A loja de roupas abre às 10h." },
      { fr: "Je fais mes achats au marché le samedi.", pt: "Faço minhas compras na feira sábado." },
      { fr: "Ce supermarché est ouvert jusqu'à 21h.", pt: "Esse supermercado fica aberto até as 21h." }
    ],
    exercises: [
      match([["la boutique", "a loja"], ["le marché", "a feira"], ["le supermarché", "o supermercado"], ["les achats", "as compras"]]),
      choice("A loja ABRE às 9h: …", ["Le magasin ouvre à 9h.", "Le magasin ferme à 9h.", "Le magasin chante à 9h."], 0),
      fill("Je fais mes a___ (compras) au marché.", "achats", { hint: "achat + s" }),
      trans("A loja de roupas abre às 10h.", "La boutique de vêtements ouvre à 10h.", { accept: ["La boutique de vêtements ouvre à 10h"] }),
      choice("'À prix réduit' significa…", ["com desconto", "caro", "grátis"], 0)
    ],
    words: ["w-boutique", "w-marche", "w-acheter", "w-prix"]
  },
  {
    id: "l22-marche",
    worldId: "world-3",
    title: "Au marché",
    icon: "basket",
    topic: "compras",
    objective: "Comprar na feira: perguntar preço, pagar e negociar com simpatia.",
    theory: [
      "C'est combien ? (quanto é?) · Ça fait… euros (dá… euros).",
      "Je peux payer par carte ? (posso pagar com cartão?)",
      "Negociar com carinho: Vous pouvez faire un petit prix ? (pode dar uma descontadinha?)"
    ],
    examples: [
      { fr: "Bonjour, c'est combien les fraises ?", pt: "Olá, quanto custa o morango?" },
      { fr: "Ça fait trois euros le kilo.", pt: "Dá três euros o quilo." },
      { fr: "Vous pouvez faire un petit prix ?", pt: "Pode dar uma descontadinha?" }
    ],
    exercises: [
      fill("C'est c___ (quanto) les fraises ?", "combien", { hint: "c + ombien" }),
      choice("Perguntar o preço: …", ["C'est combien ?", "C'est qui ?", "C'est où ?"], 0),
      trans("Posso pagar com cartão?", "Je peux payer par carte ?", { accept: ["Je peux payer par carte"] }),
      choice("'Ça fait trois euros' significa…", ["dá três euros", "são três quilos", "abre às três"], 0),
      match([["payer", "pagar"], ["le prix", "o preço"], ["acheter", "comprar"], ["combien", "quanto"]])
    ],
    words: ["w-payer", "w-prix", "w-acheter"]
  },
  {
    id: "l23-monuments",
    worldId: "world-3",
    title: "Les monuments",
    icon: "camera",
    topic: "pontos-turisticos",
    objective: "Falar de pontos turísticos e visitar a cidade.",
    theory: [
      "La Tour Eiffel, le Louvre, Notre-Dame, le musée d'Orsay.",
      "Visiter (visitar) · admirer (admirar) · prendre des photos (tirar fotos).",
      "Le monument est fermé le lundi (fechado na segunda)."
    ],
    examples: [
      { fr: "On visite la Tour Eiffel demain matin.", pt: "Visitamos a Torre Eiffel amanhã de manhã." },
      { fr: "Le musée est gratuit le premier dimanche du mois.", pt: "O museu é grátis no primeiro domingo do mês." },
      { fr: "Attention, le monument est fermé le lundi.", pt: "Atenção, o monumento fecha na segunda." }
    ],
    exercises: [
      choice("Qual monumento é símbolo de Paris?", ["La Tour Eiffel", "La Tour de Pise", "Le Big Ben"], 0),
      fill("On v___ (visitamos) la Tour Eiffel demain.", "visite", { accept: ["visitons"], hint: "visiter" }),
      trans("O museu é grátis no primeiro domingo do mês.", "Le musée est gratuit le premier dimanche du mois.", { accept: ["Le musée est gratuit le premier dimanche du mois"] }),
      choice("O monumento está FECHADO: …", ["Le monument est fermé.", "Le monument est ouvert.", "Le monument est perdu."], 0),
      match([["le musée", "o museu"], ["le monument", "o monumento"], ["visiter", "visitar"], ["gratuit", "grátis"]])
    ],
    words: ["w-musee", "w-monument", "w-visiter"]
  }
];

const world3Boss: World["boss"] = {
  id: "boss-3",
  worldId: "world-3",
  title: "Le Métro Fou",
  icon: "train",
  intro: "O metrô de Paris ficou maluco e só para se você responder no ritmo! Cada resposta certa freia o vagão. C'est parti ! ",
  xp: 100,
  exercises: [
    choice("'Où est la gare ?' pergunta…", ["onde fica a estação", "que horas são", "o que é isso"], 0),
    fill("La boulangerie est à d___ (direita).", "droite", { hint: "d + roite" }),
    match([["le métro", "o metrô"], ["la voiture", "o carro"], ["le vélo", "a bicicleta"], ["à gauche", "à esquerda"]]),
    choice("'Loin de' significa…", ["longe de", "perto de", "em frente"], 0),
    fill("Je ___ (aller) manger.", "vais"),
    build("Monte: 'Vou estudar esta noite.'", ["Je", "vais", "étudier", "ce", "soir", "."], ["Je", "vais", "étudier", "ce", "soir", "."]),
    listen("O que você ouviu?", "Prends le métro !", ["Prends le métro", "Prends le bus", "Prends le train"], 0),
    trans("A padaria fica à direita.", "La boulangerie est à droite.", { accept: ["La boulangerie est à droite"] })
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 4 —  Conversations
// ══════════════════════════════════════════════════════════════
const world4Lessons: Lesson[] = [
  {
    id: "l21-question",
    worldId: "world-4",
    title: "Poser une question",
    icon: "question",
    topic: "perguntas",
    objective: "Fazer perguntas de jeitos naturais: est-ce que, inversão e intonação.",
    theory: [
      "3 jeitos: 'Tu viens ?' (intonação) · 'Est-ce que tu viens ?' (neutro) · 'Viens-tu ?' (formal).",
      "Est-ce que é o mais seguro e natural no dia a dia.",
      "Palavras-chave: qui (quem), quoi (o quê), où (onde), quand (quando), pourquoi (por quê), comment (como)."
    ],
    examples: [
      { fr: "Est-ce que tu viens ce soir ?", pt: "Você vem hoje à noite?" },
      { fr: "Où est-ce que tu habites ?", pt: "Onde você mora?" },
      { fr: "Pourquoi tu pleures ?", pt: "Por que você está chorando?" }
    ],
    exercises: [
      choice("Qual é a forma mais NATURAL em conversa?", ["Viens-tu ?", "Est-ce que tu viens ?", "Tu viens ?"], 2, "Na fala, só a intonação resolve!"),
      choice("O que significa 'où'?", ["quando", "onde", "quem"], 1),
      fill("Q___ (por quê) tu pleures ?", "Pourquoi", { accept: ["pourquoi"], hint: "p + ourquoi" }),
      build("Monte a pergunta: 'Onde você mora?'", ["Où", "est-ce que", "tu", "habites", "?"], ["Où", "est-ce que", "tu", "habites", "?"]),
      choice("Qual palavra pergunta QUEM?", ["quoi", "qui", "quand"], 1)
    ],
    words: ["w-question", "w-repondre", "w-bien-sur"]
  },
  {
    id: "l22-reagir",
    worldId: "world-4",
    title: "Répondre et réagir",
    icon: "chatCircleDots",
    topic: "reacoes",
    objective: "Responder e reagir com naturalidade: combinar, recusar com carinho, mostrar surpresa.",
    theory: [
      "Combinar: Bien sûr ! · Pas de souci · C'est noté !",
      "Recusar com carinho: Désolé·e, je ne peux pas… · Ça me ferait plaisir, mais…",
      "Reagir: C'est vrai ? · Ah bon ? · Trop bien ! · Pas possible !"
    ],
    examples: [
      { fr: "— Tu peux m'aider ? — Bien sûr, pas de souci !", pt: "— Pode me ajudar? — Claro, sem problema!" },
      { fr: "C'est vrai ? Je ne savais pas !", pt: "É verdade? Eu não sabia!" },
      { fr: "Désolé, je ne peux pas venir samedi.", pt: "Desculpa, não posso vir no sábado." }
    ],
    exercises: [
      choice("Alguém te convida e você aceita animada. O que diz?", ["Bien sûr, avec plaisir !", "Bof…", "Je ne peux pas."], 0),
      choice("O que significa 'C'est noté !'?", ["está anotado / combinado", "está errado", "estou cansado"], 0),
      fill("P___ de souci ! (sem problema)", "Pas", { accept: ["pas"], hint: "P + as" }),
      trans("É verdade? Eu não sabia!", "C'est vrai ? Je ne savais pas !", { accept: ["C'est vrai ? Je ne savais pas"] }),
      choice("Recusar com carinho: …", ["Désolé, je ne peux pas.", "Non. Point final.", "Je m'en fiche."], 0)
    ],
    words: ["w-pas-de-souci", "w-vrai", "w-bien-sur"]
  },
  {
    id: "l23-rendez-vous",
    worldId: "world-4",
    title: "Prendre rendez-vous",
    icon: "calendar",
    topic: "encontros",
    objective: "Marcar encontros: propor dias, horários e confirmar disponibilidade.",
    theory: [
      "Propor: On se voit… ? · Ça te dit de… ? · Tu es libre… ?",
      "Confirmar: Ça marche ! · C'est parfait · Je suis disponible.",
      "Remarcar: On peut décaler ? · Je suis pris·e lundi."
    ],
    examples: [
      { fr: "On se voit samedi ? Tu es libre ?", pt: "A gente se vê sábado? Você está livre?" },
      { fr: "Ça marche, à demain !", pt: "Combinado, até amanhã!" },
      { fr: "Je suis prise mardi. On peut décaler ?", pt: "Estou ocupada terça. Podemos remarcar?" }
    ],
    exercises: [
      fill("Tu es l___ (livre) demain ?", "libre", { hint: "l + ibre" }),
      choice("Confirmar um encontro: …", ["Ça marche !", "Je suis pris.", "Bof."], 0),
      build("Monte: 'A gente se vê sábado?'", ["On", "se", "voit", "samedi", "?"], ["On", "se", "voit", "samedi", "?"]),
      choice("'Je suis pris·e' significa…", ["estou ocupado(a)", "estou pronto(a)", "estou perdido(a)"], 0),
      trans("Estou ocupada terça. Podemos remarcar?", "Je suis prise mardi. On peut décaler ?", { accept: ["Je suis prise mardi. On peut décaler ?"] })
    ],
    words: ["w-rendez-vous", "w-disponible", "w-attendre"]
  },
  {
    id: "l24-gouts",
    worldId: "world-4",
    title: "Les goûts et les envies",
    icon: "heartStraight",
    topic: "gostos",
    objective: "Falar de gostos e vontades: adorer, préférer, avoir envie de.",
    theory: [
      "J'adore… (adoro) · J'aime bien… (gosto) · Je préfère… (prefiro).",
      "Avoir envie de = estar com vontade de: j'ai envie de dormir.",
      "Ça m'embête = isso me incomoda (para o que NÃO gosta, sem ser grosso)."
    ],
    examples: [
      { fr: "J'adore la crêpe au chocolat.", pt: "Adoro crepe de chocolate." },
      { fr: "J'ai envie de danser !", pt: "Estou com vontade de dançar!" },
      { fr: "Ça m'embête un peu, désolé.", pt: "Isso me incomoda um pouco, desculpa." }
    ],
    exercises: [
      choice("O que significa 'J'adore'?", ["adoro", "detesto", "prefiro"], 0),
      fill("J'ai envie ___ danser. (de)", "de", { hint: "avoir envie de + verbo" }),
      choice("Para dizer que algo te incomoda com educação: …", ["Ça m'embête un peu.", "Je déteste ça.", "C'est nul."], 0),
      match([["adorer", "adorar"], ["préférer", "preferir"], ["détester", "detestar"], ["avoir envie de", "estar com vontade de"]]),
      trans("Adoro crepe de chocolate.", "J'adore la crêpe au chocolat.", { accept: ["J'adore la crêpe au chocolat"] })
    ],
    words: ["w-adorer", "w-preferer", "w-embeter"]
  },
  {
    id: "l25-telephone",
    worldId: "world-4",
    title: "Au téléphone",
    icon: "phoneCall",
    topic: "telefone",
    objective: "Lidar com chamadas: atender, pedir alguém, desligar com carinho.",
    theory: [
      "Atender: Allô ? · C'est de la part de qui ? · Je vous passe…",
      "Pedir: Je voudrais parler à… · Est-ce que Marie est là ?",
      "Desligar: Je vous rappelle plus tard · Merci, à bientôt !"
    ],
    examples: [
      { fr: "Allô ? Je voudrais parler à Marie.", pt: "Alô? Gostaria de falar com a Marie." },
      { fr: "Elle n'est pas là. Je vous passe son frère ?", pt: "Ela não está. Passo o irmão dela?" },
      { fr: "D'accord, je vous rappelle plus tard.", pt: "Certo, ligo de volta mais tarde." }
    ],
    exercises: [
      choice("Como se atende o telefone na França?", ["Allô ?", "Oui ?", "Présent !"], 0),
      fill("Je voudrais p___ à Marie. (falar)", "parler", { hint: "par + ler" }),
      choice("'Je vous passe…' significa…", ["vou passá-lo(a) para…", "estou passando mal", "vou sair agora"], 0),
      trans("Ligo de volta mais tarde.", "Je vous rappelle plus tard.", { accept: ["Je vous rappelle plus tard"] }),
      choice("Para terminar a ligação com educação: …", ["Merci, à bientôt !", "Ciao !", "Tais-toi !"], 0)
    ],
    words: ["w-telephone", "w-allo", "w-rappeler"]
  },
  {
    id: "l26-expressions",
    worldId: "world-4",
    title: "Les expressions utiles",
    icon: "sparkle",
    topic: "expressoes",
    objective: "Usar expressões do dia a dia: tant pis, tant mieux, à peu près.",
    theory: [
      "Tant pis (paciência, que pena) · Tant mieux (ainda bem!).",
      "À peu près (mais ou menos) · Ça dépend (depende) · Pas grave (sem problema).",
      "Reagir: C'est génial ! · C'est dommage (que pena)."
    ],
    examples: [
      { fr: "Le train est parti ? Tant pis, on prendra le suivant.", pt: "O trem partiu? Paciência, pegaremos o próximo." },
      { fr: "Tu vas mieux ? — Oui, à peu près.", pt: "Você está melhor? — Sim, mais ou menos." },
      { fr: "C'est dommage, j'aurais aimé venir.", pt: "Que pena, eu gostaria de ter ido." }
    ],
    exercises: [
      choice("Perdeu o trem, mas sem drama: …", ["Tant pis !", "Tant mieux !", "C'est génial !"], 0),
      fill("Tant m___ (ainda bem) que tu vas bien !", "mieux", { hint: "tant mieux" }),
      choice("'À peu près' significa…", ["mais ou menos", "com certeza", "de jeito nenhum"], 0),
      trans("Que pena, eu gostaria de ter ido.", "C'est dommage, j'aurais aimé venir.", { accept: ["C'est dommage, j'aurais aimé venir"] }),
      match([["tant pis", "paciência"], ["tant mieux", "ainda bem"], ["pas grave", "sem problema"], ["ça dépend", "depende"]])
    ],
    words: ["w-tant-pis", "w-tant-mieux", "w-a-peu-pres"]
  },
  {
    id: "l27-services",
    worldId: "world-4",
    title: "Demander des services",
    icon: "handHeart",
    topic: "pedir-ajuda",
    objective: "Pedir favores e serviços com jeitinho francês.",
    theory: [
      "Tu peux m'aider ? (pode me ajudar?) · Pourriez-vous… ? (você poderia…?)",
      "Ça t'embête si… ? (te incomoda se…?) · Je peux te demander un service ?",
      "Agradecer: Merci infiniment ! (muito obrigado!) · C'est très gentil (muito gentil)."
    ],
    examples: [
      { fr: "Pourriez-vous m'aider à porter ce sac ?", pt: "Você poderia me ajudar a carregar essa sacola?" },
      { fr: "Ça t'embête si j'ouvre la fenêtre ?", pt: "Te incomoda se eu abrir a janela?" },
      { fr: "Merci infiniment, c'est très gentil !", pt: "Muito obrigado, é muito gentil!" }
    ],
    exercises: [
      fill("Pourriez-vous m'a___ (ajudar) ?", "aider", { hint: "aider" }),
      choice("Pedir um favor com suavidade: …", ["Je peux te demander un service ?", "Fais ça, maintenant !", "C'est pour toi, débrouille-toi."], 0),
      trans("Te incomoda se eu abrir a janela?", "Ça t'embête si j'ouvre la fenêtre ?", { accept: ["Ça t'embête si j'ouvre la fenêtre ?"] }),
      choice("Agradecer com emoção: …", ["Merci infiniment !", "Bof, merci.", "Pas besoin."], 0),
      build("Monte: 'Você poderia me ajudar?'", ["Pourriez-vous", "m'aider", "?"], ["Pourriez-vous", "m'aider", "?"])
    ],
    words: ["w-aider", "w-bien-sur"]
  }
];

const world4Boss: World["boss"] = {
  id: "boss-4",
  worldId: "world-4",
  title: "Le Grand Bavard",
  icon: "chat",
  intro: "Um tagarela parisiense não para de falar e só te deixa passar se você mantiver a conversa! Responda como um verdadeiro causeur. ",
  xp: 120,
  exercises: [
    choice("A forma mais natural de perguntar 'Você vem?':", ["Tu viens ?", "Viens-tu ?", "Viendras-tu ?"], 0),
    fill("O___ (onde) est-ce que tu habites ?", "Où", { accept: ["ou"], hint: "O + ù" }),
    choice("Aceitar um convite animada: …", ["Bien sûr, avec plaisir !", "Bof, peut-être.", "Je ne peux pas."], 0),
    trans("Combinado, até amanhã!", "Ça marche, à demain !", { accept: ["Ça marche, à demain"] }),
    choice("'J'ai envie de danser' significa…", ["estou com vontade de dançar", "odeio dançar", "sei dançar"], 0),
    fill("Allô ? Je voudrais p___ à Marie.", "parler", { hint: "parler" }),
    match([["bien sûr", "claro"], ["pas de souci", "sem problema"], ["à bientôt", "até logo"], ["ça te dit ?", "topa?"]]),
    build("Monte: 'A gente se vê sábado?'", ["On", "se", "voit", "samedi", "?"], ["On", "se", "voit", "samedi", "?"]),
    listen("O que você ouviu?", "Je vous rappelle plus tard.", ["Je vous rappelle plus tard", "Je vous appelle maintenant", "Je vous vois plus tard"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 5 —  Voyage
// ══════════════════════════════════════════════════════════════
const world5Lessons: Lesson[] = [
  {
    id: "l26-aeroport",
    worldId: "world-5",
    title: "À l'aéroport",
    icon: "airplane",
    topic: "aeroporto",
    objective: "Sobreviver ao aeroporto: check-in, bagagem e embarque.",
    theory: [
      "Le check-in, la valise (mala), le bagage à main (bagagem de mão).",
      "L'embarquement commence à… (o embarque começa às…).",
      "Passeport et billet, s'il vous plaît."
    ],
    examples: [
      { fr: "Où est le comptoir de la compagnie ?", pt: "Onde fica o balcão da companhia?" },
      { fr: "Votre passeport et votre billet, s'il vous plaît.", pt: "Seu passaporte e sua passagem, por favor." },
      { fr: "L'embarquement commence à 9h30.", pt: "O embarque começa às 9h30." }
    ],
    exercises: [
      match([["le passeport", "o passaporte"], ["le billet", "a passagem"], ["la valise", "a mala"], ["l'embarquement", "o embarque"]]),
      fill("L'embarquement commence à 9h___ (30).", "30", { accept: ["9h30", "9:30"], hint: "hora e meia" }),
      choice("No check-in, pedem…", ["votre passeport et votre billet", "votre recette", "votre adresse"], 0),
      trans("Onde fica o balcão da companhia?", "Où est le comptoir de la compagnie ?", { accept: ["Où est le comptoir de la compagnie ?"] }),
      choice("'Bagage à main' é…", ["bagagem de mão", "bagagem despachada", "carrinho de bagagem"], 0)
    ],
    words: ["w-aeroport", "w-bagage", "w-embarquement", "w-passeport", "w-billet"]
  },
  {
    id: "l27-hotel",
    worldId: "world-5",
    title: "À l'hôtel",
    icon: "bed",
    topic: "hotel",
    objective: "Fazer check-in, resolver problemas e pedir serviços no hotel.",
    theory: [
      "J'ai une réservation au nom de… (tenho uma reserva em nome de…).",
      "La clé (chave), le petit-déjeuner (café da manhã), le wifi.",
      "Reclamar com carinho: Il y a un problème dans ma chambre…"
    ],
    examples: [
      { fr: "J'ai une réservation au nom de Silva.", pt: "Tenho uma reserva em nome de Silva." },
      { fr: "Le petit-déjeuner est servi de 7h à 10h.", pt: "O café da manhã é servido das 7h às 10h." },
      { fr: "Il y a un problème : la clé ne marche pas.", pt: "Há um problema: a chave não funciona." }
    ],
    exercises: [
      fill("J'ai une r___ au nom de Silva.", "réservation", { accept: ["reservation"], hint: "r + éservation" }),
      choice("Para pedir a chave: …", ["La clé, s'il vous plaît.", "Le pain, s'il vous plaît.", "La rue, s'il vous plaît."], 0),
      build("Monte: 'O café da manhã é servido das 7h às 10h.'", ["Le", "petit-déjeuner", "est", "servi", "de", "7h", "à", "10h", "."], ["Le", "petit-déjeuner", "est", "servi", "de", "7h", "à", "10h", "."]),
      trans("Tenho uma reserva em nome de Silva.", "J'ai une réservation au nom de Silva.", { accept: ["J'ai une réservation au nom de Silva"] }),
      choice("A chave não funciona. Você diz: …", ["La clé ne marche pas.", "La clé est délicieuse.", "La clé est à droite."], 0)
    ],
    words: ["w-chambre", "w-cleave", "w-reservation"]
  },
  {
    id: "l28-restaurant",
    worldId: "world-5",
    title: "Au restaurant",
    icon: "forkKnife",
    topic: "restaurante",
    objective: "Pedir no restaurante, avisar alergias e pedir a conta.",
    theory: [
      "Je voudrais… · La carte, s'il vous plaît (o cardápio).",
      "Avisar alergia: J'ai une allergie aux… (tenho alergia a…).",
      "Pedir a conta: L'addition, s'il vous plaît."
    ],
    examples: [
      { fr: "La carte, s'il vous plaît.", pt: "O cardápio, por favor." },
      { fr: "Attention, j'ai une allergie aux noix.", pt: "Atenção, tenho alergia a nozes." },
      { fr: "L'addition, s'il vous plaît. C'était délicieux !", pt: "A conta, por favor. Estava delicioso!" }
    ],
    exercises: [
      choice("Para ver o cardápio: …", ["La carte, s'il vous plaît.", "L'addition, s'il vous plaît.", "Le ticket, s'il vous plaît."], 0),
      fill("J'ai une allergie a___ (aos) noix.", "aux", { hint: "à + les = aux" }),
      trans("A conta, por favor.", "L'addition, s'il vous plaît.", { accept: ["L'addition s'il vous plaît"] }),
      choice("O que significa 'C'était délicieux'?", ["estava delicioso", "estava frio", "estava caro"], 0),
      match([["la carte", "o cardápio"], ["l'addition", "a conta"], ["les noix", "as nozes"], ["délicieux", "delicioso"]])
    ],
    words: ["w-restaurant", "w-addition", "w-allergie"]
  },
  {
    id: "l29-imprevus",
    worldId: "world-5",
    title: "Les imprévus",
    icon: "tornado",
    topic: "imprevistos",
    objective: "Lidar com imprevistos: atrasos, perdas e panes.",
    theory: [
      "Le train a du retard (o trem está atrasado) · La voiture est en panne.",
      "J'ai perdu… (perdi…) · Je suis perdu·e (estou perdido(a)).",
      "Pedir ajuda: Vous pouvez m'aider, s'il vous plaît ?"
    ],
    examples: [
      { fr: "Le train a une heure de retard.", pt: "O trem está uma hora atrasado." },
      { fr: "J'ai perdu mon passeport !", pt: "Perdi meu passaporte!" },
      { fr: "Excusez-moi, vous pouvez m'aider ?", pt: "Com licença, você pode me ajudar?" }
    ],
    exercises: [
      fill("Le train a une heure de r___ (atraso).", "retard", { hint: "r + etard" }),
      choice("O carro quebrou. Você diz: …", ["La voiture est en panne.", "La voiture est contente.", "La voiture est à droite."], 0),
      build("Monte: 'Perdi meu passaporte!'", ["J'ai", "perdu", "mon", "passeport", "!"], ["J'ai", "perdu", "mon", "passeport", "!"]),
      trans("Você pode me ajudar, por favor?", "Vous pouvez m'aider, s'il vous plaît ?", { accept: ["Vous pouvez m'aider s'il vous plaît ?"] }),
      choice("'Je suis perdu' significa…", ["estou perdido", "estou atrasado", "estou cansado"], 0)
    ],
    words: ["w-retard", "w-panne", "w-perdu"]
  },
  {
    id: "l30-reserver",
    worldId: "world-5",
    title: "Réserver et annuler",
    icon: "notePencil",
    topic: "reservas",
    objective: "Fazer e cancelar reservas, pedir passagens de ida e volta.",
    theory: [
      "Je voudrais réserver… (gostaria de reservar…).",
      "Un aller simple (ida) · un aller-retour (ida e volta).",
      "Annuler (cancelar) · reporter (remarcar)."
    ],
    examples: [
      { fr: "Je voudrais réserver une table pour deux.", pt: "Gostaria de reservar uma mesa para dois." },
      { fr: "Un aller-retour pour Lyon, s'il vous plaît.", pt: "Uma ida e volta para Lyon, por favor." },
      { fr: "Je dois annuler ma réservation. Désolé.", pt: "Preciso cancelar minha reserva. Desculpe." }
    ],
    exercises: [
      choice("Uma passagem de ida e volta: …", ["un aller-retour", "un aller simple", "un aller-retard"], 0),
      fill("Je voudrais r___ une table pour deux.", "réserver", { accept: ["reserver"], hint: "r + éserver" }),
      trans("Preciso cancelar minha reserva.", "Je dois annuler ma réservation.", { accept: ["Je dois annuler ma réservation"] }),
      choice("'Reporter' significa…", ["remarcar", "cancelar", "embarcar"], 0),
      match([["réserver", "reservar"], ["annuler", "cancelar"], ["reporter", "remarcar"], ["un aller-retour", "ida e volta"]])
    ],
    words: ["w-annuler", "w-voyage", "w-billet"]
  },
  {
    id: "l31-douane",
    worldId: "world-5",
    title: "À la douane",
    icon: "shield",
    topic: "alfandega",
    objective: "Passar pela alfândega com calma: documentos e declarações.",
    theory: [
      "Avez-vous quelque chose à déclarer ? (tem algo a declarar?)",
      "Je n'ai rien à déclarer (não tenho nada a declarar).",
      "Le passeport et le billet, s'il vous plaît."
    ],
    examples: [
      { fr: "Bonjour, votre passeport, s'il vous plaît.", pt: "Olá, seu passaporte, por favor." },
      { fr: "Avez-vous quelque chose à déclarer ?", pt: "Tem algo a declarar?" },
      { fr: "Non, je n'ai rien à déclarer.", pt: "Não, não tenho nada a declarar." }
    ],
    exercises: [
      choice("O agente pergunta se você tem algo a…", ["déclarer", "déjeuner", "danser"], 0),
      fill("Je n'ai r___ (nada) à déclarer.", "rien", { hint: "ne… rien" }),
      trans("Não tenho nada a declarar.", "Je n'ai rien à déclarer.", { accept: ["Je n'ai rien à déclarer"] }),
      choice("Na alfândega, o que pedem primeiro?", ["votre passeport", "votre dessert", "votre chanson"], 0),
      match([["la douane", "a alfândega"], ["déclarer", "declarar"], ["le passeport", "o passaporte"], ["rien", "nada"]])
    ],
    words: ["w-douane", "w-declarer", "w-passeport"]
  },
  {
    id: "l32-taxi",
    worldId: "world-5",
    title: "Prendre un taxi",
    icon: "car",
    topic: "taxi",
    objective: "Pegar táxi: dar o destino e combinar o trajeto.",
    theory: [
      "À l'adresse suivante… (no seguinte endereço…) · je vais à… (vou a…).",
      "Le plus vite possible (o mais rápido possível) · sans me presser (sem pressa).",
      "Combien ça coûte ? (quanto custa?) · La course (a corrida)."
    ],
    examples: [
      { fr: "Bonjour, je vais à la gare de Lyon, s'il vous plaît.", pt: "Olá, vou à estação de Lyon, por favor." },
      { fr: "Vous pouvez y aller sans me presser.", pt: "Pode ir sem pressa." },
      { fr: "Combien coûte la course ?", pt: "Quanto custa a corrida?" }
    ],
    exercises: [
      fill("Bonjour, je v___ (vou) à la gare de Lyon.", "vais", { hint: "aller, je vais" }),
      choice("Dar o destino: …", ["Je vais à l'hôtel, s'il vous plaît.", "Je suis l'hôtel.", "J'aime l'hôtel."], 0),
      trans("Quanto custa a corrida?", "Combien coûte la course ?", { accept: ["Combien coûte la course ?"] }),
      choice("Sem pressa: …", ["sans me presser", "le plus vite possible", "tout de suite"], 0),
      build("Monte: 'Vou à estação de Lyon.'", ["Je", "vais", "à", "la", "gare", "de", "Lyon", "."], ["Je", "vais", "à", "la", "gare", "de", "Lyon", "."])
    ],
    words: ["w-taxi", "w-conducteur", "w-destination"]
  }
];

const world5Boss: World["boss"] = {
  id: "boss-5",
  worldId: "world-5",
  title: "Le Train Fantôme",
  icon: "train",
  intro: "Um trem fantasma só parte se você responder no ritmo da estação! Mostre que ninguém te pega num imprevisto. ",
  xp: 120,
  exercises: [
    choice("No check-in pedem…", ["votre passeport et votre billet", "votre déjeuner", "votre chanson"], 0),
    fill("J'ai une r___ au nom de Silva.", "réservation", { accept: ["reservation"], hint: "r + éservation" }),
    trans("A conta, por favor.", "L'addition, s'il vous plaît.", { accept: ["L'addition s'il vous plaît"] }),
    choice("O trem está atrasado: …", ["Le train a du retard.", "Le train est en panne.", "Le train est perdu."], 0),
    fill("J'ai perdu mon p___ (passaporte) !", "passeport", { hint: "p + asseport" }),
    build("Monte: 'Uma ida e volta para Lyon.'", ["Un", "aller-retour", "pour", "Lyon", ",", "s'il", "vous", "plaît", "."], ["Un", "aller-retour", "pour", "Lyon", ",", "s'il", "vous", "plaît", "."]),
    choice("Avisar alergia a nozes: …", ["J'ai une allergie aux noix.", "J'ai une allergie au train.", "J'adore les noix."], 0),
    listen("O que você ouviu?", "L'embarquement commence à 9h30.", ["L'embarquement commence à 9h30", "L'embarquement commence à 10h", "Le train part à 9h30"], 0),
    trans("Perdi meu passaporte!", "J'ai perdu mon passeport !", { accept: ["J'ai perdu mon passeport"] })
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 6 —  Relations
// ══════════════════════════════════════════════════════════════
const world6Lessons: Lesson[] = [
  {
    id: "l31-plans",
    worldId: "world-6",
    title: "Faire des plans",
    icon: "calendar",
    topic: "planos",
    objective: "Propor planos e convites com entusiasmo e flexibilidade.",
    theory: [
      "Ça te dit de… ? (topa…?) · On pourrait… (a gente podia…).",
      "Accrocher: Trop bien ! · Excellente idée ! · Pourquoi pas ?",
      "Flexível: On verra · Ça dépend · Si tu veux."
    ],
    examples: [
      { fr: "Ça te dit d'aller au cinéma ce soir ?", pt: "Topa ir ao cinema hoje à noite?" },
      { fr: "Excellente idée ! On y va à 20h ?", pt: "Ótima ideia! A gente vai às 20h?" },
      { fr: "Pourquoi pas. On verra demain.", pt: "Por que não. A gente vê amanhã." }
    ],
    exercises: [
      fill("Ça te ___ (topa) d'aller au cinéma ?", "dit", { accept: ["dit ?", "dit"], hint: "ça te dit" }),
      choice("Propor com suavidade: …", ["On pourrait aller au parc.", "Va au parc, maintenant !", "Le parc est nul."], 0),
      trans("Ótima ideia! A gente vai às 20h?", "Excellente idée ! On y va à 20h ?", { accept: ["Excellente idée ! On y va à 20h"] }),
      choice("Responder sem se comprometer: …", ["On verra.", "Oui, tout de suite !", "Jamais !"], 0),
      match([["ça te dit ?", "topa?"], ["on pourrait", "a gente podia"], ["pourquoi pas", "por que não"], ["trop bien", "que máximo"]])
    ],
    words: ["w-plan", "w-inviter", "w-ca-te-dit", "w-ensemble"]
  },
  {
    id: "l32-sentiments",
    worldId: "world-6",
    title: "Les sentiments",
    icon: "heartStraight",
    topic: "sentimentos",
    objective: "Falar de sentimentos: apaixonar-se, ter saudade e se preocupar.",
    theory: [
      "Tomber amoureux·se (apaixonar-se) · avoir le cœur brisé (coração partido).",
      "Manquer = fazer falta: Tu me manques (você me faz falta).",
      "S'inquiéter (preocupar-se) · être inquiet·ète (preocupado)."
    ],
    examples: [
      { fr: "Je crois que je suis amoureux de toi.", pt: "Acho que estou apaixonado por você." },
      { fr: "Tu me manques tellement.", pt: "Você me faz muita falta." },
      { fr: "Elle a le cœur brisé.", pt: "Ela está com o coração partido." }
    ],
    exercises: [
      choice("O que significa 'Tu me manques'?", ["você me faz falta", "você me ama", "você me perdeu"], 0),
      fill("Il est a___ (apaixonado) de Léa.", "amoureux", { hint: "a + moureux" }),
      build("Monte: 'Você me faz muita falta.'", ["Tu", "me", "manques", "tellement", "."], ["Tu", "me", "manques", "tellement", "."]),
      choice("Coração partido: …", ["le cœur brisé", "le cœur content", "le cœur perdu"], 0),
      trans("Acho que estou apaixonado por você.", "Je crois que je suis amoureux de toi.", { accept: ["Je crois que je suis amoureuse de toi.", "Je crois que je suis amoureux de toi"] })
    ],
    words: ["w-amoureux", "w-coeur", "w-ami"]
  },
  {
    id: "l33-dispute",
    worldId: "world-6",
    title: "La dispute",
    icon: "tornado",
    topic: "discordar",
    objective: "Discordar sem romper: marcar limites e acalmar a conversa.",
    theory: [
      "Je ne suis pas d'accord (não concordo) · Je vois ça autrement (vejo diferente).",
      "Marcar limite: Ça me blesse quand tu dis ça (isso me magoa).",
      "Acalmar: Respire, on en reparle plus tard (respira, conversamos depois)."
    ],
    examples: [
      { fr: "Je ne suis pas d'accord avec toi.", pt: "Não concordo com você." },
      { fr: "Ça me blesse quand tu dis ça.", pt: "Isso me magoa quando você diz isso." },
      { fr: "On en reparle plus tard, d'accord ?", pt: "A gente conversa sobre isso depois, ok?" }
    ],
    exercises: [
      fill("Je ne suis pas d'___ (acordo).", "accord", { hint: "d'accord" }),
      choice("Marcar limite com carinho: …", ["Ça me blesse quand tu dis ça.", "Tais-toi !", "Tu es nul."], 0),
      build("Monte: 'A gente conversa sobre isso depois.'", ["On", "en", "reparle", "plus", "tard", ",", "d'accord", "?"], ["On", "en", "reparle", "plus", "tard", ",", "d'accord", "?"]),
      trans("Não concordo com você.", "Je ne suis pas d'accord avec toi.", { accept: ["Je ne suis pas d'accord avec toi"] }),
      choice("'Tu exagères' significa…", ["você exagera", "você concorda", "você duvida"], 0)
    ],
    words: ["w-dispute", "w-accord", "w-exagerer"]
  },
  {
    id: "l34-conseils",
    worldId: "world-6",
    title: "Donner des conseils",
    icon: "lightbulb",
    topic: "conselhos",
    objective: "Dar conselhos com tu devrais, il faut e si j'étais toi.",
    theory: [
      "Tu devrais + verbo (você deveria…) · Il faut + verbo (é preciso…).",
      "Si j'étais toi, je… (se eu fosse você, eu…).",
      "Suavizar: Tu pourrais essayer… (você podia tentar…)."
    ],
    examples: [
      { fr: "Tu devrais dormir plus.", pt: "Você deveria dormir mais." },
      { fr: "Il faut que tu en parles avec elle.", pt: "É preciso você falar com ela sobre isso." },
      { fr: "Si j'étais toi, je prendrais mon temps.", pt: "Se eu fosse você, eu iria com calma." }
    ],
    exercises: [
      fill("Tu d___ (deveria) dormir plus.", "devrais", { hint: "devoir no conditionnel" }),
      choice("Dar conselho direto e útil: …", ["Il faut que tu en parles avec elle.", "C'est ta faute.", "Bof, je m'en fiche."], 0),
      build("Monte: 'Se eu fosse você, eu iria com calma.'", ["Si", "j'étais", "toi", ",", "je", "prendrais", "mon", "temps", "."], ["Si", "j'étais", "toi", ",", "je", "prendrais", "mon", "temps", "."]),
      trans("Você deveria dormir mais.", "Tu devrais dormir plus.", { accept: ["Tu devrais dormir plus"] }),
      choice("'Il faut' + verbo significa…", ["é preciso", "é proibido", "é possível"], 0)
    ],
    words: ["w-conseil", "w-devoir", "w-bof"]
  },
  {
    id: "l35-excuses",
    worldId: "world-6",
    title: "Les excuses",
    icon: "heart",
    topic: "reconciliacao",
    objective: "Pedir desculpas de verdade e perdoar com o coração.",
    theory: [
      "Je suis désolé·e (sinto muito) · Je te demande pardon (peço seu perdão).",
      "Explicar sem justificar: Je n'aurais pas dû… (eu não devia ter…).",
      "Perdoar: Je te pardonne · On passe à autre chose ?"
    ],
    examples: [
      { fr: "Je te demande pardon. J'ai été bête.", pt: "Peço seu perdão. Fui bobo(a)." },
      { fr: "Je n'aurais pas dû dire ça.", pt: "Eu não devia ter dito isso." },
      { fr: "Je te pardonne. On passe à autre chose ?", pt: "Eu te perdoo. A gente muda de assunto?" }
    ],
    exercises: [
      fill("Je te demande p___ (perdão).", "pardon", { hint: "p + ardon" }),
      choice("Pedir desculpas de verdade: …", ["Je te demande pardon.", "C'est pas moi.", "T'as compris de travers."], 0),
      trans("Eu não devia ter dito isso.", "Je n'aurais pas dû dire ça.", { accept: ["Je n'aurais pas dû dire ça"] }),
      choice("Perdoar e seguir: …", ["Je te pardonne. On passe à autre chose ?", "Je ne te parle plus.", "C'est fini."], 0),
      build("Monte: 'Peço seu perdão.'", ["Je", "te", "demande", "pardon", "."], ["Je", "te", "demande", "pardon", "."])
    ],
    words: ["w-excuse", "w-pardonner", "w-pardon"]
  },
  {
    id: "l36-fetes",
    worldId: "world-6",
    title: "Les fêtes",
    icon: "gift",
    topic: "festas",
    objective: "Falar de aniversários e festas: convidar, dar presentes e comemorar.",
    theory: [
      "Bon anniversaire ! (feliz aniversário!) · Joyeux Noël ! · Bonne année !",
      "Offrir un cadeau (dar um presente) · faire une fête (fazer uma festa).",
      "Convidar: Tu viens à ma fête samedi ?"
    ],
    examples: [
      { fr: "Bon anniversaire, ma chérie !", pt: "Feliz aniversário, minha querida!" },
      { fr: "J'offre un cadeau à ma sœur.", pt: "Dou um presente para minha irmã." },
      { fr: "Tu viens à ma fête samedi ?", pt: "Você vem à minha festa sábado?" }
    ],
    exercises: [
      fill("Bon a___ (aniversário) !", "anniversaire", { hint: "a + nniversaire" }),
      choice("Convidar para a festa: …", ["Tu viens à ma fête samedi ?", "La fête, c'est chez moi, point.", "Viens pas, c'est privé."], 0),
      trans("Dou um presente para minha irmã.", "J'offre un cadeau à ma sœur.", { accept: ["J'offre un cadeau à ma sœur"] }),
      choice("'Un cadeau' é…", ["um presente", "um bolo", "um convite"], 0),
      match([["la fête", "a festa"], ["l'anniversaire", "o aniversário"], ["le cadeau", "o presente"], ["offrir", "dar de presente"]])
    ],
    words: ["w-fete", "w-cadeau", "w-anniversaire", "w-inviter"]
  },
  {
    id: "l37-famille-elargie",
    worldId: "world-6",
    title: "La famille élargie",
    icon: "users",
    topic: "familia",
    objective: "Falar da família ampliada: avós, tios e primos.",
    theory: [
      "Les grands-parents (avós) · l'oncle (tio) · la tante (tia) · le cousin (primo).",
      "La grand-mère / le grand-père (avó/avô).",
      "Ma famille est nombreuse (grande) · proche (unida)."
    ],
    examples: [
      { fr: "Mes grands-parents habitent à Lyon.", pt: "Meus avós moram em Lyon." },
      { fr: "Mon oncle et ma tante viennent dimanche.", pt: "Meu tio e minha tia vêm no domingo." },
      { fr: "Mon cousin parle trois langues.", pt: "Meu primo fala três línguas." }
    ],
    exercises: [
      match([["les grands-parents", "os avós"], ["l'oncle", "o tio"], ["la tante", "a tia"], ["le cousin", "o primo"]]),
      fill("Ma grand-m___ (avó) fait des gâteaux.", "mère", { accept: ["mere"], hint: "grand-m + ère" }),
      trans("Meus avós moram em Lyon.", "Mes grands-parents habitent à Lyon.", { accept: ["Mes grands-parents habitent à Lyon"] }),
      choice("O primo em francês é…", ["le cousin", "l'oncle", "le voisin"], 0),
      choice("Uma família 'nombreuse' é…", ["grande", "pequena", "distante"], 0)
    ],
    words: ["w-grands-parents", "w-oncle", "w-tante", "w-cousin"]
  }
];

const world6Boss: World["boss"] = {
  id: "boss-6",
  worldId: "world-6",
  title: "Le Cœur de Verre",
  icon: "heart",
  intro: "Um coração de vidro guarda a saída da região. Ele só se abre para quem entende de sentimentos, limites e perdão. ",
  xp: 130,
  exercises: [
    choice("Propor um plano com carinho: …", ["Ça te dit d'aller au parc ?", "Va au parc !", "Le parc est nul."], 0),
    fill("Tu me m___ (faz falta) tellement.", "manques", { hint: "manquer" }),
    trans("Não concordo com você.", "Je ne suis pas d'accord avec toi.", { accept: ["Je ne suis pas d'accord avec toi"] }),
    choice("Marcar limite: …", ["Ça me blesse quand tu dis ça.", "Tais-toi !", "Tu exagères, point."], 0),
    fill("Tu d___ (deveria) dormir plus.", "devrais", { hint: "conditionnel de devoir" }),
    build("Monte: 'Peço seu perdão.'", ["Je", "te", "demande", "pardon", "."], ["Je", "te", "demande", "pardon", "."]),
    choice("'Je n'aurais pas dû' significa…", ["eu não devia ter", "eu devia ter", "eu não posso"], 0),
    listen("O que você ouviu?", "Je te pardonne. On passe à autre chose.", ["Je te pardonne", "Je te déteste", "Je te quitte"], 0),
    match([["amoureux", "apaixonado"], ["le cœur brisé", "coração partido"], ["pardonner", "perdoar"], ["une dispute", "uma discussão"]])
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 7 —  Études
// ══════════════════════════════════════════════════════════════
const world7Lessons: Lesson[] = [
  {
    id: "l36-ecole",
    worldId: "world-7",
    title: "À l'école",
    icon: "graduationCap",
    topic: "estudos",
    objective: "Falar de estudos: disciplinas, aulas, professores e exames.",
    theory: [
      "Le cours (a aula), la matière (a disciplina), l'examen (a prova).",
      "Suivre un cours = cursar uma disciplina · passer un examen = fazer uma prova.",
      "Réussir (passar/conseguir) · échouer (reprovar/falhar)."
    ],
    examples: [
      { fr: "Je suis un cours de littérature française.", pt: "Estou cursando literatura francesa." },
      { fr: "Elle passe son examen de droit la semaine prochaine.", pt: "Ela faz a prova de direito na semana que vem." },
      { fr: "J'espère réussir ! J'ai beaucoup révisé.", pt: "Espero passar! Revisei bastante." }
    ],
    exercises: [
      match([["le cours", "a aula"], ["la matière", "a disciplina"], ["l'examen", "a prova"], ["réviser", "revisar"]]),
      fill("Je suis un c___ de littérature.", "cours", { hint: "c + ours" }),
      choice("'Passer un examen' significa…", ["fazer uma prova", "passar de ano", "faltar à aula"], 0),
      trans("Espero passar na prova!", "J'espère réussir mon examen !", { accept: ["J'espère réussir à mon examen !"] }),
      choice("'Échouer' é o oposto de…", ["réussir", "étudier", "écouter"], 0)
    ],
    words: ["w-cours", "w-matiere", "w-examen", "w-reussir", "w-echouer", "w-reviser"]
  },
  {
    id: "l37-opinion",
    worldId: "world-7",
    title: "Exprimer une opinion",
    icon: "chalkboardTeacher",
    topic: "opinioes",
    objective: "Dar opinião com jeitos naturais: à mon avis, je pense que, selon moi.",
    theory: [
      "À mon avis… (na minha opinião) · Selon moi… (segundo eu) · Je pense que… (acho que…).",
      "Suavizar: J'ai l'impression que… (tenho a impressão que…) · Il me semble que… (me parece que…).",
      "Concordar/discordar: Je suis tout à fait d'accord · Je ne suis pas convaincu·e."
    ],
    examples: [
      { fr: "À mon avis, c'est une excellente idée.", pt: "Na minha opinião, é uma excelente ideia." },
      { fr: "Je pense que les examens sont trop stressants.", pt: "Acho que as provas são estressantes demais." },
      { fr: "J'ai l'impression qu'on a besoin de plus de temps.", pt: "Tenho a impressão de que precisamos de mais tempo." }
    ],
    exercises: [
      fill("À mon a___ (opinião)…", "avis", { hint: "a + vis" }),
      choice("Qual é a forma mais natural de começar uma opinião?", ["À mon avis…", "Selon la loi…", "D'après le ciel…"], 0),
      trans("Acho que as provas são estressantes demais.", "Je pense que les examens sont trop stressants.", { accept: ["Je pense que les examens sont trop stressants"] }),
      choice("'Je ne suis pas convaincu·e' significa…", ["não estou convencido(a)", "estou convencido(a)", "não estou aqui"], 0),
      build("Monte: 'Na minha opinião, é uma boa ideia.'", ["À", "mon", "avis", ",", "c'est", "une", "bonne", "idée", "."], ["À", "mon", "avis", ",", "c'est", "une", "bonne", "idée", "."])
    ],
    words: ["w-avis", "w-opinion", "w-argument"]
  },
  {
    id: "l38-argumenter",
    worldId: "world-7",
    title: "Expliquer et argumenter",
    icon: "target",
    topic: "argumentacao",
    objective: "Explicar e argumentar: justificar, dar exemplos e consequências.",
    theory: [
      "Justificar: parce que (porque) · car (pois) · étant donné que (dado que).",
      "Dar exemplos: par exemple · prenons l'exemple de… (tomemos o exemplo de…).",
      "Consequência: donc (então) · par conséquent (por consequência) · c'est pourquoi (por isso)."
    ],
    examples: [
      { fr: "Étant donné que j'ai un examen, je ne peux pas sortir.", pt: "Dado que tenho prova, não posso sair." },
      { fr: "Prenons l'exemple de la littérature : elle ouvre l'esprit.", pt: "Tomemos o exemplo da literatura: ela abre a mente." },
      { fr: "Il a beaucoup travaillé ; par conséquent, il a réussi.", pt: "Ele trabalhou muito; por consequência, ele passou." }
    ],
    exercises: [
      choice("O que significa 'étant donné que'?", ["dado que", "apesar de", "portanto"], 0),
      fill("Je ne peux pas sortir, p___ (porque) j'ai un examen.", "parce que", { accept: ["parceque", "parce qu'"] , hint: "p + arce que" }),
      trans("Tomemos o exemplo da literatura.", "Prenons l'exemple de la littérature.", { accept: ["Prenons l'exemple de la littérature"] }),
      choice("'Par conséquent' introduz…", ["uma consequência", "um exemplo", "uma dúvida"], 0),
      build("Monte: 'Ele trabalhou muito; por isso, passou.'", ["Il", "a", "beaucoup", "travaillé", ";", "c'est", "pourquoi", "il", "a", "réussi", "."], ["Il", "a", "beaucoup", "travaillé", ";", "c'est", "pourquoi", "il", "a", "réussi", "."])
    ],
    words: ["w-argument", "w-preuve", "w-chercher"]
  },
  {
    id: "l39-subjonctif",
    worldId: "world-7",
    title: "Il faut que…",
    icon: "lightbulb",
    topic: "subjonctif",
    objective: "Usar o subjonctif com il faut que, bien que e avant que.",
    theory: [
      "Il faut que + subjonctif: Il faut que tu révisES (é preciso que você revise).",
      "Bien que + subjonctif (embora): Bien qu'il soit fatigué…",
      "Avant que + subjonctif (antes que): Avant que tu partes…"
    ],
    examples: [
      { fr: "Il faut que tu révisés tes leçons.", pt: "É preciso que você revise suas lições." },
      { fr: "Bien qu'il soit tard, elle continue d'étudier.", pt: "Embora seja tarde, ela continua estudando." },
      { fr: "Avant que tu partes, vérifie tes réponses.", pt: "Antes que você vá, confira suas respostas." }
    ],
    exercises: [
      fill("Il faut que tu r___ (réviser) tes leçons.", "révises", { accept: ["revises"], hint: "subjonctif de réviser" }),
      choice("Complete: Bien qu'il ___ tard…", ["soit", "est", "sera"], 0, "bien que + subjonctif: qu'il soit"),
      trans("É preciso que você revise suas lições.", "Il faut que tu révises tes leçons.", { accept: ["Il faut que tu revises tes leçons"] }),
      choice("Depois de 'il faut que' usamos…", ["o subjonctif", "o futuro", "o imperativo"], 0),
      fill("Avant que tu p___ (partir), vérifie tout.", "partes", { hint: "subjonctif de partir" })
    ],
    words: ["w-comprendre", "w-examen"]
  },
  {
    id: "l40-examens",
    worldId: "world-7",
    title: "Les examens",
    icon: "notePencil",
    topic: "exames",
    objective: "Falar de provas: se preparar, fazer e lidar com o resultado.",
    theory: [
      "Se préparer à un examen (se preparar) · réviser ses notes (revisar as anotações).",
      "Bien se débrouiller = se sair bem · se planter (informal) = ir mal.",
      "Le stress des examens é tema universal: Respire, tu vas y arriver !"
    ],
    examples: [
      { fr: "Je me prépare à l'examen de demain.", pt: "Estou me preparando para a prova de amanhã." },
      { fr: "Elle s'est bien débrouillée à l'oral.", pt: "Ela se saiu muito bem na oral." },
      { fr: "Ne stresse pas, tu vas y arriver !", pt: "Não se estresse, você vai conseguir!" }
    ],
    exercises: [
      fill("Je me p___ (preparo) à l'examen.", "prépare", { accept: ["prepare"], hint: "se préparer" }),
      choice("'Se débrouiller' significa…", ["se virar / se sair", "se perder", "desistir"], 0),
      trans("Não se estresse, você vai conseguir!", "Ne stresse pas, tu vas y arriver !", { accept: ["Ne stresse pas, tu vas y arriver"] }),
      choice("Informalmente, 'se planter' à um exame é…", ["ir mal", "ir muito bem", "chegar atrasado"], 0),
      match([["réviser", "revisar"], ["réussir", "passar"], ["échouer", "reprovar"], ["se débrouiller", "se virar"]])
    ],
    words: ["w-reussir", "w-echouer", "w-reviser"]
  },
  {
    id: "l41-universite",
    worldId: "world-7",
    title: "À l'université",
    icon: "student",
    topic: "universidade",
    objective: "Falar da vida universitária: cursos, campus e diploma.",
    theory: [
      "La faculté (faculdade) · le campus · l'étudiant·e (estudante).",
      "Suivre un cursus (seguir um curso) · obtenir un diplôme (obter um diploma).",
      "S'inscrire (matricular-se) · la rentrée (volta às aulas)."
    ],
    examples: [
      { fr: "Elle entre à la faculté de droit en septembre.", pt: "Ela entra na faculdade de direito em setembro." },
      { fr: "Les étudiants sont sur le campus toute la journée.", pt: "Os estudantes ficam no campus o dia todo." },
      { fr: "Il a obtenu son diplôme avec mention.", pt: "Ele obteve o diploma com distinção." }
    ],
    exercises: [
      fill("Elle entre à la f___ (faculdade) de droit.", "faculté", { accept: ["faculte"], hint: "f + aculté" }),
      choice("O que é 'la rentrée'?", ["a volta às aulas", "a formatura", "a biblioteca"], 0),
      trans("Ele obteve o diploma com distinção.", "Il a obtenu son diplôme avec mention.", { accept: ["Il a obtenu son diplôme avec mention"] }),
      choice("Matricular-se em francês: …", ["s'inscrire", "s'endormir", "se réveiller"], 0),
      match([["la faculté", "a faculdade"], ["l'étudiant", "o estudante"], ["le diplôme", "o diploma"], ["le campus", "o campus"]])
    ],
    words: ["w-faculte", "w-etudiant", "w-diplome"]
  },
  {
    id: "l42-dissertation",
    worldId: "world-7",
    title: "La dissertation",
    icon: "notePencil",
    topic: "dissertacao",
    objective: "Estruturar um texto acadêmico: introdução, desenvolvimento e conclusão.",
    theory: [
      "La dissertation tem 3 partes: introduction, développement, conclusion.",
      "L'introduction annonce le sujet et le plan (o tema e o plano).",
      "En conclusion / pour conclure (para concluir) · en d'autres termes (em outras palavras)."
    ],
    examples: [
      { fr: "L'introduction annonce le sujet et le plan.", pt: "A introdução anuncia o tema e o plano." },
      { fr: "En d'autres termes, la liberté a un prix.", pt: "Em outras palavras, a liberdade tem um preço." },
      { fr: "Pour conclure, je pense que l'éducation change tout.", pt: "Para concluir, acho que a educação muda tudo." }
    ],
    exercises: [
      fill("L'introduction annonce le s___ (tema).", "sujet", { hint: "s + ujet" }),
      choice("As 3 partes da dissertação: …", ["introduction, développement, conclusion", "début, milieu, fin", "thèse, antithèse, synthèse"], 0),
      trans("Em outras palavras, a liberdade tem um preço.", "En d'autres termes, la liberté a un prix.", { accept: ["En d'autres termes, la liberté a un prix"] }),
      choice("Para concluir: …", ["Pour conclure…", "D'abord…", "Soudain…"], 0),
      match([["le sujet", "o tema"], ["l'introduction", "a introdução"], ["la conclusion", "a conclusão"], ["le développement", "o desenvolvimento"]])
    ],
    words: ["w-sujet", "w-introduction", "w-conclusion"]
  }
];

const world7Boss: World["boss"] = {
  id: "boss-7",
  worldId: "world-7",
  title: "Le Professeur Exigeant",
  icon: "chalkboardTeacher",
  intro: "O professor mais temido da faculdade só te libera se você argumentar como um mestre! Prepare sua opinião e seu subjonctif. ",
  xp: 140,
  exercises: [
    choice("Para dar opinião com naturalidade: …", ["À mon avis…", "Selon le destin…", "D'après la lune…"], 0),
    fill("Je suis un c___ de littérature.", "cours", { hint: "c + ours" }),
    trans("Espero passar na prova!", "J'espère réussir mon examen !", { accept: ["J'espère réussir à mon examen !"] }),
    choice("'Par conséquent' introduz…", ["uma consequência", "um exemplo", "uma pergunta"], 0),
    fill("Il faut que tu r___ tes leçons.", "révises", { accept: ["revises"], hint: "subjonctif" }),
    choice("Complete: Bien qu'il ___ tard…", ["soit", "est", "sera"], 0),
    build("Monte: 'Na minha opinião, é uma boa ideia.'", ["À", "mon", "avis", ",", "c'est", "une", "bonne", "idée", "."], ["À", "mon", "avis", ",", "c'est", "une", "bonne", "idée", "."]),
    choice("Informalmente, 'se planter' é…", ["ir mal", "ir bem", "estudar muito"], 0),
    listen("O que você ouviu?", "Il faut que tu révises tes leçons.", ["Il faut que tu révises tes leçons", "Il faut que tu dormes", "Il faut que tu sortes"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 8 —  Travail
// ══════════════════════════════════════════════════════════════
const world8Lessons: Lesson[] = [
  {
    id: "l41-entretien",
    worldId: "world-8",
    title: "L'entretien d'embauche",
    icon: "briefcase",
    topic: "entrevista",
    objective: "Se apresentar numa entrevista: formação, experiência e motivação.",
    theory: [
      "Compétences (habilidades) · expérience (experiência) · formation (formação).",
      "Je postule pour le poste de… (candidato-me à vaga de…).",
      "Pontos fortes: je suis organisé·e, à l'écoute, autonome."
    ],
    examples: [
      { fr: "Je postule pour le poste de chef de projet.", pt: "Candidato-me à vaga de gerente de projeto." },
      { fr: "J'ai cinq ans d'expérience dans le marketing.", pt: "Tenho cinco anos de experiência em marketing." },
      { fr: "Mes points forts ? Je suis organisée et à l'écoute.", pt: "Meus pontos fortes? Sou organizada e sei ouvir." }
    ],
    exercises: [
      fill("Je p___ (candidato-me) pour le poste de…", "postule", { hint: "postuler" }),
      match([["le poste", "a vaga"], ["la compétence", "a habilidade"], ["l'expérience", "a experiência"], ["la formation", "a formação"]]),
      trans("Tenho cinco anos de experiência em marketing.", "J'ai cinq ans d'expérience dans le marketing.", { accept: ["J'ai cinq ans d'expérience dans le marketing"] }),
      choice("O que significa 'à l'écoute'?", ["sabe ouvir", "está atrasado", "fala muito"], 0),
      build("Monte: 'Sou organizado e sei ouvir.'", ["Je", "suis", "organisé", "et", "à", "l'écoute", "."], ["Je", "suis", "organisé", "et", "à", "l'écoute", "."])
    ],
    words: ["w-poste", "w-competence", "w-experience"]
  },
  {
    id: "l42-courriel",
    worldId: "world-8",
    title: "Le courriel professionnel",
    icon: "notePencil",
    topic: "email",
    objective: "Escrever e-mails profissionais: objeto, anexo, fórmula de cortesia.",
    theory: [
      "Objet : … (assunto) · Pièce jointe (anexo) · Répondre (responder).",
      "Formal: Madame, Monsieur, · Cordialement, · Bien à vous.",
      "Je me permets de vous écrire… (permito-me escrever-lhe…)."
    ],
    examples: [
      { fr: "Objet : candidature au poste de designer.", pt: "Assunto: candidatura à vaga de designer." },
      { fr: "Veuillez trouver mon CV en pièce jointe.", pt: "Encontre em anexo o meu currículo." },
      { fr: "Dans l'attente de votre réponse, je vous prie d'agréer mes salutations.", pt: "Aguardando sua resposta, receba minhas saudações." }
    ],
    exercises: [
      choice("Como terminar um e-mail formal?", ["Cordialement,", "Salut !", "Bisous !"], 0),
      fill("Veuillez trouver mon CV en p___ (anexo).", "pièce jointe", { accept: ["piece jointe"], hint: "p + ièce jointe" }),
      trans("Encontre em anexo o meu currículo.", "Veuillez trouver mon CV en pièce jointe.", { accept: ["Veuillez trouver mon CV en pièce jointe"] }),
      choice("O que significa 'Objet :' no e-mail?", ["o assunto", "o anexo", "o remetente"], 0),
      match([["le courriel", "o e-mail"], ["la pièce jointe", "o anexo"], ["répondre", "responder"], ["le destinataire", "o destinatário"]])
    ],
    words: ["w-courriel", "w-pj", "w-deadline"]
  },
  {
    id: "l43-reunion",
    worldId: "world-8",
    title: "La réunion",
    icon: "users",
    topic: "reuniao",
    objective: "Participar de reuniões: pauta, pontos, decisões e acompanhamento.",
    theory: [
      "L'ordre du jour (a pauta) · le premier point (o primeiro ponto).",
      "Je voudrais ajouter quelque chose (gostaria de acrescentar algo).",
      "On passe au vote ? · La décision est prise. (decisão tomada)"
    ],
    examples: [
      { fr: "Le premier point de l'ordre du jour est le budget.", pt: "O primeiro ponto da pauta é o orçamento." },
      { fr: "Je voudrais ajouter quelque chose sur ce sujet.", pt: "Gostaria de acrescentar algo sobre esse assunto." },
      { fr: "On est tous d'accord ? La décision est prise.", pt: "Todos de acordo? A decisão está tomada." }
    ],
    exercises: [
      fill("Le premier point de l'ordre du j___ (pauta).", "jour", { hint: "ordre du jour" }),
      choice("Para participar educadamente: …", ["Je voudrais ajouter quelque chose.", "Taisez-vous !", "C'est nul, votre idée."], 0),
      trans("A decisão está tomada.", "La décision est prise.", { accept: ["La décision est prise"] }),
      choice("'L'ordre du jour' é…", ["a pauta", "o horário de almoço", "a sala de reunião"], 0),
      build("Monte: 'O primeiro ponto da pauta é o orçamento.'", ["Le", "premier", "point", "de", "l'ordre", "du", "jour", "est", "le", "budget", "."], ["Le", "premier", "point", "de", "l'ordre", "du", "jour", "est", "le", "budget", "."])
    ],
    words: ["w-reunion", "w-ordre-du-jour", "w-decision"]
  },
  {
    id: "l44-telétravail",
    worldId: "world-8",
    title: "Le télétravail",
    icon: "videoCamera",
    topic: "home-office",
    objective: "Falar de trabalho remoto: visioconferência, horários e conciliação.",
    theory: [
      "Le télétravail (home office) · travailler à distance (trabalhar à distância).",
      "La visioconférence (videoconferência) · couper le micro (mutar).",
      "Concilier vie pro et vie perso (conciliar vida profissional e pessoal)."
    ],
    examples: [
      { fr: "On travaille à distance deux jours par semaine.", pt: "Trabalhamos à distância dois dias por semana." },
      { fr: "La visioconférence commence à 9h, n'oublie pas de couper le micro.", pt: "A videoconferência começa às 9h, não esqueça de mutar." },
      { fr: "Le télétravail m'aide à concilier ma vie pro et perso.", pt: "O home office me ajuda a conciliar a vida profissional e pessoal." }
    ],
    exercises: [
      fill("On travaille à d___ (distância) le vendredi.", "distance", { hint: "d + istance" }),
      choice("Na videoconferência, para não fazer barulho: …", ["coupe le micro", "coupe le café", "coupe le fil"], 0),
      trans("Trabalhamos à distância dois dias por semana.", "On travaille à distance deux jours par semaine.", { accept: ["On travaille à distance deux jours par semaine"] }),
      choice("'Concilier' significa…", ["conciliar", "cancelar", "conferir"], 0),
      match([["le télétravail", "home office"], ["à distance", "à distância"], ["la visioconférence", "a videoconferência"], ["le micro", "o microfone"]])
    ],
    words: ["w-telétravail", "w-distance"]
  },
  {
    id: "l45-negocier",
    worldId: "world-8",
    title: "Négocier",
    icon: "scales",
    topic: "negociacao",
    objective: "Negociar salário e condições com firmeza e elegância.",
    theory: [
      "Je voudrais discuter du salaire (gostaria de discutir o salário).",
      "On peut trouver un terrain d'entente ? (podemos chegar a um acordo?)",
      "Je suis flexible sur… mais pas sur… (sou flexível em… mas não em…)."
    ],
    examples: [
      { fr: "Je voudrais discuter du salaire et des avantages.", pt: "Gostaria de discutir o salário e os benefícios." },
      { fr: "On peut trouver un terrain d'entente, je pense.", pt: "Acho que podemos chegar a um acordo." },
      { fr: "Je suis flexible sur les horaires, mais pas sur le télétravail.", pt: "Sou flexível nos horários, mas não no home office." }
    ],
    exercises: [
      fill("Je voudrais discuter du s___ (salário).", "salaire", { hint: "s + alaire" }),
      choice("Propor acordo: …", ["On peut trouver un terrain d'entente ?", "C'est mon prix, point final.", "Je m'en vais."], 0),
      build("Monte: 'Sou flexível nos horários.'", ["Je", "suis", "flexible", "sur", "les", "horaires", "."], ["Je", "suis", "flexible", "sur", "les", "horaires", "."]),
      trans("Gostaria de discutir o salário e os benefícios.", "Je voudrais discuter du salaire et des avantages.", { accept: ["Je voudrais discuter du salaire et des avantages"] }),
      choice("'Un terrain d'entente' é…", ["um acordo", "um campo de futebol", "um terreno à venda"], 0)
    ],
    words: ["w-salaire", "w-accord-travail", "w-deadline", "w-embaucher"]
  },
  {
    id: "l46-stage",
    worldId: "world-8",
    title: "Le stage",
    icon: "briefcase",
    topic: "estagio",
    objective: "Falar de estágio: tarefas, orientador e relatório final.",
    theory: [
      "Faire un stage (fazer um estágio) · le stagiaire (o estagiário).",
      "Le tuteur (orientador) · le rapport de stage (relatório de estágio).",
      "Acquis: o que você aprendeu — J'ai beaucoup appris (aprendi muito)."
    ],
    examples: [
      { fr: "Je fais un stage dans une start-up.", pt: "Faço um estágio numa startup." },
      { fr: "Mon tuteur m'aide à progresser.", pt: "Meu orientador me ajuda a evoluir." },
      { fr: "Le rapport de stage est dû vendredi.", pt: "O relatório de estágio vence na sexta." }
    ],
    exercises: [
      fill("Je fais un s___ (estágio) dans une start-up.", "stage", { hint: "s + tage" }),
      choice("Quem orienta o estágio?", ["le tuteur", "le stagiaire", "le client"], 0),
      trans("Meu orientador me ajuda a evoluir.", "Mon tuteur m'aide à progresser.", { accept: ["Mon tuteur m'aide à progresser"] }),
      choice("O relatório de estágio em francês é…", ["le rapport de stage", "le repas de stage", "le retard de stage"], 0),
      match([["le stage", "o estágio"], ["le stagiaire", "o estagiário"], ["le tuteur", "o orientador"], ["le rapport", "o relatório"]])
    ],
    words: ["w-stage", "w-stagiaire", "w-rapport"]
  },
  {
    id: "l47-bureau",
    worldId: "world-8",
    title: "La vie de bureau",
    icon: "desk",
    topic: "escritorio",
    objective: "Falar do dia a dia no escritório: colegas, pausas e horários.",
    theory: [
      "Le bureau (escritório) · le·la collègue (colega) · la pause café.",
      "Pointer / badger (bater o ponto) · les horaires (horários).",
      "Informal: On déjeune ensemble ? (almoçamos juntos?)"
    ],
    examples: [
      { fr: "Mes collègues sont très sympas.", pt: "Meus colegas são muito legais." },
      { fr: "On fait une pause café à 10h30.", pt: "Fazemos uma pausa para o café às 10h30." },
      { fr: "On déjeune ensemble aujourd'hui ?", pt: "Almoçamos juntos hoje?" }
    ],
    exercises: [
      fill("Mes c___ (colegas) sont sympas.", "collègues", { accept: ["collegues"], hint: "c + ollègues" }),
      choice("Convidar para o almoço: …", ["On déjeune ensemble ?", "Va manger tout seul.", "Je suis occupé."], 0),
      trans("Fazemos uma pausa para o café às 10h30.", "On fait une pause café à 10h30.", { accept: ["On fait une pause café à 10h30"] }),
      choice("'Les horaires' são…", ["os horários", "os salários", "os colegas"], 0),
      build("Monte: 'Meus colegas são muito legais.'", ["Mes", "collègues", "sont", "très", "sympas", "."], ["Mes", "collègues", "sont", "très", "sympas", "."])
    ],
    words: ["w-bureau", "w-coller", "w-pause"]
  },
  {
    id: "l48-entretien-simule",
    worldId: "world-8",
    title: "L'entretien simulé",
    icon: "mic",
    topic: "entrevista-simulada",
    objective: "Simular uma entrevista de verdade: perguntas clássicas, método STAR e respostas com segurança.",
    theory: [
      "Perguntas clássicas: Parlez-moi de vous · Pourquoi ce poste ? · Quelles sont vos qualités ? Vos défauts ?",
      "Método STAR: Situation (situação) → Tâche (tarefa) → Action (ação) → Résultat (resultado).",
      "Falar de defeitos com elegância: Je suis parfois perfectionniste, mais ça garantit un travail soigné.",
      "Fechar com força: Je suis très motivée à rejoindre votre équipe."
    ],
    examples: [
      { fr: "Pourquoi ce poste ? Parce que vos valeurs correspondent aux miennes.", pt: "Por que essa vaga? Porque os valores de vocês combinam com os meus." },
      { fr: "Dans mon dernier poste, j'ai augmenté les ventes de 20 % en un an.", pt: "No meu último cargo, aumentei as vendas em 20% em um ano." },
      { fr: "Mes défauts ? Je suis parfois perfectionniste, mais le résultat est soigné.", pt: "Meus defeitos? Sou às vezes perfeccionista, mas o resultado é caprichado." }
    ],
    exercises: [
      choice("Pergunta clássica de abertura: …", ["Parlez-moi de vous.", "Quel est votre plat préféré ?", "Où habitez-vous ?"], 0),
      fill("Le m___ (método) STAR : Situation, Tâche, Action, Résultat.", "méthode", { accept: ["methode"], hint: "m + éthode" }),
      trans("Por que essa vaga? Porque os valores de vocês combinam com os meus.", "Pourquoi ce poste ? Parce que vos valeurs correspondent aux miennes.", { accept: ["Pourquoi ce poste ? Parce que vos valeurs correspondent aux miennes"] }),
      choice("Falar de defeito com elegância: …", ["Je suis parfois perfectionniste, mais le résultat est soigné.", "Je suis nulle en tout.", "Je n'ai aucun défaut."], 0),
      build("Monte: 'Estou muito motivada a entrar na sua equipe.'", ["Je", "suis", "très", "motivée", "à", "rejoindre", "votre", "équipe", "."], ["Je", "suis", "très", "motivée", "à", "rejoindre", "votre", "équipe", "."])
    ],
    words: ["w-qualites", "w-defaut", "w-objectif", "w-candidature"]
  },
  {
    id: "l49-courriel-complet",
    worldId: "world-8",
    title: "Le courriel formel complet",
    icon: "pencilSimple",
    topic: "email-formal",
    objective: "Escrever um e-mail formal completo do início ao fim, com todas as fórmulas de cortesia.",
    theory: [
      "Estrutura: Objet → Madame, Monsieur, → corpo → fórmula de cortesia → signature.",
      "Abertura: Je me permets de vous écrire afin de… (permito-me escrever-lhe a fim de…).",
      "Fórmula final: Dans l'attente de votre réponse, je vous prie d'agréer mes salutations distinguées.",
      "A fórmula NUNCA leva ponto final depois do nome próprio assinado."
    ],
    examples: [
      { fr: "Objet : candidature au poste de chef de projet.", pt: "Assunto: candidatura à vaga de gerente de projeto." },
      { fr: "Je me permets de vous écrire afin de postuler au poste de designer.", pt: "Permito-me escrever-lhe para me candidatar à vaga de designer." },
      { fr: "Dans l'attente de votre réponse, je vous prie d'agréer mes salutations distinguées.", pt: "Aguardando sua resposta, receba minhas saudações distintas." }
    ],
    exercises: [
      fill("Je me permets de vous é___ (escrever) afin de…", "écrire", { accept: ["ecrire"], hint: "écrire" }),
      choice("Ordem correta de um e-mail formal: …", ["Objet → formule d'appel → corps → formule finale", "Corps → Objet → Formule finale → Appel", "Formule finale → Objet → Corps"], 0),
      trans("Permito-me escrever-lhe para me candidatar à vaga de designer.", "Je me permets de vous écrire afin de postuler au poste de designer.", { accept: ["Je me permets de vous écrire afin de postuler au poste de designer"] }),
      choice("Fórmula final mais formal: …", ["Je vous prie d'agréer mes salutations distinguées.", "À plus tard !", "Ciao !"], 0),
      build("Monte a abertura: 'Prezados,'", ["Madame,", "Monsieur,"], ["Madame,", "Monsieur,"])
    ],
    words: ["w-candidature", "w-pj", "w-courriel"]
  },
  {
    id: "l50-negocier-salaire",
    worldId: "world-8",
    title: "Négocier son salaire",
    icon: "chartBar",
    topic: "salario",
    objective: "Negociar salário de verdade: números, faixas, contrapartidas e o momento certo de fechar.",
    theory: [
      "Nunca dê o primeiro número: Quel est le budget prévu pour ce poste ?",
      "Dar faixa em vez de valor único: Je pensais à une fourchette entre 3 500 et 4 000 euros.",
      "Contrapartidas: En contrepartie, je demande des jours de télétravail supplémentaires.",
      "Fechar: Si nous trouvons un accord, je peux commencer dès lundi."
    ],
    examples: [
      { fr: "Puis-je vous demander quel est le budget prévu pour ce poste ?", pt: "Posso perguntar qual é o orçamento previsto para essa vaga?" },
      { fr: "Je pensais à une fourchette entre 3 500 et 4 000 euros brut.", pt: "Eu pensava numa faixa entre 3.500 e 4.000 euros brutos." },
      { fr: "En contrepartie, je demande une prime d'intéressement.", pt: "Em contrapartida, peço um bônus de participação nos lucros." }
    ],
    exercises: [
      choice("Regra de ouro ao negociar: …", ["deixe a empresa dar o primeiro número", "diga o número mais alto primeiro", "não negocie"], 0),
      fill("Je pensais à une f___ (faixa) entre 3 500 et 4 000 euros.", "fourchette", { hint: "f + ourchette (faixa salarial)" }),
      trans("Em contrapartida, peço um bônus de participação nos lucros.", "En contrepartie, je demande une prime d'intéressement.", { accept: ["En contrepartie, je demande une prime d'intéressement"] }),
      choice("Perguntar o orçamento com elegância: …", ["Puis-je vous demander le budget prévu ?", "Combien vous me payez ?", "Donnez-moi l'argent."], 0),
      build("Monte: 'Se encontrarmos um acordo, posso começar segunda.'", ["Si", "nous", "trouvons", "un", "accord", ",", "je", "peux", "commencer", "dès", "lundi", "."], ["Si", "nous", "trouvons", "un", "accord", ",", "je", "peux", "commencer", "dès", "lundi", "."])
    ],
    words: ["w-salaire", "w-avantages", "w-embauche", "w-augmentation", "w-prime"]
  }
];

const world8Boss: World["boss"] = {
  id: "boss-8",
  worldId: "world-8",
  title: "Le Directeur Inflexible",
  icon: "briefcase",
  intro: "O diretor mais durão da empresa só assina seu contrato se você negociar como um profissional! Respire, sorria e argumente. ",
  xp: 140,
  exercises: [
    choice("Para dar opinião com firmeza: …", ["Je voudrais discuter du salaire.", "Donne-moi l'argent !", "C'est trop cher."], 0),
    fill("Je p___ (candidato-me) pour le poste de…", "postule", { hint: "postuler" }),
    trans("Encontre em anexo o meu currículo.", "Veuillez trouver mon CV en pièce jointe.", { accept: ["Veuillez trouver mon CV en pièce jointe"] }),
    choice("Terminar um e-mail formal: …", ["Cordialement,", "Salut !", "À plus !"], 0),
    fill("Je voudrais discuter du s___ (salário).", "salaire", { hint: "s + alaire" }),
    build("Monte: 'Sou flexível nos horários.'", ["Je", "suis", "flexible", "sur", "les", "horaires", "."], ["Je", "suis", "flexible", "sur", "les", "horaires", "."]),
    choice("'Un terrain d'entente' é…", ["um acordo", "uma reunião", "um contrato"], 0),
    choice("Na videoconferência, para não fazer barulho: …", ["coupe le micro", "coupe le gâteau", "coupe le courant"], 0),
    listen("O que você ouviu?", "La décision est prise.", ["La décision est prise", "La réunion est finie", "Le budget est prêt"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 9 —  Pensée
// ══════════════════════════════════════════════════════════════
const world9Lessons: Lesson[] = [
  {
    id: "l43-hypotheses",
    worldId: "world-9",
    title: "Faire des hypothèses",
    icon: "lightning",
    topic: "hipotese",
    objective: "Fazer hipóteses com si + imparfait + conditionnel.",
    theory: [
      "Hipótese real (futuro): Si + présent → futur : Si tu étudies, tu réussiras.",
      "Hipótese imaginária (agora): Si + imparfait → conditionnel : Si j'avais le temps, je voyagerais.",
      "Hipótese irreal (passado): Si + plus-que-parfait → conditionnel passé : Si tu étais venu, tu aurais vu.",
      "Na fala, o 'ne' do conditionnel costuma sumir: j'aurais pu → j'aurais pu."
    ],
    examples: [
      { fr: "Si j'avais le temps, je voyagerais plus souvent.", pt: "Se eu tivesse tempo, viajaria mais frequentemente." },
      { fr: "Si tu étudiais plus, tu réussirais ton examen.", pt: "Se você estudasse mais, passaria na prova." },
      { fr: "Si j'avais su, je serais venu plus tôt.", pt: "Se eu tivesse sabido, teria vindo mais cedo." }
    ],
    exercises: [
      choice("Depois de 'si', na hipótese imaginária, usamos…", ["l'imparfait", "le futur", "le conditionnel"], 0, "Si + imparfait → conditionnel!"),
      fill("Si j'avais le temps, je ___ (voyager, conditionnel) plus.", "voyagerais", { hint: "je voyagerais" }),
      choice("Hipótese irreal no passado: …", ["Si j'avais su, je serais venu.", "Si j'ai su, je viens.", "Si je saurai, je viendrai."], 0),
      trans("Se você estudasse mais, passaria na prova.", "Si tu étudiais plus, tu réussirais ton examen.", { accept: ["Si tu étudiais plus, tu réussirais ton examen"] }),
      build("Monte: 'Se eu tivesse tempo, viajaria.'", ["Si", "j'avais", "le", "temps", ",", "je", "voyagerais", "."], ["Si", "j'avais", "le", "temps", ",", "je", "voyagerais", "."])
    ],
    words: ["w-hypothese", "w-imaginer", "w-supposer", "w-croire"]
  },
  {
    id: "l44-conditionnel",
    worldId: "world-9",
    title: "Le conditionnel",
    icon: "magicWand",
    topic: "condicional",
    objective: "Usar o conditionnel para educar pedidos, desejos e conselhos suaves.",
    theory: [
      "Je voudrais (gostaria) · J'aimerais (adoraria) · On pourrait (poderíamos) — o tom educado do francês.",
      "Il faudrait (seria preciso) · Tu devrais (você deveria) — conselhos com delicadeza.",
      "Formação: infinitivo + terminações do imparfait: parler → je parlerais, finir → je finirais.",
      "Verbos irregulares: être → je serais, avoir → j'aurais, aller → j'irais, faire → je ferais."
    ],
    examples: [
      { fr: "Je voudrais un café, s'il vous plaît.", pt: "Gostaria de um café, por favor." },
      { fr: "Tu devrais te reposer un peu.", pt: "Você deveria descansar um pouco." },
      { fr: "On pourrait se voir demain ?", pt: "A gente poderia se ver amanhã?" }
    ],
    exercises: [
      choice("Pedido mais EDUCADO: …", ["Je voudrais un café.", "Je veux un café.", "Donne-moi un café."], 0, "Je voudrais é o clássico educado."),
      fill("Tu d___ (deveria) te reposer.", "devrais", { hint: "conditionnel de devoir" }),
      trans("A gente poderia se ver amanhã?", "On pourrait se voir demain ?", { accept: ["On pourrait se voir demain ?"] }),
      choice("O conditionnel de 'être' é…", ["serais", "sois", "serai"], 0),
      build("Monte: 'Eu gostaria de um café.'", ["Je", "voudrais", "un", "café", ",", "s'il", "vous", "plaît", "."], ["Je", "voudrais", "un", "café", ",", "s'il", "vous", "plaît", "."])
    ],
    words: ["w-vouloir", "w-pouvoir", "w-possible", "w-certain"]
  },
  {
    id: "l45-plus-que-parfait",
    worldId: "world-9",
    title: "Le plus-que-parfait",
    icon: "hourglass",
    topic: "plus-que-parfait",
    objective: "Contar o passado do passado com le plus-que-parfait.",
    theory: [
      "Plus-que-parfait = imparfait de avoir/être + particípio passado.",
      "j'avais parlé · elle était partie · nous avions fini.",
      "Serve para o que aconteceu ANTES de outra ação passada: Quand je suis arrivé, elle était déjà partie.",
      "Com déjà (já), encore (ainda), jamais (nunca) para dar nuance temporal."
    ],
    examples: [
      { fr: "Quand je suis arrivé, elle était déjà partie.", pt: "Quando cheguei, ela já tinha saído." },
      { fr: "J'avais oublié mes clés à la maison.", pt: "Eu tinha esquecido minhas chaves em casa." },
      { fr: "Ils n'avaient jamais visité Paris avant ça.", pt: "Eles nunca tinham visitado Paris antes disso." }
    ],
    exercises: [
      fill("J'___ (avoir) oublié mes clés.", "avais", { hint: "avoir no imparfait: j'avais" }),
      choice("O plus-que-parfait expressa…", ["o passado do passado", "o futuro", "uma ordem"], 0),
      fill("Quand je suis arrivé, elle était déjà ___ (partir, feminino).", "partie", { hint: "elle était partie" }),
      trans("Eu tinha esquecido minhas chaves em casa.", "J'avais oublié mes clés à la maison.", { accept: ["J'avais oublié mes clés à la maison"] }),
      choice("Complete: Ils n'avaient ___ visité Paris.", ["jamais", "déjà", "encore"], 0, "n'avait jamais = nunca tinha")
    ],
    words: ["w-souvenir", "w-oublier"]
  },
  {
    id: "l46-subjonctif-passe",
    worldId: "world-9",
    title: "Le subjonctif passé",
    icon: "scales",
    topic: "subjonctif-passe",
    objective: "Expressar emoção e incerteza sobre o passado com o subjonctif passé.",
    theory: [
      "Subjonctif passé = subjonctif de avoir/être + particípio passado: que j'aie fini, qu'elle soit partie.",
      "Usado depois de: bien que (embora), pour que (para que), avant que (antes que), je doute que…",
      "Emoção + passado: Je suis contente qu'elle soit venue (estou feliz que ela tenha vindo).",
      "C'est le plus beau ! — no subjonctif passé, o particípio concorda com o sujeito com être."
    ],
    examples: [
      { fr: "Bien qu'il ait plu, on a marché.", pt: "Embora tenha chovido, caminhamos." },
      { fr: "Je suis contente qu'elle soit venue.", pt: "Estou feliz que ela tenha vindo." },
      { fr: "Je doute qu'ils aient compris.", pt: "Duvido que eles tenham entendido." }
    ],
    exercises: [
      fill("Je suis contente qu'elle ___ (être) venue.", "soit", { hint: "subjonctif de être" }),
      choice("Complete: Bien qu'il ___ plu…", ["ait", "a", "avait"], 0, "bien que + subjonctif passé: qu'il ait plu"),
      trans("Duvido que eles tenham entendido.", "Je doute qu'ils aient compris.", { accept: ["Je doute qu'ils aient compris"] }),
      choice("O subjonctif passé é formado com…", ["subjonctif de avoir/être + particípio", "imparfait + infinitivo", "futur + particípio"], 0),
      build("Monte: 'Embora tenha chovido, caminhamos.'", ["Bien", "qu'il", "ait", "plu", ",", "on", "a", "marché", "."], ["Bien", "qu'il", "ait", "plu", ",", "on", "a", "marché", "."])
    ],
    words: ["w-doute", "w-douter", "w-croire"]
  },
  {
    id: "l47-debattre",
    worldId: "world-9",
    title: "Discuter et débattre",
    icon: "sword",
    topic: "debate",
    objective: "Debater com elegância: dar opinião, concordar, discordar e ceder.",
    theory: [
      "Opinar com força: À mon sens… (ao meu ver) · J'estime que… (considero que) · Il me semble que…",
      "Concordar: Tout à fait ! · Je partage ton avis · Je suis bien d'accord.",
      "Discordar com tato: Je comprends ton point de vue, mais… · Je ne suis pas tout à fait d'accord.",
      "Ceder: Tu as peut-être raison · Dans une certaine mesure, tu as raison."
    ],
    examples: [
      { fr: "À mon sens, c'est la meilleure solution.", pt: "Ao meu ver, é a melhor solução." },
      { fr: "Je comprends ton point de vue, mais je ne suis pas d'accord.", pt: "Entendo seu ponto de vista, mas não concordo." },
      { fr: "Dans une certaine mesure, tu as raison.", pt: "Até certo ponto, você tem razão." }
    ],
    exercises: [
      choice("Discordar com tato: …", ["Je comprends ton point de vue, mais…", "Tu as complètement tort.", "C'est n'importe quoi."], 0),
      fill("J'e___ (considero) que c'est juste.", "estime", { hint: "j'estime que" }),
      trans("Até certo ponto, você tem razão.", "Dans une certaine mesure, tu as raison.", { accept: ["Dans une certaine mesure, tu as raison"] }),
      choice("Concordar com entusiasmo: …", ["Tout à fait !", "Bof…", "Je ne sais pas."], 0),
      build("Monte: 'Ao meu ver, é a melhor solução.'", ["À", "mon", "sens", ",", "c'est", "la", "meilleure", "solution", "."], ["À", "mon", "sens", ",", "c'est", "la", "meilleure", "solution", "."])
    ],
    words: ["w-debattre", "w-debat", "w-persuader", "w-convaincre"]
  },
  {
    id: "l48-doute",
    worldId: "world-9",
    title: "Exprimer le doute",
    icon: "compass",
    topic: "duvida",
    objective: "Expressar dúvida, probabilidade e incerteza com nuance.",
    theory: [
      "Dúvida: Je doute que + subjonctif · Il n'est pas sûr que… · Je me demande si… (me pergunto se…).",
      "Probabilidade: Il se peut que + subjonctif · Il est probable que… · Sans doute (provavelmente).",
      "CerTeza: Je suis certain·e que · Il est évident que · Sans aucun doute (sem dúvida alguma).",
      "Sans doute NÃO é 'sem dúvida' — na França significa 'provavelmente'! (a famosa pegadinha)"
    ],
    examples: [
      { fr: "Je me demande si c'est une bonne idée.", pt: "Me pergunto se é uma boa ideia." },
      { fr: "Il se peut qu'il soit en retard.", pt: "Pode ser que ele esteja atrasado." },
      { fr: "Sans aucun doute, c'est la meilleure.", pt: "Sem dúvida alguma, é a melhor." }
    ],
    exercises: [
      choice("A pegadinha: 'sans doute' significa…", ["provavelmente", "sem dúvida", "sem problema"], 0, "Na França, sans doute = provavelmente!"),
      fill("Je me d___ (pergunto) si c'est vrai.", "demande", { hint: "se demander" }),
      choice("Depois de 'je doute que', usamos…", ["o subjonctif", "o futuro", "o imperativo"], 0),
      trans("Pode ser que ele esteja atrasado.", "Il se peut qu'il soit en retard.", { accept: ["Il se peut qu'il soit en retard"] }),
      match([["sans aucun doute", "sem dúvida alguma"], ["sans doute", "provavelmente"], ["se demander", "se perguntar"], ["il se peut que", "pode ser que"]])
    ],
    words: ["w-doute", "w-douter", "w-probable", "w-possible", "w-certain"]
  },
  {
    id: "l49-connecteurs",
    worldId: "world-9",
    title: "Les connecteurs logiques",
    icon: "infinity",
    topic: "conectores",
    objective: "Encadear ideias com conectores: adicionar, opor e concluir.",
    theory: [
      "Adicionar: De plus (além disso) · En outre (ademais) · D'ailleurs (aliás).",
      "Opor: Pourtant (no entanto) · En revanche (por outro lado) · Néanmoins (não obstante).",
      "Concluir: Donc (portanto) · Par conséquent (por consequência) · En fin de compte (no fim das contas).",
      "Sequência: D'abord (primeiro) · Ensuite (depois) · Enfin (enfim)."
    ],
    examples: [
      { fr: "De plus, il faut considérer le coût.", pt: "Além disso, é preciso considerar o custo." },
      { fr: "C'est cher ; en revanche, la qualité est excellente.", pt: "É caro; por outro lado, a qualidade é excelente." },
      { fr: "Je pense, donc je suis.", pt: "Penso, logo existo." }
    ],
    exercises: [
      choice("Para OPOR ideias: …", ["en revanche", "de plus", "d'ailleurs"], 0),
      fill("Je pense, d___ (portanto) je suis.", "donc", { hint: "donc = portanto" }),
      trans("Além disso, é preciso considerar o custo.", "De plus, il faut considérer le coût.", { accept: ["De plus, il faut considérer le coût"] }),
      choice("Sequência: D'abord, ensuite, …", ["enfin", "pourtant", "en revanche"], 0),
      match([["de plus", "além disso"], ["pourtant", "no entanto"], ["en revanche", "por outro lado"], ["donc", "portanto"]])
    ],
    words: ["w-pourtant", "w-donc", "w-dailleurs", "w-dabord", "w-enfin"]
  }
];

const world9Boss: World["boss"] = {
  id: "boss-9",
  worldId: "world-9",
  title: "Le Sphinx de la Pensée",
  icon: "crosshair",
  intro: "Um enigma antigo bloqueia a estrada das ideias. O Sphinx só se move se você raciocinar como um filósofo: hipóteses, condicional e subjonctif impeccáveis ! ",
  xp: 160,
  exercises: [
    choice("Hipótese imaginária: Si j'avais le temps, je ___ plus.", ["voyagerais", "voyagerai", "voyageais"], 0),
    fill("Je v___ (gostaria) un café, s'il vous plaît.", "voudrais", { hint: "conditionnel de vouloir" }),
    choice("O plus-que-parfait expressa…", ["o passado do passado", "o futuro próximo", "uma ordem"], 0),
    fill("Bien qu'il ___ plu, on a marché.", "ait", { hint: "subjonctif passé" }),
    trans("Pode ser que ele esteja atrasado.", "Il se peut qu'il soit en retard.", { accept: ["Il se peut qu'il soit en retard"] }),
    choice("A pegadinha: 'sans doute' significa…", ["provavelmente", "sem dúvida", "sem problema"], 0),
    build("Monte: 'Penso, logo existo.'", ["Je", "pense", ",", "donc", "je", "suis", "."], ["Je", "pense", ",", "donc", "je", "suis", "."]),
    choice("Discordar com tato: …", ["Je comprends ton point de vue, mais…", "Tu as tort.", "C'est n'importe quoi."], 0),
    listen("O que você ouviu?", "Si j'avais su, je serais venu.", ["Si j'avais su, je serais venu", "Si j'avais le temps, je viendrais", "Si j'étais toi, je viendrais"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 10 —  Culture
// ══════════════════════════════════════════════════════════════
const world10Lessons: Lesson[] = [
  {
    id: "l50-litterature",
    worldId: "world-10",
    title: "La littérature française",
    icon: "books",
    topic: "literatura",
    objective: "Falar de literatura: autores, obras e gêneros literários.",
    theory: [
      "Victor Hugo, Marcel Proust, Simone de Beauvoir, Albert Camus — os clássicos.",
      "Le roman (romance) · le poème (poema) · la pièce de théâtre (peça) · l'essai (ensaio).",
      "Un chef-d'œuvre = uma obra-prima · un best-seller = um sucesso de vendas.",
      "Prix Goncourt = o prêmio literário mais famoso da França."
    ],
    examples: [
      { fr: "Victor Hugo a écrit 'Les Misérables'.", pt: "Victor Hugo escreveu 'Os Miseráveis'." },
      { fr: "La recherche du temps perdu est un chef-d'œuvre.", pt: "'Em Busca do Tempo Perdido' é uma obra-prima." },
      { fr: "Simone de Beauvoir a marqué son époque.", pt: "Simone de Beauvoir marcou sua época." }
    ],
    exercises: [
      choice("Quem escreveu 'Les Misérables'?", ["Victor Hugo", "Albert Camus", "Marcel Proust"], 0),
      fill("Un chef-d'___ (obra-prima).", "œuvre", { accept: ["oeuvre"], hint: "chef-d'œuvre" }),
      choice("O romance em francês é…", ["le roman", "le poème", "l'essai"], 0),
      trans("Simone de Beauvoir marcou sua época.", "Simone de Beauvoir a marqué son époque.", { accept: ["Simone de Beauvoir a marqué son époque"] }),
      match([["le roman", "o romance"], ["le poème", "o poema"], ["l'essai", "o ensaio"], ["la pièce", "a peça"]])
    ],
    words: ["w-litterature", "w-roman", "w-poeme", "w-auteur", "w-ecrivain", "w-oeuvre"]
  },
  {
    id: "l51-cinema",
    worldId: "world-10",
    title: "Le cinéma français",
    icon: "videoCamera",
    topic: "cinema",
    objective: "Falar de cinema: filmes, atores e a Nouvelle Vague.",
    theory: [
      "La Nouvelle Vague (Godard, Truffaut) revolucionou o cinema nos anos 60.",
      "Le réalisateur (diretor) · l'acteur / l'actrice (ator/atriz) · le film.",
      "Une comédie · un drame · un documentaire · un film d'animation.",
      "C'est un succès / un échec (sucesso / fracasso) au box-office."
    ],
    examples: [
      { fr: "François Truffaut est un réalisateur de la Nouvelle Vague.", pt: "François Truffaut é um diretor da Nouvelle Vague." },
      { fr: "Le film est un véritable chef-d'œuvre.", pt: "O filme é uma verdadeira obra-prima." },
      { fr: "On va au cinéma ce soir ?", pt: "Vamos ao cinema hoje à noite?" }
    ],
    exercises: [
      choice("Quem dirige o filme?", ["le réalisateur", "l'acteur", "le spectateur"], 0),
      fill("Le film est un v___ (verdadeiro) chef-d'œuvre.", "véritable", { accept: ["veritable"], hint: "véritable" }),
      choice("O oposto de 'un succès' é…", ["un échec", "un chef-d'œuvre", "un documentaire"], 0),
      trans("Vamos ao cinema hoje à noite?", "On va au cinéma ce soir ?", { accept: ["On va au cinéma ce soir ?"] }),
      match([["le réalisateur", "o diretor"], ["l'actrice", "a atriz"], ["le film d'animation", "o filme de animação"], ["la comédie", "a comédia"]])
    ],
    words: ["w-cinema", "w-film", "w-acteur", "w-realisateur"]
  },
  {
    id: "l52-musique",
    worldId: "world-10",
    title: "La musique et la chanson",
    icon: "musicNote",
    topic: "musica",
    objective: "Falar de música: gêneros, artistas e as chansons francesas.",
    theory: [
      "Édith Piaf, Charles Aznavour, Stromae, Aya Nakamura — ícones da chanson.",
      "La chanson (canção) · la voix (voz) · les paroles (a letra) · le refrain (o refrão).",
      "Une chanson entraînante (contagiante) · une mélodie (melodia).",
      "'La Vie en rose' de Piaf é uma das canções mais famosas do mundo."
    ],
    examples: [
      { fr: "J'adore 'La Vie en rose' d'Édith Piaf.", pt: "Adoro 'La Vie en rose' da Édith Piaf." },
      { fr: "Les paroles de cette chanson sont magnifiques.", pt: "A letra dessa canção é magnífica." },
      { fr: "Le refrain est très entraînant.", pt: "O refrão é muito contagiante." }
    ],
    exercises: [
      choice("Quem cantou 'La Vie en rose'?", ["Édith Piaf", "Stromae", "Aya Nakamura"], 0),
      fill("Les p___ (letra) de cette chanson sont belles.", "paroles", { hint: "les paroles" }),
      choice("O refrão em francês é…", ["le refrain", "la voix", "la mélodie"], 0),
      trans("A letra dessa canção é magnífica.", "Les paroles de cette chanson sont magnifiques.", { accept: ["Les paroles de cette chanson sont magnifiques"] }),
      match([["la chanson", "a canção"], ["la voix", "a voz"], ["le refrain", "o refrão"], ["entraînant", "contagiante"]])
    ],
    words: ["w-musique", "w-chanson", "w-chanteur"]
  },
  {
    id: "l53-art",
    worldId: "world-10",
    title: "L'art et les musées",
    icon: "palette",
    topic: "arte",
    objective: "Falar de arte: pintura, museus e o impressionismo.",
    theory: [
      "Le Louvre, le Musée d'Orsay, le Centre Pompidou — os grandes museus de Paris.",
      "La peinture (pintura) · le tableau (quadro) · le peintre (pintor) · l'exposition (exposição).",
      "Monet, Renoir, Degas — o impressionismo nasceu na França.",
      "La Joconde (Mona Lisa) está no Louvre!",
      "Un tableau abstrait / classique / moderne."
    ],
    examples: [
      { fr: "La Joconde est exposée au Louvre.", pt: "A Mona Lisa está exposta no Louvre." },
      { fr: "Monet est un peintre impressionniste.", pt: "Monet é um pintor impressionista." },
      { fr: "L'exposition dure jusqu'en septembre.", pt: "A exposição vai até setembro." }
    ],
    exercises: [
      choice("Onde está a Joconde?", ["au Louvre", "au Musée d'Orsay", "au Centre Pompidou"], 0),
      fill("Monet est un p___ (pintor) impressionniste.", "peintre", { hint: "p + eintre" }),
      choice("O impressionismo nasceu…", ["na França", "na Itália", "na Espanha"], 0),
      trans("A exposição vai até setembro.", "L'exposition dure jusqu'en septembre.", { accept: ["L'exposition dure jusqu'en septembre"] }),
      match([["le tableau", "o quadro"], ["la peinture", "a pintura"], ["l'exposition", "a exposição"], ["le musée", "o museu"]])
    ],
    words: ["w-art", "w-peinture", "w-peintre", "w-tableau"]
  },
  {
    id: "l54-histoire",
    worldId: "world-10",
    title: "L'histoire de France",
    icon: "flag",
    topic: "historia",
    objective: "Viajar pela história: monarquia, revolução e república.",
    theory: [
      "La Révolution française (1789) mudou o mundo moderno.",
      "Louis XIV, le Roi-Soleil, construiu Versailles.",
      "Le roi (rei) · la reine (rainha) · la république (república) · la république française.",
      "'Liberté, Égalité, Fraternité' — o lema da República."
    ],
    examples: [
      { fr: "La Révolution française a commencé en 1789.", pt: "A Revolução Francesa começou em 1789." },
      { fr: "Louis XIV a fait construire Versailles.", pt: "Luís XIV mandou construir Versalhes." },
      { fr: "Le 14 juillet est la fête nationale.", pt: "O 14 de julho é a festa nacional." }
    ],
    exercises: [
      choice("Em que ano começou a Revolução Francesa?", ["1789", "1815", "1900"], 0),
      fill("Louis XIV est le Roi-S___ (Sol).", "Soleil", { accept: ["soleil"], hint: "le Roi-Soleil" }),
      choice("O lema da República é…", ["Liberté, Égalité, Fraternité", "Unité, Travail, Progrès", "Patrie, Honneur, Foi"], 0),
      trans("O 14 de julho é a festa nacional.", "Le 14 juillet est la fête nationale.", { accept: ["Le 14 juillet est la fête nationale"] }),
      match([["le roi", "o rei"], ["la reine", "a rainha"], ["la révolution", "a revolução"], ["la république", "a república"]])
    ],
    words: ["w-histoire", "w-siecle", "w-roi", "w-reine", "w-revolution"]
  },
  {
    id: "l55-gastronomie",
    worldId: "world-10",
    title: "La gastronomie française",
    icon: "forkKnife",
    topic: "gastronomia",
    objective: "Falar de gastronomia: pratos, vinhos e a arte de comer bem.",
    theory: [
      "La gastronomie française é Patrimônio Cultural Imaterial da UNESCO.",
      "Le croissant, la baguette, le fromage, le vin — símbolos da França.",
      "Le plat (prato) · la recette (receita) · le goût (gosto) · la dégustation (degustação).",
      "Bon appétit ! — a saudação essencial à mesa."
    ],
    examples: [
      { fr: "Le boeuf bourguignon est un plat traditionnel.", pt: "O boeuf bourguignon é um prato tradicional." },
      { fr: "Chaque région a sa recette et son vin.", pt: "Cada região tem sua receita e seu vinho." },
      { fr: "On commence par une dégustation de fromages.", pt: "Começamos com uma degustação de queijos." }
    ],
    exercises: [
      choice("A gastronomia francesa é Patrimônio da…", ["UNESCO", "ONU", "UE"], 0),
      fill("Chaque région a sa r___ (receita).", "recette", { hint: "r + ecette" }),
      choice("A saudação essencial à mesa: …", ["Bon appétit !", "Bon voyage !", "Bonne chance !"], 0),
      trans("Cada região tem sua receita e seu vinho.", "Chaque région a sa recette et son vin.", { accept: ["Chaque région a sa recette et son vin"] }),
      match([["le plat", "o prato"], ["la recette", "a receita"], ["le goût", "o gosto"], ["la dégustation", "a degustação"]])
    ],
    words: ["w-gastronomie", "w-plat", "w-recette", "w-vin", "w-chef"]
  },
  {
    id: "l56-traditions",
    worldId: "world-10",
    title: "Les traditions et les fêtes",
    icon: "flowerTulip",
    topic: "tradicoes",
    objective: "Conhecer as tradições e festas: 14 juillet, galette des Rois e mais.",
    theory: [
      "Le 14 juillet — Fête nationale (o Dia da Bastilha).",
      "La galette des Rois em janeiro · Pâques (Páscoa) · Noël (Natal).",
      "La tradition (tradição) · la coutume (costume) · le patrimoine (patrimônio).",
      "Le 1er mai, on offre du muguet (lírio-do-vale) — símbolo de sorte."
    ],
    examples: [
      { fr: "Le 14 juillet, il y a un grand feu d'artifice.", pt: "No 14 de julho, há um grande show de fogos." },
      { fr: "En janvier, on partage la galette des Rois.", pt: "Em janeiro, compartilhamos a galette des Rois." },
      { fr: "Ces traditions font partie du patrimoine français.", pt: "Essas tradições fazem parte do patrimônio francês." }
    ],
    exercises: [
      choice("A Fête nationale é em…", ["14 juillet", "1er mai", "25 décembre"], 0),
      fill("Le 1er mai, on offre du m___ (lírio-do-vale).", "muguet", { hint: "m + uguet" }),
      choice("A galette des Rois é compartilhada em…", ["janeiro", "julho", "setembro"], 0),
      trans("No 14 de julho, há um grande show de fogos.", "Le 14 juillet, il y a un grand feu d'artifice.", { accept: ["Le 14 juillet, il y a un grand feu d'artifice"] }),
      match([["la tradition", "a tradição"], ["la coutume", "o costume"], ["le patrimoine", "o patrimônio"], ["la fête", "a festa"]])
    ],
    words: ["w-tradition", "w-coutume", "w-patrimoine", "w-francophone"]
  }
];

const world10Boss: World["boss"] = {
  id: "boss-10",
  worldId: "world-10",
  title: "La Critique d'Art",
  icon: "medalMilitary",
  intro: "A crítica mais temida da França examina sua cultura geral! Literatura, cinema, música, história e gastronomia — mostre que você é uma verdadeira francophone ! ",
  xp: 160,
  exercises: [
    choice("Quem escreveu 'Les Misérables'?", ["Victor Hugo", "Albert Camus", "Marcel Proust"], 0),
    fill("Un chef-d'___ (obra-prima).", "œuvre", { accept: ["oeuvre"], hint: "chef-d'œuvre" }),
    choice("Quem dirige o filme?", ["le réalisateur", "l'acteur", "le spectateur"], 0),
    fill("Édith Piaf a chanté 'La Vie en ___'.", "rose", { hint: "rose" }),
    choice("Onde está a Joconde?", ["au Louvre", "au Musée d'Orsay", "au Centre Pompidou"], 0),
    choice("O lema da República é…", ["Liberté, Égalité, Fraternité", "Unité, Travail, Progrès", "Patrie, Honneur, Foi"], 0),
    choice("A gastronomia francesa é Patrimônio da…", ["UNESCO", "ONU", "UE"], 0),
    trans("No 14 de julho, há um grande show de fogos.", "Le 14 juillet, il y a un grand feu d'artifice.", { accept: ["Le 14 juillet, il y a un grand feu d'artifice"] }),
    listen("O que você ouviu?", "Bon appétit !", ["Bon appétit", "Bon voyage", "Bonne chance"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 11 —  Expressions
// ══════════════════════════════════════════════════════════════
const world11Lessons: Lesson[] = [
  {
    id: "l57-expressions-nourriture",
    worldId: "world-11",
    title: "Les expressions gourmandes",
    icon: "forkKnife",
    topic: "expressoes",
    objective: "Expressões com comida: la fin des haricots, avoir la pêche…",
    theory: [
      "C'est la fin des haricots → é o fim da picada (a situação está péssima).",
      "Mettre son grain de sel → dar palpite onde não foi chamado.",
      "Avoir la pêche → estar cheio de energia · Tomber dans les pommes → desmaiar.",
      "Avoir le beurre et l'argent du beurre → querer todas as vantagens de um negócio."
    ],
    examples: [
      { fr: "C'est la fin des haricots, on a raté le train !", pt: "É o fim da picada, perdemos o trem!" },
      { fr: "Elle met toujours son grain de sel.", pt: "Ela sempre dá seu palpite." },
      { fr: "Ce matin, j'ai la pêche !", pt: "Esta manhã estou cheio de energia!" }
    ],
    exercises: [
      match([["la fin des haricots", "o fim da picada"], ["avoir la pêche", "estar com energia"], ["mettre son grain de sel", "dar palpite"], ["tomber dans les pommes", "desmaiar"]]),
      choice("'Tomber dans les pommes' significa…", ["desmaiar", "comer maçãs", "cair da escada"], 0),
      fill("Ce matin, j'ai la p___ (energia) !", "pêche", { accept: ["peche"], hint: "la pêche = energia" }),
      trans("É o fim da picada, perdemos o trem!", "C'est la fin des haricots, on a raté le train !", { accept: ["C'est la fin des haricots, on a raté le train !"] }),
      choice("Querer TODAS as vantagens: …", ["avoir le beurre et l'argent du beurre", "être dans la lune", "donner sa langue au chat"], 0)
    ],
    words: ["w-fin-haricots", "w-grain-de-sel", "w-peche", "w-pommes"]
  },
  {
    id: "l58-expressions-corps",
    worldId: "world-11",
    title: "Le corps et les animaux",
    icon: "pawPrint",
    topic: "expressoes",
    objective: "Expressões com corpo e animais: un poil dans la main, poser un lapin…",
    theory: [
      "Avoir un poil dans la main → ser preguiçoso (literalmente: ter um pelo na mão).",
      "Donner sa langue au chat → desistir de adivinhar.",
      "Avoir le cœur sur la main → ser generoso.",
      "Poser un lapin → dar bolo (não aparecer no encontro combinado)."
    ],
    examples: [
      { fr: "Il a un poil dans la main, il ne travaille jamais.", pt: "Ele é preguiçoso, nunca trabalha." },
      { fr: "Bon, je donne ma langue au chat : quelle est la réponse ?", pt: "Bom, desisto: qual é a resposta?" },
      { fr: "Elle m'a posé un lapin hier.", pt: "Ela me deu bolo ontem." }
    ],
    exercises: [
      match([["avoir un poil dans la main", "ser preguiçoso"], ["donner sa langue au chat", "desistir de adivinhar"], ["avoir le cœur sur la main", "ser generoso"], ["poser un lapin", "dar bolo"]]),
      choice("'Poser un lapin' significa…", ["não aparecer num encontro", "dar um coelho de presente", "contar uma mentira"], 0),
      fill("Je donne ma l___ (língua) au chat.", "langue", { hint: "la langue = a língua" }),
      trans("Ela me deu bolo ontem.", "Elle m'a posé un lapin hier.", { accept: ["Elle m'a posé un lapin hier"] }),
      choice("Ser generoso: …", ["avoir le cœur sur la main", "être dans la lune", "avoir la pêche"], 0)
    ],
    words: ["w-poil-main", "w-langue-chat", "w-coeur-main", "w-poser-lapin"]
  },
  {
    id: "l59-ironie",
    worldId: "world-11",
    title: "L'ironie et le sarcasme",
    icon: "smileyMeh",
    topic: "ironia",
    objective: "Entender e usar ironia e sarcasmo como um nativo.",
    theory: [
      "A ironia diz o contrário do que se quer dizer: 'C'est du propre !' diante de uma bagunça.",
      "'C'est malin !' pode significar o oposto: sarcasmo ('que esperto… hein').",
      "O tom faz tudo: 'Ah, très intéressant…' com voz arrastada = não é nada interessante.",
      "Sinais de ironia: exagero, pausas, 'bien sûr', 'évidemment' e riso curto."
    ],
    examples: [
      { fr: "Tu as encore laissé la lumière allumée. C'est du propre !", pt: "Você deixou a luz acesa de novo. Que beleza de bagunça!" },
      { fr: "Ah, très malin de mettre les clés dans le frigo !", pt: "Ah, muito esperto colocar as chaves na geladeira!" },
      { fr: "Bien sûr, je vais travailler dimanche, avec plaisir !", pt: "Claro, vou trabalhar domingo, com prazer!" }
    ],
    exercises: [
      choice("'C'est du propre !' diante de uma bagunça é…", ["ironia", "um elogio", "uma pergunta"], 0),
      choice("Sarcasmo é…", ["dizer o contrário com tom mordaz", "um elogio sincero", "uma ordem"], 0),
      fill("Bien s___ (claro), je vais le faire…", "sûr", { accept: ["sur"], hint: "bien sûr" }),
      trans("Ah, muito esperto colocar as chaves na geladeira!", "Ah, très malin de mettre les clés dans le frigo !", { accept: ["Ah, très malin de mettre les clés dans le frigo !"] }),
      choice("Sinal típico de ironia na fala…", ["exagero e tom arrastado", "entonação neutra", "silêncio total"], 0)
    ],
    words: ["w-ironie", "w-sarcasme", "w-malin", "w-sous-entendu"]
  },
  {
    id: "l60-double-sens",
    worldId: "world-11",
    title: "Le double sens",
    icon: "magicWand",
    topic: "duplo-sentido",
    objective: "Perceber duplos sentidos e as pegadinhas do francês falado.",
    theory: [
      "'Ça marche' pode ser 'funciona' OU 'combinado!': — On se voit demain ? — Ça marche !",
      "'Pas mal' pode ser elogio: 'Pas mal du tout !' = muito bom!",
      "'C'est pas terrible' NÃO é 'não é terrível' — significa 'é fraco, não é lá grande coisa'.",
      "Jeux de mots: os franceses adoram trocadilhos com duplo sentido — ouça com atenção."
    ],
    examples: [
      { fr: "— On part à 8h ? — Ça marche !", pt: "— A gente parte às 8h? — Combinado!" },
      { fr: "Ton gâteau ? Pas mal du tout !", pt: "Seu bolo? Muito bom!" },
      { fr: "Le film était pas terrible, franchement.", pt: "O filme era fraco, sinceramente." }
    ],
    exercises: [
      choice("'Ça marche !' numa conversa significa…", ["combinado!", "está quebrado", "anda!"], 0),
      choice("'C'est pas terrible' significa…", ["é fraco / não é grande coisa", "é ótimo", "é assustador"], 0),
      choice("'Pas mal du tout' é…", ["um elogio", "uma crítica", "um insulto"], 0),
      fill("— On se voit demain ? — Ça m___ (funciona/combinado) !", "marche", { hint: "ça marche = combinado" }),
      match([["ça marche", "combinado / funciona"], ["pas terrible", "fraco"], ["pas mal du tout", "muito bom"], ["double sens", "duplo sentido"]])
    ],
    words: ["w-expression", "w-sous-entendu", "w-malin"]
  },
  {
    id: "l61-expressions-quotidien",
    worldId: "world-11",
    title: "La vie en expressions",
    icon: "sparkle",
    topic: "expressoes",
    objective: "Expressões do dia a dia: faut pas pousser, la mer à boire…",
    theory: [
      "Faut pas pousser ! → não exagera! (protesto leve e informal)",
      "On n'est pas sortis de l'auberge → ainda temos chão pela frente (os problemas continuam).",
      "Ce n'est pas la mer à boire → não é o fim do mundo.",
      "En deux temps trois mouvements → rapidinho, num piscar de olhos."
    ],
    examples: [
      { fr: "Faut pas pousser, je travaille déjà le week-end !", pt: "Não exagera, eu já trabalho no fim de semana!" },
      { fr: "Deux examens demain ? On n'est pas sortis de l'auberge…", pt: "Duas provas amanhã? Ainda não acabou…" },
      { fr: "Allez, ce n'est pas la mer à boire !", pt: "Qual é, não é o fim do mundo!" }
    ],
    exercises: [
      choice("'Ce n'est pas la mer à boire' significa…", ["não é o fim do mundo", "é impossível", "não há água"], 0),
      fill("On n'est pas s___ (saídos) de l'auberge.", "sortis", { hint: "être sortis de l'auberge" }),
      choice("'Faut pas pousser !' expressa…", ["um protesto leve", "um elogio", "um convite"], 0),
      trans("Qual é, não é o fim do mundo!", "Allez, ce n'est pas la mer à boire !", { accept: ["Allez, ce n'est pas la mer à boire !"] }),
      match([["la mer à boire", "o fim do mundo"], ["sortir de l'auberge", "sair da enrascada"], ["faut pas pousser", "não exagera"], ["en deux temps trois mouvements", "rapidinho"]])
    ],
    words: ["w-mer-a-boire", "w-expression"]
  },
  {
    id: "l62-registre-familier",
    worldId: "world-11",
    title: "Le registre familier",
    icon: "chatCircleDots",
    topic: "giria",
    objective: "Gírias e registro familiar: bouffer, bagnole, fringues, bosser…",
    theory: [
      "Familier: bouffer (comer), bagnole (carro), fringues (roupas), truc (coisa).",
      "Pessoas: mec (cara), nana (garota), gosse (criança), pote (amigão).",
      "Verbos: filer (dar o fora), bosser (trabalhar), piger (entender).",
      "Cuidado: o familiar é para amigos — jamais em entrevistas ou com o chefe."
    ],
    examples: [
      { fr: "On bouffe à 20h, ça te va ?", pt: "A gente come às 20h, serve?" },
      { fr: "Je dois bosser ce week-end.", pt: "Preciso trabalhar neste fim de semana." },
      { fr: "Ce mec est un pote de lycée.", pt: "Esse cara é amigão do colégio." }
    ],
    exercises: [
      choice("Qual é FAMILIAR (não formal)?", ["bouffer", "manger", "se restaurer"], 0),
      fill("Je dois b___ (trabalhar) ce week-end.", "bosser", { hint: "bosser = trabalhar (familiar)" }),
      choice("'Filer' significa…", ["dar o fora", "voar", "telefonar"], 0),
      match([["bouffer", "comer"], ["bagnole", "carro"], ["fringues", "roupas"], ["truc", "coisa"]]),
      choice("Onde NÃO usar o registro familiar?", ["numa entrevista de emprego", "com amigos", "numa festa"], 0)
    ],
    words: ["w-bouffer", "w-bagnole", "w-fringues", "w-truc", "w-mec", "w-filer"]
  },
  {
    id: "l63-sous-texte",
    worldId: "world-11",
    title: "Ce qu'on dit, ce qu'on entend",
    icon: "ear",
    topic: "subtexto",
    objective: "Ler o subtexto: o que o francês realmente entende por trás das palavras.",
    theory: [
      "'Tu viens ?' (neutro) · 'Tu viens, là ?' (impaciência) · 'Tu viens, ou pas ?' (irritação).",
      "'C'est intéressant' pode ser genuíno OU irônico — depende do tom e do contexto.",
      "Implicaturas: 'Il fait froid, ici…' raramente é só sobre a temperatura (feche a janela).",
      "Para ler o subtexto: contexto, relação, tom e silêncios dizem mais que as palavras."
    ],
    examples: [
      { fr: "Tu viens, là ? Le film commence !", pt: "Você vem ou não? O filme vai começar!" },
      { fr: "Hmm… c'est intéressant. (tom arrastado)", pt: "Hmm… interessante. (tom arrastado)" },
      { fr: "Il fait froid ici… (sugerindo fechar a janela)", pt: "Está frio aqui… (sugerindo fechar a janela)" }
    ],
    exercises: [
      choice("'Tu viens, là ?' transmite…", ["impaciência", "alegria", "medo"], 0),
      choice("Implicatura de 'Il fait froid ici…'…", ["feche a janela", "fale do tempo", "ligue o ventilador"], 0),
      fill("Le sous-entendu est dans le t___ (tom).", "ton", { hint: "le ton" }),
      trans("Você vem ou não? O filme vai começar!", "Tu viens, ou pas ? Le film commence !", { accept: ["Tu viens, ou pas ? Le film commence !"] }),
      choice("Para ler o subtexto, observe…", ["contexto + tom + relação", "só as palavras", "a pontuação"], 0)
    ],
    words: ["w-sous-entendu", "w-ironie"]
  }
];

const world11Boss: World["boss"] = {
  id: "boss-11",
  worldId: "world-11",
  title: "Le Génie des Mots",
  icon: "magicWand",
  intro: "Um gênio milenar domina cada expressão, ironia e duplo sentido da língua. Para passar, prove que você entende o que os franceses REALMENTE dizem ! ",
  xp: 160,
  exercises: [
    match([["la fin des haricots", "o fim da picada"], ["poser un lapin", "dar bolo"], ["avoir la pêche", "estar com energia"], ["tomber dans les pommes", "desmaiar"]]),
    choice("'C'est pas terrible' significa…", ["é fraco", "é ótimo", "é assustador"], 0),
    fill("Je donne ma l___ au chat.", "langue", { hint: "la langue" }),
    choice("Sarcasmo é…", ["dizer o contrário com tom mordaz", "elogiar de verdade", "fazer uma pergunta"], 0),
    trans("Ela me deu bolo ontem.", "Elle m'a posé un lapin hier.", { accept: ["Elle m'a posé un lapin hier"] }),
    build("Monte: 'É o fim da picada!'", ["C'est", "la", "fin", "des", "haricots", "!"], ["C'est", "la", "fin", "des", "haricots", "!"]),
    choice("Onde NÃO usar gíria?", ["numa entrevista", "com amigos", "numa festa"], 0),
    fill("Ce matin, j'ai la p___ !", "pêche", { accept: ["peche"], hint: "la pêche" }),
    listen("O que você ouviu?", "Ce n'est pas la mer à boire.", ["Ce n'est pas la mer à boire", "C'est la fin des haricots", "Donne ta langue au chat"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 12 —  Immersion
// ══════════════════════════════════════════════════════════════
const world12Lessons: Lesson[] = [
  {
    id: "l64-journal-televise",
    worldId: "world-12",
    title: "Le journal télévisé",
    icon: "videoCamera",
    topic: "midia",
    objective: "Entender o telejornal: o JT, o direct, as fontes e o fait divers.",
    theory: [
      "Le JT (journal télévisé): le présentateur, le flash info, le fait divers, la météo.",
      "Fórmulas: Selon les sources… · L'info en bref · On y reviendra.",
      "Le témoin raconte · La police a ouvert une enquête · Les faits se sont déroulés à…",
      "L'actualité en continu (24h) e o direct (ao vivo): 'Nous sommes en direct de…'"
    ],
    examples: [
      { fr: "Selon les sources, l'accord est signé.", pt: "Segundo as fontes, o acordo foi assinado." },
      { fr: "Nous sommes en direct de la place de la République.", pt: "Estamos ao vivo da Place de la République." },
      { fr: "L'info en bref : trois minutes pour tout comprendre.", pt: "As notícias em resumo: três minutos para entender tudo." }
    ],
    exercises: [
      choice("O que é 'le JT'?", ["o telejornal", "o jornal impresso", "o rádio"], 0),
      fill("Selon les s___ (fontes), l'accord est signé.", "sources", { hint: "les sources" }),
      choice("'En direct' significa…", ["ao vivo", "gravado", "em direção"], 0),
      trans("Estamos ao vivo da Place de la République.", "Nous sommes en direct de la place de la République.", { accept: ["Nous sommes en direct de la place de la République"] }),
      match([["le présentateur", "o apresentador"], ["le flash info", "o plantão"], ["le fait divers", "a notícia policial"], ["le témoin", "a testemunha"]])
    ],
    words: ["w-jt", "w-actualite", "w-temoin", "w-source"]
  },
  {
    id: "l65-presse-ecrite",
    worldId: "world-12",
    title: "La presse écrite",
    icon: "book",
    topic: "midia",
    objective: "Ler a imprensa: manchetes, édito, rubriques e dépêches.",
    theory: [
      "À la une (na capa/manchete) · la manchette · l'édito (editorial) · la rubrique (seção).",
      "L'article de fond (reportagem) · la dépêche (despacho de agência, ex.: AFP).",
      "Titres de journal são curtos e verbais: 'Accord historique à Paris'.",
      "Le canard é gíria para jornal · la presse people · la presse économique."
    ],
    examples: [
      { fr: "L'affaire fait la une de tous les journaux.", pt: "O caso é capa de todos os jornais." },
      { fr: "L'édito critique la nouvelle loi.", pt: "O editorial critica a nova lei." },
      { fr: "L'AFP a publié une dépêche à midi.", pt: "A AFP publicou um despacho ao meio-dia." }
    ],
    exercises: [
      choice("A manchete de capa é…", ["la manchette / la une", "la rubrique", "l'édito"], 0),
      fill("L'é___ (editorial) critique la nouvelle loi.", "édito", { accept: ["edito"], hint: "l'édito" }),
      choice("'Le canard' é gíria para…", ["jornal", "pato", "máquina"], 0),
      match([["la une", "a capa"], ["la rubrique", "a seção"], ["la dépêche", "o despacho"], ["l'article de fond", "a reportagem"]]),
      trans("O caso é capa de todos os jornais.", "L'affaire fait la une de tous les journaux.", { accept: ["L'affaire fait la une de tous les journaux"] })
    ],
    words: ["w-manchette", "w-edito", "w-rubrique", "w-depeche"]
  },
  {
    id: "l66-reseaux-sociaux",
    worldId: "world-12",
    title: "Les réseaux sociaux",
    icon: "users",
    topic: "midia",
    objective: "Navegar as redes em francês: buzz, tendances, abonnés e mdr.",
    theory: [
      "Le fil d'actualité (feed) · poster (publicar) · partager (compartilhar) · liker.",
      "Suivre / être suivi·e · un abonné (seguidor) · une story · un tweet / un post.",
      "Faire le buzz: viralizar · le bad buzz: a polêmica · être en tendance: estar em alta.",
      "Linguagem de comentários: 'mdr' (mort de rire), 'lol', 'trop bien', 'grave'."
    ],
    examples: [
      { fr: "La vidéo fait le buzz sur les réseaux.", pt: "O vídeo viralizou nas redes." },
      { fr: "Ce sujet est en tendance depuis hier.", pt: "Esse assunto está em alta desde ontem." },
      { fr: "Je scrolle mon fil d'actualité chaque matin.", pt: "Rolo meu feed todas as manhãs." }
    ],
    exercises: [
      choice("'Faire le buzz' significa…", ["viralizar", "fazer barulho de abelha", "silenciar"], 0),
      fill("Ce sujet est en t___ (tendência) depuis hier.", "tendance", { hint: "en tendance" }),
      choice("O que é 'un abonné'?", ["um seguidor", "um anúncio", "um botão"], 0),
      trans("O vídeo viralizou nas redes.", "La vidéo fait le buzz sur les réseaux.", { accept: ["La vidéo fait le buzz sur les réseaux"] }),
      match([["le fil d'actualité", "o feed"], ["liker", "curtir"], ["le bad buzz", "a polêmica"], ["mdr", "muito engraçado (gíria)"]])
    ],
    words: ["w-buzz", "w-tendance", "w-fil-actu"]
  },
  {
    id: "l67-expressions-medias",
    worldId: "world-12",
    title: "Les expressions des médias",
    icon: "radio",
    topic: "midia",
    objective: "Expressões da mídia: faire la une, relayer l'info, sous les feux…",
    theory: [
      "Faire la une / faire les gros titres → virar manchete.",
      "Être sous les feux de l'actualité → estar no centro das atenções da mídia.",
      "Relayer l'information → repassar a notícia · Une info non confirmée → não confirmada.",
      "Casser du sucre sur le dos de quelqu'un → falar mal de alguém pelas costas."
    ],
    examples: [
      { fr: "Le scandale fait les gros titres.", pt: "O escândalo virou manchete." },
      { fr: "La ministre est sous les feux de l'actualité.", pt: "A ministra está no centro das atenções." },
      { fr: "Arrête de casser du sucre sur son dos !", pt: "Pare de falar mal dela pelas costas!" }
    ],
    exercises: [
      choice("'Faire la une' significa…", ["virar manchete", "fazer um número um", "cozinhar"], 0),
      fill("La ministre est sous les f___ de l'actualité.", "feux", { hint: "les feux de l'actualité" }),
      choice("'Casser du sucre sur le dos de quelqu'un'…", ["falar mal pelas costas", "fazer doces", "elogiar"], 0),
      trans("O escândalo virou manchete.", "Le scandale fait les gros titres.", { accept: ["Le scandale fait les gros titres"] }),
      match([["les gros titres", "as manchetes"], ["relayer l'info", "repassar a notícia"], ["une info non confirmée", "uma notícia não confirmada"], ["les feux de l'actualité", "o centro das atenções"]])
    ],
    words: ["w-manchette", "w-buzz", "w-tendance"]
  },
  {
    id: "l68-argot-jeunes",
    worldId: "world-12",
    title: "L'argot des jeunes",
    icon: "chatText",
    topic: "giria",
    objective: "O verlan e as gírias jovens: ouf, chelou, kiffer, la flemme.",
    theory: [
      "Verlan (inverter sílabas): ouf (fou), chelou (louche), meuf (femme), relou (lourd).",
      "'C'est ouf !' = é doido/incrível · 'C'est chelou' = é estranho.",
      "Kiffer = curtir · Avoir la flemme = estar com preguiça · Grave = muito.",
      "Registros: argot < familier < courant < soutenu — escolha o nível certo."
    ],
    examples: [
      { fr: "Ce concert, c'était ouf !", pt: "Esse show foi doido!" },
      { fr: "Ce type est un peu chelou.", pt: "Esse cara é meio estranho." },
      { fr: "J'ai la flemme de sortir ce soir.", pt: "Estou com preguiça de sair hoje." }
    ],
    exercises: [
      choice("Verlan de 'fou' é…", ["ouf", "fou", "folle"], 0),
      choice("'Chelou' significa…", ["esquisito", "bonito", "velho"], 0),
      fill("J'ai la f___ (preguiça) de sortir.", "flemme", { hint: "la flemme" }),
      trans("Esse show foi doido!", "Ce concert, c'était ouf !", { accept: ["Ce concert, c'était ouf !"] }),
      match([["ouf", "doido (de fou)"], ["chelou", "estranho (de louche)"], ["kiffer", "curtir"], ["meuf", "garota (de femme)"]])
    ],
    words: ["w-ouf", "w-chelou", "w-kiffer", "w-flemme"]
  },
  {
    id: "l69-regionalismes",
    worldId: "world-12",
    title: "Les francophonies",
    icon: "globe",
    topic: "regionalismo",
    objective: "Variações da francofonia: Quebec, Bélgica, Suíça e o debate da chocolatine.",
    theory: [
      "Chocolatine (Sudoeste da França) vs pain au chocolat (resto do país).",
      "Números: septante / huitante (Bélgica, Suíça) vs soixante-dix / quatre-vingts (França).",
      "Quebec: magasiner (fazer compras), char (carro), tuque (gorro), souper (jantar).",
      "'Déjeuner' no Quebec é café da manhã; na França é almoço — cuidado com a pegadinha!"
    ],
    examples: [
      { fr: "Chocolatine ou pain au chocolat ? Le débat éternel.", pt: "Chocolatine ou pain au chocolat? O debate eterno." },
      { fr: "Au Québec, on magasine au centre-ville.", pt: "Em Quebec, a gente faz compras no centro." },
      { fr: "On va souper à 18h, comme au Québec.", pt: "Vamos jantar às 18h, como em Quebec." }
    ],
    exercises: [
      choice("No Quebec, 'magasiner' é…", ["fazer compras", "cozinhar", "limpar"], 0),
      fill("En Belgique, on dit s___ (setenta).", "septante", { hint: "septante" }),
      choice("'Chocolatine' se usa no…", ["Sudoeste da França", "Quebec", "Bélgica"], 0),
      trans("Em Quebec, a gente faz compras no centro.", "Au Québec, on magasine au centre-ville.", { accept: ["Au Québec, on magasine au centre-ville"] }),
      match([["magasiner", "fazer compras (Quebec)"], ["tuque", "gorro (Quebec)"], ["septante", "setenta (Bélgica)"], ["souper", "jantar (Quebec)"]])
    ],
    words: ["w-chocolatine", "w-magasiner", "w-souper", "w-tuque", "w-septante"]
  },
  {
    id: "l70-conversation-reelle",
    worldId: "world-12",
    title: "La conversation réelle",
    icon: "chat",
    topic: "conversacao",
    objective: "Falar como um francês de verdade: preenchedores, interjeições e ritmo.",
    theory: [
      "Preenchedores: bah, ben, du coup, en fait, genre, tu vois, voilà voilà.",
      "'Du coup' virou o 'então' dos franceses: Du coup, on y va ?",
      "Interjeições: Ah bon ? · C'est vrai ? · Sans blague ! · Carrément !",
      "A conversa real tem sobreposição, pausas e reformulações — não é um diálogo de livro."
    ],
    examples: [
      { fr: "Bah du coup, je sais pas trop…", pt: "Bom, então, não sei muito bem…" },
      { fr: "En fait, c'est pas si compliqué.", pt: "Na verdade, não é tão complicado." },
      { fr: "— Il a démissionné. — Sans blague !?", pt: "— Ele pediu demissão. — Sem brincadeira!?" }
    ],
    exercises: [
      choice("Qual é um preenchedor típico francês?", ["du coup", "portanto", "however"], 0),
      fill("E___ (na verdade), c'est pas si compliqué.", "En fait", { hint: "en fait" }),
      choice("'Sans blague !?' expressa…", ["surpresa", "tristeza", "fome"], 0),
      trans("Ele pediu demissão. — Sem brincadeira!?", "Il a démissionné. — Sans blague !?", { accept: ["Il a démissionné. — Sans blague !?"] }),
      match([["du coup", "então"], ["en fait", "na verdade"], ["tu vois", "entende"], ["carrément", "totalmente!"]])
    ],
    words: ["w-du-coup", "w-en-fait"]
  }
];

const world12Boss: World["boss"] = {
  id: "boss-12",
  worldId: "world-12",
  title: "L'Animatrice du JT",
  icon: "radio",
  intro: "Os holofotes do estúdio acendem! A apresentadora do JT testa seu francês de mídia, as gírias jovens e os regionalismos da francofonia. Silence, on tourne ! ",
  xp: 160,
  exercises: [
    choice("O que é 'le JT'?", ["o telejornal", "o rádio", "o jornal impresso"], 0),
    fill("Selon les s___ (fontes)…", "sources", { hint: "les sources" }),
    choice("'Faire le buzz' significa…", ["viralizar", "silenciar", "cozinhar"], 0),
    trans("O escândalo virou manchete.", "Le scandale fait les gros titres.", { accept: ["Le scandale fait les gros titres"] }),
    choice("Verlan de 'fou' é…", ["ouf", "fou", "meuf"], 0),
    choice("No Quebec, 'souper' é…", ["o jantar", "a sopa", "o café da manhã"], 0),
    match([["magasiner", "fazer compras (Quebec)"], ["septante", "setenta (Bélgica)"], ["la manchette", "a manchete"], ["le témoin", "a testemunha"]]),
    fill("J'ai la f___ (preguiça) de sortir.", "flemme", { hint: "la flemme" }),
    listen("O que você ouviu?", "Nous sommes en direct de Paris.", ["Nous sommes en direct de Paris", "Nous sommes en retard", "Nous sommes en tendance"], 0)
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 13 —  Advanced French
// ══════════════════════════════════════════════════════════════
const world13Lessons: Lesson[] = [
  {
    id: "a13-01-registres",
    worldId: "world-13",
    title: "Les registres de langue",
    icon: "books",
    topic: "registros",
    objective: "Escolher o registro certo: soutenu, courant ou familier — e sentir a diferença.",
    theory: [
      "Três registros: soutenu (erudito), courant (normal) e familier (informal).",
      "A MESMA ideia muda de roupa: Je suis fatigué (courant) · Je suis crevé (familier) · Je suis épuisé (soutenu).",
      "Escolher o registro é escolher o efeito: respeitar, impressionar, aproximar ou provocar.",
      "Nuance = a diferença fina entre duas palavras que parecem iguais (ex.: regarder x observer)."
    ],
    examples: [
      { fr: "Courant: Tu peux fermer la porte ?", pt: "Normal: você pode fechar a porta?" },
      { fr: "Familier: Tu peux fermer la porte, mec ?", pt: "Informal: fecha a porta aí, cara?" },
      { fr: "Soutenu: Pourriez-vous fermer la porte, s'il vous plaît ?", pt: "Erudito: o senhor poderia fechar a porta, por favor?" }
    ],
    exercises: [
      choice("Qual frase está no registro FAMILIER?", ["Tu peux fermer la porte ?", "Tu peux fermer la porte, mec ?", "Pourriez-vous fermer la porte ?"], 1),
      choice("Registro SOUTENU serve para…", ["conversa com amigos", "carta formal / entrevista", "mensagem no zap"], 1),
      match([["courant", "normal"], ["familier", "informal"], ["soutenu", "erudito"], ["la nuance", "a diferença fina"]]),
      fill("Je suis c___ (morto de cansado, familier).", "crevé", { accept: ["creve"], hint: "familier de épuisé" }),
      trans("Você pode fechar a porta? (courant)", "Tu peux fermer la porte ?", { accept: ["Tu peux fermer la porte"] })
    ],
    words: ["w-registre", "w-soutenu", "w-familier", "w-nuance"]
  },
  {
    id: "a13-02-connotation",
    worldId: "world-13",
    title: "La connotation",
    icon: "magicWand",
    topic: "conotacao",
    objective: "Perceber o que as palavras SUGEREM além do sentido literal — e usar isso a seu favor.",
    theory: [
      "Denotação = o sentido literal (une maison = uma casa).",
      "Conotação = o que a palavra FAZ SENTIR (une baraque = um barraco, cheio de julgamento).",
      "Escolher 'maigre' (magro, negativo) em vez de 'mince' (magro, elogio) muda tudo.",
      "O subtexto: às vezes o que não se diz importa mais do que o que se diz."
    ],
    examples: [
      { fr: "Elle est mince.", pt: "Ela é magra (elogio — leve, elegante)." },
      { fr: "Elle est maigre.", pt: "Ela é magra (preocupante — frágil)." },
      { fr: "Il conduit une voiture.", pt: "Ele dirige um carro (neutro)." },
      { fr: "Il conduit une bagnole.", pt: "Ele dirige uma lata-velha (familier, julgamento)." }
    ],
    exercises: [
      choice("Qual palavra soa como ELOGIO?", ["maigre", "mince", "chétif"], 1),
      choice("'Une baraque' conota…", ["um casebre (pejorativo)", "um castelo", "uma escola"], 0),
      fill("Denotação é o sentido ___.", "literal", { hint: "o sentido da palavra no dicionário" }),
      trans("Ela é magra (elogio).", "Elle est mince.", { accept: ["Elle est mince"] }),
      choice("O que é 'subtexto'?", ["o que fica nas entrelinhas", "o texto escrito", "um tipo de fonte"], 0)
    ],
    words: ["w-connoter", "w-nuance", "w-sous-entendu"]
  }
];

const world13Boss: World["boss"] = {
  id: "boss-13",
  worldId: "world-13",
  title: "Le Censeur des Registres",
  icon: "scales",
  intro: "Um crítico literário implacável avalia cada palavra sua. Escolha o registro certo ou ele te devolve ao rascunho !",
  xp: 180,
  exercises: [
    choice("Registro FAMILIER de 'Je suis fatigué'?", ["Je suis crevé", "Je suis épuisé", "Je suis las"], 0),
    choice("'Mince' conota…", ["elogio", "insulto", "medo"], 0),
    fill("Escolher o registro é escolher o ___.", "efeito", { hint: "efeito / impressão" }),
    trans("Você pode fechar a porta? (soutenu)", "Pourriez-vous fermer la porte ?", { accept: ["Pourriez-vous fermer la porte, s'il vous plaît"] }),
    match([["courant", "normal"], ["familier", "informal"], ["soutenu", "erudito"], ["la nuance", "a diferença fina"]])
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 14 —  Mastery
// ══════════════════════════════════════════════════════════════
const world14Lessons: Lesson[] = [
  {
    id: "a14-01-rhetorique",
    worldId: "world-14",
    title: "La rhétorique",
    icon: "magicWand",
    topic: "retorica",
    objective: "Persuadir com elegância: figuras de linguagem que dobram qualquer interlocutor.",
    theory: [
      "Retórica = a arte de falar de um jeito que convence, sem mentir.",
      "Litote: dizer MENOS para dar a entender MAIS: 'Ce n'est pas mal' = é ótimo!",
      "Zeugme: ligar duas ideias com uma palavra só, com efeito: 'Il a perdu sa montre et son sang-froid'.",
      "Silepse: concordar com a IDEIA, não com a gramática: 'La plupart sont d'accord' (plural na ideia)."
    ],
    examples: [
      { fr: "Ce gâteau n'est pas mauvais du tout !", pt: "Esse bolo não é nada ruim! (litote = é uma delícia)" },
      { fr: "Elle a perdu son temps et son calme.", pt: "Ela perdeu tempo e a paciência (zeugme)." },
      { fr: "Tout le monde étaient contents.", pt: "Todo mundo estava contente (silepse: ideia no plural)." }
    ],
    exercises: [
      choice("O que é uma LITOTE?", ["dizer menos para implicar mais", "exagerar demais", "inventar fatos"], 0),
      choice("'Ce n'est pas mal !' geralmente quer dizer…", ["é ótimo!", "é horrível", "é mediano"], 0),
      match([["la litote", "atenuação irônica"], ["le zeugme", "duas ideias, uma palavra"], ["la silepse", "concordar com a ideia"], ["la rhétorique", "a arte de persuadir"]]),
      fill("Retórica é a arte de ___.", "persuadir", { hint: "convencer sem mentir" }),
      trans("Esse bolo não é nada ruim! (litote)", "Ce gâteau n'est pas mauvais du tout !", { accept: ["Ce gâteau n'est pas mauvais du tout"] })
    ],
    words: ["w-rhetorique", "w-litote", "w-zeugme"]
  },
  {
    id: "a14-02-argument",
    worldId: "world-14",
    title: "L'argument parfait",
    icon: "target",
    topic: "argumentacao",
    objective: "Montar um argumento à prova de balas: tese, prova, exemplo e contra-ataque.",
    theory: [
      "Estrutura: Thèse (o que defendo) → Argument (por quê) → Exemple (prova concreta).",
      "Conectores que somam: d'ailleurs (aliás), de plus (além disso), en outre (ademais).",
      "Conectores que contrastam: pourtant (no entanto), en revanche (por outro lado), néanmoins (contudo).",
      "Antecipar a objeção e respondê-la na hora é sinal de domínio total."
    ],
    examples: [
      { fr: "Je pense que le vélo est idéal en ville. D'ailleurs, je l'utilise chaque jour.", pt: "Acho a bicicleta ideal na cidade. Aliás, uso todos os dias." },
      { fr: "Le télétravail gagne du terrain. En revanche, il isole parfois.", pt: "O home office ganha espaço. Por outro lado, às vezes isola." },
      { fr: "Pourtant, les études montrent l'inverse.", pt: "No entanto, os estudos mostram o contrário." }
    ],
    exercises: [
      choice("Qual conector SOMa um argumento?", ["d'ailleurs", "pourtant", "néanmoins"], 0),
      choice("Qual conector CONTRASTA?", ["de plus", "en revanche", "d'ailleurs"], 1),
      build("Monte: 'Aliás, uso todos os dias.'", ["D'ailleurs", "je", "l'utilise", "chaque", "jour", "."], ["D'ailleurs", "je", "l'utilise", "chaque", "jour", "."]),
      fill("Thèse → Argument → ___", "exemple", { hint: "a prova concreta" }),
      trans("No entanto, os estudos mostram o contrário.", "Pourtant, les études montrent l'inverse.", { accept: ["Pourtant les études montrent l'inverse"] })
    ],
    words: ["w-argument", "w-pourtant", "w-dailleurs", "w-donc", "w-preuve"]
  }
];

const world14Boss: World["boss"] = {
  id: "boss-14",
  worldId: "world-14",
  title: "Le Débatteur Sans Pitié",
  icon: "crosshair",
  intro: "Um debatedor profissional quer te destruir com palavras. Responda com retórica afiada ou vire estatística do debate !",
  xp: 200,
  exercises: [
    choice("Litote de 'é ótimo'?", ["Ce n'est pas mal !", "C'est nul !", "C'est moyen."], 0),
    choice("Conector para CONTRASTAR:", ["en revanche", "de plus", "d'ailleurs"], 0),
    fill("Thèse → Argument → ___", "exemple", { hint: "prova concreta" }),
    build("Monte: 'Aliás, uso todos os dias.'", ["D'ailleurs", "je", "l'utilise", "chaque", "jour", "."], ["D'ailleurs", "je", "l'utilise", "chaque", "jour", "."]),
    trans("No entanto, os estudos mostram o contrário.", "Pourtant, les études montrent l'inverse.", { accept: ["Pourtant les études montrent l'inverse"] })
  ]
};

// ══════════════════════════════════════════════════════════════
// WORLD 15 —  Native Mode
// ══════════════════════════════════════════════════════════════
const world15Lessons: Lesson[] = [
  {
    id: "a15-01-verlan",
    worldId: "world-15",
    title: "Le verlan",
    icon: "maskHappy",
    topic: "verlan",
    objective: "Entender a gíria invertida que todo francês jovem usa — e soar nativa de verdade.",
    theory: [
      "Verlan = inverter as sílabas: femme → meuf · fou → ouf · lourd → relou.",
      "Regra prática: pegue a palavra, inverta as sílabas e às vezes solte o final: bizarre → zarbi.",
      "É informal — use com amigos, nunca em entrevista ou carta formal.",
      "Ouvir verlan é o teste definitivo de compreensão real de ouvido."
    ],
    examples: [
      { fr: "C'est ouf, cette histoire !", pt: "Essa história é doida!" },
      { fr: "La meuf là-bas, c'est ta sœur ?", pt: "Aquela mina ali é sua irmã?" },
      { fr: "Ce film, il est trop relou.", pt: "Esse filme é muito chato." }
    ],
    exercises: [
      choice("Verlan de 'femme' é…", ["meuf", "ouf", "relou"], 0),
      choice("Verlan de 'fou' é…", ["ouf", "meuf", "fouf"], 0),
      fill("Verlan de 'lourd' é ___.", "relou", { hint: "lourd → relou" }),
      trans("Essa mina é sua irmã? (informal)", "La meuf là-bas, c'est ta sœur ?", { accept: ["La meuf c'est ta soeur", "La meuf là-bas c'est ta sœur"] }),
      choice("Quando usar verlan?", ["só com amigos", "em entrevista de emprego", "em carta formal"], 0)
    ],
    words: ["w-verlan", "w-meuf", "w-ouf-nat", "w-relou"]
  },
  {
    id: "a15-02-natif",
    worldId: "world-15",
    title: "Parler comme un natif",
    icon: "moon",
    topic: "nativo",
    objective: "Os tiques de fala, ligações e pequenos truques que separam aluno de nativo.",
    theory: [
      "Liaison: les_amis, deux_heures — o som que liga as palavras.",
      "Tiques de fala: du coup (então), en fait (na verdade), quoi (tipo…), voilà (pronto).",
      "Elisão na fala: 'Je sais pas' no lugar de 'Je ne sais pas'.",
      "Nativos repetem, hesitam e usam 'euh' — naturalidade é ritmo, não perfeição."
    ],
    examples: [
      { fr: "Du coup, on part demain.", pt: "Então, a gente parte amanhã." },
      { fr: "En fait, c'est pas si compliqué.", pt: "Na verdade, não é tão complicado." },
      { fr: "Les amis arrivent à deux heures.", pt: "Os amigos chegam às duas horas (liaison: les-z-amis)." }
    ],
    exercises: [
      choice("O que é 'liaison'?", ["ligar o som entre palavras", "uma cidade", "um tipo de verbo"], 0),
      choice("'Du coup' significa…", ["então / por causa disso", "de repente", "de novo"], 0),
      fill("Na fala, 'Je ne sais pas' vira 'Je s___ pas'.", "sais", { hint: "s + ais" }),
      trans("Na verdade, não é tão complicado.", "En fait, c'est pas si compliqué.", { accept: ["En fait ce n'est pas si compliqué"] }),
      choice("Qual frase soa mais NATIVA em conversa?", ["Je ne sais pas.", "Je sais pas.", "Je ne le sais point."], 1)
    ],
    words: ["w-du-coup", "w-en-fait", "w-voila"]
  }
];

const world15Boss: World["boss"] = {
  id: "boss-15",
  worldId: "world-15",
  title: "Le Roi du Verlan",
  icon: "crown",
  intro: "O rei da gíria parisiense te desafia: entenda o verlan, as liaisons e o ritmo de rua — ou fica pra trás no metrô !",
  xp: 220,
  exercises: [
    choice("Verlan de 'femme'?", ["meuf", "ouf", "fouf"], 0),
    choice("'Du coup' na conversa significa…", ["então", "nunca", "também"], 0),
    fill("Liaison: les_amis soa como 'les-___'.", "zamis", { hint: "les z-amis" }),
    trans("Essa história é doida! (informal)", "C'est ouf, cette histoire !", { accept: ["C'est ouf cette histoire", "Cette histoire c'est ouf"] }),
    choice("Onde NÃO usar verlan?", ["entrevista de emprego", "com amigos no zap", "num show"], 0)
  ]
};

// ── Aulas de prática geradas (reforço: 13 a 20 aulas por mundo) ──
// O gerador fica em practice.ts; aqui só ligamos cada mundo à sua
// quantidade extra. O mundo 1 já tem 16 aulas manuais.
const world1Extra: Lesson[] = [];
const world2Extra: Lesson[] = generatePracticeLessons(world2Lessons, { worldId: "world-2", topic: "a vida cotidiana" }, 4);
const world3Extra: Lesson[] = generatePracticeLessons(world3Lessons, { worldId: "world-3", topic: "a cidade" }, 6);
const world4Extra: Lesson[] = generatePracticeLessons(world4Lessons, { worldId: "world-4", topic: "as conversas" }, 6);
const world5Extra: Lesson[] = generatePracticeLessons(world5Lessons, { worldId: "world-5", topic: "as viagens" }, 6);
const world6Extra: Lesson[] = generatePracticeLessons(world6Lessons, { worldId: "world-6", topic: "os relacionamentos" }, 6);
const world7Extra: Lesson[] = generatePracticeLessons(world7Lessons, { worldId: "world-7", topic: "os estudos" }, 6);
const world8Extra: Lesson[] = generatePracticeLessons(world8Lessons, { worldId: "world-8", topic: "o trabalho" }, 3);
const world9Extra: Lesson[] = generatePracticeLessons(world9Lessons, { worldId: "world-9", topic: "o pensamento em francês" }, 6);
const world10Extra: Lesson[] = generatePracticeLessons(world10Lessons, { worldId: "world-10", topic: "a cultura francesa" }, 6);
const world11Extra: Lesson[] = generatePracticeLessons(world11Lessons, { worldId: "world-11", topic: "as expressões" }, 6);
const world12Extra: Lesson[] = generatePracticeLessons(world12Lessons, { worldId: "world-12", topic: "a imersão" }, 6);
const world13Extra: Lesson[] = generatePracticeLessons(
  world13Lessons,
  { worldId: "world-13", topic: "o francês avançado", extraWordIds: ["w-enonce", "w-ironie", "w-sarcasme", "w-euphemisme", "w-ton", "w-contexte", "w-litteral", "w-figuratif"] },
  11
);
const world14Extra: Lesson[] = generatePracticeLessons(
  world14Lessons,
  { worldId: "world-14", topic: "o domínio da língua", extraWordIds: ["w-convaincre", "w-prouver", "w-preuve", "w-argument", "w-these", "w-refuter", "w-accord", "w-desaccord", "w-opinion", "w-debat"] },
  11
);
const world15Extra: Lesson[] = generatePracticeLessons(
  world15Lessons,
  { worldId: "world-15", topic: "o modo nativo", extraWordIds: ["w-argot", "w-liaison", "w-zarbi", "w-teuf", "w-chelou", "w-belek", "w-ouais", "w-grave-nat"] },
  11
);

export const WORLDS: World[] = [
  {
    id: "world-1",
    order: 1,
    title: "Première Rencontre",
    icon: "leaf",
    cefr: 0,
    description: "Primeiros passos: saudações, apresentações, números e o básico do básico.",
    color: "world-mint",
    unlockCefr: 0,
    lessons: [...world1Lessons, ...world1Extra].map((l) => l.id),
    boss: world1Boss
  },
  {
    id: "world-2",
    order: 2,
    title: "La Vie Quotidienne",
    icon: "bowlFood",
    cefr: 1,
    description: "Família, comida, rotina, horas, negação e o passado simples.",
    color: "world-rose",
    unlockCefr: 1,
    lessons: [...world2Lessons, ...world2Extra].map((l) => l.id),
    boss: world2Boss
  },
  {
    id: "world-3",
    order: 3,
    title: "La Ville",
    icon: "city",
    cefr: 2,
    description: "Cidade, direções, transportes e o futuro próximo.",
    color: "world-blue",
    unlockCefr: 1,
    lessons: [...world3Lessons, ...world3Extra].map((l) => l.id),
    boss: world3Boss
  },
  {
    id: "world-4",
    order: 4,
    title: "Conversations",
    icon: "chat",
    cefr: 3,
    description: "Diálogos reais: perguntar, reagir, marcar encontros, gostos e telefonemas.",
    color: "world-lilac",
    unlockCefr: 2,
    lessons: [...world4Lessons, ...world4Extra].map((l) => l.id),
    boss: world4Boss
  },
  {
    id: "world-5",
    order: 5,
    title: "Voyage",
    icon: "airplane",
    cefr: 3,
    description: "Aeroporto, hotel, restaurante, imprevistos — sobreviva à França!",
    color: "world-gold",
    unlockCefr: 3,
    lessons: [...world5Lessons, ...world5Extra].map((l) => l.id),
    boss: world5Boss
  },
  {
    id: "world-6",
    order: 6,
    title: "Relations",
    icon: "heart",
    cefr: 4,
    description: "Sentimentos, amizade, amor, planos e convites.",
    color: "world-blush",
    unlockCefr: 3,
    lessons: [...world6Lessons, ...world6Extra].map((l) => l.id),
    boss: world6Boss
  },
  {
    id: "world-7",
    order: 7,
    title: "Études",
    icon: "graduationCap",
    cefr: 4,
    description: "Escola, universidade, opiniões, argumentação e o subjonctif.",
    color: "world-blue",
    unlockCefr: 3,
    lessons: [...world7Lessons, ...world7Extra].map((l) => l.id),
    boss: world7Boss
  },
  {
    id: "world-8",
    order: 8,
    title: "Travail",
    icon: "briefcase",
    cefr: 4,
    description: "Entrevistas, e-mails, reuniões, home office e negociação.",
    color: "world-rose",
    unlockCefr: 4,
    lessons: [...world8Lessons, ...world8Extra].map((l) => l.id),
    boss: world8Boss
  },
  {
    id: "world-9",
    order: 9,
    title: "Pensée",
    icon: "brain",
    cefr: 5,
    description: "Hipóteses, conditionnel, plus-que-parfait, subjonctif passé, debate e dúvida — pensar em francês.",
    color: "world-lilac",
    unlockCefr: 4,
    lessons: [...world9Lessons, ...world9Extra].map((l) => l.id),
    boss: world9Boss
  },
  {
    id: "world-10",
    order: 10,
    title: "Culture",
    icon: "books",
    cefr: 5,
    description: "Literatura, cinema, música, arte, história e gastronomia — a alma francesa.",
    color: "world-gold",
    unlockCefr: 5,
    lessons: [...world10Lessons, ...world10Extra].map((l) => l.id),
    boss: world10Boss
  },
  {
    id: "world-11",
    order: 11,
    title: "Expressions",
    icon: "maskHappy",
    cefr: 5,
    description: "Expressões idiomáticas, ironia, duplo sentido e o subtexto do francês real.",
    color: "world-mint",
    unlockCefr: 5,
    lessons: [...world11Lessons, ...world11Extra].map((l) => l.id),
    boss: world11Boss
  },
  {
    id: "world-12",
    order: 12,
    title: "Immersion",
    icon: "globe",
    cefr: 5,
    description: "Francês de verdade: mídia, imprensa, redes sociais, gírias e a francofonia.",
    color: "world-blush",
    unlockCefr: 5,
    lessons: [...world12Lessons, ...world12Extra].map((l) => l.id),
    boss: world12Boss
  },
  {
    id: "world-13",
    order: 13,
    title: "Advanced French",
    icon: "fire",
    cefr: 7,
    description: "Registros, estilo, subtexto e nuances avançadas.",
    color: "world-rose",
    unlockCefr: 7,
    lessons: [...world13Lessons, ...world13Extra].map((l) => l.id),
    boss: world13Boss
  },
  {
    id: "world-14",
    order: 14,
    title: "Mastery",
    icon: "crown",
    cefr: 7,
    description: "Linguística, retórica e domínio absoluto.",
    color: "world-gold",
    unlockCefr: 7,
    lessons: [...world14Lessons, ...world14Extra].map((l) => l.id),
    boss: world14Boss
  },
  {
    id: "world-15",
    order: 15,
    title: "Native Mode",
    icon: "moon",
    cefr: 7,
    description: "O Modo Deus Supremo: a língua como um francês nativo a vive.",
    color: "world-lilac",
    unlockCefr: 7,
    lessons: [...world15Lessons, ...world15Extra].map((l) => l.id),
    boss: world15Boss
  }
];

export const LESSONS: Record<string, Lesson> = Object.fromEntries(
  [...world1Lessons, ...world2Lessons, ...world3Lessons, ...world4Lessons, ...world5Lessons, ...world6Lessons, ...world7Lessons, ...world8Lessons, ...world9Lessons, ...world10Lessons, ...world11Lessons, ...world12Lessons, ...world13Lessons, ...world14Lessons, ...world15Lessons, ...world1Extra, ...world2Extra, ...world3Extra, ...world4Extra, ...world5Extra, ...world6Extra, ...world7Extra, ...world8Extra, ...world9Extra, ...world10Extra, ...world11Extra, ...world12Extra, ...world13Extra, ...world14Extra, ...world15Extra].map((l) => [l.id, l])
);

export const BOSSES: Record<string, World["boss"]> = {
  "boss-1": world1Boss,
  "boss-2": world2Boss,
  "boss-3": world3Boss,
  "boss-4": world4Boss,
  "boss-5": world5Boss,
  "boss-6": world6Boss,
  "boss-7": world7Boss,
  "boss-8": world8Boss,
  "boss-9": world9Boss,
  "boss-10": world10Boss,
  "boss-11": world11Boss,
  "boss-12": world12Boss,
  "boss-13": world13Boss,
  "boss-14": world14Boss,
  "boss-15": world15Boss
};

export function worldById(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS[id];
}

export function worldLessons(world: World): Lesson[] {
  return world.lessons.map((id) => LESSONS[id]).filter(Boolean);
}

export function worldProgress(world: World, completed: string[]): { done: number; total: number } {
  const total = world.lessons.length;
  const done = world.lessons.filter((id) => completed.includes(id)).length;
  return { done, total };
}

export function nextLessonInWorld(world: World, completed: string[]): Lesson | null {
  for (const id of world.lessons) {
    if (!completed.includes(id)) {
      const l = LESSONS[id];
      if (l) return l;
    }
  }
  return null;
}

export function isWorldUnlocked(world: World, stateCefr: number, cleared: string[]): boolean {
  if (world.lessons.length === 0) return false; // mundos "em breve" ficam bloqueados
  if (cleared.includes(world.id)) return true;
  return world.unlockCefr <= stateCefr;
}

export function isWorldCleared(world: World, completed: string[]): boolean {
  return world.lessons.length > 0 && world.lessons.every((id) => completed.includes(id));
}

export function isLessonUnlocked(world: World, lessonId: string, completed: string[]): boolean {
  const idx = world.lessons.indexOf(lessonId);
  if (idx <= 0) return true;
  return completed.includes(world.lessons[idx - 1]);
}

export function isBossUnlocked(world: World, completed: string[]): boolean {
  return world.lessons.length > 0 && world.lessons.every((id) => completed.includes(id));
}

export const ALL_EXERCISES: Exercise[] = [...world1Lessons, ...world2Lessons, ...world3Lessons, ...world4Lessons, ...world5Lessons, ...world6Lessons, ...world7Lessons, ...world8Lessons, ...world9Lessons, ...world10Lessons, ...world11Lessons, ...world12Lessons].flatMap((l) => l.exercises);
