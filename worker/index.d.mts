// Declaração de tipos para worker/index.mjs (usada pelos testes vitest).
// A implementação vive no .mjs — aqui só a superfície de tipos.

export interface WorkerEnv {
  OLLAMA_API_KEY?: string;
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW?: string;
}

// O Worker só chama o upstream com strings de URL — o tipo reflete isso.
export type FetchImpl = (input: string, init?: RequestInit) => Promise<Response>;

export function corsHeaders(origin: string, allowed: boolean): Record<string, string>;
export function handleRequest(
  request: Request,
  env: WorkerEnv,
  fetchImpl?: FetchImpl,
  rateStore?: Map<string, { count: number; resetAt: number }>
): Promise<Response>;
