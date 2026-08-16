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
  coracao: ["#ff8fa3", "#e5484d", "#ff8fa3", "#e5484d"]
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
