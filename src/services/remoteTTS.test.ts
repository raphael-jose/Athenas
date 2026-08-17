// ══════════════════════════════════════════════════════════════
// Athenas — Testes do TTS remoto instantâneo (voz feminina, sem chave)
// ══════════════════════════════════════════════════════════════
import { afterEach, describe, expect, it, vi } from "vitest";
import { synthesizeRemote } from "./remoteTTS";

afterEach(() => vi.unstubAllGlobals());

function stubOkFetch() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    blob: async () => new Blob([new ArrayBuffer(1200)], { type: "audio/mpeg" })
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("synthesizeRemote — voz remota instantânea", () => {
  it("francês usa voz feminina French Female (fr-FR)", async () => {
    const fetchMock = stubOkFetch();
    const blob = await synthesizeRemote("Bonjour", "fr-FR");
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("lang=fr-FR");
    expect(url).toContain("French%20Female");
    expect(url).toContain("engine=g1");
    expect(blob).toBeInstanceOf(Blob);
  });

  it("português usa voz feminina Portuguese Brazilian Female (pt-BR)", async () => {
    const fetchMock = stubOkFetch();
    await synthesizeRemote("Olá", "pt-BR");
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("lang=pt-BR");
    expect(url).toContain("Portuguese%20Brazilian%20Female");
  });

  it("rejeita idioma sem voz remota (fallback para aparelho)", async () => {
    await expect(synthesizeRemote("Hello", "en-US")).rejects.toThrow("no_remote_voice");
  });

  it("rejeita resposta de erro do servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    await expect(synthesizeRemote("Bonjour", "fr-FR")).rejects.toThrow("remote_tts_429");
  });

  it("rejeita resposta não-áudio (HTML de erro disfarçado)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(["<html>erro</html>"], { type: "text/html" })
      })
    );
    await expect(synthesizeRemote("Bonjour", "fr-FR")).rejects.toThrow("remote_tts_empty");
  });
});
