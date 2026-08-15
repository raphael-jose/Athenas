// ══════════════════════════════════════════════════════════════
// Athenas — Kit de componentes base
// ══════════════════════════════════════════════════════════════
import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/Icons";
import { sfxClick } from "@/lib/sfx";
import type { IconName } from "@/types";

type BtnVariant = "primary" | "accent" | "soft" | "ghost" | "gold";

export function Button({
  variant = "primary",
  block,
  size,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; block?: boolean; size?: "sm" | "lg" }) {
  const cls = [
    "btn",
    variant === "primary" && "btn-primary",
    variant === "accent" && "btn-accent",
    variant === "soft" && "btn-soft",
    variant === "ghost" && "btn-ghost",
    variant === "gold" && "btn-gold",
    block && "btn-block",
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg",
    className
  ]
    .filter(Boolean)
    .join(" ");
  const { onClick, disabled, ...rest } = props;
  return (
    <button
      className={cls}
      disabled={disabled}
      onClick={(e) => {
        if (!disabled) sfxClick();
        onClick?.(e);
      }}
      {...rest}
    />
  );
}

export function Card({ className = "", soft, ...props }: React.HTMLAttributes<HTMLDivElement> & { soft?: boolean }) {
  return <div className={`card${soft ? " card-soft" : ""} ${className}`} {...props} />;
}

export function Chip({ children, variant }: { children: ReactNode; variant?: "rose" | "accent" | "gold" | "green" | "red" | "blue" }) {
  return <span className={`chip ${variant ? `chip-${variant}` : ""}`}>{children}</span>;
}

export function ProgressBar({ value, variant, thin }: { value: number; variant?: "gold" | "green" | "accent"; thin?: boolean }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress ${variant ?? ""} ${thin ? "thin" : ""}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title ?? "diálogo"}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="e-emoji" style={{ color: "var(--c-accent-deep)" }}>
        <Icon name={icon} size={34} />
      </span>
      <h3 style={{ fontSize: "1.1rem" }}>{title}</h3>
      {text && <p className="muted small">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="empty-state">
      <span className="e-emoji floaty" style={{ color: "var(--c-primary)" }}>
        <Icon name="sparkle" size={30} />
      </span>
      <p className="muted small">{label}</p>
    </div>
  );
}

export function PageHeader({ title, sub, onBack, right }: { title: ReactNode; sub?: ReactNode; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="page-head">
      {onBack && (
        <button className="back-btn" onClick={onBack} aria-label="Voltar">
          <Icon name="back" size={18} />
        </button>
      )}
      <div className="grow">
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function StatCard({ icon, value, label }: { icon: IconName; value: ReactNode; label: string }) {
  return (
    <div className="stat-card">
      <div className="s-emoji">
        <Icon name={icon} size={26} />
      </div>
      <div className="s-val">{value}</div>
      <div className="s-lbl">{label}</div>
    </div>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      className={`switch ${on ? "on" : ""}`}
      role="switch"
      aria-checked={on}
      aria-label={label ?? "alternar"}
      onClick={() => onChange(!on)}
    />
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? "active" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SettingRow({
  icon,
  title,
  desc,
  children
}: {
  icon: IconName;
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div className="setting-row">
      <span className="s-emoji" style={{ color: "var(--c-accent-deep)", display: "inline-flex" }}>
        <Icon name={icon} size={20} />
      </span>
      <div className="grow">
        <div className="bold small">{title}</div>
        {desc && <div className="muted small">{desc}</div>}
      </div>
      {children}
    </div>
  );
}
