// ══════════════════════════════════════════════════════════════
// Athenas — Helpers de UI para a central de IA
// ══════════════════════════════════════════════════════════════
export { Button, Card, Chip, Modal, PageHeader, Segmented, SettingRow } from "@/components/ui";

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      className="text-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
    />
  );
}
