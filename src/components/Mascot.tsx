// ══════════════════════════════════════════════════════════════
// Athenas — "Lulu", a fadinha-antena mascote original
// Expressões: feliz, empolgada, pensando, confusa, triste,
// orgulhosa, surpresa, preocupada, apaixonada, explicando.
// ══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import { sfxSparkle } from "@/lib/sfx";
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

const FACE = "var(--c-face-line, #5b3a56)";

export function Eyes({ kind }: { kind: EyeKind }) {
  switch (kind) {
    case "arcs":
      return (
        <g stroke={FACE} strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M48 68 Q55 61 62 68" />
          <path d="M78 68 Q85 61 92 68" />
        </g>
      );
    case "round":
      return (
        <g fill={FACE}>
          <circle cx={55} cy={69} r={5} />
          <circle cx={85} cy={69} r={5} />
          <circle cx={57} cy={67} r={1.6} fill="#fff" />
          <circle cx={87} cy={67} r={1.6} fill="#fff" />
        </g>
      );
    case "big":
      return (
        <g fill={FACE}>
          <circle cx={55} cy={69} r={7} />
          <circle cx={85} cy={69} r={7} />
          <circle cx={58} cy={66} r={2.4} fill="#fff" />
          <circle cx={88} cy={66} r={2.4} fill="#fff" />
        </g>
      );
    case "squint":
      return (
        <g stroke={FACE} strokeWidth={3} strokeLinecap="round">
          <path d="M48 70 Q55 66 62 70" fill="none" />
          <path d="M78 69 Q85 65 92 69" fill="none" />
          <circle cx={55} cy={71} r={2} fill={FACE} />
        </g>
      );
    case "sad":
      return (
        <g stroke={FACE} strokeWidth={3} strokeLinecap="round" fill="none">
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

export function Mouth({ kind }: { kind: MouthKind }) {
  switch (kind) {
    case "smile":
      return <path d="M58 88 Q70 97 82 88" stroke={FACE} strokeWidth={3} strokeLinecap="round" fill="none" />;
    case "grin":
      return (
        <path d="M56 87 Q70 99 84 87 Q70 93 56 87" fill={FACE} />
      );
    case "o":
      return <ellipse cx={70} cy={90} rx={5} ry={6} fill={FACE} />;
    case "frown":
      return <path d="M58 92 Q70 84 82 92" stroke={FACE} strokeWidth={3} strokeLinecap="round" fill="none" />;
    case "wavy":
      return <path d="M58 90 q4 -4 8 0 q4 4 8 0 q4 -4 8 0" stroke={FACE} strokeWidth={2.6} strokeLinecap="round" fill="none" />;
    case "small":
      return <ellipse cx={70} cy={91} rx={3.4} ry={4} fill={FACE} />;
    case "explain":
      return (
        <g>
          <path d="M60 88 Q66 95 72 89" stroke={FACE} strokeWidth={3} strokeLinecap="round" fill="none" />
          <path d="M75 88 Q79 92 84 89" stroke={FACE} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

export function Brows({ kind }: { kind?: BrowKind }) {
  if (!kind) return null;
  const raise = kind === "raise";
  return (
    <g stroke="var(--c-face-line, #5b3a56)" strokeWidth={2.6} strokeLinecap="round">
      <path d={raise ? "M46 56 Q55 52 64 55" : "M46 60 Q55 65 64 61"} />
      <path d={raise ? "M76 55 Q85 52 94 56" : "M76 61 Q85 65 94 60"} />
    </g>
  );
}

export function Mascot({ mood = "happy", size = 120, className = "", speaking }: { mood?: Mood; size?: number; className?: string; speaking?: boolean }) {
  const m = MOODS[mood];
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Ao tocar na Lulu: reações em SEQUÊNCIA — cada toque seguido deixa
  // ela mais animada (1 = pulinho, 2 = pulo com giro, 3 = pulo grande +
  // corações). Sem toques por 1,3s, a sequência volta ao começo.
  const [level, setLevel] = useState(0);
  const levelRef = useRef(0);
  const levelTimer = useRef<number | null>(null);
  const handleTap = () => {
    sfxSparkle();
    const next = Math.min(levelRef.current + 1, 3);
    levelRef.current = next;
    setLevel(next);
    if (levelTimer.current) window.clearTimeout(levelTimer.current);
    levelTimer.current = window.setTimeout(() => {
      levelRef.current = 0;
      setLevel(0);
    }, 1300);
  };
  useEffect(() => () => {
    if (levelTimer.current) window.clearTimeout(levelTimer.current);
  }, []);
  // Traje atual: lê o [data-costume] mais próximo (html global ou o wrapper
  // de cada linha da loja). Um MutationObserver mantém a Lulu sincronizada
  // quando o usuário troca de roupa nas configurações.
  const [costume, setCostume] = useState<string>("classic");
  useEffect(() => {
    const read = () => {
      const el = svgRef.current?.closest("[data-costume]");
      setCostume(el?.getAttribute("data-costume") ?? "classic");
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-costume"] });
    return () => obs.disconnect();
  }, []);
  // "mc-svg" dá o aceno de boas-vindas sempre que a Lulu aparece na
  // tela (Home, aulas, revisão…); o traje fica em mc-costume-*.
  const cls = ["mc-svg", `mc-costume-${costume}`];
  if (className) cls.push(className);
  if (level > 0) cls.push(`lulu-reaction-${level}`);
  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={cls.join(" ")}
      role="img"
      aria-label={`Lulu, a mascote do Athenas — expressão: ${mood}`}
      onClick={handleTap}
      style={{ cursor: "pointer" }}
    >
      {/* asas */}
      <ellipse cx={24} cy={92} rx={12} ry={20} fill="#ffffff" opacity={0.55} transform="rotate(-18 24 92)" />
      <ellipse cx={116} cy={92} rx={12} ry={20} fill="#ffffff" opacity={0.55} transform="rotate(18 116 92)" />

      {/* Cabeça do Homem de Ferro (PNG aprovado) — desenhada POR BAIXO da
          boina e das anteninhas, que ficam por cima (cosplay de verdade). */}
      {HERO_PNG[costume] && (
        <image
          href={HERO_PNG[costume].src}
          x={HERO_PNG[costume].x}
          y={HERO_PNG[costume].y}
          width={HERO_PNG[costume].w}
          height={HERO_PNG[costume].h}
          preserveAspectRatio="xMidYMid meet"
          className="mc-hero-png"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* antenas (sempre à mostra — a Lulu nunca perde a identidade).
          Cada antena é um grupo próprio com a base embaixo, para o
          balanço (lulu-antenna) girar em torno da base, não do meio. */}
      <g className="mc-antenna mc-antenna-l">
        <path d="M48 40 Q40 26 36 16" stroke="#b9a5f0" strokeWidth={4} strokeLinecap="round" fill="none" />
        <circle cx={36} cy={14} r={5.5} fill="#e9b44c" />
        <circle cx={36} cy={14} r={2} fill="#fff" opacity={0.7} />
      </g>
      <g className="mc-antenna mc-antenna-r">
        <path d="M92 40 Q100 26 104 16" stroke="#b9a5f0" strokeWidth={4} strokeLinecap="round" fill="none" />
        <circle cx={104} cy={14} r={5.5} fill="#e9b44c" />
        <circle cx={104} cy={14} r={2} fill="#fff" opacity={0.7} />
      </g>

      {/* boina francesa (cores da roupinha — veja COSTUMES em global.css) */}
      <g className="mc-beret" transform="rotate(-6 70 30)">
        <ellipse cx={70} cy={30} rx={33} ry={13} fill="var(--c-beret, #e5484d)" />
        <path d="M55 34 q15 -14 30 0 l-4 6 q-11 -7 -22 0 z" fill="var(--c-beret-dark, #c93a3f)" />
        <circle cx={70} cy={26} r={3} fill="var(--c-beret-dot, #f28bb4)" />
        {/* brilho da boina (qualidade) */}
        <path d="M48 27 Q58 20 68 21 Q78 22 86 27" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.35} />
        {/* detalhes da roupinha — cada traje mostra seu acessório via [data-costume] no CSS */}
        <g className="mc-deco">
          {/* Rosé Classique: rosê presa na boina */}
          <g className="mc-rose">
            <circle cx={86} cy={28} r={4.4} fill="#e56b9d" />
            <circle cx={91} cy={30} r={3.6} fill="#e5484d" />
            <circle cx={85} cy={32} r={3.8} fill="#e56b9d" />
            <circle cx={88} cy={30} r={1.8} fill="#c93a3f" />
            <path d="M81 33 q3 2 5 1" stroke="#6fbf73" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </g>
          {/* Mystère Lavande: raminhos de lavanda */}
          <g className="mc-lavande">
            <path d="M45 32 Q43 22 46 15" stroke="#7d5ec2" strokeWidth={2} fill="none" strokeLinecap="round" />
            <path d="M50 32 Q51 21 54 14" stroke="#7d5ec2" strokeWidth={2} fill="none" strokeLinecap="round" />
            <g fill="#b9a5f0">
              <ellipse cx={46} cy={16} rx={2.4} ry={3} />
              <ellipse cx={48} cy={20} rx={2.4} ry={3} />
              <ellipse cx={45.5} cy={24} rx={2.4} ry={3} />
              <ellipse cx={54} cy={15} rx={2.4} ry={3} />
              <ellipse cx={52.5} cy={19} rx={2.4} ry={3} />
              <ellipse cx={55} cy={23} rx={2.4} ry={3} />
            </g>
          </g>
          {/* Bleuet Étoilé: estrelinhas na boina */}
          <g className="mc-stars">
            <path d="M50 18 l1.5 3.2 3.2 1.5 -3.2 1.5 -1.5 3.2 -1.5 -3.2 -3.2 -1.5 3.2 -1.5 z" fill="#ffe28a" />
            <path d="M84 15 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 z" fill="#ffffff" />
            <path d="M68 12 l1.2 2.5 2.5 1.2 -2.5 1.2 -1.2 2.5 -1.2 -2.5 -2.5 -1.2 2.5 -1.2 z" fill="#cfe6ff" />
          </g>
          {/* Chocolat Fondant: cobertura derretida */}
          <g className="mc-choco">
            <path d="M47 33 q23 -6 46 0 l-1.5 4 q-21.5 -4.5 -43 0 z" fill="#c98f5f" />
            <ellipse cx={57} cy={40} rx={2.2} ry={4} fill="#c98f5f" />
            <ellipse cx={85} cy={39} rx={2} ry={3.6} fill="#c98f5f" />
            <ellipse cx={70} cy={41.5} rx={1.8} ry={3.2} fill="#c98f5f" />
          </g>
        </g>
      </g>

      {/* corpo / rostinho (a pele muda de cor com a roupinha — ex.: Hulk) */}
      <g className="mc-skin">
        <ellipse cx={70} cy={80} rx={46} ry={40} fill="var(--c-skin-dark, #e7dcfb)" />
        <ellipse cx={70} cy={76} rx={46} ry={36} fill="var(--c-skin, #f3ecff)" />
        <ellipse cx={58} cy={62} rx={16} ry={10} fill="#ffffff" opacity={0.5} />
      </g>

      {/* bochechas */}
      <g className="mc-cheeks">
        <ellipse cx={42} cy={84} rx={7} ry={4.5} fill="#ffb3c8" opacity={0.9} />
        <ellipse cx={98} cy={84} rx={7} ry={4.5} fill="#ffb3c8" opacity={0.9} />
      </g>

      {/* rosto */}
      <g className="mc-face-base">
        <Brows kind={m.brows} />
        {/* olhos em grupo próprio: permite a piscada via CSS (scaleY) */}
        <g className="mc-eyes">
          <Eyes kind={m.eyes} />
        </g>
        <Mouth kind={m.mouth} />
      </g>

      {/* echarpe (cores da roupinha) */}
      <path d="M44 112 q26 10 52 0 l-4 10 q-22 8 -44 0 z" fill="var(--c-scarf, #f28bb4)" />
      <path d="M88 112 l6 14 l-8 -3 z" fill="var(--c-scarf-dark, #e56b9d)" />
      {/* Émeraude Parisienne: gema na echarpe */}
      <g className="mc-gem">
        <path d="M70 112 l6.5 5.5 -6.5 8 -6.5 -8 z" fill="#2e9e5b" stroke="#217a45" strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M70 112 l6.5 5.5 -3 2.2 -3.5 -3.4 z" fill="#5fc98a" />
        <circle cx={67.5} cy={119} r={1.2} fill="#c6f0d8" />
      </g>

      {/* Cosplay dos heróis (roupinhas Vingadores) — desenhos ORIGINAIS em
          SVG inspirados nos personagens. A Lulu mantém a boina, as anteninhas
          e o rostinho à mostra: é cosplay, não substituição da cara. */}
      <g className="mc-hero">
        {/* Homem-Aranha: máscara de dominó com teias e olhos brancos grandes */}
        <g className="mc-spidey">
          {/* banda vermelha sobre os olhos */}
          <path d="M26 52 Q70 44 114 52 Q118 58 116 66 Q114 74 104 76 Q70 70 36 76 Q26 74 24 66 Q22 58 26 52 Z" fill="#e23a2e" stroke="#1a1a2e" strokeWidth={2.6} strokeLinejoin="round" />
          {/* pontas nas têmporas (clássico do Aranha) */}
          <path d="M26 54 L10 50 L14 64 L26 62 Z" fill="#e23a2e" stroke="#1a1a2e" strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M114 54 L130 50 L126 64 L114 62 Z" fill="#e23a2e" stroke="#1a1a2e" strokeWidth={2.2} strokeLinejoin="round" />
          {/* olhos de aranha brancos e grandes */}
          <path d="M32 60 Q55 50 72 60 Q55 74 32 60 Z" fill="#ffffff" stroke="#1a1a2e" strokeWidth={2.8} strokeLinejoin="round" />
          <path d="M68 60 Q85 50 108 60 Q85 74 68 60 Z" fill="#ffffff" stroke="#1a1a2e" strokeWidth={2.8} strokeLinejoin="round" />
          {/* teias fininhas na banda */}
          <g stroke="#1a1a2e" strokeWidth={1} opacity={0.55} fill="none">
            <path d="M30 56 L42 52" />
            <path d="M28 62 L40 60" />
            <path d="M30 68 L42 66" />
            <path d="M110 56 L98 52" />
            <path d="M112 62 L100 60" />
            <path d="M110 68 L98 66" />
            <path d="M52 75 L58 70" />
            <path d="M88 75 L82 70" />
          </g>
          {/* aranha de broche na echarpe */}
          <g transform="translate(96 118)">
            <circle r={2.4} fill="#1a1a2e" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1={0} y1={0} x2={0} y2={-3.4} stroke="#1a1a2e" strokeWidth={1.1} transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
        {/* Capitão América: faixa azul na testa com A e asinhas */}
        <g className="mc-captain">
          <path d="M28 48 Q70 40 112 48 Q116 56 112 62 Q70 56 28 62 Q24 56 28 48 Z" fill="#3d6fd8" stroke="#1f3f8a" strokeWidth={2.2} strokeLinejoin="round" />
          {/* letra A branca */}
          <g stroke="#ffffff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M63 54 L70 40 L77 54" />
            <path d="M66.2 48.5 L73.8 48.5" />
          </g>
          {/* asinhas prateadas nas laterais */}
          <path d="M34 52 Q16 44 8 38 Q16 46 18 54 Q24 60 36 60 Z" fill="#d8dbe0" stroke="#1f3f8a" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M106 52 Q124 44 132 38 Q124 46 122 54 Q116 60 104 60 Z" fill="#d8dbe0" stroke="#1f3f8a" strokeWidth={1.8} strokeLinejoin="round" />
          {/* estrela de broche na echarpe */}
          <path transform="translate(70 117)" d="M0 -5.5 L1.3 -1.8 L5.2 -1.8 L2.2 0.7 L3.4 4.5 L0 2.2 L-3.4 4.5 L-2.2 0.7 L-5.2 -1.8 L-1.3 -1.8 Z" fill="#ffffff" stroke="#1f3f8a" strokeWidth={1.2} strokeLinejoin="round" />
        </g>
        {/* Thor: faixa prateada com rebites, asas e Mjolnir pendurado */}
        <g className="mc-thor">
          <path d="M28 48 Q70 40 112 48 Q116 56 112 62 Q70 56 28 62 Q24 56 28 48 Z" fill="#c9cdd8" stroke="#5f6775" strokeWidth={2.2} strokeLinejoin="round" />
          {/* rebites */}
          <circle cx={46} cy={51} r={1.8} fill="#8b93a3" />
          <circle cx={94} cy={51} r={1.8} fill="#8b93a3" />
          <circle cx={70} cy={48} r={2.2} fill="#8b93a3" />
          {/* asas brancas */}
          <path d="M34 52 Q16 44 8 38 Q16 46 18 54 Q24 60 36 60 Z" fill="#e8e8f0" stroke="#5f6775" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M106 52 Q124 44 132 38 Q124 46 122 54 Q116 60 104 60 Z" fill="#e8e8f0" stroke="#5f6775" strokeWidth={1.8} strokeLinejoin="round" />
          {/* Mjolnir pendurado na echarpe */}
          <g transform="translate(104 119)">
            <rect x={-3} y={-11} width={6} height={11} rx={2} fill="#8b5a2b" stroke="#5d3a1a" strokeWidth={1.4} />
            <rect x={-8.5} y={-17.5} width={17} height={8.5} rx={2.5} fill="#9aa1b0" stroke="#5f6775" strokeWidth={1.4} />
            <path d="M-8.5 -12.2 h17 l-1.5 2.2 h-14 z" fill="#6b7280" />
          </g>
        </g>
        {/* Hulk: pintura de rosto verde (pele vira verde no CSS) + raio gamma */}
        <g className="mc-hulk">
          {/* cabelo escuro espetado aparecendo sob a boina */}
          <path d="M42 46 Q38 34 46 30 Q50 38 52 46 Z" fill="#1a1a2e" stroke="#000000" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M62 44 Q64 32 72 30 Q78 34 80 44 Z" fill="#1a1a2e" stroke="#000000" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M90 46 Q94 34 100 38 Q98 44 96 46 Z" fill="#1a1a2e" stroke="#000000" strokeWidth={1.8} strokeLinejoin="round" />
          {/* sobrancelhas franzidas de bravo */}
          <g stroke="#14141f" strokeWidth={3.4} strokeLinecap="round">
            <path d="M46 58 L64 55" />
            <path d="M76 55 L94 58" />
          </g>
          {/* raio gamma pintado na bochecha */}
          <path d="M38 78 l-3.4 6 h2.8 l-2.2 5.4 l5.6 -7.2 h-3 l3 -4.2 z" fill="#ffe28a" stroke="#c98f1f" strokeWidth={0.8} strokeLinejoin="round" />
        </g>
        {/* Viúva Negra: cabelo ruivo, faixa preta na testa e ampulheta */}
        <g className="mc-widow">
          {/* franja ruiva sob a boina */}
          <path d="M38 42 Q70 32 102 42 Q106 48 100 50 Q70 44 40 50 Q34 48 38 42 Z" fill="#c13a1e" stroke="#8f2713" strokeWidth={1.8} strokeLinejoin="round" />
          {/* mechas ruivas nas laterais */}
          <path d="M30 46 Q20 40 26 32 Q34 38 38 48 Q34 62 40 74 Q32 78 26 70 Q22 56 30 46 Z" fill="#c13a1e" stroke="#8f2713" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M110 46 Q120 40 114 32 Q106 38 102 48 Q106 62 100 74 Q108 78 114 70 Q118 56 110 46 Z" fill="#c13a1e" stroke="#8f2713" strokeWidth={1.8} strokeLinejoin="round" />
          {/* faixa preta na testa */}
          <path d="M28 48 Q70 40 112 48 Q116 56 112 62 Q70 56 28 62 Q24 56 28 48 Z" fill="#2b2b3a" stroke="#14141f" strokeWidth={2.2} strokeLinejoin="round" />
          {/* ampulheta de broche na echarpe */}
          <g transform="translate(70 117)">
            <path d="M-5 -6.5 L5 -6.5 L0 0 Z" fill="#d33f3f" stroke="#8f1f1f" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M-5 6.5 L5 6.5 L0 0 Z" fill="#d33f3f" stroke="#8f1f1f" strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        </g>
      </g>

      {/* Corações do nível 3 (toques seguidos): sobem e somem */}
      {level >= 3 && (
        <g className="lulu-hearts" fill="#ff7bac">
          <path d="M40 30 c-2.5 -3 -7 -1.2 -5.4 2.4 c1.2 2.4 5.4 3.6 5.4 3.6 s4.2 -1.2 5.4 -3.6 c1.6 -3.6 -2.9 -5.4 -5.4 -2.4 z" />
          <path d="M95 22 c-2 -2.4 -5.6 -1 -4.3 1.9 c1 1.9 4.3 2.9 4.3 2.9 s3.4 -1 4.3 -2.9 c1.3 -2.9 -2.3 -4.3 -4.3 -1.9 z" />
          <path d="M70 10 c-2.2 -2.7 -6.2 -1.1 -4.8 2.1 c1.1 2.1 4.8 3.2 4.8 3.2 s3.7 -1.1 4.8 -3.2 c1.4 -3.2 -2.6 -4.8 -4.8 -2.1 z" />
        </g>
      )}

      {/* Mãozinha do "tchauzinho": acena quando a Lulu se apresenta na
          Home (animação lulu-tchau no CSS). Invisível o resto do tempo. */}
      <g className="mc-wave-hand">
        <path d="M96 100 Q108 92 112 79" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={5.5} strokeLinecap="round" fill="none" />
        <circle cx={114} cy={75} r={6.5} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.8} />
        <circle cx={117.5} cy={68} r={2.4} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.2} />
        <circle cx={112} cy={66} r={2.4} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.2} />
      </g>

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

// Cabeça do Homem de Ferro (PNG aprovado pelo usuário) — fica POR BAIXO da
// boina e das anteninhas, que desenham por cima (cosplay).
const HERO_PNG: Record<string, { src: string; x: number; y: number; w: number; h: number }> = {
  ironman: { src: "./heroes/ironman.png", x: 20, y: 34, w: 100, h: 92 }
};
