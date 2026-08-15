/**
 * scripts/prepare.mjs
 * Roda automaticamente antes de `npm run dev` e `npm run build`.
 *  - Copia o PNG do logo (raiz do projeto) para public/logo.png
 *  - Gera os ícones PWA (192/512) a partir do mesmo PNG
 * O logo é procurado em: process.env.LOGO_PATH → primeiro *.png na raiz.
 * Se nenhum PNG for encontrado, o app usa um fallback de marca (emoji + texto).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function findLogo() {
  const explicit = process.env.LOGO_PATH;
  if (explicit && existsSync(join(root, explicit))) return join(root, explicit);
  const candidates = readdirSync(root).filter((f) => f.toLowerCase().endsWith(".png"));
  return candidates.length > 0 ? join(root, candidates[0]) : null;
}

function copyLogo() {
  ensureDir(publicDir);
  ensureDir(iconsDir);
  const source = findLogo();
  if (source) {
    copyFileSync(source, join(publicDir, "logo.png"));
    copyFileSync(source, join(iconsDir, "icon-192.png"));
    copyFileSync(source, join(iconsDir, "icon-512.png"));
    console.log("✔  Logo copiado para public/ (logo.png + ícones PWA)");
  } else {
    console.log("ℹ  Nenhum PNG de logo encontrado — o app usará a marca padrão (emoji).");
  }
}

copyLogo();

/**
 * Rotaciona a chave embutida (se houver fonte: env ou secrets/ollama-key.txt).
 * A cada execução a semente XOR muda → payload codificado único por build.
 * Sem fonte, o payload commitado é mantido (app segue funcionando).
 */
function rotateKeyPayload() {
  const r = spawnSync(process.execPath, ["scripts/encode-key.mjs"], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

rotateKeyPayload();
