// ══════════════════════════════════════════════════════════════
// Athenas — "Lulu", a fadinha-antena mascote original
// Expressões: feliz, empolgada, pensando, confusa, triste,
// orgulhosa, surpresa, preocupada, apaixonada, explicando.
// ══════════════════════════════════════════════════════════════
export type Mood =
  | "happy"
  | "excited"
  | "thinking"
  | "confused"
  | "sad"
  | "proud"
  | "surprised"
  | "worried"
  | "love"
  | "explaining";

type EyeKind = "arcs" | "round" | "squint" | "sad" | "hearts" | "big";
type MouthKind = "smile" | "grin" | "o" | "frown" | "wavy" | "small" | "explain";
type BrowKind = "raise" | "down";

const MOODS: Record<Mood, { eyes: EyeKind; mouth: MouthKind; brows?: BrowKind }> = {
  happy: { eyes: "arcs", mouth: "smile" },
  excited: { eyes: "big", mouth: "grin" },
  thinking: { eyes: "squint", mouth: "small", brows: "down" },
  confused: { eyes: "squint", mouth: "wavy", brows: "raise" },
  sad: { eyes: "sad", mouth: "frown", brows: "down" },
  proud: { eyes: "arcs", mouth: "grin" },
  surprised: { eyes: "round", mouth: "o", brows: "raise" },
  worried: { eyes: "round", mouth: "wavy", brows: "down" },
  love: { eyes: "hearts", mouth: "smile" },
  explaining: { eyes: "round", mouth: "explain" }
};

function Eyes({ kind }: { kind: EyeKind }) {
  switch (kind) {
    case "arcs":
      return (
        <g stroke="#5b3a56" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M48 68 Q55 61 62 68" />
          <path d="M78 68 Q85 61 92 68" />
        </g>
      );
    case "round":
      return (
        <g fill="#5b3a56">
          <circle cx={55} cy={69} r={5} />
          <circle cx={85} cy={69} r={5} />
          <circle cx={57} cy={67} r={1.6} fill="#fff" />
          <circle cx={87} cy={67} r={1.6} fill="#fff" />
        </g>
      );
    case "big":
      return (
        <g fill="#5b3a56">
          <circle cx={55} cy={69} r={7} />
          <circle cx={85} cy={69} r={7} />
          <circle cx={58} cy={66} r={2.4} fill="#fff" />
          <circle cx={88} cy={66} r={2.4} fill="#fff" />
        </g>
      );
    case "squint":
      return (
        <g stroke="#5b3a56" strokeWidth={3} strokeLinecap="round">
          <path d="M48 70 Q55 66 62 70" fill="none" />
          <path d="M78 69 Q85 65 92 69" fill="none" />
          <circle cx={55} cy={71} r={2} fill="#5b3a56" />
        </g>
      );
    case "sad":
      return (
        <g stroke="#5b3a56" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M48 72 Q55 78 62 72" />
          <path d="M78 72 Q85 78 92 72" />
        </g>
      );
    case "hearts":
      return (
        <g fill="#e5484d">
          <path d="M55 71 c-3 -4 -9 -1 -7 3 c2 3 7 5 7 5 c0 0 5 -2 7 -5 c2 -4 -4 -7 -7 -3 z" />
          <path d="M85 71 c-3 -4 -9 -1 -7 3 c2 3 7 5 7 5 c0 0 5 -2 7 -5 c2 -4 -4 -7 -7 -3 z" />
        </g>
      );
    default:
      return null;
  }
}

function Mouth({ kind }: { kind: MouthKind }) {
  switch (kind) {
    case "smile":
      return <path d="M58 88 Q70 97 82 88" stroke="#5b3a56" strokeWidth={3} strokeLinecap="round" fill="none" />;
    case "grin":
      return (
        <path d="M56 87 Q70 99 84 87 Q70 93 56 87" fill="#5b3a56" />
      );
    case "o":
      return <ellipse cx={70} cy={90} rx={5} ry={6} fill="#5b3a56" />;
    case "frown":
      return <path d="M58 92 Q70 84 82 92" stroke="#5b3a56" strokeWidth={3} strokeLinecap="round" fill="none" />;
    case "wavy":
      return <path d="M58 90 q4 -4 8 0 q4 4 8 0 q4 -4 8 0" stroke="#5b3a56" strokeWidth={2.6} strokeLinecap="round" fill="none" />;
    case "small":
      return <ellipse cx={70} cy={91} rx={3.4} ry={4} fill="#5b3a56" />;
    case "explain":
      return (
        <g>
          <path d="M60 88 Q66 95 72 89" stroke="#5b3a56" strokeWidth={3} strokeLinecap="round" fill="none" />
          <path d="M75 88 Q79 92 84 89" stroke="#5b3a56" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

function Brows({ kind }: { kind?: BrowKind }) {
  if (!kind) return null;
  const raise = kind === "raise";
  return (
    <g stroke="#5b3a56" strokeWidth={2.6} strokeLinecap="round">
      <path d={raise ? "M46 56 Q55 52 64 55" : "M46 60 Q55 65 64 61"} />
      <path d={raise ? "M76 55 Q85 52 94 56" : "M76 61 Q85 65 94 60"} />
    </g>
  );
}

export function Mascot({ mood = "happy", size = 120, className = "", speaking }: { mood?: Mood; size?: number; className?: string; speaking?: boolean }) {
  const m = MOODS[mood];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={className}
      role="img"
      aria-label={`Lulu, a mascote do Athenas — expressão: ${mood}`}
    >
      {/* asas */}
      <ellipse cx={24} cy={92} rx={12} ry={20} fill="#ffffff" opacity={0.55} transform="rotate(-18 24 92)" />
      <ellipse cx={116} cy={92} rx={12} ry={20} fill="#ffffff" opacity={0.55} transform="rotate(18 116 92)" />

      {/* antenas */}
      <g stroke="#b9a5f0" strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M48 40 Q40 26 36 16" />
        <path d="M92 40 Q100 26 104 16" />
      </g>
      <g fill="#e9b44c">
        <circle cx={36} cy={14} r={5.5} />
        <circle cx={104} cy={14} r={5.5} />
        <circle cx={36} cy={14} r={2} fill="#fff" opacity={0.7} />
        <circle cx={104} cy={14} r={2} fill="#fff" opacity={0.7} />
      </g>

      {/* boina francesa */}
      <g transform="rotate(-6 70 30)">
        <ellipse cx={70} cy={30} rx={33} ry={13} fill="#e5484d" />
        <path d="M55 34 q15 -14 30 0 l-4 6 q-11 -7 -22 0 z" fill="#c93a3f" />
        <circle cx={70} cy={26} r={3} fill="#f28bb4" />
      </g>

      {/* corpo / rostinho */}
      <ellipse cx={70} cy={80} rx={46} ry={40} fill="#e7dcfb" />
      <ellipse cx={70} cy={76} rx={46} ry={36} fill="#f3ecff" />
      <ellipse cx={58} cy={62} rx={16} ry={10} fill="#ffffff" opacity={0.5} />

      {/* bochechas */}
      <ellipse cx={42} cy={84} rx={7} ry={4.5} fill="#ffb3c8" opacity={0.9} />
      <ellipse cx={98} cy={84} rx={7} ry={4.5} fill="#ffb3c8" opacity={0.9} />

      {/* rosto */}
      <Brows kind={m.brows} />
      <Eyes kind={m.eyes} />
      <Mouth kind={m.mouth} />

      {/* echarpe */}
      <path d="M44 112 q26 10 52 0 l-4 10 q-22 8 -44 0 z" fill="#f28bb4" />
      <path d="M88 112 l6 14 l-8 -3 z" fill="#e56b9d" />

      {/* ondas de fala */}
      {speaking && (
        <g fill="none" stroke="#b9a5f0" strokeWidth={2.4} strokeLinecap="round" opacity={0.8}>
          <path d="M112 30 q6 5 0 10" />
          <path d="M120 24 q8 6 0 12" />
        </g>
      )}

      {/* coraçãozinho flutuante */}
      {mood === "love" && <path d="M70 14 c-4 -5 -12 -2 -9 4 c2 4 9 6 9 6 c0 0 7 -2 9 -6 c3 -6 -5 -9 -9 -4 z" fill="#e5484d" />}
    </svg>
  );
}
