// ══════════════════════════════════════════════════════════════
// Athenas — LuluBurst: partículas explodindo radialmente ao redor
// da Lulu em momentos de celebração (aula concluída, boss, etc.).
// Cores seguem o tema ativo. Respeita prefers-reduced-motion
// (vira um anel estático discreto em vez de explodir).
// ══════════════════════════════════════════════════════════════
import { useMemo, type ReactNode } from "react";
import { StarFour, Sparkle, Heart } from "@phosphor-icons/react";

/** Paleta por tema: estrela, sparkle, coração. */
const BURST_PALETTES: Record<string, { star: string; sparkle: string; heart: string }> = {
  rose: { star: "#e9b44c", sparkle: "#f28bb4", heart: "#e5484d" },
  lavande: { star: "#8a6fd8", sparkle: "#b9a5f0", heart: "#e56b9d" },
  bleuet: { star: "#5b9bd5", sparkle: "#8fc3f0", heart: "#f280a6" },
  creme: { star: "#d9a441", sparkle: "#eec79b", heart: "#e0708f" },
  nuit: { star: "#e9c46a", sparkle: "#b9a5f0", heart: "#f28bb4" }
};

const DEFAULT_BURST = BURST_PALETTES.rose;

const SHAPES = [StarFour, Sparkle, Heart];

interface BurstParticle {
  angle: number;
  dist: number;
  size: number;
  delay: number;
  dur: number;
  rot: number;
  kind: "star" | "sparkle" | "heart";
}

function makeBurst(seed: number): BurstParticle[] {
  let s = seed >>> 0;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 14 }, (_, i) => ({
    angle: (i / 14) * Math.PI * 2 + rand() * 0.5,
    dist: 46 + rand() * 46,
    size: 9 + rand() * 13,
    delay: rand() * 0.25,
    dur: 0.7 + rand() * 0.6,
    rot: (rand() - 0.5) * 360,
    kind: (["star", "sparkle", "heart"] as const)[i % 3]
  }));
}

export function LuluBurst({ theme = "rose", children }: { theme?: string; children: ReactNode }) {
  const particles = useMemo(() => makeBurst(20260815), []);
  const palette = BURST_PALETTES[theme] ?? DEFAULT_BURST;
  return (
    <div className="lulu-burst" aria-hidden="true">
      {particles.map((p, i) => {
        const Shape = SHAPES[i % SHAPES.length];
        return (
          <span
            key={i}
            className={`burst-particle burst-${p.kind}`}
            style={
              {
                color: palette[p.kind],
                "--b-size": `${p.size}px`,
                "--b-x": `${Math.cos(p.angle) * p.dist}px`,
                "--b-y": `${Math.sin(p.angle) * p.dist}px`,
                "--b-delay": `${p.delay}s`,
                "--b-dur": `${p.dur}s`,
                "--b-rot": `${p.rot}deg`
              } as React.CSSProperties
            }
          >
            <Shape weight="fill" />
          </span>
        );
      })}
      {children}
    </div>
  );
}
