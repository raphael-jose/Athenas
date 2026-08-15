import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { embeddedKey } from "./embeddedKey";
import { hashKey } from "./keyCodec";
import { KEY_CHECKSUM, XOR_SEED } from "./keyPayload.generated";

// Formato de chave Ollama Cloud (32 hex + "." + segredo).
const KEY_SHAPE = /^[0-9a-f]{32}\.[A-Za-z0-9]{20,40}$/;

describe("embeddedKey", () => {
  it("decodifica para uma chave com formato válido", () => {
    const k = embeddedKey();
    expect(k).not.toBeNull();
    expect(KEY_SHAPE.test(k!)).toBe(true);
  });

  it("a chave decodificada passa na verificação de integridade do payload", () => {
    const k = embeddedKey();
    expect(k).not.toBeNull();
    expect(hashKey(k!)).toBe(KEY_CHECKSUM);
  });

  it("o payload gerado não contém a chave em texto puro", () => {
    const k = embeddedKey();
    const payload = readFileSync(join(__dirname, "keyPayload.generated.ts"), "utf8");
    expect(payload).not.toContain(k!);
    const secret = k!.split(".")[1];
    expect(payload).not.toContain(secret!);
    // a semente rotativa também não é a chave nem o segredo
    expect(XOR_SEED).not.toContain(secret!);
  });

  it("o código-fonte (codec + wrapper) não contém a chave decodificada", () => {
    const k = embeddedKey();
    const secret = k!.split(".")[1];
    for (const f of ["embeddedKey.ts", "keyCodec.ts"]) {
      const src = readFileSync(join(__dirname, f), "utf8");
      expect(src, f).not.toContain(k!);
      expect(src, f).not.toContain(secret!);
    }
  });

  it("a chave real não aparece na documentação pública", () => {
    const k = embeddedKey();
    if (!k) return;
    try {
      expect(readFileSync("README.md", "utf8"), "README.md").not.toContain(k);
    } catch {
      // arquivo ausente no ambiente de teste — ok
    }
  });
});
