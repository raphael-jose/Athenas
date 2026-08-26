// ══════════════════════════════════════════════════════════════
// Athenas — Worker da voz (Piper VITS, femimina)
//
// A Lulu fala com vozes FEMININAS do Piper:
//   português → "Dii" (OpenVoiceOS/pipertts_pt-BR_dii)
//   francês   → "siwis" (rhasspy/piper-voices, fr_FR/siwis)
//
// O runtime (espeak-ng + onnxruntime-web) e os modelos são baixados
// SOB DEMANDA e ficam no cache do navegador.
//
// Tudo roda AQUI, em um Web Worker: baixar o modelo e sintetizar nunca
// congelam a interface. O main-thread posta {texto, voz} e recebe o WAV.
// ══════════════════════════════════════════════════════════════
import { ExpressionWebRuntime, OnnxWebRuntime, PhonemizeWebRuntime, PiperWebEngine } from "piper-tts-web";

// ── Configuração das vozes femininas ─────────────────────────
interface VoiceConfig {
  /** Nome do modelo (ex.: "dii_pt-BR", "siwis") */
  modelId: string;
  /** Caminho relativo em public/models/ */
  localPath: string;
  /** Nome do arquivo .onnx (sem extensão) */
  onnxFile: string;
  /** Fallback remoto (HuggingFace) */
  hfBase?: string;
}

const VOICES: Record<string, VoiceConfig> = {
  dii: {
    modelId: "dii_pt-BR",
    localPath: "models/dii/",
    onnxFile: "dii_pt-BR",
    hfBase: "https://huggingface.co/OpenVoiceOS/pipertts_pt-BR_dii/resolve/main/"
  },
  siwis: {
    modelId: "siwis",
    localPath: "models/fr_FR/siwis/",
    onnxFile: "fr_FR-siwis-medium",
    hfBase: "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/"
  }
};

/** Provider multi-voz: busca os arquivos no PRÓPRIO SITE primeiro
 * (mesma origem = download confiável até no celular) e cai no CDN do
 * HuggingFace se faltarem. CACHEIA cada modelo: se baixasse de
 * novo a cada fala, criaria uma nova sessão ONNX e travaria a máquina.
 */
class MultiVoiceProvider {
  private cache = new Map<string, [Record<string, unknown>, string]>();
  async list(): Promise<string[]> {
    return Object.values(VOICES).map((v) => v.modelId);
  }
  private async fetchFrom(base: string, cfg: VoiceConfig): Promise<[Record<string, unknown>, string]> {
    const [config, model] = await Promise.all([
      fetch(base + cfg.onnxFile + ".onnx.json").then((r) => {
        if (!r.ok) throw new Error("config_missing");
        return r.json();
      }),
      fetch(base + cfg.onnxFile + ".onnx").then(async (r) => {
        if (!r.ok) throw new Error("model_missing");
        return URL.createObjectURL(await r.blob());
      })
    ]);
    return [config, model];
  }
  async fetch(name: string): Promise<[Record<string, unknown>, string]> {
    const cached = this.cache.get(name);
    if (cached) return cached;
    // Encontra a config da voz pelo modelId
    const cfg = Object.values(VOICES).find((v) => v.modelId === name);
    if (!cfg) throw new Error(`voice_not_found: ${name}`);
    let result: [Record<string, unknown>, string];
    try {
      result = await this.fetchFrom(siteBase + cfg.localPath, cfg);
    } catch {
      if (!cfg.hfBase) throw new Error(`voice_fetch_failed: ${name}`);
      result = await this.fetchFrom(cfg.hfBase, cfg);
    }
    this.cache.set(name, result);
    return result;
  }
  destroy(): void {
    this.cache.clear();
  }
}

// Um engine separado POR VOZ — o PiperWebEngine pode caches o modelo
// ONNX carregado e ignorar trocas de voz no mesmo engine.
const engines = new Map<string, PiperWebEngine>();
let siteBase = "/";
const voiceProvider = new MultiVoiceProvider();

function getEngine(voiceKey: string): PiperWebEngine {
  let eng = engines.get(voiceKey);
  if (!eng) {
    eng = new PiperWebEngine({
      onnxRuntime: new OnnxWebRuntime({ basePath: siteBase + "onnx/" }),
      phonemizeRuntime: new PhonemizeWebRuntime({ basePath: siteBase + "piper/" }),
      expressionRuntime: new ExpressionWebRuntime(),
      voiceProvider
    });
    engines.set(voiceKey, eng);
  }
  return eng;
}

const post = (msg: unknown, transfer?: Transferable[]) => {
  (self as unknown as { postMessage: (m: unknown, t?: Transferable[]) => void }).postMessage(msg, transfer);
};

(self as unknown as Worker).onmessage = async (e: MessageEvent<{ type: string; id: number; text: string; baseUrl: string; voice?: string }>) => {
  const { type, id, text, baseUrl, voice } = e.data;
  if (type === "init") {
    siteBase = baseUrl;
    return;
  }
  if (type !== "synth") return;
  try {
    // "dii" → "dii_pt-BR" (português), "siwis" → "siwis" (francês)
    const voiceName = voice === "siwis" ? "siwis" : "dii_pt-BR";
    // Cada voz tem seu engine separado para não misturar modelos.
    const out = await getEngine(voiceName).generate(text, voiceName, 0);
    post({ type: "result", id, blob: out.file, durationMs: out.duration });
  } catch (err) {
    post({ type: "error", id, error: err instanceof Error ? err.message : String(err) });
  }
};
