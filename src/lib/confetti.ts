// ══════════════════════════════════════════════════════════════
// Athenas — Confete em canvas dedicado (não rouba o clique)
// ══════════════════════════════════════════════════════════════
import confetti from "canvas-confetti";

let canvas: HTMLCanvasElement | null = null;

function ensureCanvas(): HTMLCanvasElement {
  if (!canvas || !document.body.contains(canvas)) {
    canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    document.body.appendChild(canvas);
  }
  return canvas;
}

export function fireConfetti(big = false) {
  const c = ensureCanvas();
  const myConfetti = confetti.create(c, { resize: true, useWorker: true });
  const colors = ["#f28bb4", "#b9a5f0", "#f5c96b", "#8fd3c0", "#8fc3f0", "#ffffff"];
  if (big) {
    myConfetti({ particleCount: 160, spread: 110, origin: { y: 0.6 }, colors, zIndex: 300 });
    setTimeout(() => myConfetti({ particleCount: 90, spread: 70, origin: { y: 0.4 }, colors, zIndex: 300 }), 250);
  } else {
    myConfetti({ particleCount: 70, spread: 70, origin: { y: 0.65 }, colors, zIndex: 300 });
  }
}

export function fireSparkle() {
  const c = ensureCanvas();
  const myConfetti = confetti.create(c, { resize: true, useWorker: true });
  myConfetti({
    particleCount: 24,
    spread: 45,
    startVelocity: 22,
    gravity: 0.6,
    scalar: 0.8,
    ticks: 90,
    origin: { y: 0.7 },
    colors: ["#f5c96b", "#ffffff", "#f28bb4"],
    zIndex: 300
  });
}
