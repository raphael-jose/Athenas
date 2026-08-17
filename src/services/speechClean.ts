// ══════════════════════════════════════════════════════════════
// Athenas — Limpeza de transcrição falada
// Quando o aluno fala (push-to-talk), o reconhecimento devolve
// vícios naturais da fala: repetições, gaguejos e palavras de
// preenchimento ("tipo", "né", "euh"…). Antes de mandar para a
// Lulu, limpamos o texto para a resposta soar como escrita real —
// "o que a pessoa quis dizer", não a transcrição crua.
// ══════════════════════════════════════════════════════════════

/** Palavras de preenchimento/vício de fala (FR + PT) removidas quando sozinhas. */
const FILLERS = new Set([
  // francês
  "euh", "euhm", "ehm", "hum", "hmm", "hm", "mmm", "mm", "uh",
  "hein", "bah", "ben", "euhh",
  // português (alunos brasileiros)
  "tipo", "né", "sabe", "tá", "ahn", "hã", "aham", "uhm", "veja", "entende",
  "entendeu", "tipoassim", "tlgd", "pow", "mano", "cara"
]);

/** Separa "x-x" (gaguejo de sílaba): "j-je" → "je", "p-pour" → "pour". */
const STUTTER_RE = /(\b[a-zà-ÿ]{1,2})-(\1[a-zà-ÿ]*)/gi;

/**
 * Limpa uma transcrição falada:
 * - colapsa gaguejos de sílaba ("j-je veux" → "je veux")
 * - remove vícios de fala ("tipo", "né", "euh"…)
 * - colapsa palavras repetidas seguidas ("je je veux" → "je veux")
 * - normaliza espaços e pontuação final
 */
/**
 * Limpa um texto ANTES de ser FALADO pela Lulu:
 * - remove marcadores de formatação (markdown): **negrito**, *itálico*,
 *   _sublinhado_, `código`, # título, > citação, [link](url), listas…
 * - remove EMOJIS (a voz não deve descrever "coração", "rosa"…)
 * - preserva letras, números, pontuação, apóstrofos e hífens do francês
 *   (aujourd'hui, peut-être) — e símbolos de texto reais (→, ✓, ▲).
 * Usado no speak() para a voz nunca ler lixo de formatação.
 */
export function cleanForSpeech(raw: string): string {
  let s = (raw ?? "").replace(/’/g, "'");

  // 1. EMOJIS — remove junto com variação de tom/pele, VS16 e ZWJ
  s = s.replace(/[\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu, "");
  s = s.replace(/\p{Extended_Pictographic}/gu, "");

  // 2. Markdown inline — mantém o conteúdo, tira a formatação
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1"); // **negrito**
  s = s.replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s.,;:!?)…]|$)/g, "$1$2"); // *itálico* / _itálico_
  s = s.replace(/~~([^~]+)~~/g, "$1"); // ~~tachado~~
  s = s.replace(/`([^`]+)`/g, "$1"); // `código`
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // [texto](url)

  // 3. Markdown de linha — títulos, citações, listas
  s = s.replace(/^\s*#{1,6}\s*/gm, ""); // # Título
  s = s.replace(/^\s*>\s?/gm, ""); // > citação
  s = s.replace(/^\s*[-*+]\s+/gm, ""); // - item
  s = s.replace(/^\s*\d+[.)]\s+/gm, ""); // 1. item
  s = s.replace(/^\s*```[a-z]*\s*$/gim, ""); // blocos de código

  // 4. Sobras de marcação solta (nunca parte de palavra em fr/pt) + tabelas
  s = s.replace(/[*_#~`|]/g, " ");

  // 5. Normaliza espaços/pontuação
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export function cleanSpokenText(raw: string): string {
  let s = (raw ?? "").replace(STUTTER_RE, "$2").trim();
  const tokens = s.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const tok of tokens) {
    const bare = tok.toLowerCase().replace(/[.,;:!?]/g, "");
    if (FILLERS.has(bare)) continue;
    const prev = out[out.length - 1];
    if (prev && bare && prev.toLowerCase().replace(/[.,;:!?]/g, "") === bare) continue;
    out.push(tok);
  }
  s = out.join(" ");
  // tipografia francesa: espaço antes de ! e ?, sem espaço antes de , . ; :
  s = s.replace(/\s+([,.;:])/g, "$1").replace(/\s*([!?])/g, " $1");
  // pontuação final redundante (ex.: reticências de hesitação)
  s = s.replace(/[.,;:]+$/g, "").trim();
  return s;
}
