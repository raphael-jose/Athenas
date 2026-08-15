// ══════════════════════════════════════════════════════════════
// Athenas — Roteador hash simples (GitHub Pages: sem 404 no refresh)
// ══════════════════════════════════════════════════════════════
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

function currentPath(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h || "/";
}

export function navigate(to: string) {
  window.location.hash = to.startsWith("/") ? to : `/${to}`;
}

interface RouterCtx {
  path: string;
  navigate: (to: string) => void;
}

const Ctx = createContext<RouterCtx>({ path: "/", navigate });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(currentPath());

  useEffect(() => {
    const onHash = () => setPath(currentPath());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((to: string) => navigate(to), []);

  return <Ctx.Provider value={{ path, navigate: go }}>{children}</Ctx.Provider>;
}

export function useRouter() {
  return useContext(Ctx);
}

/** Divide "/lesson/l1-bonjour" em ["lesson", "l1-bonjour"] */
export function routeParts(path: string): string[] {
  return path.split("/").filter(Boolean);
}
