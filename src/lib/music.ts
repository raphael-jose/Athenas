// ══════════════════════════════════════════════════════════════
// Athenas — Música de fundo (Web Audio, gerada no navegador)
// Sem arquivos de áudio → funciona offline no PWA e não pesa nada.
// Cada mundo tem um humor (escala + tempo), e o boss muda para uma
// trilha TENSA (grave, rápida, dissonante de leve).
// ══════════════════════════════════════════════════════════════
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let timer: number | null = null;
let nextStart = 0;
let currentId: string | null = null;
let enabled = true;

const MAJOR = [0, 2, 4, 7, 9]; // pentatônica maior (suave)
const MINOR = [0, 3, 5, 7, 10]; // pentatônica menor (emotiva)

interface Mood {
  root: number; // frequência base (Hz)
  scale: number[]; // intervalos em semitons
  tempo: number; // segundos por passo
  vol: number;
  tense: boolean; // boss: dissonância + graves
}

const MOODS: Mood[] = [
  { root: 261.63, scale: MAJOR, tempo: 0.9, vol: 0.05, tense: false }, // C — doce
  { root: 220.0, scale: MINOR, tempo: 0.85, vol: 0.05, tense: false }, // A menor — emotiva
  { root: 246.94, scale: MAJOR, tempo: 0.82, vol: 0.05, tense: false }, // B — alegre
  { root: 196.0, scale: MINOR, tempo: 0.75, vol: 0.055, tense: false }, // G menor — contemplativa
  { root: 293.66, scale: MAJOR, tempo: 0.8, vol: 0.05, tense: false }, // D — radiante
  { root: 174.61, scale: MINOR, tempo: 0.7, vol: 0.055, tense: false } // F menor — profunda
];

const BOSS_MOOD: Mood = { root: 130.81, scale: MINOR, tempo: 0.42, vol: 0.06, tense: true };

/** Humor de um mundo (por ordem: 1..n). */
export function worldMood(order: number): Mood {
  return MOODS[(Math.max(1, order) - 1) % MOODS.length];
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.6;
    master.connect(filter);
    filter.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function note(freq: number, t: number, dur: number, vol: number, type: OscillatorType) {
  if (!ctx || !filter) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = Math.max(40, freq);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(filter);
  o.start(t);
  o.stop(t + dur + 0.15);
}

function scheduleAhead(mood: Mood, horizon = 9) {
  if (!ctx) return;
  const now = ctx.currentTime;
  if (nextStart < now) nextStart = now + 0.1;
  const end = nextStart + horizon;
  let guard = 0;
  while (nextStart < end && guard < 120) {
    const t = nextStart;
    const step = Math.round(t * 10) % 1000; // pseudo-passo estável
    const deg = step % mood.scale.length;
    const freq = mood.root * Math.pow(2, mood.scale[deg] / 12);

    // melodia suave (triângulo) — no boss, mais aguda e saltitante
    note(freq, t, mood.tempo * (mood.tense ? 1.1 : 1.7), mood.vol, mood.tense ? "square" : "triangle");

    // apoio (terça acima) — de leve
    const third = mood.root * Math.pow(2, mood.scale[(deg + 2) % mood.scale.length] / 12);
    note(third, t, mood.tempo * 1.4, mood.vol * 0.55, "sine");

    // baixo grave a cada 4 passos (a cada 2 no boss — pulsação tensa)
    if (step % (mood.tense ? 2 : 4) === 0) {
      note(mood.root / 2, t, mood.tempo * 3, mood.vol * 0.8, "sine");
    }
    // toque de tensão no boss: semitom fora da escala, bem de leve
    if (mood.tense && step % 8 === 5) {
      note(freq * Math.pow(2, 1 / 12), t, mood.tempo * 0.8, mood.vol * 0.35, "sine");
    }
    nextStart += mood.tempo;
    guard++;
  }
}

function rampVolume(target: number, seconds = 1.2) {
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(target, ctx.currentTime + seconds);
}

function start(mood: Mood, id: string) {
  const c = ac();
  if (!c || !master) return;
  if (currentId === id && timer !== null) {
    rampVolume(mood.vol * 0.9); // já está tocando — só dá o volume
    return;
  }
  stopMusic();
  currentId = id;
  nextStart = 0;
  rampVolume(mood.vol * 0.9);
  scheduleAhead(mood);
  timer = window.setInterval(() => {
    if (currentId !== id) return;
    scheduleAhead(mood);
  }, 2500);
}

/** Toca o humor do mundo (por ordem). */
export function playWorldMusic(order: number) {
  if (!enabled) return;
  start(worldMood(order), `world-${order}`);
}

/** Trilha tensa do boss. */
export function playBossMusic() {
  if (!enabled) return;
  start(BOSS_MOOD, "boss");
}

/** Para a música (fade rápido). */
export function stopMusic() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  currentId = null;
  rampVolume(0, 0.4);
}

/** Liga/desliga a música (respeita a configuração do Perfil). */
export function setMusicEnabled(v: boolean) {
  enabled = v;
  if (!v) stopMusic();
}
