// ══════════════════════════════════════════════════════════════
// Athenas — Sprites exclusivos de cada chefe (SVG vetorial, arte
// caprichada: gradientes, brilhos e expressões). Cada chefe tem
// silhueta, cores e acessórios próprios. A aura de cada um fica
// em BOSS_ACCENTS (usada na arena de batalha). Animações de
// flutuação e dano ficam em global.css (.boss-sprite / .boss-hurt).
// ══════════════════════════════════════════════════════════════
import type { ReactNode } from "react";

type Mouth = "shout" | "teeth" | "smug" | "grimace" | "o";
type Eyes = "round" | "robot" | "hollow";

type FaceProps = {
  eye?: string;
  cheek?: string;
  mouth?: Mouth;
  eyes?: Eyes;
  fangs?: boolean;
  blush?: boolean;
  cx?: number;
};

/** Carinha brava porém fofa, usada por todos os chefes. */
function Face({ eye = "#33232b", cheek = "#ffb3c8", mouth = "teeth", eyes = "round", fangs = false, blush = true, cx = 60 }: FaceProps) {
  const ex = cx;
  return (
    <g>
      {/* sobrancelhas inclinadas */}
      <g stroke={eye} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d={`M${ex - 22} ${54} L${ex - 8} ${60}`} />
        <path d={`M${ex + 22} ${54} L${ex + 8} ${60}`} />
      </g>
      {/* olhos */}
      {eyes === "round" && (
        <g>
          <circle cx={ex - 14} cy={67} r={6.4} fill={eye} />
          <circle cx={ex + 14} cy={67} r={6.4} fill={eye} />
          <circle cx={ex - 11.8} cy={64.6} r={2.2} fill="#fff" />
          <circle cx={ex + 16.2} cy={64.6} r={2.2} fill="#fff" />
          <circle cx={ex - 16.2} cy={69} r={1.1} fill="#fff" opacity={0.7} />
          <circle cx={ex + 11.8} cy={69} r={1.1} fill="#fff" opacity={0.7} />
        </g>
      )}
      {eyes === "robot" && (
        <g>
          <rect x={ex - 19} y={62} width={11} height={9} rx={2.5} fill={eye} />
          <rect x={ex + 8} y={62} width={11} height={9} rx={2.5} fill={eye} />
          <rect x={ex - 16} y={65} width={5} height={3} rx={1} fill="#9fe8ff" />
          <rect x={ex + 11} y={65} width={5} height={3} rx={1} fill="#9fe8ff" />
        </g>
      )}
      {eyes === "hollow" && (
        <g fill={eye}>
          <ellipse cx={ex - 14} cy={68} rx={5.6} ry={7} />
          <ellipse cx={ex + 14} cy={68} rx={5.6} ry={7} />
        </g>
      )}
      {blush && eyes !== "hollow" && (
        <g>
          <ellipse cx={ex - 29} cy={77} rx={6} ry={3.6} fill={cheek} opacity={0.9} />
          <ellipse cx={ex + 29} cy={77} rx={6} ry={3.6} fill={cheek} opacity={0.9} />
        </g>
      )}
      {/* boca */}
      {mouth === "shout" && (
        <g>
          <ellipse cx={ex} cy={87} rx={10} ry={9.5} fill={eye} />
          <ellipse cx={ex} cy={91.5} rx={6} ry={4} fill="#ff8fa3" />
        </g>
      )}
      {mouth === "teeth" && (
        <g>
          <ellipse cx={ex} cy={87} rx={11.5} ry={10} fill={eye} />
          <path d={`M${ex - 10} ${79.5} q10 -5 20 0 l-2.5 4 q-7.5 -3 -15 0 z`} fill="#fff" />
          {fangs && (
            <g fill="#fff">
              <path d={`M${ex - 7} ${78} L${ex - 4} ${84} L${ex - 1} ${78} z`} />
              <path d={`M${ex + 1} ${78} L${ex + 3.5} ${83} L${ex + 6} ${78} z`} />
            </g>
          )}
          <ellipse cx={ex} cy={93.5} rx={7} ry={4} fill="#ff8fa3" />
        </g>
      )}
      {mouth === "smug" && <path d={`M${ex - 10} ${85} Q${ex} ${77} ${ex + 10} ${85} Q${ex} ${89} ${ex - 10} ${85}`} fill={eye} />}
      {mouth === "grimace" && (
        <path d={`M${ex - 8} ${87} q4 -4 8 0 q4 4 8 0 q4 -4 8 0`} stroke={eye} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      )}
      {mouth === "o" && <ellipse cx={ex} cy={87} rx={5.5} ry={7.5} fill={eye} />}
    </g>
  );
}

/** Cor da aura de cada chefe (glow da arena de batalha). */
export const BOSS_ACCENTS: Record<string, string> = {
  "boss-1": "#8fe09a",
  "boss-2": "#f7cb77",
  "boss-3": "#7db9f0",
  "boss-4": "#c3a6f5",
  "boss-5": "#bcc8f2",
  "boss-6": "#93dcf2",
  "boss-7": "#d3acec",
  "boss-8": "#93a6cc",
  "boss-9": "#edcf8e",
  "boss-10": "#eea3cd",
  "boss-11": "#9ab8f5",
  "boss-12": "#a2aec6",
  "boss-13": "#b6c8d6",
  "boss-14": "#f5969b",
  "boss-15": "#c29ce8"
};

const SPRITES: Record<string, ReactNode> = {
  // ── 1 · Le Dragon du Vocabulaire 🐉 ──────────────────────────
  "boss-1": (
    <g>
      <defs>
        <linearGradient id="bs-drag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ee39a" />
          <stop offset="1" stopColor="#4fae5c" />
        </linearGradient>
        <linearGradient id="bs-dragw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdf0c4" />
          <stop offset="1" stopColor="#7fd18a" />
        </linearGradient>
        <linearGradient id="bs-dragh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc37a" />
          <stop offset="1" stopColor="#f08a3c" />
        </linearGradient>
      </defs>
      {/* cauda */}
      <path d="M88 100 Q112 102 106 118 L98 110 Q104 104 94 104 z" fill="url(#bs-drag)" />
      <path d="M106 118 L100 114 L102 108 z" fill="#f08a3c" />
      {/* asas */}
      <path d="M18 56 Q6 40 12 24 Q24 32 26 22 Q32 40 26 56 z" fill="url(#bs-dragw)" />
      <path d="M102 56 Q114 40 108 24 Q96 32 94 22 Q88 40 94 56 z" fill="url(#bs-dragw)" />
      {/* corpinho */}
      <ellipse cx={60} cy={104} rx={26} ry={15} fill="url(#bs-drag)" />
      <ellipse cx={60} cy={108} rx={16} ry={9} fill="#d8f4dc" />
      {/* patinhas */}
      <ellipse cx={44} cy={116} rx={8} ry={5} fill="#4fae5c" />
      <ellipse cx={76} cy={116} rx={8} ry={5} fill="#4fae5c" />
      {/* cabeça */}
      <ellipse cx={60} cy={62} rx={42} ry={38} fill="url(#bs-drag)" />
      <ellipse cx={60} cy={80} rx={24} ry={16} fill="#d8f4dc" />
      {/* chifres */}
      <path d="M30 44 Q20 20 34 14 Q34 30 42 36 z" fill="url(#bs-dragh)" />
      <path d="M90 44 Q100 20 86 14 Q86 30 78 36 z" fill="url(#bs-dragh)" />
      {/* crista de espinhos */}
      <path d="M46 26 l4 9 4 -9 z" fill="#2f7a3a" />
      <path d="M56 23 l4 10 4 -10 z" fill="#3f914b" />
      <path d="M66 23 l4 10 4 -10 z" fill="#2f7a3a" />
      {/* narinas com fumaça */}
      <circle cx={40} cy={66} r={2.4} fill="#2f7a3a" />
      <circle cx={80} cy={66} r={2.4} fill="#2f7a3a" />
      <path d="M36 60 q-4 -4 0 -8" stroke="#cfe9d4" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d="M84 60 q4 -4 0 -8" stroke="#cfe9d4" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Face mouth="teeth" fangs eye="#2c4a30" cheek="#b9f0c1" />
    </g>
  ),

  // ── 2 · Le Croissant Géant 🥐 ────────────────────────────────
  "boss-2": (
    <g>
      <defs>
        <linearGradient id="bs-croi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8cd7c" />
          <stop offset="1" stopColor="#e09a38" />
        </linearGradient>
        <linearGradient id="bs-croim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9b8" />
          <stop offset="1" stopColor="#f6c879" />
        </linearGradient>
      </defs>
      {/* pratinho */}
      <ellipse cx={60} cy={112} rx={46} ry={8} fill="#eef1f7" />
      <ellipse cx={60} cy={110} rx={46} ry={8} fill="#f8fafd" />
      {/* crescentão */}
      <path
        d="M20 74 Q26 32 60 28 Q94 32 100 74 Q96 44 60 42 Q24 44 20 74 z"
        fill="url(#bs-croi)"
        stroke="#cf8f30"
        strokeWidth={3}
      />
      {/* camadas */}
      <path d="M30 68 Q38 40 60 37" stroke="#cf8f30" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d="M90 68 Q82 40 60 37" stroke="#cf8f30" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d="M60 28 Q76 30 88 44" stroke="#eeb95f" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* brilho */}
      <path d="M34 50 Q44 40 58 38" stroke="#ffe9b8" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      {/* miolo com carinha */}
      <ellipse cx={60} cy={76} rx={32} ry={25} fill="url(#bs-croim)" />
      {/* farinhas */}
      <circle cx={32} cy={38} r={2.2} fill="#fff3d6" />
      <circle cx={84} cy={34} r={2.6} fill="#fff3d6" />
      <circle cx={100} cy={54} r={2} fill="#fff3d6" />
      <circle cx={22} cy={58} r={1.8} fill="#fff3d6" />
      <Face mouth="smug" eye="#6b4a1f" cheek="#ffdfa8" cx={60} />
    </g>
  ),

  // ── 3 · Le Métro Fou 🚇 ──────────────────────────────────────
  "boss-3": (
    <g>
      <defs>
        <linearGradient id="bs-metr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb1ec" />
          <stop offset="1" stopColor="#3f7fc4" />
        </linearGradient>
        <linearGradient id="bs-metrg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eaf6ff" />
          <stop offset="1" stopColor="#bfe0f8" />
        </linearGradient>
      </defs>
      {/* trilhos */}
      <line x1={14} y1={112} x2={106} y2={112} stroke="#9aa3b5" strokeWidth={3} />
      <line x1={14} y1={102} x2={106} y2={102} stroke="#c3ccd9" strokeWidth={2} />
      {/* antena */}
      <path d="M88 34 L98 16" stroke="#3f7fc4" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={99} cy={14} r={5} fill="#ffe28a" />
      <circle cx={99} cy={14} r={2} fill="#fff" opacity={0.8} />
      {/* rodas */}
      <circle cx={32} cy={98} r={8} fill="#2b3544" />
      <circle cx={88} cy={98} r={8} fill="#2b3544" />
      <circle cx={32} cy={97} r={3} fill="#8fa0b5" />
      <circle cx={88} cy={97} r={3} fill="#8fa0b5" />
      {/* corpo do vagão */}
      <rect x={16} y={38} width={88} height={58} rx={14} fill="url(#bs-metr)" />
      {/* faixa */}
      <rect x={16} y={58} width={88} height={10} fill="#2f6db0" opacity={0.55} />
      {/* faróis */}
      <circle cx={24} cy={92} r={5.5} fill="#ffe28a" />
      <circle cx={24} cy={92} r={2.2} fill="#fff" opacity={0.85} />
      <circle cx={96} cy={92} r={5.5} fill="#ffe28a" />
      <path d="M10 92 L22 92" stroke="#ffe9ad" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      {/* para-brisa com rosto */}
      <rect x={28} y={48} width={64} height={34} rx={10} fill="url(#bs-metrg)" />
      <line x1={60} y1={48} x2={60} y2={82} stroke="#9cc6ee" strokeWidth={2.5} />
      <Face cx={60} mouth="shout" eye="#274e75" cheek="#b8d9f5" />
      {/* placa */}
      <rect x={34} y={84} width={52} height={9} rx={4} fill="#243d5e" />
      <text x={60} y={91} fontSize={6.5} fontWeight={800} fill="#ffe28a" textAnchor="middle">GARE</text>
    </g>
  ),

  // ── 4 · Le Grand Bavard 💬 ───────────────────────────────────
  "boss-4": (
    <g>
      <defs>
        <linearGradient id="bs-bav" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9adf7" />
          <stop offset="1" stopColor="#9672dd" />
        </linearGradient>
      </defs>
      {/* ondas de som */}
      <path d="M8 78 q-8 -10 0 -20" stroke="#b79bf2" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      <path d="M112 78 q8 -10 0 -20" stroke="#b79bf2" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      {/* bolhas */}
      <circle cx={98} cy={24} r={11} fill="#efe9fd" stroke="#b79bf2" strokeWidth={2.6} />
      <text x={98} y={28} fontSize={13} fontWeight={800} fill="#8b6fd0" textAnchor="middle">!</text>
      <circle cx={14} cy={34} r={7} fill="#efe9fd" stroke="#b79bf2" strokeWidth={2.4} />
      <text x={14} y={37.5} fontSize={8.5} fontWeight={800} fill="#8b6fd0" textAnchor="middle">…</text>
      {/* braços */}
      <path d="M22 84 q-10 -2 -10 -14 q10 4 14 0" stroke="#9672dd" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M98 84 q10 -2 10 -14 q-10 4 -14 0" stroke="#9672dd" strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* corpo */}
      <ellipse cx={60} cy={78} rx={44} ry={42} fill="url(#bs-bav)" />
      <ellipse cx={60} cy={94} rx={26} ry={16} fill="#d9c8f8" />
      {/* bocão */}
      <ellipse cx={60} cy={86} rx={20} ry={15} fill="#4a2d5c" />
      <path d="M41 75 Q60 68 79 75" stroke="#4a2d5c" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M42 76 q18 -6 36 0 l-3 5 q-15 -4 -30 0 z" fill="#fff" />
      <ellipse cx={60} cy={93} rx={13} ry={7} fill="#ff8fa3" />
      {/* olhos + sobrancelhas */}
      <g>
        <circle cx={46} cy={60} r={6} fill="#33232b" />
        <circle cx={74} cy={60} r={6} fill="#33232b" />
        <circle cx={48} cy={58} r={2} fill="#fff" />
        <circle cx={76} cy={58} r={2} fill="#fff" />
      </g>
      <g stroke="#33232b" strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M38 50 L50 56" />
        <path d="M82 50 L70 56" />
      </g>
      <ellipse cx={28} cy={70} rx={6} ry={3.6} fill="#ffb3c8" opacity={0.9} />
      <ellipse cx={92} cy={70} rx={6} ry={3.6} fill="#ffb3c8" opacity={0.9} />
    </g>
  ),

  // ── 5 · Le Train Fantôme 👻 ──────────────────────────────────
  "boss-5": (
    <g>
      <defs>
        <linearGradient id="bs-gho" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe4ff" />
        </linearGradient>
      </defs>
      {/* vapor */}
      <circle cx={34} cy={16} r={7} fill="#e8edff" opacity={0.9} />
      <circle cx={48} cy={10} r={5} fill="#e8edff" opacity={0.7} />
      <circle cx={88} cy={14} r={6} fill="#e8edff" opacity={0.8} />
      {/* corpo-fantasma */}
      <path
        d="M22 82 Q22 38 60 36 Q98 38 98 82 L98 110 Q90 102 82 110 Q74 102 66 110 Q58 102 50 110 Q42 102 34 110 L22 110 z"
        fill="url(#bs-gho)"
        stroke="#c6cdf2"
        strokeWidth={3}
      />
      {/* quepe de maquinista */}
      <path d="M38 40 Q60 24 82 40 L78 30 Q60 18 42 30 z" fill="#39406b" />
      <rect x={36} y={38} width={48} height={9} rx={4.5} fill="#39406b" />
      <circle cx={60} cy={42} r={3.4} fill="#e9b44c" />
      <ellipse cx={60} cy={27} rx={14} ry={4} fill="#1f2440" opacity={0.5} />
      {/* lanterna */}
      <g transform="translate(88 66)">
        <rect x={-2.5} y={6} width={5} height={12} rx={2} fill="#c6cdf2" />
        <rect x={-7} y={16} width={14} height={9} rx={3} fill="#39406b" />
        <circle cx={0} cy={20.5} r={3.4} fill="#ffe28a" />
        <circle cx={0} cy={20.5} r={1.6} fill="#fff" />
      </g>
      {/* apito */}
      <path d="M76 56 q12 -6 10 8 q-5 1 -9 0" fill="#d8a33d" stroke="#b9842b" strokeWidth={2.4} />
      <Face eyes="hollow" mouth="o" eye="#565f8f" cheek="#eef" blush={false} cx={58} />
    </g>
  ),

  // ── 6 · Le Cœur de Verre 💔 ──────────────────────────────────
  "boss-6": (
    <g>
      <defs>
        <linearGradient id="bs-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8f4fd" />
          <stop offset="1" stopColor="#8fd8f0" />
        </linearGradient>
      </defs>
      {/* brilhos */}
      <path d="M18 26 l2.6 5.4 5.4 2.6 -5.4 2.6 -2.6 5.4 -2.6 -5.4 -5.4 -2.6 5.4 -2.6 z" fill="#bfe9f7" />
      <path d="M104 20 l2 4.2 4.2 2 -4.2 2 -2 4.2 -2 -4.2 -4.2 -2 4.2 -2 z" fill="#bfe9f7" />
      <path d="M20 96 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" fill="#cdeefb" opacity={0.8} />
      {/* coração */}
      <path
        d="M60 106 C38 88 18 72 18 50 C18 30 34 18 50 18 C58 18 60 22 60 28 C60 22 62 18 70 18 C86 18 102 30 102 50 C102 72 82 88 60 106 z"
        fill="url(#bs-heart)"
        stroke="#7cc7e8"
        strokeWidth={3}
      />
      {/* brilho */}
      <path d="M34 34 Q42 24 52 22" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9} />
      {/* trincas */}
      <path d="M52 32 L60 48 L54 58 L63 72" stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.95} />
      <path d="M67 40 L73 54 L67 62" stroke="#ffffff" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.9} />
      {/* cacos */}
      <path d="M28 88 l5 4 l-2 6 l-5 -4 z" fill="#a8e2f5" stroke="#7cc7e8" strokeWidth={2} />
      <path d="M86 94 l4 5 l-3 5 l-4 -5 z" fill="#bfe9f7" stroke="#7cc7e8" strokeWidth={2} />
      <Face mouth="grimace" eye="#2e6b87" cheek="#cdeefb" cx={60} />
    </g>
  ),

  // ── 7 · Le Professeur Exigeant 🦉 ────────────────────────────
  "boss-7": (
    <g>
      <defs>
        <linearGradient id="bs-owl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8c0f2" />
          <stop offset="1" stopColor="#b18ade" />
        </linearGradient>
        <linearGradient id="bs-owlw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef0ff" />
          <stop offset="1" stopColor="#c9b0e8" />
        </linearGradient>
      </defs>
      {/* asas */}
      <path d="M14 70 Q4 58 10 42 Q20 52 22 46 Q22 60 26 68 z" fill="url(#bs-owlw)" />
      <path d="M106 70 Q116 58 110 42 Q100 52 98 46 Q98 60 94 68 z" fill="url(#bs-owlw)" />
      {/* corpo */}
      <ellipse cx={60} cy={80} rx={40} ry={38} fill="url(#bs-owl)" />
      <ellipse cx={60} cy={94} rx={24} ry={16} fill="#e6d9f8" />
      {/* gravatinha */}
      <path d="M60 92 l-8 6 8 3 8 -3 z" fill="#e5484d" />
      {/* tufos de pena */}
      <path d="M34 46 L28 30 L44 42 z" fill="#a989d6" />
      <path d="M86 46 L92 30 L76 42 z" fill="#a989d6" />
      {/* capelo */}
      <g transform="rotate(-8 60 30)">
        <path d="M34 34 Q60 16 86 34 L86 30 Q60 14 34 30 z" fill="#39406b" />
        <rect x={30} y={31} width={60} height={8} rx={4} fill="#39406b" />
        <path d="M86 34 q16 2 14 10 q-4 -4 -14 -3" fill="#39406b" />
        <circle cx={93} cy={42} r={2.6} fill="#e9b44c" />
      </g>
      {/* óculos */}
      <circle cx={45} cy={68} r={13.5} fill="#eef0ff" opacity={0.35} />
      <circle cx={75} cy={68} r={13.5} fill="#eef0ff" opacity={0.35} />
      <circle cx={45} cy={68} r={13.5} fill="none" stroke="#7d5fb0" strokeWidth={3} />
      <circle cx={75} cy={68} r={13.5} fill="none" stroke="#7d5fb0" strokeWidth={3} />
      <line x1={58.5} y1={68} x2={61.5} y2={68} stroke="#7d5fb0" strokeWidth={3} />
      {/* olhos + sobrancelhas */}
      <circle cx={45} cy={69} r={4.6} fill="#3a2b45" />
      <circle cx={75} cy={69} r={4.6} fill="#3a2b45" />
      <circle cx={46.8} cy={67.2} r={1.6} fill="#fff" />
      <circle cx={76.8} cy={67.2} r={1.6} fill="#fff" />
      <g stroke="#3a2b45" strokeWidth={3.4} strokeLinecap="round" fill="none">
        <path d="M36 55 L46 61" />
        <path d="M84 55 L74 61" />
      </g>
      {/* bico */}
      <path d="M55 77 L60 72 L65 77 z" fill="#e9b44c" />
      <ellipse cx={32} cy={80} rx={4.6} ry={3} fill="#ffb3c8" opacity={0.85} />
      <ellipse cx={88} cy={80} rx={4.6} ry={3} fill="#ffb3c8" opacity={0.85} />
      {/* livro */}
      <g transform="translate(84 74) rotate(6)">
        <rect x={0} y={0} width={26} height={22} rx={3} fill="#e5484d" />
        <line x1={13} y1={0} x2={13} y2={22} stroke="#fff" strokeWidth={2} />
        <line x1={4} y1={6} x2={10} y2={6} stroke="#ffd9d9" strokeWidth={1.6} />
        <line x1={16} y1={6} x2={22} y2={6} stroke="#ffd9d9" strokeWidth={1.6} />
        <line x1={4} y1={11} x2={10} y2={11} stroke="#ffd9d9" strokeWidth={1.6} />
      </g>
    </g>
  ),

  // ── 8 · Le Directeur Inflexible 💼 ───────────────────────────
  "boss-8": (
    <g>
      <defs>
        <linearGradient id="bs-suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#54658a" />
          <stop offset="1" stopColor="#3d4a63" />
        </linearGradient>
      </defs>
      {/* pasta */}
      <g transform="translate(86 80)">
        <rect x={0} y={4} width={24} height={20} rx={4} fill="#8a5a34" stroke="#6e4526" strokeWidth={2.4} />
        <rect x={0} y={4} width={24} height={6} rx={3} fill="#a06c40" />
        <path d="M8 0 h8 v4 h-8 z" fill="#6e4526" />
        <circle cx={12} cy={8} r={2} fill="#e9b44c" />
      </g>
      {/* terno */}
      <rect x={24} y={64} width={72} height={46} rx={14} fill="url(#bs-suit)" />
      {/* lapelas */}
      <path d="M46 68 L60 84 L74 68" fill="none" stroke="#2f3a4e" strokeWidth={3} />
      {/* camisa + gravata */}
      <path d="M50 64 L60 76 L70 64 z" fill="#f4f6fa" />
      <path d="M58 74 L62 74 L62 102 L58 102 z" fill="#e5484d" />
      <path d="M56 70 L64 70 L62 75 L58 75 z" fill="#c93a3f" />
      {/* braço cruzado */}
      <path d="M24 76 Q34 88 46 84" stroke="#3d4a63" strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* cabeça */}
      <ellipse cx={60} cy={44} rx={27} ry={27} fill="#e8c39a" />
      {/* cabelo */}
      <path d="M33 46 Q35 18 60 16 Q85 18 87 46 L87 38 Q85 12 60 10 Q35 12 33 38 z" fill="#4a4238" />
      <path d="M33 44 Q34 30 44 26 L46 22 Q34 26 34 42 z" fill="#4a4238" />
      {/* olhos + sobrancelhas finas */}
      <g>
        <circle cx={46} cy={68} r={4.6} fill="#2e2a24" />
        <circle cx={74} cy={68} r={4.6} fill="#2e2a24" />
        <circle cx={47.6} cy={66.4} r={1.5} fill="#fff" />
        <circle cx={75.6} cy={66.4} r={1.5} fill="#fff" />
      </g>
      <g stroke="#2e2a24" strokeWidth={3.4} strokeLinecap="round" fill="none">
        <path d="M38 58 L48 62" />
        <path d="M82 58 L72 62" />
      </g>
      {/* bigode */}
      <path d="M44 80 Q60 88 76 80" stroke="#4a4238" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* boca */}
      <path d="M52 86 Q60 82 68 86 Q60 90 52 86" fill="#2e2a24" />
      <ellipse cx={30} cy={78} rx={4.6} ry={3} fill="#f2d3ae" opacity={0.8} />
      <ellipse cx={90} cy={78} rx={4.6} ry={3} fill="#f2d3ae" opacity={0.8} />
    </g>
  ),

  // ── 9 · Le Sphinx de la Pensée 🦁 ────────────────────────────
  "boss-9": (
    <g>
      <defs>
        <linearGradient id="bs-sph" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d6a2" />
          <stop offset="1" stopColor="#d9a95f" />
        </linearGradient>
      </defs>
      {/* ponto de interrogação */}
      <g transform="translate(102 14)">
        <path d="M0 -6 q6 -8 12 0 q0 5 -4 7 q-4 2 -4 5" stroke="#d9a95f" strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={4} cy={12} r={2.4} fill="#d9a95f" />
      </g>
      {/* corpo de leão */}
      <ellipse cx={60} cy={92} rx={50} ry={26} fill="url(#bs-sph)" />
      {/* coxas */}
      <ellipse cx={26} cy={96} rx={12} ry={10} fill="#e3c088" />
      <ellipse cx={94} cy={96} rx={12} ry={10} fill="#e3c088" />
      {/* patas */}
      <ellipse cx={18} cy={106} rx={8} ry={5.5} fill="#d9a95f" />
      <ellipse cx={36} cy={106} rx={8} ry={5.5} fill="#d9a95f" />
      <ellipse cx={86} cy={106} rx={8} ry={5.5} fill="#d9a95f" />
      {/* rabo */}
      <path d="M106 92 q14 -4 12 -16" stroke="#d9a95f" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={118} cy={72} r={4} fill="#d9a95f" />
      {/* papiro */}
      <g transform="translate(72 84) rotate(8)">
        <rect x={0} y={0} width={22} height={15} rx={2} fill="#fff7e0" stroke="#d9c9a0" strokeWidth={2} />
        <line x1={5} y1={5} x2={17} y2={5} stroke="#b9a98a" strokeWidth={1.6} />
        <line x1={5} y1={9} x2={17} y2={9} stroke="#b9a98a" strokeWidth={1.6} />
      </g>
      {/* juba */}
      <circle cx={60} cy={52} r={32} fill="#d9a95f" />
      <g fill="#c9944a">
        <path d="M28 52 l-8 8 -2 -10 z" />
        <path d="M92 52 l8 8 2 -10 z" />
        <path d="M34 34 l-10 2 5 -9 z" />
        <path d="M86 34 l10 2 -5 -9 z" />
      </g>
      {/* cabeça */}
      <circle cx={60} cy={50} r={25} fill="#f0d6a2" />
      {/* nemes (touca do faraó) */}
      <path d="M35 52 Q36 24 60 22 Q84 24 85 52 L82 52 Q82 30 60 28 Q38 30 38 52 z" fill="#4a78c9" />
      <path d="M36 40 Q60 30 84 40" stroke="#e9b44c" strokeWidth={3} fill="none" />
      <path d="M38 52 L30 70 L44 66 L38 86 L52 70 L60 52 L68 70 L82 86 L76 66 L90 70 L82 52" fill="none" stroke="#e9b44c" strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M36 52 L44 66" stroke="#e9b44c" strokeWidth={3.4} />
      <path d="M84 52 L76 66" stroke="#e9b44c" strokeWidth={3.4} />
      {/* orelhas */}
      <path d="M36 36 L28 22 L44 30 z" fill="#d9a95f" />
      <path d="M84 36 L92 22 L76 30 z" fill="#d9a95f" />
      <Face cx={60} mouth="teeth" fangs eye="#6b4a1f" cheek="#f5dcae" />
    </g>
  ),

  // ── 10 · La Critique d'Art 🎨 ────────────────────────────────
  "boss-10": (
    <g>
      <defs>
        <linearGradient id="bs-art" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eeb2d6" />
          <stop offset="1" stopColor="#d98ab8" />
        </linearGradient>
      </defs>
      {/* cavalete */}
      <g transform="translate(6 96)" stroke="#a08068" strokeWidth={3} strokeLinecap="round">
        <path d="M0 0 L10 -26" />
        <path d="M24 0 L14 -26" />
        <path d="M-4 0 L28 0" />
      </g>
      <rect x={4} y={64} width={22} height={30} rx={2} fill="#fdf6ea" stroke="#d8c9ae" strokeWidth={2} />
      <path d="M8 70 q4 -6 8 0 q4 6 8 0 l0 6 q-8 -3 -16 0 z" fill="#e5484d" />
      <circle cx={20} cy={82} r={2.6} fill="#4a90d9" />
      {/* paleta */}
      <g transform="translate(92 76)">
        <ellipse cx={0} cy={0} rx={20} ry={15} fill="#d9c9a0" stroke="#b9a98a" strokeWidth={2.6} />
        <circle cx={-11} cy={-4} r={3.2} fill="#e5484d" />
        <circle cx={-2} cy={-8} r={3.2} fill="#e9b44c" />
        <circle cx={7} cy={-6} r={3.2} fill="#4a90d9" />
        <circle cx={12} cy={4} r={3.2} fill="#6fbf73" />
        <circle cx={-6} cy={7} r={3.2} fill="#8b5fc9" />
      </g>
      {/* pincel */}
      <g transform="translate(88 26) rotate(38)">
        <rect x={0} y={0} width={4} height={26} rx={2} fill="#a08068" />
        <path d="M-1 -2 q2 -7 6 -2 q-1 4 -6 2 z" fill="#8b5fc9" />
      </g>
      {/* corpo (smoking de pintor) */}
      <ellipse cx={56} cy={80} rx={38} ry={38} fill="url(#bs-art)" />
      {/* gola */}
      <path d="M32 58 L56 66 L80 58 L80 66 L56 78 L32 66 z" fill="#f4f0e6" />
      <path d="M42 56 L56 62 L70 56" stroke="#c06a9f" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {/* boina */}
      <path d="M30 44 Q34 26 60 24 Q86 26 90 44 Q70 34 60 36 Q48 34 30 44 z" fill="#5b3a56" />
      <circle cx={60} cy={24} r={3.6} fill="#e9b44c" />
      <Face cx={60} mouth="smug" eye="#4a3043" cheek="#f6c3d8" />
      {/* bigode fino */}
      <path d="M46 80 Q60 87 74 80" stroke="#4a3043" strokeWidth={3.2} fill="none" strokeLinecap="round" />
      {/* respingos */}
      <circle cx={26} cy={108} r={3} fill="#e5484d" opacity={0.8} />
      <circle cx={44} cy={112} r={2.4} fill="#4a90d9" opacity={0.8} />
      <circle cx={70} cy={110} r={2.8} fill="#e9b44c" opacity={0.8} />
    </g>
  ),

  // ── 11 · Le Génie des Mots 🧞 ────────────────────────────────
  "boss-11": (
    <g>
      <defs>
        <linearGradient id="bs-gen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9dbcf8" />
          <stop offset="1" stopColor="#5f86d4" />
        </linearGradient>
        <linearGradient id="bs-lamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="1" stopColor="#d8a33d" />
        </linearGradient>
      </defs>
      {/* varinha */}
      <g transform="translate(98 30)">
        <path d="M-4 14 L8 2" stroke="#e9b44c" strokeWidth={3.6} strokeLinecap="round" />
        <path d="M9 -1 l2.2 4.6 4.6 2.2 -4.6 2.2 -2.2 4.6 -2.2 -4.6 -4.6 -2.2 4.6 -2.2 z" fill="#ffe28a" />
      </g>
      {/* estrelinhas */}
      <path d="M18 22 l1.8 3.8 3.8 1.8 -3.8 1.8 -1.8 3.8 -1.8 -3.8 -3.8 -1.8 3.8 -1.8 z" fill="#ffe28a" />
      <path d="M108 66 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 z" fill="#ffe28a" />
      {/* lâmpada */}
      <g transform="translate(16 92)">
        <path d="M10 0 q14 -3 18 -16 q-6 5 -13 5 q-8 0 -11 -7 q-5 12 6 18 z" fill="url(#bs-lamp)" stroke="#b9842b" strokeWidth={2.6} />
        <path d="M4 0 q12 3 24 0" stroke="#b9842b" strokeWidth={2.6} fill="none" />
        <path d="M14 -16 q-2 -6 2 -10" stroke="#c9d4f2" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </g>
      {/* cauda */}
      <path d="M28 90 Q12 84 18 66 Q28 76 38 74 Q34 84 28 90 z" fill="#5f86d4" />
      {/* corpo */}
      <path d="M32 92 Q22 60 42 46 Q62 36 82 46 Q102 60 92 92 Q62 106 32 92 z" fill="url(#bs-gen)" />
      {/* peitoral */}
      <path d="M42 62 Q62 52 82 62" stroke="#4a6cb8" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* braços cruzados + braceletes */}
      <path d="M36 68 Q46 76 50 68" stroke="#4a6cb8" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M88 68 Q78 76 74 68" stroke="#4a6cb8" strokeWidth={6} fill="none" strokeLinecap="round" />
      <rect x={30} y={76} width={7} height={4} rx={2} fill="#e9b44c" />
      <rect x={87} y={76} width={7} height={4} rx={2} fill="#e9b44c" />
      {/* turbante */}
      <path d="M38 46 Q42 30 60 30 Q78 30 82 46 Q60 38 38 46 z" fill="#f4f0e6" />
      <path d="M40 44 Q60 34 80 44" stroke="#d9d0c0" strokeWidth={3} fill="none" />
      <circle cx={60} cy={41} r={5} fill="#e5484d" />
      <circle cx={60} cy={41} r={1.8} fill="#fff" opacity={0.8} />
      {/* pluma */}
      <path d="M66 32 Q72 20 80 18 Q74 26 76 32 z" fill="#e5484d" />
      {/* orelhas pontudas */}
      <path d="M30 52 L20 44 L28 58 z" fill="#9dbcf8" />
      <path d="M90 52 L100 44 L92 58 z" fill="#9dbcf8" />
      <Face cx={60} mouth="smug" eye="#2c4a7a" cheek="#bfd3f7" />
    </g>
  ),

  // ── 12 · L'Animatrice du JT 📺 ───────────────────────────────
  "boss-12": (
    <g>
      <defs>
        <linearGradient id="bs-tv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a6b0c2" />
          <stop offset="1" stopColor="#6f7789" />
        </linearGradient>
        <linearGradient id="bs-scr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef3fb" />
          <stop offset="1" stopColor="#c4d4ea" />
        </linearGradient>
      </defs>
      {/* ondas de transmissão */}
      <path d="M8 56 q-8 -8 0 -16" stroke="#a2aec6" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      <path d="M112 56 q8 -8 0 -16" stroke="#a2aec6" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      {/* antena */}
      <path d="M88 30 L98 12" stroke="#6f7789" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={99} cy={10} r={4.4} fill="#e5484d" />
      <circle cx={99} cy={10} r={1.8} fill="#fff" opacity={0.85} />
      {/* caixa */}
      <rect x={16} y={32} width={88} height={58} rx={10} fill="url(#bs-tv)" stroke="#59616f" strokeWidth={3} />
      <rect x={48} y={90} width={24} height={12} rx={3} fill="#59616f" />
      <rect x={42} y={100} width={36} height={5} rx={2.5} fill="#59616f" />
      {/* tela */}
      <rect x={26} y={42} width={68} height={40} rx={6} fill="url(#bs-scr)" />
      {/* vinheta LIVE */}
      <rect x={60} y={34} width={26} height={10} rx={3} fill="#e5484d" />
      <text x={73} y={41.5} fontSize={7.5} fontWeight={800} fill="#fff" textAnchor="middle">LIVE</text>
      {/* rosto na tela */}
      <ellipse cx={60} cy={64} rx={23} ry={17} fill="#e8c39a" />
      <path d="M40 58 Q46 42 60 42 Q74 42 80 58 L80 52 Q74 36 60 36 Q46 36 40 52 z" fill="#8b5a3c" />
      <g>
        <circle cx={51} cy={66} r={4} fill="#3a2c20" />
        <circle cx={69} cy={66} r={4} fill="#3a2c20" />
        <circle cx={52.4} cy={64.6} r={1.4} fill="#fff" />
        <circle cx={70.4} cy={64.6} r={1.4} fill="#fff" />
      </g>
      <g stroke="#3a2c20" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M44 58 L51 62" />
        <path d="M76 58 L69 62" />
      </g>
      <path d="M54 74 Q60 70 66 74" stroke="#3a2c20" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {/* microfone */}
      <g transform="translate(14 74)">
        <line x1={0} y1={6} x2={0} y2={28} stroke="#59616f" strokeWidth={3.2} />
        <ellipse cx={0} cy={4} rx={5.5} ry={7.5} fill="#39406b" />
        <rect x={-6} y={10} width={12} height={4.5} rx={2.2} fill="#a2aec6" />
        <path d="M-5 2 q-4 -3 -6 0" stroke="#39406b" strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    </g>
  ),

  // ── 13 · Le Censeur des Registres ⚖️ ─────────────────────────
  "boss-13": (
    <g>
      <defs>
        <linearGradient id="bs-rob" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cdd7e0" />
          <stop offset="1" stopColor="#9aa9b8" />
        </linearGradient>
      </defs>
      {/* balança */}
      <g stroke="#8f9dad" strokeWidth={3} strokeLinecap="round">
        <line x1={20} y1={30} x2={100} y2={30} strokeWidth={4.5} />
        <path d="M54 30 L66 30 L60 36 z" fill="#8f9dad" stroke="none" />
        <line x1={33} y1={30} x2={33} y2={48} />
        <line x1={87} y1={30} x2={87} y2={48} />
        <path d="M22 48 h22 l-7 12 h-8 z" fill="#e9c15c" stroke="none" />
        <path d="M76 48 h22 l-7 12 h-8 z" fill="#e9c15c" stroke="none" />
      </g>
      {/* antena */}
      <path d="M60 52 L60 42" stroke="#9aa9b8" strokeWidth={3.4} strokeLinecap="round" />
      <circle cx={60} cy={40} r={4.2} fill="#e5484d" />
      <circle cx={60} cy={40} r={1.6} fill="#fff" opacity={0.85} />
      {/* corpo do robô */}
      <ellipse cx={60} cy={92} rx={42} ry={24} fill="url(#bs-rob)" />
      {/* cabeça */}
      <rect x={30} y={56} width={60} height={28} rx={10} fill="url(#bs-rob)" stroke="#8493a4" strokeWidth={2.6} />
      {/* viseira */}
      <rect x={38} y={62} width={44} height={14} rx={6} fill="#2f3b4d" />
      <g fill="#9fe8ff">
        <rect x={44} y={66} width={10} height={6} rx={2} />
        <rect x={66} y={66} width={10} height={6} rx={2} />
      </g>
      {/* parafusos */}
      <circle cx={34} cy={70} r={1.8} fill="#8493a4" />
      <circle cx={86} cy={70} r={1.8} fill="#8493a4" />
      {/* boca-grade */}
      <g stroke="#2f3b4d" strokeWidth={2.6} strokeLinecap="round">
        <line x1={48} y1={84} x2={72} y2={84} />
        <line x1={52} y1={88} x2={68} y2={88} />
      </g>
      {/* gola de juiz */}
      <path d="M44 84 L60 92 L76 84 L76 88 L60 96 L44 88 z" fill="#f4f0e6" />
      <circle cx={60} cy={92} r={2.2} fill="#e5484d" />
      {/* braços */}
      <path d="M20 90 q-6 10 -2 18" stroke="#9aa9b8" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M100 90 q6 10 2 18" stroke="#9aa9b8" strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* peitoral */}
      <rect x={50} y={98} width={20} height={10} rx={4} fill="#8493a4" />
      <rect x={54} y={101} width={12} height={4} rx={2} fill="#5f86d4" />
    </g>
  ),

  // ── 14 · Le Débatteur Sans Pitié 🥊 ──────────────────────────
  "boss-14": (
    <g>
      <defs>
        <linearGradient id="bs-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f58b90" />
          <stop offset="1" stopColor="#e5484d" />
        </linearGradient>
      </defs>
      {/* linhas de velocidade */}
      <path d="M6 40 L18 44" stroke="#f0a0a4" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <path d="M6 52 L16 55" stroke="#f0a0a4" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      {/* bolha de raiva */}
      <circle cx={16} cy={22} r={9} fill="#ffe0a8" />
      <text x={16} y={26} fontSize={13} fontWeight={800} fill="#c93a3f" textAnchor="middle">!</text>
      {/* luva de trás */}
      <circle cx={82} cy={52} r={14} fill="#e5484d" stroke="#c93a3f" strokeWidth={3} />
      {/* braço de trás */}
      <path d="M74 58 q-8 8 -18 6" stroke="#e5484d" strokeWidth={8} fill="none" strokeLinecap="round" />
      {/* corpo */}
      <ellipse cx={56} cy={84} rx={40} ry={36} fill="url(#bs-box)" />
      <ellipse cx={56} cy={96} rx={26} ry={16} fill="#f5969b" />
      {/* faixa */}
      <rect x={20} y={68} width={72} height={10} rx={5} fill="#c93a3f" />
      {/* estrela */}
      <path d="M56 56 l2.6 5.2 5.2 2.6 -5.2 2.6 -2.6 5.2 -2.6 -5.2 -5.2 -2.6 5.2 -2.6 z" fill="#ffe0a8" />
      {/* calção */}
      <path d="M30 104 l8 10 h36 l8 -10 q-26 8 -52 0 z" fill="#c93a3f" />
      <rect x={42} y={102} width={28} height={6} rx={3} fill="#a83337" />
      {/* cabeça */}
      <ellipse cx={56} cy={38} rx={26} ry={24} fill="#e8b48c" />
      {/* bandana */}
      <path d="M32 32 Q56 20 80 32 L80 28 Q56 16 32 28 z" fill="#3d4a63" />
      <path d="M80 28 q10 -2 14 -8 q-8 2 -10 8 z" fill="#3d4a63" />
      {/* olhos + sobrancelhas bravas */}
      <g>
        <circle cx={46} cy={40} r={5} fill="#3a2320" />
        <circle cx={66} cy={40} r={5} fill="#3a2320" />
        <circle cx={47.6} cy={38.4} r={1.6} fill="#fff" />
        <circle cx={67.6} cy={38.4} r={1.6} fill="#fff" />
      </g>
      <g stroke="#3a2320" strokeWidth={3.6} strokeLinecap="round" fill="none">
        <path d="M38 30 L48 36" />
        <path d="M74 30 L64 36" />
      </g>
      {/* boca gritando */}
      <ellipse cx={56} cy={52} rx={8} ry={7} fill="#3a2320" />
      <path d="M49 47 q7 -3 14 0 l-2 3 q-5 -2 -10 0 z" fill="#fff" />
      <ellipse cx={30} cy={48} rx={4.4} ry={2.8} fill="#ffc9cc" opacity={0.9} />
      <ellipse cx={82} cy={48} rx={4.4} ry={2.8} fill="#ffc9cc" opacity={0.9} />
      {/* luva da frente */}
      <circle cx={94} cy={76} r={16} fill="#fff" stroke="#d8dde6" strokeWidth={3} />
      <path d="M84 84 q-4 8 2 14" stroke="#d8dde6" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M88 66 q10 2 13 8" stroke="#e5484d" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M86 72 h16" stroke="#e5484d" strokeWidth={3} strokeLinecap="round" />
    </g>
  ),

  // ── 15 · Le Roi du Verlan 👑 ─────────────────────────────────
  "boss-15": (
    <g>
      <defs>
        <linearGradient id="bs-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b18fe0" />
          <stop offset="1" stopColor="#8b5fc9" />
        </linearGradient>
        <linearGradient id="bs-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe28a" />
          <stop offset="1" stopColor="#e9b44c" />
        </linearGradient>
      </defs>
      {/* bolha de fala */}
      <g transform="translate(96 18)">
        <rect x={-18} y={-9} width={36} height={16} rx={8} fill="#fff" stroke="#c9c3f0" strokeWidth={2.4} />
        <path d="M-6 7 l-3 6 8 -6 z" fill="#fff" stroke="#c9c3f0" strokeWidth={2.4} strokeLinejoin="round" />
        <text x={0} y={3.5} fontSize={9} fontWeight={800} fill="#8b5fc9" textAnchor="middle">ouf</text>
      </g>
      {/* capa */}
      <path d="M18 88 Q32 122 60 122 Q88 122 102 88 Q60 106 18 88 z" fill="url(#bs-robe)" />
      {/* ceptro */}
      <g transform="translate(96 56)">
        <line x1={0} y1={8} x2={0} y2={56} stroke="#e9b44c" strokeWidth={4.4} strokeLinecap="round" />
        <circle cx={0} cy={2} r={7.5} fill="url(#bs-crown)" stroke="#c9842b" strokeWidth={2.4} />
        <path d="M0 -7 l2.6 4.6 4.6 2.2 -4.6 2.2 -2.6 4.6 -2.6 -4.6 -4.6 -2.2 4.6 -2.2 z" fill="#fff" opacity={0.95} />
      </g>
      {/* manto */}
      <ellipse cx={60} cy={84} rx={42} ry={38} fill="url(#bs-robe)" />
      {/* gola de arminho */}
      <path d="M28 60 Q60 76 92 60 L92 72 Q60 88 28 72 z" fill="#f4f0e6" />
      <circle cx={40} cy={70} r={2} fill="#8f8fa0" />
      <circle cx={60} cy={77} r={2} fill="#8f8fa0" />
      <circle cx={80} cy={70} r={2} fill="#8f8fa0" />
      {/* brasão */}
      <path d="M56 92 l4 -4 4 4 -4 4 z" fill="#ffe28a" />
      {/* cabeça */}
      <ellipse cx={60} cy={40} rx={26} ry={24} fill="#e8c39a" />
      {/* cabelo */}
      <path d="M34 40 Q36 18 60 18 Q84 18 86 40 L86 36 Q84 14 60 14 Q36 14 34 36 z" fill="#4a4238" />
      {/* coroa */}
      <g>
        <path d="M34 34 L34 22 L42 30 L50 18 L58 28 L66 18 L74 30 L82 22 L82 34 z" fill="url(#bs-crown)" stroke="#c9842b" strokeWidth={2.6} />
        <rect x={32} y={32} width={52} height={8} rx={3.5} fill="url(#bs-crown)" stroke="#c9842b" strokeWidth={2.4} />
        <circle cx={42} cy={27} r={2.8} fill="#e5484d" />
        <circle cx={60} cy={25} r={3.2} fill="#4a90d9" />
        <circle cx={78} cy={27} r={2.8} fill="#6fbf73" />
      </g>
      <Face cx={60} mouth="smug" eye="#4a3043" cheek="#f2d3ae" />
      <ellipse cx={34} cy={46} rx={4.4} ry={2.8} fill="#f2d3ae" opacity={0.9} />
      <ellipse cx={86} cy={46} rx={4.4} ry={2.8} fill="#f2d3ae" opacity={0.9} />
    </g>
  )
};

// ══════════════════════════════════════════════════════════════
// Poses do chefe: idle · hurt · low (HP<30%) · defeated · attack
// O overlay de rosto usa a âncora de cada chefe (alguns têm o rosto
// fora do padrão, ex.: o boxeador tem a cabeça lá em cima).
// ══════════════════════════════════════════════════════════════
export type BossPose = "idle" | "hurt" | "low" | "defeated" | "attack";

type FaceAnchor = { x: number; ey: number; my: number; mouth: boolean };

const FACE_ANCHOR: Record<string, FaceAnchor> = {
  "boss-4": { x: 60, ey: 62, my: 88, mouth: true },
  "boss-7": { x: 60, ey: 69, my: 78, mouth: false },
  "boss-8": { x: 60, ey: 68, my: 84, mouth: true },
  "boss-12": { x: 60, ey: 66, my: 74, mouth: true },
  "boss-13": { x: 60, ey: 66, my: 84, mouth: true },
  "boss-14": { x: 56, ey: 40, my: 52, mouth: true }
};

const anchorOf = (id: string): FaceAnchor => FACE_ANCHOR[id] ?? { x: 60, ey: 67, my: 87, mouth: true };

/** Pose de HP baixo: olhos apertados, sobrancelhas de tensão, boca torta e gota de suor. */
function LowPose({ id }: { id: string }) {
  const { x, ey, my, mouth } = anchorOf(id);
  return (
    <g>
      <g stroke="#24141c" strokeWidth={4} strokeLinecap="round" fill="none">
        <path d={`M${x - 26} ${ey - 11} L${x - 5} ${ey - 1}`} />
        <path d={`M${x + 26} ${ey - 11} L${x + 5} ${ey - 1}`} />
        <path d={`M${x - 23} ${ey - 4} Q${x - 14} ${ey - 9} ${x - 5} ${ey - 3}`} />
        <path d={`M${x + 5} ${ey - 3} Q${x + 14} ${ey - 9} ${x + 23} ${ey - 4}`} />
        <path d={`M${x - 21} ${ey + 5} Q${x - 14} ${ey + 9} ${x - 7} ${ey + 4}`} />
        <path d={`M${x + 7} ${ey + 4} Q${x + 14} ${ey + 9} ${x + 21} ${ey + 5}`} />
      </g>
      {mouth && <path d={`M${x - 9} ${my} q4 -5 9 0 q5 5 9 0`} stroke="#24141c" strokeWidth={3.6} strokeLinecap="round" fill="none" />}
      <path d={`M${x - 36} ${ey - 14} q3.4 6.4 0 9.6 q-3.4 -3.2 0 -9.6 z`} fill="#9fd7ff" stroke="#5aa9e0" strokeWidth={1.4} />
    </g>
  );
}

/** Pose de derrota: olhos em X, boca caída, fumaça subindo e tontura (o tilt vem do CSS). */
function DefeatPose({ id }: { id: string }) {
  const { x, ey, my, mouth } = anchorOf(id);
  return (
    <g>
      <g stroke="#24141c" strokeWidth={4.2} strokeLinecap="round">
        <path d={`M${x - 21} ${ey - 7} L${x - 7} ${ey + 7}`} />
        <path d={`M${x - 7} ${ey - 7} L${x - 21} ${ey + 7}`} />
        <path d={`M${x + 7} ${ey - 7} L${x + 21} ${ey + 7}`} />
        <path d={`M${x + 21} ${ey - 7} L${x + 7} ${ey + 7}`} />
      </g>
      {mouth && <path d={`M${x - 10} ${my + 4} Q${x} ${my + 11} ${x + 10} ${my + 4}`} stroke="#24141c" strokeWidth={3.4} strokeLinecap="round" fill="none" />}
      <g className="boss-smoke" fill="#aeb6c4">
        <circle cx={x - 32} cy={20} r={6.5} opacity={0.9} />
        <circle cx={x - 18} cy={9} r={5} opacity={0.65} />
        <circle cx={x + 26} cy={15} r={5.6} opacity={0.75} />
      </g>
      <g transform={`translate(${x + 37} ${ey - 16})`} fill="#e9c15c" opacity={0.95}>
        <path d="M0 -7 l1.9 4 4 1.9 -4 1.9 -1.9 4 -1.9 -4 -4 -1.9 4 -1.9 z" />
      </g>
    </g>
  );
}

/** Ataque de cada chefe (dispara quando o aluno erra um exercício). */
const ATTACK_FX: Record<string, ReactNode> = {
  // dragão solta fogo pela boca
  "boss-1": (
    <g className="boss-fx">
      <path d="M32 82 Q14 66 5 76 Q13 80 7 92 Q24 88 33 95 z" fill="#f08a3c" />
      <path d="M29 84 Q18 75 11 80 Q19 82 15 89 Q26 86 31 91 z" fill="#ffc37a" />
      <path d="M27 86 Q20 81 17 85 Q23 83 26 89 z" fill="#fff3c0" />
      <path d="M88 82 Q106 66 115 76 Q107 80 113 92 Q96 88 87 95 z" fill="#f08a3c" />
      <path d="M91 84 Q102 75 109 80 Q101 82 105 89 Q94 86 89 91 z" fill="#ffc37a" />
      <path d="M93 86 Q100 81 103 85 Q97 83 94 89 z" fill="#fff3c0" />
    </g>
  ),
  // croissant espalha migalhas
  "boss-2": (
    <g className="boss-fx">
      <circle cx={28} cy={24} r={3} fill="#e09a38" />
      <circle cx={42} cy={13} r={2.4} fill="#eeb95f" />
      <circle cx={86} cy={17} r={2.8} fill="#e09a38" />
      <circle cx={99} cy={30} r={2.2} fill="#eeb95f" />
      <path d="M20 32 q3 -5 7 -2 q-2 4 -7 2 z" fill="#ffe9b8" />
      <path d="M92 22 q4 -4 8 -1 q-3 4 -8 1 z" fill="#ffe9b8" />
      <path d="M62 10 l1.8 3.6 3.6 1.8 -3.6 1.8 -1.8 3.6 -1.8 -3.6 -3.6 -1.8 3.6 -1.8 z" fill="#f6c879" />
    </g>
  ),
  // metrô apita com vapor
  "boss-3": (
    <g className="boss-fx">
      <text x={60} y={24} fontSize={11} fontWeight={900} fill="#e5484d" textAnchor="middle" fontStyle="italic">TUT!</text>
      <g stroke="#ffe28a" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.9}>
        <path d="M14 42 q-7 -6 0 -12" />
        <path d="M106 42 q7 -6 0 -12" />
      </g>
      <g fill="#dfe6f2" opacity={0.85}>
        <circle cx={94} cy={18} r={5} />
        <circle cx={103} cy={9} r={3.6} />
      </g>
    </g>
  ),
  // falador manda BLA BLA
  "boss-4": (
    <g className="boss-fx">
      <g transform="translate(14 20)">
        <rect x={-17} y={-8} width={34} height={15} rx={7.5} fill="#fff" stroke="#9672dd" strokeWidth={2.2} />
        <path d="M-6 6 l-3 6 8 -6 z" fill="#fff" stroke="#9672dd" strokeWidth={2.2} strokeLinejoin="round" />
        <text x={0} y={2.5} fontSize={7.5} fontWeight={800} fill="#8b6fd0" textAnchor="middle">BLA</text>
      </g>
      <g transform="translate(98 36)">
        <rect x={-14} y={-7} width={28} height={13} rx={6.5} fill="#fff" stroke="#9672dd" strokeWidth={2.2} />
        <path d="M-5 5 l-2.5 5 7 -5 z" fill="#fff" stroke="#9672dd" strokeWidth={2.2} strokeLinejoin="round" />
        <text x={0} y={2} fontSize={7} fontWeight={800} fill="#8b6fd0" textAnchor="middle">!</text>
      </g>
    </g>
  ),
  // fantasma solta um OUUI
  "boss-5": (
    <g className="boss-fx">
      <g transform="translate(24 20)">
        <rect x={-18} y={-8} width={36} height={15} rx={7.5} fill="#fff" stroke="#aab3e8" strokeWidth={2.2} />
        <path d="M-6 6 l-3 6 8 -6 z" fill="#fff" stroke="#aab3e8" strokeWidth={2.2} strokeLinejoin="round" />
        <text x={0} y={2.5} fontSize={7.5} fontWeight={800} fill="#6a74c4" textAnchor="middle">OUUU!</text>
      </g>
      <g stroke="#c6cdf2" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M100 40 q8 -6 0 -12" />
        <path d="M104 54 q9 -7 0 -14" />
      </g>
    </g>
  ),
  // coração espalha cacos
  "boss-6": (
    <g className="boss-fx">
      <path d="M26 28 l6 4 l-3 7 l-6 -4 z" fill="#a8e2f5" stroke="#7cc7e8" strokeWidth={1.8} />
      <path d="M96 24 l5 5 l-4 6 l-5 -5 z" fill="#bfe9f7" stroke="#7cc7e8" strokeWidth={1.8} />
      <path d="M13 86 l5 4 l-3 6 l-5 -4 z" fill="#a8e2f5" stroke="#7cc7e8" strokeWidth={1.8} />
      <path d="M103 88 l4 5 l-3 6 l-4 -5 z" fill="#bfe9f7" stroke="#7cc7e8" strokeWidth={1.8} />
      <path d="M60 10 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4 z" fill="#d8f4fd" />
    </g>
  ),
  // coruja bate o livro
  "boss-7": (
    <g className="boss-fx">
      <circle cx={16} cy={26} r={9} fill="#fff" stroke="#7d5fb0" strokeWidth={2.4} />
      <text x={16} y={30} fontSize={13} fontWeight={800} fill="#7d5fb0" textAnchor="middle">!</text>
      <g stroke="#a989d6" strokeWidth={3} strokeLinecap="round">
        <path d="M96 66 q8 -4 4 -12" />
        <path d="M98 80 q9 -5 3 -13" />
      </g>
    </g>
  ),
  // diretor bate o carimbo NON
  "boss-8": (
    <g className="boss-fx">
      <g transform="translate(24 24) rotate(-8)">
        <rect x={-17} y={-9} width={34} height={17} rx={3} fill="#e5484d" opacity={0.92} />
        <text x={0} y={3.5} fontSize={10} fontWeight={900} fill="#fff" textAnchor="middle">NON!</text>
      </g>
      <g stroke="#4a4238" strokeWidth={2.6} strokeLinecap="round">
        <path d="M40 22 l-6 -6 M38 30 l-8 2" />
        <path d="M80 22 l6 -6 M82 30 l8 2" />
      </g>
    </g>
  ),
  // esfinge lança a pergunta
  "boss-9": (
    <g className="boss-fx">
      <g transform="translate(98 16)">
        <path d="M0 -7 q7 -9 13 0 q0 5 -5 7 q-4 2 -4 5" stroke="#d9a95f" strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <circle cx={2} cy={11} r={2.6} fill="#d9a95f" />
      </g>
      <g fill="#e3c088" opacity={0.9}>
        <circle cx={18} cy={58} r={2.6} />
        <circle cx={12} cy={72} r={2} />
        <circle cx={104} cy={54} r={2.4} />
      </g>
    </g>
  ),
  // crítica espalha tinta
  "boss-10": (
    <g className="boss-fx">
      <circle cx={24} cy={22} r={5} fill="#e5484d" />
      <circle cx={34} cy={14} r={3} fill="#4a90d9" />
      <circle cx={90} cy={18} r={4.4} fill="#e9b44c" />
      <circle cx={103} cy={30} r={3} fill="#6fbf73" />
      <path d="M17 34 q4 -3 7 0 q-2 4 -7 0 z" fill="#8b5fc9" />
      <path d="M96 40 q4 -3 8 0 q-3 4 -8 0 z" fill="#e5484d" />
      <circle cx={60} cy={10} r={3.6} fill="#8b5fc9" />
    </g>
  ),
  // gênio solta faíscas
  "boss-11": (
    <g className="boss-fx">
      <g fill="#ffe28a">
        <path d="M20 28 l2 4.4 4.4 2 -4.4 2 -2 4.4 -2 -4.4 -4.4 -2 4.4 -2 z" />
        <path d="M98 18 l1.8 3.8 3.8 1.8 -3.8 1.8 -1.8 3.8 -1.8 -3.8 -3.8 -1.8 3.8 -1.8 z" />
        <path d="M60 8 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 z" />
      </g>
      <path d="M16 14 q2 4 0 8" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.9} />
    </g>
  ),
  // apresentadora solta BIP
  "boss-12": (
    <g className="boss-fx">
      <g transform="translate(32 18) rotate(-6)">
        <rect x={-16} y={-8} width={32} height={15} rx={7.5} fill="#39406b" />
        <text x={0} y={2.5} fontSize={8} fontWeight={800} fill="#fff" textAnchor="middle">BIP!</text>
      </g>
      <g stroke="#e5484d" strokeWidth={3} strokeLinecap="round" opacity={0.9}>
        <path d="M96 42 q7 -5 0 -10" />
        <path d="M100 54 q8 -6 0 -12" />
      </g>
    </g>
  ),
  // robô dispara laser
  "boss-13": (
    <g className="boss-fx">
      <text x={60} y={16} fontSize={9} fontWeight={900} fill="#ff4d5e" textAnchor="middle" fontStyle="italic">ERREUR!</text>
      <line x1={60} y1={70} x2={112} y2={26} stroke="#ff4d5e" strokeWidth={3.4} strokeLinecap="round" />
      <line x1={60} y1={70} x2={100} y2={14} stroke="#ff8fa0" strokeWidth={2} strokeLinecap="round" />
      <circle cx={112} cy={26} r={4} fill="#ff4d5e" />
      <circle cx={100} cy={14} r={3} fill="#ff8fa0" />
    </g>
  ),
  // boxeador desfere o golpe
  "boss-14": (
    <g className="boss-fx">
      <g transform="translate(38 14)">
        <circle cx={0} cy={0} r={17} fill="#fff" stroke="#d8dde6" strokeWidth={3.4} />
        <path d="M-10 10 q-5 9 2 15" stroke="#d8dde6" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M-6 -8 q10 2 13 9" stroke="#e5484d" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-8 -2 h17" stroke="#e5484d" strokeWidth={3} strokeLinecap="round" />
      </g>
      <g stroke="#f0a0a4" strokeWidth={3} strokeLinecap="round">
        <path d="M64 6 l6 -5 M76 2 l4 -7 M88 8 l9 -3" opacity={0.9} />
      </g>
      <text x={60} y={110} fontSize={12} fontWeight={900} fill="#c93a3f" textAnchor="middle" fontStyle="italic">BOUM!</text>
    </g>
  ),
  // rei dispara OUF!
  "boss-15": (
    <g className="boss-fx">
      <g transform="translate(20 26)">
        <rect x={-15} y={-8} width={30} height={15} rx={7.5} fill="#fff" stroke="#c9c3f0" strokeWidth={2.4} />
        <path d="M-5 6 l-3 6 8 -6 z" fill="#fff" stroke="#c9c3f0" strokeWidth={2.4} strokeLinejoin="round" />
        <text x={0} y={2.5} fontSize={8} fontWeight={800} fill="#8b5fc9" textAnchor="middle">OUF!</text>
      </g>
      <g fill="#ffe28a">
        <path d="M96 44 l2 4.2 4.2 2 -4.2 2 -2 4.2 -2 -4.2 -4.2 -2 4.2 -2 z" />
        <path d="M108 30 l1.5 3.2 3.2 1.5 -3.2 1.5 -1.5 3.2 -1.5 -3.2 -3.2 -1.5 3.2 -1.5 z" />
      </g>
    </g>
  )
};

/** Rótulo do ataque de cada chefe (aparece no flash quando o aluno erra). */
export const BOSS_ATTACK_LABEL: Record<string, string> = {
  "boss-1": "RAWR! 🔥",
  "boss-2": "Crumbs everywhere! 🥐",
  "boss-3": "TUT TUT! 🚇",
  "boss-4": "BLA BLA BLA! 💬",
  "boss-5": "OUUU! 👻",
  "boss-6": "Shards! 💔",
  "boss-7": "Read this! 📖",
  "boss-8": "NON! 💼",
  "boss-9": "Think! 🦁",
  "boss-10": "Splatter! 🎨",
  "boss-11": "Abracadabra! 🧞",
  "boss-12": "BIP! 📺",
  "boss-13": "ERREUR! ⚖️",
  "boss-14": "BOUM! 🥊",
  "boss-15": "OUF! 👑"
};

export function BossSprite({
  bossId,
  size = 96,
  className = "",
  pose = "idle",
  hurt = false
}: {
  bossId: string;
  size?: number;
  className?: string;
  pose?: BossPose;
  hurt?: boolean;
}) {
  const cls = ["boss-sprite"];
  if (pose === "hurt" || hurt) cls.push("boss-hurt");
  if (pose === "low") cls.push("boss-low");
  if (pose === "defeated") cls.push("boss-defeated");
  if (pose === "attack") cls.push("boss-attacking");
  if (className) cls.push(className);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cls.join(" ")}
      role="img"
      aria-label={`Sprite do chefe ${bossId} — pose ${pose}`}
    >
      <g className="boss-body">{SPRITES[bossId] ?? <circle cx={60} cy={60} r={40} fill="#d9c9a0" />}</g>
      {pose === "low" && <LowPose id={bossId} />}
      {pose === "defeated" && <DefeatPose id={bossId} />}
      {pose === "attack" && (ATTACK_FX[bossId] ?? <DefeatPose id={bossId} />)}
    </svg>
  );
}
