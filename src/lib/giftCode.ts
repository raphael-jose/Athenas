// ══════════════════════════════════════════════════════════════
// Athenas — Códigos de presente (área administrativa)
//
// O criador gera um código na área secreta e manda por WhatsApp; quem
// resgata na Loja ganha étoiles ou um item da loja. A assinatura usa
// o PIN do criador (ADMIN_PIN) — validação 100% local, sem servidor.
//
// ⚠️ Honestidade: o PIN vive no código do app, então alguém que
// entenda de programação conseguiria fabricar códigos. Para um app
// de presente, ok; para blindar de verdade, precisaria de backend.
// ══════════════════════════════════════════════════════════════
import { ADMIN_PIN } from "./constants";

/** Hash rápido (djb2) — assinatura simples, não criptografia. */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return (h >>> 0).toString(36);
}

function sig(payload: string): string {
  return hash(`${ADMIN_PIN}:${payload}`).slice(0, 6).toUpperCase();
}

/** Código de étoiles: ATH-500-ABC123 */
export function generateStarCode(amount: number): string {
  const n = Math.max(1, Math.floor(amount));
  return `ATH-${n}-${sig(`S${n}`)}`;
}

export type ItemCategory = "theme" | "costume" | "frame" | "confetti";

/** Código de item: ATH-ITEM-costume-bleuet-ABC123 */
export function generateItemCode(category: ItemCategory, id: string): string {
  return `ATH-ITEM-${category}-${id}-${sig(`I${category}:${id}`)}`;
}

export type GiftCode =
  | { type: "stars"; amount: number }
  | { type: "item"; category: ItemCategory; id: string };

/** Valida um código e devolve o que ele entrega (null = inválido). */
export function parseGiftCode(code: string): GiftCode | null {
  const c = code.trim();
  if (!c.toUpperCase().startsWith("ATH-")) return null;

  // Estrelas: ATH-500-ABC123
  const starMatch = c.match(/^ATH-(\d+)-([a-z0-9]{6})$/i);
  if (starMatch) {
    const n = Number(starMatch[1]);
    if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
    if (starMatch[2].toUpperCase() !== sig(`S${n}`)) return null;
    return { type: "stars", amount: n };
  }

  // Item: ATH-ITEM-categoria-id-ABC123
  const itemMatch = c.match(/^ATH-ITEM-(theme|costume|frame|confetti)-([A-Za-z0-9_-]+)-([a-z0-9]{6})$/i);
  if (itemMatch) {
    const category = itemMatch[1] as ItemCategory;
    const id = itemMatch[2];
    if (itemMatch[3].toUpperCase() !== sig(`I${category}:${id}`)) return null;
    return { type: "item", category, id };
  }

  return null;
}
