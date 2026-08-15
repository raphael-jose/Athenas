// ══════════════════════════════════════════════════════════════
// Athenas — Prática de pronúncia
// Cada item: frase em francês + "fonética" aproximada (como soa) +
// significado em português. A voz modelo (fr-FR) fala o texto.
// ══════════════════════════════════════════════════════════════
export interface PronItem {
  id: string;
  fr: string;
  phon: string; // aproximação fonética para brasileiros
  pt: string;
  tip?: string; // dica de pronúncia
  level: "A1" | "A2" | "B1";
}

export const PRONUNCIATION_DECK: PronItem[] = [
  { id: "p-bonjour", fr: "Bonjour !", phon: "bonjúr", pt: "Olá / Bom dia!", tip: "O 'r' final é suave, quase sem som: 'bonjúr'.", level: "A1" },
  { id: "p-salut", fr: "Salut, ça va ?", phon: "salú, sá vá?", pt: "Oi, tudo bem?", tip: "'salut' com 'u' de lábios arredondados.", level: "A1" },
  { id: "p-merci", fr: "Merci beaucoup !", phon: "mérsi bôkú", pt: "Muito obrigado(a)!", tip: "'beaucoup' soa 'bôkú' (o 'p' quase não soa).", level: "A1" },
  { id: "p-appelle", fr: "Je m'appelle…", phon: "jê mapél", pt: "Eu me chamo…", tip: "'je' soa 'jê' bem leve; 'm'appelle' = 'mapél'.", level: "A1" },
  { id: "p-enchantee", fr: "Enchantée !", phon: "ãchãté", pt: "Prazer em conhecer!", tip: "'en' soa nasal, como 'ã' sem fechar a boca.", level: "A1" },
  { id: "p-faim", fr: "J'ai faim.", phon: "jé fã", pt: "Estou com fome.", tip: "'faim' é nasal: 'fã'.", level: "A1" },
  { id: "p-voudrais", fr: "Je voudrais un café.", phon: "jê vudré ã café", pt: "Eu gostaria de um café.", tip: "'voudrais' soa 'vudré' — o final 'ais' vira 'é'.", level: "A1" },
  { id: "p-baguette", fr: "Une baguette, s'il vous plaît.", phon: "ün baguét, sil vú plé", pt: "Uma baguete, por favor.", tip: "'une' = 'ün' (lábios em 'u', língua em 'i').", level: "A1" },
  { id: "p-gare", fr: "Où est la gare ?", phon: "u é la gár?", pt: "Onde fica a estação?", tip: "'où' soa 'u' fechado; o 'r' final de 'gare' é gutural leve.", level: "A1" },
  { id: "p-droite", fr: "C'est à droite.", phon: "sé tá drwat", pt: "É à direita.", tip: "'c'est' = 'sé' (não soa 'cê').", level: "A1" },
  { id: "p-ai-ans", fr: "J'ai vingt ans.", phon: "jé vãtã", pt: "Eu tenho vinte anos.", tip: "'vingt ans' = 'vãtã' com ligação.", level: "A2" },
  { id: "p-mange", fr: "Hier, j'ai mangé une pizza.", phon: "iér, jé mãjé ün pidza", pt: "Ontem eu comi uma pizza.", tip: "'mangé' = 'mãjé' (nasal + 'é').", level: "A2" },
  { id: "p-petit", fr: "Un petit café, s'il te plaît.", phon: "ã pti café, sil tê plé", pt: "Um café pequeno, por favor.", tip: "'petit' final não soa: 'pti'.", level: "A2" },
  { id: "p-negation", fr: "Je ne sais pas.", phon: "jê nê sé pá", pt: "Eu não sei.", tip: "Na fala natural: 'j'sais pas' (o 'ne' quase some).", level: "A2" },
  { id: "p-quelle-heure", fr: "Quelle heure est-il ?", phon: "kel ér étil?", pt: "Que horas são?", tip: "'heure' = 'ér'; ligue 'est-il' = 'étil'.", level: "A2" },
  { id: "p-va-tout", fr: "Ça va très bien, merci.", phon: "sá vá tré biã, mérsi", pt: "Está tudo muito bem, obrigado.", tip: "'très' = 'tré'; 'bien' = 'biã' nasal.", level: "A2" },
  { id: "p-croissant", fr: "Un croissant, s'il vous plaît.", phon: "ã krwasã, sil vú plé", pt: "Um croissant, por favor.", tip: "'croissant' = 'krwasã' — o 'oi' vira 'wa'.", level: "A2" },
  { id: "p-ou-est", fr: "Où est la boulangerie ?", phon: "u é la bulãjri?", pt: "Onde fica a padaria?", tip: "'boulangerie' = 'bulãjri' (4 sílabas, não 5).", level: "A2" },
  { id: "p-demain", fr: "À demain !", phon: "á dmã", pt: "Até amanhã!", tip: "'demain' = 'dmã' — a vogal final é nasal.", level: "A2" },
  { id: "p-tu-viens", fr: "Tu viens avec moi ?", phon: "tü viã avék mwa?", pt: "Você vem comigo?", tip: "'viens' = 'viã'; 'moi' = 'mwa'.", level: "A2" },
  { id: "p-je-veux", fr: "Je voudrais parler français.", phon: "jê vudré parlê frãsé", pt: "Eu gostaria de falar francês.", tip: "'français' = 'frãsé'.", level: "B1" },
  { id: "p-si-javais", fr: "Si j'avais le temps…", phon: "si javé lê tã", pt: "Se eu tivesse tempo…", tip: "'temps' = 'tã' (o 'p' não soa).", level: "B1" },
  { id: "p-bon-appetit", fr: "Bon appétit !", phon: "bõn apeti", pt: "Bom apetite!", tip: "Ligação: 'bon appétit' = 'bõn apeti'.", level: "A2" },
  { id: "p-tres-heureux", fr: "Je suis très heureux.", phon: "jê süi tré zerö", pt: "Estou muito feliz.", tip: "Ligação: 'très heureux' = 'tré zerö'.", level: "B1" }
];

export function pronunciationDeck(ids?: string[]): PronItem[] {
  if (!ids) return PRONUNCIATION_DECK;
  const byId = new Map(PRONUNCIATION_DECK.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is PronItem => !!p);
}
