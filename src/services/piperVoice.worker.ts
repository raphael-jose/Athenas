// ══════════════════════════════════════════════════════════════
// Athenas — Worker da voz pt-BR (Piper "Dii", HuggingFace)
//
// A Lulu fala português com a voz FEMININA "Dii" (Piper VITS,
// OpenVoiceOS/pipertts_pt-BR_dii) rodando no navegador — sem chave,
// sem servidor. O runtime (espeak-ng + onnxruntime-web) e o modelo
// (≈64 MB) são baixados SOB DEMANDA, só na primeira vez que o app fala
// português; depois ficam no cache do navegador.
//
// Tudo roda AQUI, em um Web Worker: baixar o modelo e sintetizar nunca
// congelam a interface. O main-thread posta {texto} e recebe o WAV.
// ══════════════════════════════════════════════════════════════
import { ExpressionWebRuntime, OnnxWebRuntime, PhonemizeWebRuntime, PiperWebEngine } from "piper-tts-web";

// Repositório da voz Dii no HuggingFace (arquivos na raiz) — usado só
// como FALLBACK: o download normal vem do PRÓPRIO SITE (models/dii),
// mais rápido e confiável no celular.
const DII_HF = "https://huggingface.co/OpenVoiceOS/pipertts_pt-BR_dii/resolve/main/";

/** Provider da voz Dii: busca os arquivos no PRÓPRIO SITE primeiro
 * (mesma origem = download confiável até no celular) e cai no CDN do
 * HuggingFace se faltarem. CACHEIA o modelo (63 MB): se baixasse de
 * novo a cada fala, criaria uma nova sessão ONNX e travaria a máquina
 * — com cache, o modelo é baixado uma vez e as falas seguintes são só
 * inferência. */
class DiiVoiceProvider {
  private cached: [Record<string, unknown>, string] | null = null;
  async list(): Promise<string[]> {
    return ["dii_pt-BR"];
  }
  private async fetchFrom(base: string): Promise<[Record<string, unknown>, string]> {
    const [cfg, model] = await Promise.all([
      fetch(base + "dii_pt-BR.onnx.json").then((r) => {
        if (!r.ok) throw new Error("config_missing");
        return r.json();
      }),
      fetch(base + "dii_pt-BR.onnx").then(async (r) => {
        if (!r.ok) throw new Error("model_missing");
        return URL.createObjectURL(await r.blob());
      })
    ]);
    return [cfg, model];
  }
  async fetch(_name: string): Promise<[Record<string, unknown>, string]> {
    if (this.cached) return this.cached;
    try {
      this.cached = await this.fetchFrom(siteBase + "models/dii/");
    } catch {
      // arquivos não publicados no site (ou rede bloqueada) → CDN
      this.cached = await this.fetchFrom(DII_HF);
    }
    return this.cached;
  }
  destroy(): void {
    // sem estado próprio
  }
}

let engine: PiperWebEngine | null = null;
let siteBase = "/";

function getEngine(): PiperWebEngine {
  if (!engine) {
    engine = new PiperWebEngine({
      onnxRuntime: new OnnxWebRuntime({ basePath: siteBase + "onnx/" }),
      phonemizeRuntime: new PhonemizeWebRuntime({ basePath: siteBase + "piper/" }),
      expressionRuntime: new ExpressionWebRuntime(),
      voiceProvider: new DiiVoiceProvider()
    });
  }
  return engine;
}

const post = (msg: unknown, transfer?: Transferable[]) => {
  (self as unknown as { postMessage: (m: unknown, t?: Transferable[]) => void }).postMessage(msg, transfer);
};

(self as unknown as Worker).onmessage = async (e: MessageEvent<{ type: string; id: number; text: string; baseUrl: string }>) => {
  const { type, id, text, baseUrl } = e.data;
  if (type === "init") {
    siteBase = baseUrl;
    return;
  }
  if (type !== "synth") return;
  try {
    const out = await getEngine().generate(text, "dii_pt-BR", 0);
    post({ type: "result", id, blob: out.file, durationMs: out.duration });
  } catch (err) {
    post({ type: "error", id, error: err instanceof Error ? err.message : String(err) });
  }
};
