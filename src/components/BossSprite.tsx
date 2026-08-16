// ══════════════════════════════════════════════════════════════
// Athenas — Sprites exclusivos de cada chefe (SVG fofinho estilo mascote)
// Cada chefe tem corpo, cores e acessórios próprios, com a mesma
// "cara brava porém fofa" da Lulu. A animação de flutuação e a de
// dano (hurt) ficam em global.css (.boss-sprite / .boss-hurt).
// ══════════════════════════════════════════════════════════════
import type { ReactNode } from "react";

type FaceProps = {
  eye?: string;
  cheek?: string;
  fangs?: boolean;
  smug?: boolean;
};

/** Cara padrão: olhos bravos (pupila + sobrancelha inclinada) e boca aberta gritando. */
function AngryFace({ eye = "#3d2f3a", cheek = "#ffb3c8", fangs = false, smug = false }: FaceProps) {
  return (
    <g>
      {/* sobrancelhas inclinadas */}
      <g stroke={eye} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M40 56 L52 61" />
        <path d="M80 56 L68 61" />
      </g>
      {/* olhos */}
      <g fill={eye}>
        <circle cx={46} cy={67} r={4.4} />
        <circle cx={74} cy={67} r={4.4} />
        <circle cx={47.4} cy={65.4} r={1.5} fill="#fff" />
        <circle cx={75.4} cy={65.4} r={1.5} fill="#fff" />
      </g>
      {/* bochechas */}
      <ellipse cx={33} cy={77} rx={5.5} ry={3.4} fill={cheek} opacity={0.85} />
      <ellipse cx={87} cy={77} rx={5.5} ry={3.4} fill={cheek} opacity={0.85} />
      {/* boca gritando (ou sorriso cínico) */}
      {smug ? (
        <path d="M50 82 Q60 76 70 82 Q60 86 50 82" fill={eye} />
      ) : (
        <g>
          <ellipse cx={60} cy={84} rx={9.5} ry={8} fill={eye} />
          {fangs && (
            <g fill="#fff">
              <path d="M54 77 L57 82 L60 77 z" />
              <path d="M61 77 L63.5 81.5 L66 77 z" />
            </g>
          )}
        </g>
      )}
    </g>
  );
}

const SPRITES: Record<string, ReactNode> = {
  // 1 — Le Dragon du Vocabulaire 🐉
  "boss-1": (
    <g>
      {/* asas */}
      <path d="M14 62 Q4 50 12 34 Q20 46 24 40 Q18 56 26 60 z" fill="#4f9e54" />
      <path d="M106 62 Q116 50 108 34 Q100 46 96 40 Q102 56 94 60 z" fill="#4f9e54" />
      {/* cauda */}
      <path d="M96 92 Q116 96 108 112 L100 106 z" fill="#6fbf73" />
      {/* corpo */}
      <ellipse cx={60} cy={78} rx={44} ry={38} fill="#6fbf73" />
      <ellipse cx={60} cy={92} rx={26} ry={18} fill="#cdeecf" />
      {/* chifres */}
      <path d="M38 44 L32 24 L48 38 z" fill="#f2a65a" />
      <path d="M82 44 L88 24 L72 38 z" fill="#f2a65a" />
      {/* escamas */}
      <path d="M22 92 Q28 86 34 92" stroke="#4f9e54" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M86 92 Q92 86 98 92" stroke="#4f9e54" strokeWidth={3} fill="none" strokeLinecap="round" />
      <AngryFace eye="#2c4a30" cheek="#a8e6a8" fangs />
    </g>
  ),

  // 2 — Le Croissant Géant 🥐
  "boss-2": (
    <g>
      {/* crescentão */}
      <path
        d="M18 70 Q24 30 60 26 Q96 30 102 70 Q96 46 60 44 Q24 46 18 70 z"
        fill="#e8a33d"
        stroke="#c9842b"
        strokeWidth={3}
      />
      <path d="M28 66 Q36 42 60 39" stroke="#c9842b" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M92 66 Q84 42 60 39" stroke="#c9842b" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* farinhas */}
      <circle cx={34} cy={40} r={2} fill="#fff7e0" />
      <circle cx={84} cy={36} r={2.4} fill="#fff7e0" />
      <circle cx={104} cy={56} r={1.8} fill="#fff7e0" />
      {/* carinha no miolo */}
      <ellipse cx={60} cy={74} rx={30} ry={24} fill="#f6c879" />
      <AngryFace eye="#6b4a1f" cheek="#ffd9a3" />
    </g>
  ),

  // 3 — Le Métro Fou 🚇
  "boss-3": (
    <g>
      {/* antena */}
      <path d="M92 40 L100 24" stroke="#4a90d9" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={101} cy={22} r={4.5} fill="#ffe28a" />
      {/* corpo do vagão */}
      <rect x={14} y={42} width={92} height={46} rx={12} fill="#4a90d9" />
      {/* janela com o rosto */}
      <rect x={26} y={52} width={68} height={26} rx={8} fill="#cfe6ff" />
      {/* porta */}
      <line x1={60} y1={52} x2={60} y2={78} stroke="#9cc6ee" strokeWidth={2.5} />
      <AngryFace eye="#274e75" cheek="#b8d9f5" />
      {/* farol */}
      <circle cx={20} cy={84} r={5} fill="#ffe28a" />
      {/* rodas */}
      <circle cx={34} cy={92} r={7} fill="#2f3b4d" />
      <circle cx={86} cy={92} r={7} fill="#2f3b4d" />
      <circle cx={34} cy={91} r={2.4} fill="#8a93a6" />
      <circle cx={86} cy={91} r={2.4} fill="#8a93a6" />
    </g>
  ),

  // 4 — Le Grand Bavard 💬
  "boss-4": (
    <g>
      {/* bolhas de fala */}
      <circle cx={98} cy={26} r={9} fill="#e9e4fb" stroke="#b79bf2" strokeWidth={2.5} />
      <circle cx={12} cy={38} r={6} fill="#e9e4fb" stroke="#b79bf2" strokeWidth={2.5} />
      <text x={94} y={30} fontSize={13} fontWeight={700} fill="#8b6fd0" textAnchor="middle">!</text>
      {/* corpo */}
      <ellipse cx={60} cy={76} rx={42} ry={40} fill="#b79bf2" />
      <ellipse cx={60} cy={92} rx={24} ry={14} fill="#d6c8f8" />
      {/* bocão aberto */}
      <ellipse cx={60} cy={86} rx={18} ry={14} fill="#5b3a56" />
      <ellipse cx={60} cy={92} rx={11} ry={6} fill="#ff8fa3" />
      <path d="M44 76 Q60 70 76 76" stroke="#5b3a56" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* olhos bravos */}
      <g fill="#3d2f3a">
        <circle cx={46} cy={62} r={4.6} />
        <circle cx={74} cy={62} r={4.6} />
        <circle cx={47.4} cy={60.4} r={1.5} fill="#fff" />
        <circle cx={75.4} cy={60.4} r={1.5} fill="#fff" />
      </g>
      <g stroke="#3d2f3a" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M40 52 L52 57" />
        <path d="M80 52 L68 57" />
      </g>
      <ellipse cx={30} cy={72} rx={5.5} ry={3.4} fill="#ffb3c8" opacity={0.85} />
      <ellipse cx={90} cy={72} rx={5.5} ry={3.4} fill="#ffb3c8" opacity={0.85} />
    </g>
  ),

  // 5 — Le Train Fantôme 👻
  "boss-5": (
    <g>
      {/* corpo-fantasma */}
      <path
        d="M24 78 Q24 40 60 38 Q96 40 96 78 L96 108 Q88 100 80 108 Q72 100 64 108 Q56 100 48 108 Q40 100 32 108 L24 108 z"
        fill="#f2f2ff"
        stroke="#c9c9ec"
        strokeWidth={3}
      />
      {/* quepe de maquinista */}
      <path d="M40 40 Q60 26 80 40 L76 30 Q60 20 44 30 z" fill="#3b3b66" />
      <rect x={38} y={38} width={44} height={8} rx={4} fill="#3b3b66" />
      <circle cx={60} cy={41} r={3} fill="#e9b44c" />
      {/* apito */}
      <path d="M88 58 q10 -4 8 6 q-4 1 -7 1" fill="#d8a33d" stroke="#b9842b" strokeWidth={2} />
      {/* olhos ocos */}
      <g fill="#5b5b8f">
        <ellipse cx={46} cy={68} rx={5} ry={6.5} />
        <ellipse cx={74} cy={68} rx={5} ry={6.5} />
      </g>
      {/* boca */}
      <ellipse cx={60} cy={84} rx={7.5} ry={6.5} fill="#5b5b8f" />
      <ellipse cx={33} cy={80} rx={4.5} ry={3} fill="#ffb3c8" opacity={0.7} />
      <ellipse cx={87} cy={80} rx={4.5} ry={3} fill="#ffb3c8" opacity={0.7} />
    </g>
  ),

  // 6 — Le Cœur de Verre 💔
  "boss-6": (
    <g>
      {/* brilhos */}
      <path d="M22 30 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 z" fill="#bde8f7" />
      <path d="M100 26 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" fill="#bde8f7" />
      {/* coração de vidro */}
      <path
        d="M60 102 C38 84 20 70 20 50 C20 32 34 20 50 20 C58 20 60 24 60 30 C60 24 62 20 70 20 C86 20 100 32 100 50 C100 70 82 84 60 102 z"
        fill="#bfe9f7"
        stroke="#7cc7e8"
        strokeWidth={3}
      />
      {/* trincas */}
      <path d="M52 34 L60 48 L54 58 L62 70" stroke="#ffffff" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d="M66 40 L72 52 L66 60" stroke="#ffffff" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <AngryFace eye="#2e6b87" cheek="#cdeefb" />
    </g>
  ),

  // 7 — Le Professeur Exigeant 🦉
  "boss-7": (
    <g>
      {/* livro na mão */}
      <rect x={84} y={78} width={26} height={22} rx={3} fill="#e5484d" stroke="#c93a3f" strokeWidth={2.5} />
      <line x1={97} y1={78} x2={97} y2={100} stroke="#fff" strokeWidth={2} />
      {/* corpo-coruja */}
      <ellipse cx={60} cy={78} rx={40} ry={38} fill="#c9b1e8" />
      <ellipse cx={60} cy={90} rx={24} ry={18} fill="#e6d9f8" />
      {/* tufos de pena */}
      <path d="M34 44 L30 30 L44 40 z" fill="#a989d6" />
      <path d="M86 44 L90 30 L76 40 z" fill="#a989d6" />
      {/* óculos */}
      <circle cx={44} cy={66} r={12} fill="none" stroke="#8b6fd0" strokeWidth={3} />
      <circle cx={76} cy={66} r={12} fill="none" stroke="#8b6fd0" strokeWidth={3} />
      <line x1={56} y1={66} x2={64} y2={66} stroke="#8b6fd0" strokeWidth={3} />
      {/* olhos + sobrancelhas bravas */}
      <g fill="#3d2f3a">
        <circle cx={44} cy={67} r={4} />
        <circle cx={76} cy={67} r={4} />
      </g>
      <g stroke="#3d2f3a" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M36 54 L46 60" />
        <path d="M84 54 L74 60" />
      </g>
      {/* bico */}
      <path d="M56 76 L60 72 L64 76 z" fill="#e9b44c" />
      {/* bochechas */}
      <ellipse cx={32} cy={78} rx={4.5} ry={3} fill="#ffb3c8" opacity={0.8} />
      <ellipse cx={88} cy={78} rx={4.5} ry={3} fill="#ffb3c8" opacity={0.8} />
    </g>
  ),

  // 8 — Le Directeur Inflexible 💼
  "boss-8": (
    <g>
      {/* terno */}
      <rect x={24} y={62} width={72} height={46} rx={14} fill="#3d4a63" />
      {/* lapelas */}
      <path d="M44 66 L60 84 L76 66" fill="none" stroke="#2f3a4e" strokeWidth={3} />
      {/* gravata */}
      <path d="M58 74 L62 74 L62 100 L58 100 z" fill="#e5484d" />
      {/* camisa */}
      <path d="M50 62 L60 74 L70 62 z" fill="#f4f6fa" />
      {/* cabeça */}
      <ellipse cx={60} cy={44} rx={26} ry={26} fill="#e8c39a" />
      {/* cabelo */}
      <path d="M34 44 Q36 18 60 18 Q84 18 86 44 L86 36 Q84 14 60 14 Q36 14 34 36 z" fill="#4a4238" />
      <AngryFace eye="#2e2a24" cheek="#f2d3ae" />
      {/* bigode */}
      <path d="M46 76 Q60 84 74 76" stroke="#4a4238" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </g>
  ),

  // 9 — Le Sphinx de la Pensée 🦁
  "boss-9": (
    <g>
      {/* corpo de leão */}
      <ellipse cx={60} cy={88} rx={48} ry={26} fill="#e3c088" />
      {/* patas */}
      <ellipse cx={26} cy={102} rx={9} ry={7} fill="#d9a95f" />
      <ellipse cx={94} cy={102} rx={9} ry={7} fill="#d9a95f" />
      {/* juba */}
      <circle cx={60} cy={52} r={30} fill="#d9a95f" />
      {/* cabeça */}
      <circle cx={60} cy={50} r={24} fill="#e8cba0" />
      {/* orelhas */}
      <path d="M38 34 L32 22 L46 30 z" fill="#d9a95f" />
      <path d="M82 34 L88 22 L74 30 z" fill="#d9a95f" />
      <AngryFace eye="#6b4a1f" cheek="#f2d3ae" fangs />
      {/* papiro na pata */}
      <rect x={78} y={78} width={20} height={14} rx={2} fill="#fff7e0" stroke="#d9c9a0" strokeWidth={2} />
      <line x1={82} y1={83} x2={94} y2={83} stroke="#b9a98a" strokeWidth={1.6} />
      <line x1={82} y1={87} x2={94} y2={87} stroke="#b9a98a" strokeWidth={1.6} />
    </g>
  ),

  // 10 — La Critique d'Art 🎨
  "boss-10": (
    <g>
      {/* paleta */}
      <ellipse cx={94} cy={88} rx={18} ry={14} fill="#d9c9a0" stroke="#b9a98a" strokeWidth={2.5} />
      <circle cx={88} cy={82} r={3} fill="#e5484d" />
      <circle cx={100} cy={82} r={3} fill="#4a90d9" />
      <circle cx={94} cy={92} r={3} fill="#6fbf73" />
      <circle cx={84} cy={92} r={3} fill="#e9b44c" />
      {/* corpo */}
      <ellipse cx={58} cy={78} rx={40} ry={38} fill="#d9a4c4" />
      {/* gola de pintor */}
      <path d="M34 58 L58 66 L82 58 L82 66 L58 76 L34 66 z" fill="#f4f0e6" />
      {/* boina */}
      <path d="M32 42 Q36 26 60 24 Q84 26 88 42 Q70 34 60 36 Q48 34 32 42 z" fill="#5b3a56" />
      <circle cx={60} cy={24} r={3.5} fill="#e9b44c" />
      <AngryFace eye="#4a3043" cheek="#f6c3d8" smug />
      {/* bigode fino */}
      <path d="M46 78 Q60 84 74 78" stroke="#4a3043" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  ),

  // 11 — Le Génie des Mots 🧞
  "boss-11": (
    <g>
      {/* lâmpada */}
      <path d="M84 100 q12 -2 14 -14 q-4 4 -10 4 q-6 0 -8 -6 q-4 10 4 16 z" fill="#e9b44c" stroke="#c9842b" strokeWidth={2.5} />
      {/* cauda de gênio */}
      <path d="M20 84 Q6 76 14 62 Q22 72 30 70 Q24 80 20 84 z" fill="#7fa8f2" />
      {/* corpo */}
      <path d="M28 86 Q20 60 40 46 Q60 36 80 46 Q100 60 92 86 Q60 100 28 86 z" fill="#7fa8f2" />
      {/* braços cruzados */}
      <path d="M34 68 Q42 74 46 68" stroke="#5f86d4" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M86 68 Q78 74 74 68" stroke="#5f86d4" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* turbante */}
      <path d="M38 44 Q42 30 60 30 Q78 30 82 44 Q60 38 38 44 z" fill="#f4f0e6" />
      <path d="M40 42 Q60 34 80 42" stroke="#d9d0c0" strokeWidth={3} fill="none" />
      <circle cx={60} cy={40} r={4.5} fill="#e5484d" />
      <AngryFace eye="#2c4a7a" cheek="#bfd3f7" />
      {/* varinha estrela */}
      <path d="M96 40 L108 24" stroke="#e9b44c" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M108 20 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2 z" fill="#e9b44c" />
    </g>
  ),

  // 12 — L'Animatrice du JT 📺
  "boss-12": (
    <g>
      {/* antena */}
      <path d="M92 30 L100 14" stroke="#8a93a6" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={101} cy={12} r={4} fill="#e5484d" />
      {/* caixa de TV */}
      <rect x={16} y={32} width={88} height={58} rx={10} fill="#8a93a6" stroke="#6f7789" strokeWidth={3} />
      {/* tela */}
      <rect x={26} y={42} width={68} height={40} rx={6} fill="#dbe4f0" />
      {/* pé */}
      <rect x={48} y={90} width={24} height={10} rx={3} fill="#6f7789" />
      {/* rosto na tela */}
      <ellipse cx={60} cy={62} rx={24} ry={18} fill="#e8c39a" />
      <path d="M40 56 Q46 40 60 40 Q74 40 80 56 L80 52 Q74 36 60 36 Q46 36 40 52 z" fill="#8b5a3c" />
      <AngryFace eye="#3a2c20" cheek="#f2d3ae" />
      {/* selo LIVE */}
      <rect x={60} y={36} width={26} height={10} rx={3} fill="#e5484d" />
      <text x={73} y={44} fontSize={8} fontWeight={800} fill="#fff" textAnchor="middle">LIVE</text>
      {/* microfone */}
      <line x1={14} y1={74} x2={14} y2={100} stroke="#6f7789" strokeWidth={3} />
      <ellipse cx={14} cy={72} rx={5} ry={7} fill="#3d4a63" />
      <rect x={9} y={78} width={10} height={4} rx={2} fill="#8a93a6" />
    </g>
  ),

  // 13 — Le Censeur des Registres ⚖️
  "boss-13": (
    <g>
      {/* balança no topo */}
      <line x1={20} y1={34} x2={100} y2={34} stroke="#9aa6b3" strokeWidth={4} strokeLinecap="round" />
      <path d="M56 34 L64 34 L60 40 z" fill="#9aa6b3" />
      <line x1={34} y1={34} x2={34} y2={52} stroke="#9aa6b3" strokeWidth={3} />
      <path d="M24 52 h20 l-6 10 h-8 z" fill="#c3ccd6" />
      <line x1={86} y1={34} x2={86} y2={52} stroke="#9aa6b3" strokeWidth={3} />
      <path d="M76 52 h20 l-6 10 h-8 z" fill="#c3ccd6" />
      {/* robô */}
      <ellipse cx={60} cy={86} rx={40} ry={24} fill="#b8c2cc" />
      <rect x={32} y={60} width={56} height={26} rx={8} fill="#c3ccd6" />
      {/* antena do robô */}
      <path d="M60 52 L60 44" stroke="#9aa6b3" strokeWidth={3} />
      <circle cx={60} cy={42} r={3.5} fill="#e5484d" />
      {/* olhos de robô + sobrancelhas */}
      <g fill="#2f3b4d">
        <rect x={42} y={66} width={10} height={7} rx={2} />
        <rect x={68} y={66} width={10} height={7} rx={2} />
      </g>
      <g stroke="#2f3b4d" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M40 60 L52 64" />
        <path d="M80 60 L68 64" />
      </g>
      {/* boca de grade */}
      <line x1={52} y1={80} x2={68} y2={80} stroke="#2f3b4d" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={34} cy={72} rx={4.5} ry={3} fill="#ffb3c8" opacity={0.7} />
      <ellipse cx={86} cy={72} rx={4.5} ry={3} fill="#ffb3c8" opacity={0.7} />
    </g>
  ),

  // 14 — Le Débatteur Sans Pitié 🥊
  "boss-14": (
    <g>
      {/* punho erguido */}
      <circle cx={98} cy={40} r={15} fill="#d7a05f" stroke="#b9842b" strokeWidth={3} />
      <path d="M88 50 q-6 10 -12 8" stroke="#b9842b" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M92 32 q10 0 12 8" stroke="#8a93a6" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {/* corpo */}
      <ellipse cx={56} cy={80} rx={42} ry={38} fill="#e5484d" />
      <ellipse cx={56} cy={94} rx={26} ry={16} fill="#f08488" />
      {/* faixa de lutador */}
      <rect x={18} y={64} width={76} height={10} rx={5} fill="#c93a3f" />
      {/* braço no corpo */}
      <path d="M22 76 Q34 84 42 78" stroke="#c93a3f" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* estrela no peito */}
      <path d="M56 58 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 z" fill="#ffd9a3" />
      <AngryFace eye="#5e1f22" cheek="#ffc9cc" fangs />
      {/* bolha de raiva */}
      <circle cx={16} cy={26} r={8} fill="#ffd9a3" />
      <text x={16} y={30} fontSize={13} fontWeight={800} fill="#c93a3f" textAnchor="middle">!</text>
    </g>
  ),

  // 15 — Le Roi du Verlan 👑
  "boss-15": (
    <g>
      {/* capa real */}
      <path d="M20 86 Q34 120 60 120 Q86 120 100 86 Q60 104 20 86 z" fill="#8b5fc9" />
      {/* manto */}
      <ellipse cx={60} cy={82} rx={42} ry={38} fill="#a989d6" />
      {/* gola de arminho */}
      <path d="M30 60 Q60 74 90 60 L90 70 Q60 84 30 70 z" fill="#f4f0e6" />
      {/* ceptro */}
      <line x1={94} y1={58} x2={94} y2={104} stroke="#e9b44c" strokeWidth={4} strokeLinecap="round" />
      <circle cx={94} cy={54} r={7} fill="#e9b44c" />
      <path d="M94 46 l2.5 4 4.5 1.5 -4 2.5 -1 4.5 -2.5 -3.5 -4 -1 4 -2.5 z" fill="#fff" opacity={0.9} />
      {/* cabeça */}
      <ellipse cx={60} cy={40} rx={26} ry={24} fill="#e8c39a" />
      {/* coroa */}
      <path d="M34 34 L34 22 L42 30 L50 18 L58 28 L66 18 L74 30 L82 22 L82 34 z" fill="#e9b44c" stroke="#c9842b" strokeWidth={2.5} />
      <circle cx={42} cy={27} r={2.5} fill="#e5484d" />
      <circle cx={60} cy={24} r={2.5} fill="#4a90d9" />
      <circle cx={78} cy={27} r={2.5} fill="#6fbf73" />
      <AngryFace eye="#4a3043" cheek="#f2d3ae" smug />
      {/* sorriso de lado */}
      <path d="M52 84 Q60 90 70 84" stroke="#4a3043" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  )
};

export function BossSprite({
  bossId,
  size = 96,
  className = "",
  hurt = false
}: {
  bossId: string;
  size?: number;
  className?: string;
  hurt?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`boss-sprite ${hurt ? "boss-hurt" : ""} ${className}`.trim()}
      role="img"
      aria-label={`Sprite do chefe ${bossId}`}
    >
      {SPRITES[bossId] ?? <circle cx={60} cy={60} r={40} fill="#d9c9a0" />}
    </svg>
  );
}
