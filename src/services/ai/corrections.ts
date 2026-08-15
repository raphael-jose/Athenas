// ══════════════════════════════════════════════════════════════
// Athenas — "Ça sonne français ?" — correções por regras
// Objetivo: ir além do "correto" → o que um francês realmente diria.
// Em modo Ollama, a análise real vem da IA; aqui temos um fallback
// offline honesto e didático.
// ══════════════════════════════════════════════════════════════
export interface Correction {
  original: string;
  suggestion?: string;
  note: string;
  isNatural: boolean;
}

interface Rule {
  re: RegExp;
  fix: (input: string) => string;
  note: string;
}

const RULES: Rule[] = [
  {
    re: /\bje suis avec (faim|soif)\b/i,
    fix: (s) => s.replace(/\bje suis avec (faim|soif)\b/i, "j'ai $1"),
    note: "Em francês, 'fome' e 'sede' usam o verbo AVOIR: J'ai faim / J'ai soif. Não se diz 'être avec faim'."
  },
  {
    re: /\bje suis (faim|soif)\b/i,
    fix: (s) => s.replace(/\bje suis (faim|soif)\b/i, "j'ai $1"),
    note: "Use avoir: J'ai faim (não 'je suis faim')."
  },
  {
    re: /\bje suis avec\b/i,
    fix: (s) => s.replace(/\bje suis avec\b/i, "je suis"),
    note: "O 'avec' extra não é usado assim em francês. Ex.: 'Je suis fatigué' (sem 'avec')."
  },
  {
    re: /\bje suis (\d+) ans\b/i,
    fix: (s) => s.replace(/\bje suis (\d+) ans\b/i, "j'ai $1 ans"),
    note: "Idade em francês é sempre com AVOIR: J'ai 25 ans."
  },
  {
    re: /\bje veux\b/i,
    fix: (s) => s.replace(/\bje veux\b/i, "je voudrais"),
    note: "'Je veux' é direto demais. Em conversa educada, o natural é 'Je voudrais…' (eu gostaria)."
  },
  {
    re: /\bcomment (est-ce que tu|ton nom|tu t'appel)es?\b/i,
    fix: () => "Comment tu t'appelles ?",
    note: "A forma mais natural de perguntar o nome é 'Comment tu t'appelles ?' (ou 'Vous vous appelez comment ?')."
  },
  {
    re: /\bde nada\b/i,
    fix: () => "De rien !",
    note: "'De rien' é a resposta padrão. Formal: 'Je t'en prie' / 'Je vous en prie'. No Canadá: 'Bienvenue'."
  },
  {
    re: /\bje suis très (bien|content|heureux|fatigué)\b/i,
    fix: (s) => s,
    note: "Perfeito! 'Très' + adjetivo é natural. Em conversa casual, às vezes se usa 'super' (familier)."
  },
  {
    re: /\btu es d'accord avec moi\b/i,
    fix: (s) => s,
    note: "Natural! Alternativa oral comum: 'T'es d'accord ?' (informal)."
  },
  {
    re: /\bmon ami(e)?\b/i,
    fix: (s) => s,
    note: "Atenção: 'mon ami' pode soar como par romântico em certos contextos. Para amigos em geral, prefira 'un ami / un copain'."
  },
  {
    re: /\bj'ai besoin de\b/i,
    fix: (s) => s,
    note: "Natural! Para pedir algo em loja: 'J'aurais besoin de…' soa ainda mais polido."
  },
  {
    re: /\bça va bien\b/i,
    fix: (s) => s,
    note: "Natural. Em conversa, a resposta clássica a 'Ça va ?' é 'Ça va bien, et toi ?'."
  }
];

export function analyzeFrench(input: string): Correction {
  const clean = input.trim();
  if (!clean) return { original: input, note: "Escreva uma frase em francês para eu analisar! ", isNatural: false };

  for (const rule of RULES) {
    if (rule.re.test(clean)) {
      const suggestion = rule.fix(clean);
      return {
        original: clean,
        suggestion: suggestion !== clean ? suggestion : undefined,
        note: rule.note,
        isNatural: suggestion === clean
      };
    }
  }

  const accents = (clean.match(/[àâçéèêëîïôûùüÿœ]/g) ?? []).length;
  const hasFrench =
    accents >= 2 ||
    /\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|un|une|des|est|sont|ai|as|suis|de|du|au|aux|et|ou|bonjour|salut|merci|oui|non|madame|monsieur|français|francaise|pour|avec|mais|très|tres|oui)\b/i.test(clean);
  if (!hasFrench) {
    return {
      original: clean,
      suggestion: undefined,
      note: "Hmm, não parece francês… Tenta de novo? Pode escrever qualquer frase, eu te ajudo! ",
      isNatural: false
    };
  }

  return {
    original: clean,
    note: "Está correto e natural!  Em conversa real, um francês diria exatamente assim.",
    isNatural: true
  };
}

export const SOUND_FRENCH_TIPS = [
  "Em conversa, o 'ne' da negação costuma sumir: 'Je sais pas' em vez de 'Je ne sais pas'.",
  "'Je veux' é direto — 'Je voudrais' é o educado do dia a dia.",
  "Fome/sede/idade sempre com AVOIR: j'ai faim, j'ai soif, j'ai 20 ans.",
  "Perguntas orais: 'Tu viens ?' com entonação basta; o 'est-ce que' é mais formal.",
  "Na França: 'de rien'. Formal: 'je t'en prie'. Canadá: 'bienvenue'."
];
