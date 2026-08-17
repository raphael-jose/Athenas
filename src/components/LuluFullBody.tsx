// ══════════════════════════════════════════════════════════════
// Athenas — "Lulu" de CORPO INTEIRO (chibi)
// Cabeça + vestidinho Parisienne de babados + perninhas de meia +
// sapatos Mary Jane. Mantém a identidade (boina, anteninhas,
// echarpe) e as mesmas classes de animação da Lulu busto
// (mc-svg, mc-eyes, mc-antenna, mc-costume-*): acena ao aparecer,
// pisca, balança as antenas e reage ao toque.
// ══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import { sfxSparkle } from "@/lib/sfx";
import { Brows, Eyes, Mouth, type Mood } from "./Mascot";

const MOODS: Record<Mood, { eyes: "arcs" | "round" | "squint" | "sad" | "hearts" | "big"; mouth: "smile" | "grin" | "o" | "frown" | "wavy" | "small"; brows?: "raise" | "down" }> = {
  happy: { eyes: "arcs", mouth: "smile" },
  excited: { eyes: "big", mouth: "grin" },
  thinking: { eyes: "squint", mouth: "small", brows: "down" },
  confused: { eyes: "squint", mouth: "wavy", brows: "raise" },
  sad: { eyes: "sad", mouth: "frown", brows: "down" },
  proud: { eyes: "arcs", mouth: "grin" },
  surprised: { eyes: "round", mouth: "o", brows: "raise" },
  worried: { eyes: "round", mouth: "wavy", brows: "down" },
  love: { eyes: "hearts", mouth: "smile" },
  explaining: { eyes: "round", mouth: "smile" }
};

export function LuluFullBody({
  mood = "happy",
  size = 160,
  className = "",
  speaking
}: {
  mood?: Mood;
  size?: number;
  className?: string;
  speaking?: boolean;
}) {
  const m = MOODS[mood];
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Mesma sequência de toques da Lulu busto: 1 = pulinho, 2 = giro,
  // 3 = pulo grande + corações. Reset após 1,3s sem toques.
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
  useEffect(
    () => () => {
      if (levelTimer.current) window.clearTimeout(levelTimer.current);
    },
    []
  );

  // Traje atual: lê o [data-costume] mais próximo (mesmo sistema da Lulu busto).
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

  const cls = ["mc-svg", `mc-costume-${costume}`];
  if (className) cls.push(className);
  if (level > 0) cls.push(`lulu-reaction-${level}`);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 140 220"
      className={cls.join(" ")}
      role="img"
      aria-label={`Lulu de corpo inteiro — expressão: ${mood}`}
      onClick={handleTap}
      style={{ cursor: "pointer" }}
    >
      {/* antenas (identidade — sempre à mostra) */}
      <g className="mc-antenna mc-antenna-l">
        <path d="M48 52 Q40 34 36 22" stroke="#b9a5f0" strokeWidth={4} strokeLinecap="round" fill="none" />
        <circle cx={36} cy={20} r={5.5} fill="#e9b44c" />
        <circle cx={36} cy={20} r={2} fill="#fff" opacity={0.7} />
      </g>
      <g className="mc-antenna mc-antenna-r">
        <path d="M92 52 Q100 34 104 22" stroke="#b9a5f0" strokeWidth={4} strokeLinecap="round" fill="none" />
        <circle cx={104} cy={20} r={5.5} fill="#e9b44c" />
        <circle cx={104} cy={20} r={2} fill="#fff" opacity={0.7} />
      </g>

      {/* boina francesa (cores da roupinha) */}
      <g className="mc-beret" transform="rotate(-6 70 38)">
        <ellipse cx={70} cy={38} rx={29} ry={11.5} fill="var(--c-beret, #e5484d)" />
        <path d="M56 42 q14 -12 28 0 l-3.5 5 q-10.5 -6 -21 0 z" fill="var(--c-beret-dark, #c93a3f)" />
        <circle cx={70} cy={34} r={2.6} fill="var(--c-beret-dot, #f28bb4)" />
        <path d="M50 35 Q58 28 68 29 Q78 30 86 35" stroke="#ffffff" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.35} />
      </g>

      {/* cabeça / rostinho (pele muda com a roupinha) */}
      <g className="mc-skin">
        <ellipse cx={70} cy={64} rx={37} ry={31} fill="var(--c-skin-dark, #e7dcfb)" />
        <ellipse cx={70} cy={61} rx={37} ry={28} fill="var(--c-skin, #f3ecff)" />
      </g>

      {/* bochechas */}
      <ellipse cx={40} cy={78} rx={6} ry={4} fill="#ffb3c8" opacity={0.9} />
      <ellipse cx={100} cy={78} rx={6} ry={4} fill="#ffb3c8" opacity={0.9} />

      {/* rosto (mesmas expressões da Lulu busto) */}
      <g className="mc-face-base">
        <Brows kind={m.brows} />
        <g className="mc-eyes">
          <Eyes kind={m.eyes} />
        </g>
        <Mouth kind={m.mouth} />
      </g>

      {/* pescoço */}
      <path d="M63 88 L77 88 L78 100 L62 100 Z" fill="var(--c-skin-dark, #e7dcfb)" />
      <path d="M64 90 L76 90 L77 99 L63 99 Z" fill="var(--c-skin, #f3ecff)" />

      {/* bracinhos curtos e mãozinhas redondas */}
      <g className="mc-arms">
        <path d="M42 102 Q33 116 38 128" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={5.5} strokeLinecap="round" fill="none" />
        <circle cx={39} cy={131} r={5.5} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.6} />
        <path d="M98 102 Q107 116 102 128" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={5.5} strokeLinecap="round" fill="none" />
        <circle cx={101} cy={131} r={5.5} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.6} />
      </g>

      {/* vestidinho Parisienne (saia A com babados + botõezinhos) */}
      <path d="M46 98 Q70 90 94 98 L100 146 Q70 158 40 146 Z" fill="var(--c-dress, #f28bb4)" />
      {/* colarinho branco bem visível */}
      <path d="M53 97 Q70 88 87 97 L79 114 Q70 119 61 114 Z" fill="#ffffff" stroke="#e0d4f0" strokeWidth={1.6} strokeLinejoin="round" />
      {/* botõezinhos */}
      <circle cx={70} cy={120} r={2} fill="var(--c-dress-dark, #e56b9d)" />
      <circle cx={70} cy={129} r={2} fill="var(--c-dress-dark, #e56b9d)" />
      <circle cx={70} cy={138} r={2} fill="var(--c-dress-dark, #e56b9d)" />
      {/* barra de babados */}
      <path
        d="M40 146 q5 9 10 0 q5 9 10 0 q5 9 10 0 q5 9 10 0 q5 9 10 0 q5 9 10 0 L100 150 Q70 158 40 150 Z"
        fill="var(--c-dress-dark, #e56b9d)"
      />

      {/* echarpe — o "colar" da Lulu: contorno escuro pra aparecer
          mesmo quando a cor dela é igual à do vestido */}
      <path d="M40 104 q30 8 60 0 l-3 8 q-27 6 -54 0 z" fill="var(--c-scarf, #f28bb4)" stroke="var(--c-scarf-dark, #e56b9d)" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M92 104 l6 13 l-8 -3 z" fill="var(--c-scarf-dark, #e56b9d)" />
      {/* gema (Émeraude) */}
      <g className="mc-gem">
        <path d="M70 106 l6.5 5.5 -6.5 8 -6.5 -8 z" fill="#2e9e5b" stroke="#217a45" strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M70 106 l6.5 5.5 -3 2.2 -3.5 -3.4 z" fill="#5fc98a" />
        <circle cx={67.5} cy={113} r={1.2} fill="#c6f0d8" />
      </g>

      {/* perninhas com meia listrada */}
      <rect x={56} y={154} width={9} height={24} rx={4.5} fill="var(--c-skin, #f3ecff)" />
      <rect x={75} y={154} width={9} height={24} rx={4.5} fill="var(--c-skin, #f3ecff)" />
      <path d="M60.5 156 v20 M79.5 156 v20" stroke="var(--c-dress-dark, #e56b9d)" strokeWidth={1.2} opacity={0.5} />

      {/* sapatinhos Mary Jane (sem laços entre os pés) */}
      <rect x={44} y={175} width={24} height={12} rx={5} fill="#8a5a2b" />
      <path d="M46 175 v-4 M66 175 v-4" stroke="#6f4622" strokeWidth={2.4} />
      <rect x={72} y={175} width={24} height={12} rx={5} fill="#8a5a2b" />
      <path d="M74 175 v-4 M94 175 v-4" stroke="#6f4622" strokeWidth={2.4} />

      {/* mãozinha do tchauzinho (acena na Home; invisível o resto do tempo) */}
      <g className="mc-wave-hand">
        <path d="M98 104 Q112 96 116 82" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={5.5} strokeLinecap="round" fill="none" />
        <circle cx={118} cy={78} r={6.5} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.8} />
        <circle cx={121.5} cy={71} r={2.4} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.2} />
        <circle cx={116} cy={69} r={2.4} fill="var(--c-skin, #f3ecff)" stroke="var(--c-skin-dark, #e7dcfb)" strokeWidth={1.2} />
      </g>

      {/* ondas de fala */}
      {speaking && (
        <g fill="none" stroke="#b9a5f0" strokeWidth={2.4} strokeLinecap="round" opacity={0.8}>
          <path d="M116 40 q6 5 0 10" />
          <path d="M124 34 q8 6 0 12" />
        </g>
      )}

      {/* corações do nível 3 (toques seguidos) */}
      {level >= 3 && (
        <g className="lulu-hearts" fill="#ff7bac">
          <path d="M40 46 c-2.5 -3 -7 -1.2 -5.4 2.4 c1.2 2.4 5.4 3.6 5.4 3.6 s4.2 -1.2 5.4 -3.6 c1.6 -3.6 -2.9 -5.4 -5.4 -2.4 z" />
          <path d="M95 38 c-2 -2.4 -5.6 -1 -4.3 1.9 c1 1.9 4.3 2.9 4.3 2.9 s3.4 -1 4.3 -2.9 c1.3 -2.9 -2.3 -4.3 -4.3 -1.9 z" />
          <path d="M70 28 c-2.2 -2.7 -6.2 -1.1 -4.8 2.1 c1.1 2.1 4.8 3.2 4.8 3.2 s3.7 -1.1 4.8 -3.2 c1.4 -3.2 -2.6 -4.8 -4.8 -2.1 z" />
        </g>
      )}

      {/* coraçãozinho flutuante (apaixonada) */}
      {mood === "love" && <path d="M70 20 c-4 -5 -12 -2 -9 4 c2 4 9 6 9 6 c0 0 7 -2 9 -6 c3 -6 -5 -9 -9 -4 z" fill="#e5484d" />}
    </svg>
  );
}
