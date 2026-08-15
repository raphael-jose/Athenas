// ══════════════════════════════════════════════════════════════
// Athenas — Conta local (cadastro + recuperação de senha)
// ══════════════════════════════════════════════════════════════
// A conta vive no aparelho (localStorage), como todo o progresso do
// Athenas. A senha NUNCA é guardada em claro: só o hash SHA-256.
//
// IMPORTANTE (honestidade): o app roda 100% no navegador (GitHub
// Pages), então não existe servidor de email aqui. A recuperação
// funciona por código de 6 dígitos que, num app com backend, seria
// enviado por email — aqui o código aparece na própria tela como
// \"simulação\" (o gatilho continua sendo acertar o email cadastrado).

/** Hash SHA-256 da senha (com fallback caso crypto.subtle não exista). */
export async function hashPassword(pw: string): Promise<string> {
  const salted = "athenas::" + pw.trim();
  try {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salted));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    // cai no fallback
  }
  // fallback simples (ofuscação, não criptografia — só evita senha em claro)
  let h = 5381;
  for (let i = 0; i < salted.length; i++) h = ((h << 5) + h + salted.charCodeAt(i)) >>> 0;
  return "f" + h.toString(16);
}

/** Código de recuperação de 6 dígitos. */
export function recoveryCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Valida um email de forma leve. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
