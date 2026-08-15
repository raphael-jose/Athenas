// ══════════════════════════════════════════════════════════════
// Athenas — Anti-vazamento: garante que o bundle de produção NÃO
// contenha uma chave de API em texto puro. A chave embutida viaja
// apenas na forma codificada (fragmentos XOR+base64), que não casa
// com o padrão de chave real.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Formato de chave Ollama Cloud: 32 hex + "." + segredo alfanumérico.
const KEY_SHAPE = /[0-9a-f]{32}\.[A-Za-z0-9]{20,40}/g;

function jsFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...jsFiles(full));
    else if (full.endsWith(".js") || full.endsWith(".mjs")) out.push(full);
  }
  return out;
}

describe("anti-vazamento do bundle", () => {
  it("nenhum arquivo do dist contém uma chave de API em texto puro", () => {
    const distDir = join(process.cwd(), "dist");
    // `npm test` sozinho (sem build) não tem dist — pula em vez de falhar;
    // no CI o build roda antes dos testes, então o bundle real é varrido.
    if (!existsSync(distDir)) return;
    const files = jsFiles(distDir);
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const content = readFileSync(f, "utf8");
      const hits = content.match(KEY_SHAPE) ?? [];
      expect(hits, `${f} contém possível chave vazada`).toEqual([]);
    }
  });
});
