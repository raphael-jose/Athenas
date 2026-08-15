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
