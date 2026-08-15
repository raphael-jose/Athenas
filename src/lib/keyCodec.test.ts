// ══════════════════════════════════════════════════════════════
// Athenas — Testes do codec da chave embutida
//
// Usam uma chave FAKE (formato válido) — a chave real nunca entra
// em arquivos de teste. O roundtrip cruza o gerador do build
// (scripts/encode-key.mjs) com o decoder do runtime (keyCodec.ts):
// se os dois divergirem, o teste falha.
// ══════════════════════════════════════════════════════════════
import { describe, expect, it } from "vitest";
import { decodeKey, hashKey } from "./keyCodec";
import { encodeKeyForBuild, hashKey as scriptHashKey, randomSeed } from "../../scripts/encode-key.mjs";

// Chave fake com o mesmo formato de uma chave Ollama Cloud real.
const FAKE_KEY = "0123456789abcdef0123456789abcdef.fakeSecret1234567890";

describe("keyCodec — roundtrip", () => {
  it("decodifica o que o gerador do build codifica (mesma chave)", () => {
    const payload = encodeKeyForBuild(FAKE_KEY, randomSeed());
    expect(decodeKey(payload.fragments, payload.seed, payload.checksum)).toBe(FAKE_KEY);
  });

  it("o payload gerado valida o formato de chave", () => {
    const payload = encodeKeyForBuild(FAKE_KEY, randomSeed());
    expect(decodeKey(payload.fragments, payload.seed, payload.checksum)).toMatch(/^[0-9a-f]{32}\.[A-Za-z0-9]{20,40}$/);
  });

  it("hashKey do script e do codec produzem o mesmo checksum (sem deriva)", () => {
    expect(scriptHashKey(FAKE_KEY)).toBe(hashKey(FAKE_KEY));
    expect(hashKey("outra-chave-qualquer")).not.toBe(hashKey(FAKE_KEY));
  });
});

describe("keyCodec — rotação por build", () => {
  it("duas execuções com sementes diferentes geram payloads diferentes para a MESMA chave", () => {
    const a = encodeKeyForBuild(FAKE_KEY, randomSeed());
    const b = encodeKeyForBuild(FAKE_KEY, randomSeed());
    expect(a.seed).not.toBe(b.seed);
    expect(a.fragments).not.toEqual(b.fragments);
    // mas ambas decodificam para a mesma chave
    expect(decodeKey(a.fragments, a.seed, a.checksum)).toBe(FAKE_KEY);
    expect(decodeKey(b.fragments, b.seed, b.checksum)).toBe(FAKE_KEY);
  });

  it("sementes aleatórias são longas e diferentes entre si", () => {
    const seeds = new Set(Array.from({ length: 20 }, () => randomSeed()));
    expect(seeds.size).toBe(20);
    for (const s of seeds) expect(s.length).toBeGreaterThanOrEqual(20);
  });
});

describe("keyCodec — verificação de integridade", () => {
  it("fragmento adulterado → null (mesmo com formato ainda válido)", () => {
    const payload = encodeKeyForBuild(FAKE_KEY, randomSeed());
    const tampered = payload.fragments.map((f, i) => (i === 1 ? (f[0] === "A" ? "B" + f.slice(1) : "A" + f.slice(1)) : f));
    expect(decodeKey(tampered, payload.seed, payload.checksum)).toBeNull();
  });

  it("semente errada → null", () => {
    const payload = encodeKeyForBuild(FAKE_KEY, randomSeed());
    expect(decodeKey(payload.fragments, randomSeed(), payload.checksum)).toBeNull();
  });

  it("checksum errado → null (integridade falha)", () => {
    const payload = encodeKeyForBuild(FAKE_KEY, randomSeed());
    const wrong = hashKey("outra-chave-qualquer");
    expect(decodeKey(payload.fragments, payload.seed, wrong)).toBeNull();
  });

  it("fragmentos vazios/lixo → null sem lançar", () => {
    expect(decodeKey([], "abc", "deadbeef")).toBeNull();
    expect(decodeKey(["!!!não-base64!!!"], "abc", "deadbeef")).toBeNull();
  });
});
