// ══════════════════════════════════════════════════════════════
// Athenas — Efeitos sonoros (Web Audio API, sintetizados)
// Sem arquivos externos → funciona offline no PWA. Todos os sons
// são suaves e carinhosos (nada de "errado!" agressivo).
// Respeita a configuração settings.sound via setSfxEnabled().
// ══════════════════════════════════════════════════════════════
let enabled = true;
let ctx: AudioContext | null = null;

export function setSfxEnabled(v: boolean) {
  enabled = v;
  if (!v) {
    // silencia tudo que estiver tocando
    ctx?.suspend?.();
  } else {
    ctx?.resume?.();
  }
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  endFreq?: number;
  delay?: number;
}

function tone(freq: number, dur: number, opts: ToneOpts = {}) {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  const { type = "sine", vol = 0.1, endFreq, delay = 0 } = opts;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(30, freq), t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Primeiro uso precisa de gesto do usuário — o AudioContext é criado sob demanda. */
function ensureGesture() {
  // chamar ac() aqui já cumpre o requisito na maioria dos navegadores
  ac();
}

// ── Sons públicos ─────────────────────────────────────────────

/** Clique suave (botões, navegação). */
export function sfxClick() {
  ensureGesture();
  tone(520, 0.06, { type: "triangle", vol: 0.05 });
}

/** Acerto — arpejo doce ascendente. */
export function sfxCorrect() {
  ensureGesture();
  tone(523.25, 0.12, { vol: 0.09 }); // C5
  tone(659.25, 0.14, { vol: 0.09, delay: 0.09 }); // E5
  tone(783.99, 0.2, { vol: 0.1, delay: 0.18 }); // G5
}

/** Erro — suave e acolhedor, sem drama. */
export function sfxWrong() {
  ensureGesture();
  tone(392, 0.22, { type: "triangle", vol: 0.07 });
  tone(311.13, 0.26, { type: "triangle", vol: 0.06, delay: 0.09 });
}

/** Brilho (sparkle) — shimmer alto e rápido. */
export function sfxSparkle() {
  ensureGesture();
  tone(1046.5, 0.08, { vol: 0.05 });
  tone(1318.5, 0.08, { vol: 0.05, delay: 0.05 });
  tone(1568, 0.12, { vol: 0.05, delay: 0.1 });
}

/** Aula concluída — pequena melodia feliz. */
export function sfxComplete() {
  ensureGesture();
  tone(523.25, 0.12, { vol: 0.09 });
  tone(659.25, 0.12, { vol: 0.09, delay: 0.1 });
  tone(783.99, 0.12, { vol: 0.09, delay: 0.2 });
  tone(1046.5, 0.28, { vol: 0.1, delay: 0.3 });
}

/** Level up — fanfarra. */
export function sfxLevelUp() {
  ensureGesture();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone(f, 0.16, { vol: 0.09, delay: i * 0.09 }));
  tone(1318.5, 0.35, { vol: 0.08, delay: 0.36 });
}

/** Conquista — brilho + campainha. */
export function sfxAchievement() {
  ensureGesture();
  tone(880, 0.14, { vol: 0.07 });
  tone(1108.73, 0.18, { vol: 0.07, delay: 0.09 });
  tone(1318.5, 0.24, { vol: 0.08, delay: 0.18 });
  tone(1760, 0.3, { vol: 0.06, delay: 0.26 });
}

/** Vitória de boss — fanfarra maior. */
export function sfxVictory() {
  ensureGesture();
  const notes = [392, 523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone(f, 0.2, { vol: 0.1, delay: i * 0.11 }));
  tone(1568, 0.5, { vol: 0.09, delay: 0.55 });
}
