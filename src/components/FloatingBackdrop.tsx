// ══════════════════════════════════════════════════════════════
// Athenas — Fundo animado sutil: partículas flutuantes (estrelinhas,
// corações, sparkles) atrás do conteúdo. Cada tema tem sua própria
// paleta de partículas com uma cor assinatura. Respeita
// prefers-reduced-motion.
// ══════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { StarFour, Sparkle, Heart, Circle } from "@phosphor-icons/react";

/** Paleta de partículas por tema: assinatura + tons de apoio. */
const THEME_PALETTES: Record<string, { star: string; sparkle: string; heart: string; dot: string }> = {
  rose: { star: "#e9b44c", sparkle: "#f28bb4", heart: "#e5484d", dot: "#b9a5f0" },
  lavande: { star: "#8a6fd8", sparkle: "#b9a5f0", heart: "#e56b9d", dot: "#7d6ab0" },
  bleuet: { star: "#5b9bd5", sparkle: "#8fc3f0", heart: "#f280a6", dot: "#7fb5e8" },
  creme: { star: "#d9a441", sparkle: "#eec79b", heart: "#e0708f", dot: "#c98d4b" },
  nuit: { star: "#e9c46a", sparkle: "#b9a5f0", heart: "#f28bb4", dot: "#8fc3f0" },
  spidey: { star: "#e7483f", sparkle: "#3d7ae0", heart: "#e7483f", dot: "#3d7ae0" },
  ironman: { star: "#e8a13a", sparkle: "#d6483b", heart: "#f5c96b", dot: "#e8a13a" },
  captain: { star: "#3d6fd8", sparkle: "#d8483f", heart: "#ffffff", dot: "#3d6fd8" }
};

const DEFAULT_PALETTE = THEME_PALETTES.rose;

interface ParticleCfg {
  left: number; // % da largura
  top: number; // % da altura
  size: number; // px
  delay: number; // s
  dur: number; // s
  drift: number; // px horizontais
  rise: number; // px verticais
  opacity: number;
  kind: "star" | "sparkle" | "heart" | "dot";
}

const SHAPES = [StarFour, Sparkle, Heart, Circle];

function makeParticles(count: number, seed: number): ParticleCfg[] {
  // PRNG determinístico (mulberry32) para não mudar a cada render
  let s = seed >>> 0;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: ParticleCfg[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      left: rand() * 100,
      top: rand() * 100,
      size: 7 + rand() * 11,
      delay: rand() * 14,
      dur: 9 + rand() * 10,
      drift: (rand() - 0.5) * 36,
      rise: 14 + rand() * 26,
      opacity: 0.12 + rand() * 0.22,
      kind: (["star", "sparkle", "heart", "dot"] as const)[i % 4]
    });
  }
  return out;
}

export function FloatingBackdrop({ theme = "rose" }: { theme?: string }) {
  const particles = useMemo(() => makeParticles(18, 20260814), []);
  const palette = THEME_PALETTES[theme] ?? DEFAULT_PALETTE;
  return (
    <div className="backdrop" aria-hidden="true">
      {particles.map((p, i) => {
        const Shape = SHAPES[i % SHAPES.length];
        return (
          <span
            key={i}
            className={`particle particle-${p.kind}`}
            style={
              {
                left: `${p.left}%`,
                top: `${p.top}%`,
                color: palette[p.kind],
                "--p-size": `${p.size}px`,
                "--p-delay": `${p.delay}s`,
                "--p-dur": `${p.dur}s`,
                "--p-drift": `${p.drift}px`,
                "--p-rise": `${p.rise}px`,
                "--p-opacity": p.opacity
              } as React.CSSProperties
            }
          >
            <Shape weight="fill" />
          </span>
        );
      })}
    </div>
  );
}
