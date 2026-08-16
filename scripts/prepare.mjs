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

async function copyLogo() {
  ensureDir(publicDir);
  ensureDir(iconsDir);
  const source = findLogo();
  if (source) {
    // Logo do app (header/onboarding) — otimizado, sem precisar pesar 1MB+.
    try {
      const sharp = (await import("sharp")).default;
      await sharp(source).resize(512, 512).png().toFile(join(publicDir, "logo.png"));
      // Ícones PWA: o navegador exige as dimensões EXATAS do manifest
      // (192 e 512). Copiar o PNG cru (ex.: 1254x1254) quebra a
      // instalabilidade — o atalho vira aba do navegador em vez de app.
      await sharp(source).resize(512, 512).png().toFile(join(iconsDir, "icon-512.png"));
      await sharp(source).resize(192, 192).png().toFile(join(iconsDir, "icon-192.png"));
      console.log("✔  Logo otimizado e ícones PWA gerados (192/512)");
    } catch {
      // Sem sharp instalado: copia como está (funciona, mas sem resize).
      copyFileSync(source, join(publicDir, "logo.png"));
      copyFileSync(source, join(iconsDir, "icon-192.png"));
      copyFileSync(source, join(iconsDir, "icon-512.png"));
      console.log("⚠  sharp indisponível — logo e ícones copiados sem otimizar");
    }
  } else {
    console.log("ℹ  Nenhum PNG de logo encontrado — o app usará a marca padrão (emoji).");
  }
}

void copyLogo().then(() => rotateKeyPayload());

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
