// ══════════════════════════════════════════════════════════════
// Athenas — Botão de áudio reutilizável (ouve qualquer texto em francês)
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { Icon } from "@/components/Icons";

export function AudioButton({
  text,
  size = "md",
  label
}: {
  text: string;
  size?: "sm" | "md";
  label?: string;
}) {
  const { speak, supported } = useSpeech();
  const [playing, setPlaying] = useState(false);

  if (!supported) return null;
  const cls = size === "sm" ? "audio-btn sm" : "audio-btn";
  return (
    <button
      className={`${cls} ${playing ? "playing" : ""}`}
      onClick={() => {
        setPlaying(true);
        speak(text, { onEnd: () => setPlaying(false) });
      }}
      aria-label={label ?? `Ouvir: ${text}`}
      title="Ouvir a pronúncia"
    >
      <Icon name="speaker" size={size === "sm" ? 16 : 20} />
    </button>
  );
}
