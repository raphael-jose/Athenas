// Declaração de tipos para scripts/encode-key.mjs (usada pelos testes).
// O script roda em Node puro (build-time); a implementação vive no .mjs.

export interface KeyPayload {
  fragments: string[];
  seed: string;
  checksum: string;
  buildId: string;
}

export function hashKey(key: string): string;
export function randomSeed(): string;
export function encodeKeyForBuild(key: string, seed: string): Omit<KeyPayload, "buildId">;
export function generatePayload(key: string, buildId: string): KeyPayload;
export function writePayload(payload: KeyPayload): void;
export function findRawKey(): string | null;
