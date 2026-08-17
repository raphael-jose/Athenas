// ══════════════════════════════════════════════════════════════
// Athenas — Moldura do avatar (loja: FRAMES)
// Anel SVG com detalhe próprio por moldura: simples, ouro, galáxia,
// flores, arco-íris e corações. Usada no Perfil e na prévia da loja.
// ══════════════════════════════════════════════════════════════
import type { ReactNode } from "react";

const GRADS: Record<string, string[]> = {
  ouro: ["#ffe28a", "#e9b44c", "#fff3c0", "#e9b44c"],
  galaxia: ["#9a7bd8", "#4a3a75", "#8b6fd0", "#5a4a8f"],
  flor: ["#ff8fa3", "#e56b9d", "#ffb3c8", "#e56b9d"],
  arcoiris: ["#f5484d", "#f5a623", "#f5c96b", "#6fbf73", "#4a90d9", "#8b5fc9"],
  coracao: ["#ff8fa3", "#e5484d", "#ff8fa3", "#e5484d"],
  spidey: ["#e23a2e", "#3d7ae0", "#e23a2e", "#8b2f28"],
  ironman: ["#e8a13a", "#d6483b", "#f5c96b", "#a9352b"],
  captain: ["#3d6fd8", "#d8483f", "#ffffff", "#2a50ad"],
  nuit: ["#c79be8", "#3b2d4d", "#b99ae0", "#241b2e"]
};

// Pontos sobre o anel (r=46) para os detalhes.
const RING_POINTS: Array<[number, number]> = [
  [89.8, 73], // 30°
  [50, 96], // 90°
  [10.2, 73], // 150°
  [10.2, 27], // 210°
  [50, 4], // 270°
  [89.8, 27] // 330°
];

const ACCENTS: Record<string, ReactNode> = {
  simples: null,
  ouro: (
    <g stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" opacity={0.95}>
      {[RING_POINTS[0], RING_POINTS[2], RING_POINTS[3], RING_POINTS[5]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <line x1={-3.2} y1={0} x2={3.2} y2={0} />
          <line x1={0} y1={-3.2} x2={0} y2={3.2} />
        </g>
      ))}
    </g>
  ),
  galaxia: (
    <g>
      <g fill="#ffffff" opacity={0.95}>
        {[RING_POINTS[0], RING_POINTS[1], RING_POINTS[3], RING_POINTS[5]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.3} />
        ))}
      </g>
      <g fill="#ffe28a" opacity={0.95}>
        {[RING_POINTS[2], RING_POINTS[4]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.3} />
        ))}
      </g>
    </g>
  ),
  flor: (
    <g>
      {RING_POINTS.map(([x, y], i) => (
        <g key={i} fill="#ffffff" opacity={0.95}>
          <circle cx={x} cy={y - 2.4} r={1.9} />
          <circle cx={x - 2.1} cy={y + 1.6} r={1.9} />
          <circle cx={x + 2.1} cy={y + 1.6} r={1.9} />
          <circle cx={x} cy={y} r={1.4} fill="#ffd166" opacity={1} />
        </g>
      ))}
    </g>
  ),
  arcoiris: (
    <g fill="#ffffff" opacity={0.9}>
      {RING_POINTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.9} />
      ))}
    </g>
  ),
  coracao: (
    <g fill="#ffffff" opacity={0.95}>
      {RING_POINTS.map(([x, y], i) => (
        <path
          key={i}
          transform={`translate(${x} ${y}) scale(0.55)`}
          d="M0 3 c-1.9 -2.7 -5.2 -1.3 -4.6 2.3 c0.5 2.3 4.6 3.6 4.6 3.6 c0 0 4.1 -1.3 4.6 -3.6 c0.6 -3.6 -2.7 -5 -4.6 -2.3 z"
        />
      ))}
    </g>
  ),
  spidey: (
    <g>
      {/* teia entre os pontos do anel */}
      <g stroke="#ffffff" strokeWidth={1.5} fill="none" opacity={0.85} strokeLinecap="round">
        {RING_POINTS.map(([x, y], i) => {
          const [nx, ny] = RING_POINTS[(i + 1) % RING_POINTS.length];
          const mx = (x + nx) / 2;
          const my = (y + ny) / 2;
          return <path key={i} d={`M${x} ${y} Q${50 + (mx - 50) * 0.82} ${50 + (my - 50) * 0.82} ${nx} ${ny}`} />;
        })}
      </g>
      {/* aranhinha no topo */}
      <g transform="translate(50 4)">
        <circle r={3.2} fill="#ffffff" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a} x1={0} y1={0} x2={0} y2={-4.6} stroke="#ffffff" strokeWidth={1.4} transform={`rotate(${a})`} />
        ))}
      </g>
    </g>
  ),
  ironman: (
    <g>
      {/* reatores no topo e embaixo */}
      {[[50, 4], [50, 96]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={5.5} fill="#e8a13a" stroke="#c47f22" strokeWidth={1.6} />
          <circle r={3} fill="#4dd0ff" />
          <circle r={1.2} fill="#ffffff" />
        </g>
      ))}
      {/* detalhes dourados nos lados */}
      {[RING_POINTS[0], RING_POINTS[2], RING_POINTS[3], RING_POINTS[5]].map(([x, y], i) => (
        <line key={i} x1={x - 3} y1={y} x2={x + 3} y2={y} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.9} />
      ))}
    </g>
  ),
  captain: (
    <g>
      {/* estrelas no topo e embaixo */}
      {[[50, 4], [50, 96]].map(([x, y], i) => (
        <path
          key={i}
          transform={`translate(${x} ${y}) scale(0.8)`}
          fill="#ffffff"
          stroke="#d8483f"
          strokeWidth={1.4}
          d="M0 -7 L1.6 -2.2 L6.7 -2.2 L2.5 0.8 L4.1 5.7 L0 2.7 L-4.1 5.7 L-2.5 0.8 L-6.7 -2.2 L-1.6 -2.2 Z"
        />
      ))}
      {[RING_POINTS[0], RING_POINTS[2], RING_POINTS[3], RING_POINTS[5]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.4} fill="#ffffff" />
      ))}
    </g>
  ),
  nuit: (
    <g>
      {/* lua crescente no topo */}
      <g transform="translate(50 4)">
        <circle r={6.5} fill="#c79be8" />
        <circle cx={2.4} cy={-1.4} r={5.6} fill="var(--c-surface-2, #ffffff)" />
      </g>
      {/* estrelinhas ao redor do anel */}
      <g fill="#ffffff" opacity={0.95}>
        {RING_POINTS.map(([x, y], i) => (
          <path
            key={i}
            transform={`translate(${x} ${y}) scale(0.55)`}
            d="M0 -5 L1.4 -1.6 L5.2 -1.6 L2.1 0.8 L3.4 4.5 L0 2.3 L-3.4 4.5 L-2.1 0.8 L-5.2 -1.6 L-1.4 -1.6 Z"
          />
        ))}
      </g>
    </g>
  )
};

export function AvatarFrame({ id, className = "" }: { id: string; className?: string }) {
  const gradient = GRADS[id];
  const stroke = gradient ? `url(#af-${id})` : "var(--c-primary)";
  return (
    <svg viewBox="0 0 100 100" className={`avatar-frame ${className}`.trim()} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id={`af-${id}`} x1="0" y1="0" x2="1" y2="1">
            {gradient.map((c, i) => (
              <stop key={i} offset={`${(i / (gradient.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
      )}
      <circle cx="50" cy="50" r="46" fill="none" stroke={stroke} strokeWidth="6.5" strokeLinecap="round" />
      {ACCENTS[id]}
    </svg>
  );
}
