// ══════════════════════════════════════════════════════════════
// Athenas — Árvore de gramática (explicações + links para aulas)
// ══════════════════════════════════════════════════════════════
import type { IconName } from "@/types";

export interface GrammarNode {
  id: string;
  icon: IconName;
  title: string;
  blurb: string;
  lessonId?: string;
  advanced?: boolean;
}

export const GRAMMAR_TREE: GrammarNode[] = [
  { id: "g-pronoms", icon: "user", title: "Pronoms", blurb: "je, tu, il, elle, nous, vous, ils, elles. Os sujeitos de toda frase francesa.", lessonId: "l3-oui-non" },
  { id: "g-articles", icon: "book", title: "Articles", blurb: "le/la/les (definidos) e un/une/des (indefinidos). O artigo carrega o gênero.", lessonId: "l6-articles" },
  { id: "g-genre", icon: "genderFemale", title: "Genre", blurb: "Masculino x feminino: aprenda cada palavra com seu artigo — une table, un livre.", lessonId: "l7-genre" },
  { id: "g-etre", icon: "scales", title: "Être", blurb: "je suis, tu es, il est… Ser/estar. Pilares da língua.", lessonId: "l10-etre-avoir" },
  { id: "g-avoir", icon: "gift", title: "Avoir", blurb: "j'ai, tu as, il a… Ter. Fome, sede e idade usam avoir!", lessonId: "l10-etre-avoir" },
  { id: "g-present", icon: "sun", title: "Présent", blurb: "O presente dos verbos -er (manger, parler, aimer) e irregulares essenciais.", lessonId: "l13-verbes" },
  { id: "g-negation", icon: "xCircle", title: "La négation", blurb: "ne… pas. E na fala informal, o 'ne' costuma sumir: 'Je sais pas'.", lessonId: "l15-negation" },
  { id: "g-passe-compose", icon: "hourglass", title: "Passé composé", blurb: "Avoir + particípio: j'ai mangé. Ações pontuais do passado.", lessonId: "l16-passe" },
  { id: "g-imparfait", icon: "videoCamera", title: "Imparfait", blurb: "Hábitos e cenários do passado: quand j'étais petit… (em breve)" },
  { id: "g-futur", icon: "rocket", title: "Futur", blurb: "Futur proche: aller + infinitivo — je vais manger. O futuro do dia a dia.", lessonId: "l20-futur-proche" },
  { id: "g-conditionnel", icon: "lightbulb", title: "Conditionnel", blurb: "je voudrais, je pourrais… Educação, cortesia e hipóteses.", advanced: true, lessonId: "l44-conditionnel" },
  { id: "g-subjonctif", icon: "tornado", title: "Subjonctif", blurb: "Il faut que…, bien que… O modo do desejo e da dúvida.", advanced: true },
  { id: "g-plus-que-parfait", icon: "arrowClockwise", title: "Plus-que-parfait", blurb: "O passado do passado: j'avais mangé.", advanced: true, lessonId: "l45-plus-que-parfait" },
  { id: "g-hypotheses", icon: "compass", title: "Hypothèses", blurb: "Si + imparfait → conditionnel · Si + plus-que-parfait → conditionnel passé. O universo imaginário em francês.", advanced: true, lessonId: "l43-hypotheses" },
  { id: "g-subjonctif-passe", icon: "hourglass", title: "Subjonctif passé", blurb: "bien qu'il ait plu, je doute qu'ils aient compris. Emoção e incerteza sobre o passado.", advanced: true, lessonId: "l46-subjonctif-passe" },
  { id: "g-concordance", icon: "infinity", title: "Concordance des temps", blurb: "Como os tempos se encaixam na frase.", advanced: true },
  { id: "g-nuances", icon: "crownSimple", title: "Nuances avancées", blurb: "Registro, subtexto, pragmática: o que um francês REALMENTE entende. O coração do Modo Deus Supremo.", advanced: true }
];

export function grammarNodeById(id: string): GrammarNode | undefined {
  return GRAMMAR_TREE.find((g) => g.id === id);
}
