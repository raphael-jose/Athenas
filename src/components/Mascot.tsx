// ══════════════════════════════════════════════════════════════
// Athenas — "Lulu", a fadinha-antena mascote original
// Expressões: feliz, empolgada, pensando, confusa, triste,
// orgulhosa, surpresa, preocupada, apaixonada, explicando.
// ══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
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
  const svgRef = useRef<SVGSVGElement | null>(null);
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
  const cls = [`mc-costume-${costume}`];
  if (className) cls.push(className);
  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 140 140"
      className={cls.join(" ")}
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

      {/* boina francesa (cores da roupinha — veja COSTUMES em global.css) */}
      <g transform="rotate(-6 70 30)">
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
      <ellipse cx={70} cy={80} rx={46} ry={40} fill="var(--c-skin-dark, #e7dcfb)" />
      <ellipse cx={70} cy={76} rx={46} ry={36} fill="var(--c-skin, #f3ecff)" />
      <ellipse cx={58} cy={62} rx={16} ry={10} fill="#ffffff" opacity={0.5} />

      {/* bochechas */}
      <g className="mc-cheeks">
        <ellipse cx={42} cy={84} rx={7} ry={4.5} fill="#ffb3c8" opacity={0.9} />
        <ellipse cx={98} cy={84} rx={7} ry={4.5} fill="#ffb3c8" opacity={0.9} />
      </g>

      {/* rosto */}
      <g className="mc-face-base">
        <Brows kind={m.brows} />
        <Eyes kind={m.eyes} />
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

      {/* Máscaras/capacetes dos heróis (roupinhas Vingadores) — cada grupo
          aparece só com o traje certo (ver .mc-hero no CSS). */}
      <g className="mc-hero">
        {/* Homem-Aranha: touca com teias, máscara vermelha, olhos brancos e aranha */}
        <g className="mc-spidey">
          <g stroke="#1a1a2e" strokeWidth={1.4} opacity={0.55} fill="none" strokeLinecap="round">
            <path d="M70 20 Q60 27 46 27" />
            <path d="M70 20 Q80 27 94 27" />
            <path d="M70 20 L70 33" />
            <path d="M70 20 Q57 33 47 34" />
            <path d="M70 20 Q83 33 93 34" />
          </g>
          {/* aranha no topo da cabeça */}
          <g transform="translate(70 24)">
            <circle r={2.6} fill="#1a1a2e" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1={0} y1={0} x2={0} y2={-3.8} stroke="#1a1a2e" strokeWidth={1.2} transform={`rotate(${a})`} />
            ))}
          </g>
          {/* máscara vermelha (testa e olhos; sorriso fica de fora) */}
          <path d="M26 44 Q70 33 114 44 Q118 56 113 66 Q110 78 100 81 Q70 87 40 81 Q30 78 27 66 Q22 56 26 44 Z" fill="#e23a2e" stroke="#1a1a2e" strokeWidth={3} strokeLinejoin="round" />
          {/* teias da máscara */}
          <g stroke="#1a1a2e" strokeWidth={1.3} opacity={0.5} fill="none" strokeLinecap="round">
            <path d="M70 62 Q46 55 32 59" />
            <path d="M70 62 Q94 55 108 59" />
            <path d="M70 62 Q47 73 36 74" />
            <path d="M70 62 Q93 73 104 74" />
            <path d="M70 62 L70 79" />
          </g>
          {/* olhos de aranha */}
          <g fill="#ffffff" stroke="#1a1a2e" strokeWidth={3}>
            <path d="M41 63 Q55 53 69 63 Q55 73 41 63 Z" />
            <path d="M71 63 Q85 53 99 63 Q85 73 71 63 Z" />
          </g>
        </g>
        {/* Homem de Ferro: capacete vermelho, placa dourada, visor azul e reator */}
        <g className="mc-ironman">
          <path d="M24 40 Q70 16 116 40 Q120 54 116 66 Q112 80 100 84 Q70 92 40 84 Q28 80 24 66 Q20 54 24 40 Z" fill="#d6483b" stroke="#7a1f16" strokeWidth={2.6} strokeLinejoin="round" />
          {/* aletas douradas (as antenas viram o capacete) */}
          <path d="M22 42 L8 32 L12 50 Z" fill="#e8a13a" stroke="#9c6a14" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M118 42 L132 32 L128 50 Z" fill="#e8a13a" stroke="#9c6a14" strokeWidth={1.8} strokeLinejoin="round" />
          {/* placa facial dourada */}
          <path d="M42 50 Q70 45 98 50 L100 72 Q70 83 40 72 Z" fill="#e8a13a" stroke="#9c6a14" strokeWidth={2.2} strokeLinejoin="round" />
          {/* visor azul brilhante */}
          <path d="M45 61 Q70 56 95 61 L95 68 Q70 63 45 68 Z" fill="#4dd0ff" stroke="#155a8a" strokeWidth={1.8} />
          <path d="M47 62.5 Q70 58 93 62.5 L93 64.5 Q70 60 47 64.5 Z" fill="#dff6ff" />
          {/* boca do capacete */}
          <path d="M56 76 Q70 80 84 76" stroke="#7a1f16" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {/* reator no peito */}
          <g>
            <circle cx={70} cy={117} r={8} fill="#e8a13a" stroke="#9c6a14" strokeWidth={2} />
            <circle cx={70} cy={117} r={4.6} fill="#4dd0ff" />
            <circle cx={70} cy={117} r={2} fill="#ffffff" />
          </g>
        </g>
        {/* Capitão América: capacete azul com A, asinhas brancas */}
        <g className="mc-captain">
          <path d="M24 40 Q70 16 116 40 Q120 52 116 64 Q70 56 24 64 Q20 52 24 40 Z" fill="#3d6fd8" stroke="#1f3f8a" strokeWidth={2.4} strokeLinejoin="round" />
          {/* letra A branca na testa */}
          <g stroke="#ffffff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M62 52 L70 34 L78 52" />
            <path d="M65.6 45 L74.4 45" />
          </g>
          {/* asinhas */}
          <path d="M52 50 Q28 38 16 32 Q24 42 26 50 Q32 57 50 57 Z" fill="#ffffff" stroke="#1f3f8a" strokeWidth={2} strokeLinejoin="round" />
          <path d="M88 50 Q112 38 124 32 Q116 42 114 50 Q108 57 90 57 Z" fill="#ffffff" stroke="#1f3f8a" strokeWidth={2} strokeLinejoin="round" />
        </g>
        {/* Thor: capacete prateado com asas e Mjolnir pendurado */}
        <g className="mc-thor">
          <path d="M24 40 Q70 16 116 40 Q120 52 116 64 Q70 56 24 64 Q20 52 24 40 Z" fill="#c9cdd8" stroke="#5f6775" strokeWidth={2.4} strokeLinejoin="round" />
          {/* rebites */}
          <circle cx={44} cy={46} r={1.9} fill="#8b93a3" />
          <circle cx={96} cy={46} r={1.9} fill="#8b93a3" />
          <circle cx={70} cy={40} r={2.3} fill="#8b93a3" />
          {/* asas */}
          <path d="M52 50 Q28 38 16 32 Q24 42 26 50 Q32 57 50 57 Z" fill="#e8e8f0" stroke="#5f6775" strokeWidth={2} strokeLinejoin="round" />
          <path d="M88 50 Q112 38 124 32 Q116 42 114 50 Q108 57 90 57 Z" fill="#e8e8f0" stroke="#5f6775" strokeWidth={2} strokeLinejoin="round" />
          {/* Mjolnir pendurado */}
          <g transform="translate(104 119)">
            <rect x={-3} y={-11} width={6} height={11} rx={2} fill="#8b5a2b" stroke="#5d3a1a" strokeWidth={1.4} />
            <rect x={-8.5} y={-17.5} width={17} height={8.5} rx={2.5} fill="#9aa1b0" stroke="#5f6775" strokeWidth={1.4} />
            <path d="M-8.5 -12.2 h17 l-1.5 2.2 h-14 z" fill="#6b7280" />
          </g>
        </g>
        {/* Hulk: cabelo verde espetado + raio gamma na bochecha */}
        <g className="mc-hulk">
          <path d="M46 30 Q52 10 64 18 Q70 8 80 16 Q88 10 94 22 Q100 26 97 34 Q70 24 45 34 Q42 32 46 30 Z" fill="#2e8a46" stroke="#1f5c30" strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M38 78 l-3.6 6.2 h3 l-2.3 5.6 l6 -7.6 h-3.2 l3.2 -4.2 z" fill="#ffe28a" />
        </g>
        {/* Viúva Negra: cabelo vermelho, faixa preta e ampulheta no peito */}
        <g className="mc-widow">
          <path d="M38 32 Q70 20 102 32 Q106 38 103 46 Q100 53 92 55 Q70 47 48 55 Q40 53 37 46 Q34 38 38 32 Z" fill="#a52a2a" stroke="#7a1f1f" strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M36 44 Q26 50 23 60 Q29 52 40 50 Z" fill="#a52a2a" stroke="#7a1f1f" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M104 44 Q114 50 117 60 Q111 52 100 50 Z" fill="#a52a2a" stroke="#7a1f1f" strokeWidth={1.6} strokeLinejoin="round" />
          {/* faixa preta */}
          <path d="M30 50 Q70 42 110 50 L112 58 Q70 50 28 58 Z" fill="#2b2b3a" stroke="#14141f" strokeWidth={1.8} strokeLinejoin="round" />
          {/* ampulheta */}
          <g transform="translate(70 117)">
            <path d="M-5 -6.5 L5 -6.5 L0 0 Z" fill="#d33f3f" stroke="#8f1f1f" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M-5 6.5 L5 6.5 L0 0 Z" fill="#d33f3f" stroke="#8f1f1f" strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        </g>
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
