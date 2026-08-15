// ══════════════════════════════════════════════════════════════
// Athenas — Codec da chave embutida (decode + integridade)
//
// Este módulo NÃO contém a chave — só a máquina de decodificação.
// Os dados codificados vivem em keyPayload.generated.ts (gerado por
// scripts/encode-key.mjs com semente rotativa por build). Aqui o
// valor decodificado passa por DUAS validações:
//   1. Formato (32 hex + "." + segredo alfanumérico);
//   2. Integridade — o checksum (FNV-1a 64) do valor decodificado
//      precisa bater com o gravado junto ao payload.
// Se qualquer uma falhar → null (o app segue em modo BYOK/offline).
//
// ⚠️ TRANSPARÊNCIA: em app estático, NENHUMA ofuscação é segura
// 100%. O checksum detecta corrupção/adulteração acidental do
// payload; não é autenticação contra um atacante determinado.
// ══════════════════════════════════════════════════════════════

/** Formato válido de chave Ollama Cloud: 32 hex + "." + segredo alfanumérico. */
export const KEY_SHAPE = /^[0-9a-f]{32}\.[A-Za-z0-9]{20,40}$/;

/**
 * Hash FNV-1a de 64 bits (BigInt, sem perda de precisão).
 * Usado como checksum de integridade da chave decodificada.
 * Mantido em sincronia com scripts/encode-key.mjs — o teste de
 * roundtrip (encode no script × decode aqui) falha se divergirem.
 */
export function hashKey(key: string): string {
  const OFFSET = 0xcbf29ce484222325n;
  const PRIME = 0x100000001b3n;
  const MASK = 0xffffffffffffffffn;
  let h = OFFSET;
  for (let i = 0; i < key.length; i++) {
    h ^= BigInt(key.charCodeAt(i));
    h = (h * PRIME) & MASK;
  }
  return h.toString(16).padStart(16, "0");
}

/**
 * Decodifica os fragmentos (XOR rotativo + base64 + inversão) e valida
 * formato + integridade. Retorna a chave ou null em qualquer falha.
 */
export function decodeKey(fragments: string[], seed: string, checksum: string): string | null {
  try {
    const b64 = fragments.join("");
    const bytes = atob(b64);
    let xored = "";
    for (let i = 0; i < bytes.length; i++) {
      xored += String.fromCharCode(bytes.charCodeAt(i) ^ seed.charCodeAt(i % seed.length));
    }
    const key = [...xored].reverse().join("");
    if (!KEY_SHAPE.test(key)) return null;
    if (hashKey(key) !== checksum) return null; // integridade
    return key;
  } catch {
    return null;
  }
}
