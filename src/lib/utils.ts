// ══════════════════════════════════════════════════════════════
// Athenas — Utilidades puras
// ══════════════════════════════════════════════════════════════

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const uid = () => Math.random().toString(36).slice(2, 10);

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sample = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const pick = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

export const avg = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

export const round = (n: number, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

// Normaliza texto para comparação fofa (acentos, caixa, pontuação)
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`´]/g, "'")
    .replace(/[^a-z0-9'\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function fuzzyMatch(input: string, expected: string, accept: string[] = []): boolean {
  const a = normalize(input);
  if (!a) return false;
  const all = [expected, ...accept];
  return all.some((e) => normalize(e) === a || normalize(e).split(/\s+/).join("") === a.split(/\s+/).join(""));
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "agorinha";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m} min`;
  return `${Math.max(1, Math.round(seconds))} s`;
}

export function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

/** Distribui [a,b] mantendo a ordem, para os pares do Word Match. */
export function zipPairs<T>(left: T[], right: T[]): [T, T][] {
  return left.map((l, i) => [l, right[i]] as [T, T]);
}

/** Gera um item diário determinístico a partir de uma data (para as missões). */
export function seededIndex(dateKey: string, salt: string, max: number): number {
  let h = 0;
  const s = dateKey + "::" + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % max;
}
