// ══════════════════════════════════════════════════════════════
// Athenas — Gerador do payload da chave embutida (rotação por build)
//
// Roda dentro de scripts/prepare.mjs (dev/build) e no CI de deploy.
//   • Fonte da chave: env ATHENAS_OLLAMA_KEY  →  secrets/ollama-key.txt
//   • Semente XOR ALEATÓRIA a cada execução → payload único por build
//     (mesma chave, blob codificado diferente a cada deploy)
//   • Checksum de integridade (FNV-1a 64) gravado junto ao payload —
//     verificado em runtime por src/lib/keyCodec.ts
//   • Se NENHUMA fonte de chave existir, o payload já commitado é
//     mantido (app continua funcionando; apenas sem rotação).
//
// A chave NUNCA é impressa nem gravada fora do payload codificado.
// ══════════════════════════════════════════════════════════════
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const OUT = join(root, "src", "lib", "keyPayload.generated.ts");

const KEY_SHAPE = /^[0-9a-f]{32}\.[A-Za-z0-9]{20,40}$/;

/** FNV-1a 64-bit — mesma implementação de src/lib/keyCodec.ts (teste de roundtrip garante sincronia). */
export function hashKey(key) {
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

/** Semente XOR aleatória (24 chars base64url) — o que rotaciona o payload por build. */
export function randomSeed() {
  return randomBytes(18).toString("base64url");
}

/** Codifica a chave em fragmentos (inverso exato do decodeKey do runtime). */
export function encodeKeyForBuild(key, seed) {
  const reversed = [...key].reverse().join("");
  let xored = "";
  for (let i = 0; i < reversed.length; i++) {
    xored += String.fromCharCode(reversed.charCodeAt(i) ^ seed.charCodeAt(i % seed.length));
  }
  const b64 = btoa(xored);
  const n = 4;
  const size = Math.ceil(b64.length / n);
  const fragments = [];
  for (let i = 0; i < n; i++) fragments.push(b64.slice(i * size, (i + 1) * size));
  return { fragments, seed, checksum: hashKey(key) };
}

/** Monta o payload completo (fragmentos + semente + checksum + id do build). */
export function generatePayload(key, buildId) {
  const { fragments, seed, checksum } = encodeKeyForBuild(key, randomSeed());
  return { fragments, seed, checksum, buildId };
}

/** Grava src/lib/keyPayload.generated.ts (fallback commitado / consumido pelo build). */
export function writePayload(payload) {
  const header = `// ══════════════════════════════════════════════════════════════
// GERADO AUTOMATICAMENTE por scripts/encode-key.mjs — NÃO edite.
// Contém a chave da IA APENAS na forma codificada (XOR + base64),
// com semente rotativa por build e checksum de integridade.
// Build id: ${payload.buildId}
// ══════════════════════════════════════════════════════════════
export const KEY_FRAGMENTS = ${JSON.stringify(payload.fragments, null, 2)};
export const XOR_SEED = ${JSON.stringify(payload.seed)};
export const KEY_CHECKSUM = ${JSON.stringify(payload.checksum)};
export const KEY_BUILD_ID = ${JSON.stringify(payload.buildId)};
`;
  writeFileSync(OUT, header);
}

/** Procura a chave crua: primeiro env (CI/secret), depois secrets/ollama-key.txt (local). */
export function findRawKey() {
  const fromEnv = process.env.ATHENAS_OLLAMA_KEY;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  const file = join(root, "secrets", "ollama-key.txt");
  if (existsSync(file)) {
    const v = readFileSync(file, "utf8").trim();
    if (v) return v;
  }
  return null;
}

function main() {
  const key = findRawKey();
  if (!key) {
    console.log("ℹ  Chave embutida: nenhuma fonte (env ATHENAS_OLLAMA_KEY ou secrets/ollama-key.txt) — payload commitado mantido.");
    process.exit(0);
  }
  if (!KEY_SHAPE.test(key)) {
    console.error("✖  Chave embutida: formato inválido na fonte — payload commitado mantido.");
    process.exit(1);
  }
  const payload = generatePayload(key, Date.now().toString(36));
  writePayload(payload);
  console.log("✔  Chave embutida: payload regenerado com semente rotativa + checksum de integridade.");
}

// Só roda como CLI (quando chamado diretamente ou via prepare.mjs).
const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) main();
