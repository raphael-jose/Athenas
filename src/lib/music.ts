// ══════════════════════════════════════════════════════════════
// Athenas — Música de fundo (Web Audio, gerada no navegador)
// Sem arquivos de áudio → funciona offline no PWA e não pesa nada.
//
// Design sonoro: acordes-pad longos e suaves (triângulo), baixo em
// seno e uma melodia curtinha por compasso — tudo em volume baixo e
// com filtro passa-baixa. SEM ondas quadradas e SEM notas aleatórias
// saltando, para não gerar ruído nem batimento (beating).
//
// Cada mundo tem um humor (tonalidade + andamento); o boss muda para
// uma trilha TENSA (menor, mais rápida, com uma dissonância leve).
// ══════════════════════════════════════════════════════════════
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let timer: number | null = null;
let currentId: string | null = null;
let enabled = true;
let nextBar = 0;
let barIndex = 0;
// Camadas da música: a trilha FICA MAIS RICA conforme o usuário avança
// nas aulas do mundo. 0 = só o acorde-pad · 1 = + baixo · 2 = + melodia
// · 3 = + brilho (clímax). O boss toca sempre na camada cheia.
let layers = 3;

// Progressões de acordes (tríades em semitons a partir da tônica)
// I → IV → iii → V (calmo) e i → iv → v → III (emotivo)
const CHORDS_MAJOR = [
  [0, 4, 7],
  [5, 9, 12],
  [3, 7, 10],
  [4, 7, 11]
];
const CHORDS_MINOR = [
  [0, 3, 7],
  [5, 8, 12],
  [7, 10, 14],
  [3, 7, 10]
];

interface Mood {
  root: number; // frequência da tônica (Hz)
  chords: number[][];
  bar: number; // segundos por compasso
  vol: number; // volume das notas (master fica fixo)
  tense: boolean;
}

const MOODS: Mood[] = [
  { root: 261.63, chords: CHORDS_MAJOR, bar: 4.2, vol: 0.022, tense: false }, // C — doce
  { root: 220.0, chords: CHORDS_MINOR, bar: 4.6, vol: 0.022, tense: false }, // A menor — emotiva
  { root: 246.94, chords: CHORDS_MAJOR, bar: 4.0, vol: 0.022, tense: false }, // B — alegre
  { root: 196.0, chords: CHORDS_MINOR, bar: 4.8, vol: 0.024, tense: false }, // G menor — contemplativa
  { root: 293.66, chords: CHORDS_MAJOR, bar: 3.8, vol: 0.022, tense: false }, // D — radiante
  { root: 174.61, chords: CHORDS_MINOR, bar: 5.0, vol: 0.024, tense: false } // F menor — profunda
];

const BOSS_MOOD: Mood = { root: 130.81, chords: CHORDS_MINOR, bar: 2.4, vol: 0.024, tense: true };

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
    // passa-baixa acolchoado + corta o ronco grave demais
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.4;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 55;
    master.connect(filter);
    filter.connect(highpass);
    highpass.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function freq(root: number, semitone: number): number {
  return Math.max(40, root * Math.pow(2, semitone / 12));
}

/** Pad longo e macio (triângulo). */
function pad(f: number, t: number, dur: number, vol: number) {
  if (!ctx || !filter) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = f;
  const attack = Math.min(0.8, dur * 0.25);
  const release = Math.min(1.6, dur * 0.35);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + dur - release);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(filter);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Baixo grave em seno (só fundamental — sem harmônicos que batem). */
function bass(f: number, t: number, dur: number, vol: number) {
  if (!ctx || !filter) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = Math.max(40, f);
  const attack = Math.min(0.6, dur * 0.2);
  const release = Math.min(1.4, dur * 0.3);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + dur - release);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(filter);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Nota de melodia curta (triângulo) — ataque rápido, cauda macia. */
function pluck(f: number, t: number, vol: number, dur = 1.4) {
  if (!ctx || !filter) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(filter);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Agenda UM compasso (acorde-pad + camadas conforme a evolução). */
function scheduleBar(mood: Mood) {
  if (!ctx) return;
  const now = ctx.currentTime;
  if (nextBar < now) nextBar = now + 0.05; // evita "corrida" após pausa
  const t = nextBar;
  const chord = mood.chords[barIndex % mood.chords.length];
  const barDur = mood.bar;
  const root = mood.root;

  const hasBass = layers >= 1;
  const hasMelody = layers >= 2;
  const hasSparkle = layers >= 3;

  // camada 0: o acorde-pad (3 vozes em triângulo, bem macio) — sempre presente
  chord.forEach((semi) => pad(freq(root, semi), t, barDur * 1.7, mood.vol));

  // camada 1: baixo (tônica do acorde uma oitava abaixo)
  if (hasBass) bass(freq(root, chord[0]) / 2, t, barDur * 1.6, mood.vol * 1.5);

  // camada 2: melodia curta na segunda metade do compasso
  if (hasMelody) {
    const melSemi = chord[(barIndex * 2) % chord.length];
    pluck(freq(root, melSemi) * 2, t + barDur * 0.62, mood.vol * 1.1);
  }

  // camada 3: brilho — nota aguda do acorde, bem leve (clímax)
  if (hasSparkle) {
    const highSemi = chord[1] + 12;
    pluck(freq(root, highSemi), t + barDur * 0.35, mood.vol * 0.55, 1.0);
  }

  // boss: pulsação de baixo mais presente + dissonância leve (b9) baixinha
  if (mood.tense) {
    bass(freq(root, chord[0]) / 2, t + barDur * 0.5, barDur * 0.6, mood.vol * 1.2);
    const b9 = freq(root, chord[0] + 13);
    pluck(b9, t + barDur * 0.92, mood.vol * 0.4, 0.8);
  }

  nextBar += barDur;
  barIndex += 1;
}

/** Loop com lookahead: agenda compassos com folga, sem lacunas nem duplicatas. */
function loop(mood: Mood, id: string) {
  if (timer !== null) window.clearInterval(timer);
  timer = window.setInterval(() => {
    if (currentId !== id || !ctx) return;
    if (nextBar < ctx.currentTime + 2.5) scheduleBar(mood);
  }, 500);
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
    rampVolume(0.5 * mood.vol); // já tocando — só ajusta o volume
    return;
  }
  stopMusic();
  currentId = id;
  nextBar = 0;
  barIndex = 0;
  rampVolume(0.5 * mood.vol);
  loop(mood, id);
}

/**
 * Toca o humor do mundo (por ordem). `progress` (0..1) controla a
 * evolução: 0-24% só o pad, 25-49% + baixo, 50-74% + melodia,
 * 75%+ o arranjo completo com brilho.
 */
export function playWorldMusic(order: number, progress = 0) {
  if (!enabled) return;
  const p = Math.max(0, Math.min(1, progress));
  layers = p >= 0.75 ? 3 : p >= 0.5 ? 2 : p >= 0.25 ? 1 : 0;
  start(worldMood(order), `world-${order}`);
}

/** Trilha tensa do boss — sempre no arranjo completo (clímax). */
export function playBossMusic() {
  if (!enabled) return;
  layers = 3;
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
