// ══════════════════════════════════════════════════════════════
// Athenas — Navegação inferior (ícones próprios, fofos e profissionais)
// ══════════════════════════════════════════════════════════════
import { useRouter } from "@/lib/router";
import { useApp } from "@/hooks/useApp";
import { nextReviewCount } from "@/services/srs";
import { Icon } from "@/components/Icons";
import type { IconName } from "@/types";
import { sfxClick } from "@/lib/sfx";

const ITEMS: { path: string; label: string; icon: IconName }[] = [
  { path: "/", label: "Início", icon: "home" },
  { path: "/map", label: "Aventura", icon: "map" },
  { path: "/review", label: "Revisar", icon: "brain" },
  { path: "/ai", label: "Lulu", icon: "chat" },
  { path: "/profile", label: "Perfil", icon: "user" }
];

export function BottomNav() {
  const { path, navigate } = useRouter();
  const { state } = useApp();
  const due = nextReviewCount(state.reviewQueue);

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {ITEMS.map((it) => {
        const active = path === it.path || (it.path !== "/" && path.startsWith(it.path + "/"));
        return (
          <button key={it.path} className={active ? "active" : ""} onClick={() => { sfxClick(); navigate(it.path); }} aria-current={active ? "page" : undefined}>
            <Icon name={it.icon} size={23} filled={active} className="ico" />
            <span>{it.label}</span>
            {it.path === "/review" && due > 0 && <span className="nav-dot">{due > 9 ? "9+" : due}</span>}
          </button>
        );
      })}
    </nav>
  );
}
