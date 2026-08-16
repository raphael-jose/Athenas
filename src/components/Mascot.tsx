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

const FACE = "var(--c-face-line, #5b3a56)";

function Eyes({ kind }: { kind: EyeKind }) {
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

function Mouth({ kind }: { kind: MouthKind }) {
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

function Brows({ kind }: { kind?: BrowKind }) {
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

      {/* antenas (ocultas nas roupinhas de herói de máscara completa) */}
      <g className="mc-antennas" stroke="#b9a5f0" strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M48 40 Q40 26 36 16" />
        <path d="M92 40 Q100 26 104 16" />
      </g>
      <g className="mc-antennas" fill="#e9b44c">
        <circle cx={36} cy={14} r={5.5} />
        <circle cx={104} cy={14} r={5.5} />
        <circle cx={36} cy={14} r={2} fill="#fff" opacity={0.7} />
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
        {/* Homem-Aranha: máscara completa cobrindo a cara toda, com teias
            e olhos brancos grandes — igual ao desenho/filme */}
        <g className="mc-spidey">
          {/* máscara inteira (do topo da cabeça ao queixo) */}
          <path d="M24 40 Q70 26 116 40 Q120 62 118 80 Q116 100 100 108 Q70 118 40 108 Q24 100 22 80 Q20 62 24 40 Z" fill="#e23a2e" stroke="#1a1a2e" strokeWidth={3} strokeLinejoin="round" />
          {/* brilho suave no topo */}
          <path d="M34 44 Q70 33 106 44 Q70 40 34 44 Z" fill="#ffffff" opacity={0.12} />
          {/* teias: linhas radiais do centro até a borda */}
          <g stroke="#1a1a2e" strokeWidth={1.3} opacity={0.55} fill="none" strokeLinecap="round">
            <path d="M70 60 L70 32" />
            <path d="M70 60 L96 38" />
            <path d="M70 60 L114 62" />
            <path d="M70 60 L96 86" />
            <path d="M70 60 L70 112" />
            <path d="M70 60 L44 86" />
            <path d="M70 60 L26 62" />
            <path d="M70 60 L44 38" />
            {/* arcos do anel interno */}
            <path d="M70 40 Q77 42 84 46" />
            <path d="M84 46 Q88 53 90 60" />
            <path d="M90 60 Q88 67 84 74" />
            <path d="M84 74 Q77 78 70 80" />
            <path d="M70 80 Q63 78 56 74" />
            <path d="M56 74 Q52 67 50 60" />
            <path d="M50 60 Q52 53 56 46" />
            <path d="M56 46 Q63 42 70 40" />
            {/* arcos do anel externo */}
            <path d="M70 33 Q79 36 89 41" />
            <path d="M89 41 Q94 50 97 60" />
            <path d="M97 60 Q94 70 89 79" />
            <path d="M89 79 Q80 84 70 87" />
            <path d="M70 87 Q60 84 51 79" />
            <path d="M51 79 Q46 70 43 60" />
            <path d="M43 60 Q46 50 51 41" />
            <path d="M51 41 Q60 36 70 33" />
          </g>
          {/* olhos de aranha grandes e arredondados (como na referência) */}
          <g fill="#ffffff" stroke="#1a1a2e" strokeWidth={3.2}>
            <path d="M32 62 Q55 46 78 62 Q55 77 32 62 Z" />
            <path d="M62 62 Q85 46 108 62 Q85 77 62 62 Z" />
          </g>
          {/* aranha no peito (como na referência) */}
          <g transform="translate(70 117)">
            <circle r={2.2} fill="#1a1a2e" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1={0} y1={0} x2={0} y2={-3.2} stroke="#1a1a2e" strokeWidth={1} transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
        {/* Homem de Ferro: máscara completa vermelha e dourada, igual
            aos desenhos/filmes, com olhos azuis e reator no peito */}
        <g className="mc-ironman">
          {/* capacete vermelho cobrindo a cara toda */}
          <path d="M24 40 Q70 16 116 40 Q120 62 118 80 Q116 100 100 108 Q70 118 40 108 Q24 100 22 80 Q20 62 24 40 Z" fill="#d6483b" stroke="#7a1f16" strokeWidth={2.6} strokeLinejoin="round" />
          {/* aletas douradas (as antenas viram o capacete) */}
          <path d="M22 42 L8 32 L12 50 Z" fill="#e8a13a" stroke="#9c6a14" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M118 42 L132 32 L128 50 Z" fill="#e8a13a" stroke="#9c6a14" strokeWidth={1.8} strokeLinejoin="round" />
          {/* placa facial dourada */}
          <path d="M42 50 Q70 43 98 50 Q102 72 100 92 Q98 106 70 108 Q42 106 40 92 Q38 72 42 50 Z" fill="#e8a13a" stroke="#9c6a14" strokeWidth={2.2} strokeLinejoin="round" />
          {/* sombra nas laterais da placa (profundidade) */}
          <path d="M42 50 Q70 43 98 50 Q102 60 100 68 Q70 60 40 68 Q38 60 42 50 Z" fill="#c47f22" opacity={0.5} />
          {/* olhos brancos brilhantes e grandes (como na referência) */}
          <path d="M38 59 L68 63.5 L68 69.5 L38 65 Z" fill="#ffffff" stroke="#8f9db5" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M102 59 L72 63.5 L72 69.5 L102 65 Z" fill="#ffffff" stroke="#8f9db5" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M41 60.5 L66 64 L66 65.4 L41 62 Z" fill="#e8f6ff" />
          <path d="M99 60.5 L74 64 L74 65.4 L99 62 Z" fill="#e8f6ff" />
          {/* boca do capacete */}
          <path d="M56 88 Q70 92 84 88" stroke="#7a1f16" strokeWidth={2.4} fill="none" strokeLinecap="round" />
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
          {/* asinhas prateadas (como na referência) */}
          <path d="M52 50 Q28 38 16 32 Q24 42 26 50 Q32 57 50 57 Z" fill="#d8dbe0" stroke="#1f3f8a" strokeWidth={2} strokeLinejoin="round" />
          <path d="M88 50 Q112 38 124 32 Q116 42 114 50 Q108 57 90 57 Z" fill="#d8dbe0" stroke="#1f3f8a" strokeWidth={2} strokeLinejoin="round" />
          {/* estrela branca no peito (como na referência) */}
          <path transform="translate(70 117)" d="M0 -5.5 L1.3 -1.8 L5.2 -1.8 L2.2 0.7 L3.4 4.5 L0 2.2 L-3.4 4.5 L-2.2 0.7 L-5.2 -1.8 L-1.3 -1.8 Z" fill="#ffffff" stroke="#1f3f8a" strokeWidth={1.2} strokeLinejoin="round" />
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
        {/* Hulk: cabelo preto bagunçado (como na referência) + raio gamma */}
        <g className="mc-hulk">
          <path d="M46 30 Q52 10 64 18 Q70 8 80 16 Q88 10 94 22 Q100 26 97 34 Q70 24 45 34 Q42 32 46 30 Z" fill="#1a1a2e" stroke="#000000" strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M44 26 Q52 18 60 20 Q56 22 54 28 Q50 24 44 26 Z" fill="#2e2e44" opacity={0.6} />
          <path d="M38 78 l-3.6 6.2 h3 l-2.3 5.6 l6 -7.6 h-3.2 l3.2 -4.2 z" fill="#ffe28a" />
        </g>
        {/* Viúva Negra: cabelo vermelho, faixa preta e ampulheta no peito */}
        <g className="mc-widow">
          {/* cabelo ruivo grande e vibrante (como na referência) */}
          <path d="M38 32 Q70 20 102 32 Q106 38 103 46 Q100 53 92 55 Q70 47 48 55 Q40 53 37 46 Q34 38 38 32 Z" fill="#c13a1e" stroke="#8f2713" strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M36 44 Q26 50 23 60 Q29 52 40 50 Z" fill="#c13a1e" stroke="#8f2713" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M104 44 Q114 50 117 60 Q111 52 100 50 Z" fill="#c13a1e" stroke="#8f2713" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M46 40 Q52 46 48 54 Q44 46 46 40 Z" fill="#e04a22" />
          <path d="M94 40 Q88 46 92 54 Q96 46 94 40 Z" fill="#e04a22" />
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

      {/* Cabeça chibi do herói (roupinhas Vingadores) — sticker com fundo
          transparente cobrindo o rostinho da Lulu, como na referência. */}
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
    </svg>
  );
}

// Cabeças chibi dos heróis (public/heroes) com o encaixe no rostinho da Lulu
const HERO_PNG: Record<string, { src: string; x: number; y: number; w: number; h: number }> = {
  spidey: { src: "./heroes/spidey.png", x: 24, y: 32, w: 92, h: 96 },
  ironman: { src: "./heroes/ironman.png", x: 20, y: 34, w: 100, h: 92 },
  captain: { src: "./heroes/captain.png", x: 22, y: 38, w: 96, h: 82 },
  thor: { src: "./heroes/thor.png", x: 22, y: 34, w: 96, h: 94 },
  hulk: { src: "./heroes/hulk.png", x: 22, y: 36, w: 96, h: 90 },
  widow: { src: "./heroes/widow.png", x: 22, y: 40, w: 96, h: 74 }
};
