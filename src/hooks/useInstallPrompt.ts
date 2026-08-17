// ══════════════════════════════════════════════════════════════
// Athenas — Instalação PWA (atalho na tela inicial)
// Captura o evento beforeinstallprompt (Chrome/Android/Edge/desktop)
// e detecta se o app já roda como instalado (standalone). No iOS o
// navegador não dispara o evento — a UI mostra as instruções manuais.
// ══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallPromptApi {
  /** true quando o navegador ofereceu instalar (beforeinstallprompt capturado). */
  canInstall: boolean;
  /** true quando o app já roda instalado (atalho na tela inicial). */
  isStandalone: boolean;
  /** true depois do evento appinstalled. */
  installed: boolean;
  /** Dispara o prompt nativo. Resolve true se o usuário aceitou. */
  install: () => Promise<boolean>;
}

/**
 * `suppress` = suprimir o banner nativo do navegador (chamando
 * preventDefault) para mostrar o botão de instalação PRÓPRIO do app.
 * Deve ser true SÓ quando o modal de instalação vai aparecer — se for
 * sempre true, o Chrome reclama no console ("Banner not shown:
 * preventDefault() called") em toda visita em que o modal não aparece.
 */
export function useInstallPrompt(suppress = true): InstallPromptApi {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Só suprime o banner nativo quando o app vai mostrar o próprio
      // botão de instalação (senão o Chrome avisa no console e o
      // navegador fica sem o banner nativo à toa).
      if (suppress) e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [suppress]);

  const install = useCallback(async () => {
    const e = deferred.current;
    if (!e) return false;
    deferred.current = null;
    setCanInstall(false);
    try {
      await e.prompt();
      const choice = await e.userChoice;
      return choice.outcome === "accepted";
    } catch {
      return false;
    }
  }, []);

  return { canInstall, isStandalone, installed, install };
}
