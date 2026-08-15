// ══════════════════════════════════════════════════════════════
// Athenas — Chave embutida (ofuscada em camadas)
//
// Para o app funcionar de cara no GitHub Pages SEM o usuário
// configurar nada, a chave precisa viajar no bundle. Ela NUNCA
// fica em texto puro: viaja codificada em fragmentos (XOR rotativo
// + base64 + inversão) gerados por scripts/encode-key.mjs com
// semente ALEATÓRIA POR BUILD — cada deploy produz um blob
// codificado diferente. A decodificação (src/lib/keyCodec.ts) ainda
// valida formato + checksum de integridade (FNV-1a 64).
//
// ⚠️ TRANSPARÊNCIA: em app estático, NENHUMA ofuscação é segura
// 100% — um atacante determinado pode extrair a chave do bundle.
// Isto eleva a barra (nada de chave em texto puro no repo/bundle,
// payload único por build, integridade verificada) e protege contra
// vazamento acidental; para blindagem real, a chave deve viver
// atrás de um servidor (proxy serverless) que o app chama.
// ══════════════════════════════════════════════════════════════
import { decodeKey } from "./keyCodec";
import { KEY_CHECKSUM, KEY_FRAGMENTS, XOR_SEED } from "./keyPayload.generated";

/**
 * Decodifica a chave embutida. Retorna null se a validação de
 * formato ou de integridade falhar (o app segue em BYOK/offline).
 */
export function embeddedKey(): string | null {
  return decodeKey(KEY_FRAGMENTS, XOR_SEED, KEY_CHECKSUM);
}
