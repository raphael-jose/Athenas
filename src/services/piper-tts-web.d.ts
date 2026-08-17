// Declaração mínima do pacote piper-tts-web (não publica tipos).
// Usado apenas para a voz pt-BR (Dii) — ver piperVoice.worker.ts.
declare module "piper-tts-web" {
  export interface PiperOutput {
    phonemeData: unknown;
    /** WAV pronto para tocar. */
    file: Blob;
    duration: number;
  }

  export interface VoiceProvider {
    list(): Promise<string[]>;
    fetch(name: string): Promise<[Record<string, unknown>, string]>;
    destroy(): void;
  }

  export class FetchProvider implements VoiceProvider {
    fetch(url: string): Promise<unknown>;
    destroy(): void;
  }

  export class OnnxWebRuntime {
    constructor(opts?: { ort?: unknown; basePath?: string; numThreads?: number });
    destroy(): void;
  }

  export class PhonemizeWebRuntime {
    constructor(opts?: { provider?: FetchProvider; basePath?: string });
    destroy(): void;
  }

  export class ExpressionWebRuntime {
    constructor(opts?: { task?: string; model?: string });
    destroy(): void;
  }

  export class PiperWebEngine {
    constructor(opts?: {
      onnxRuntime?: OnnxWebRuntime;
      phonemizeRuntime?: PhonemizeWebRuntime;
      expressionRuntime?: ExpressionWebRuntime;
      voiceProvider?: VoiceProvider;
    });
    generate(text: string, voice: string, speaker?: number): Promise<PiperOutput>;
    destroy(): void;
  }
}
