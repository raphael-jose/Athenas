// ══════════════════════════════════════════════════════════════
// Athenas — Modal de atalho (PWA)
// No PRIMEIRO login, convida a adicionar o app à tela inicial do
// celular — para a aluna não ficar abrindo o navegador e digitando
// a URL toda vez. Usa o prompt nativo (beforeinstallprompt) quando
// existe; no iOS mostra as instruções do Safari.
// ══════════════════════════════════════════════════════════════
import { useEffect } from "react";
import { useApp } from "@/hooks/useApp";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button, Modal } from "@/components/ui";
import { Icon } from "@/components/Icons";

export function InstallPrompt() {
  const { state, markInstallPrompt, toast } = useApp();
  const { canInstall, isStandalone, installed, install } = useInstallPrompt();

  // Já instalou (botão nativo aceito): registra e comemora.
  useEffect(() => {
    if (installed) {
      markInstallPrompt();
      toast("Athenas instalado! Agora é só tocar no ícone 💗", "heart");
    }
  }, [installed, markInstallPrompt, toast]);

  // Só no primeiro login e quando o app ainda não está instalado.
  const show = state.onboarded && !state.installPromptSeen && !isStandalone;
  if (!show) return null;

  const onInstall = async () => {
    const ok = await install();
    if (ok) {
      markInstallPrompt();
      toast("Athenas instalado! Agora é só tocar no ícone 💗", "heart");
    }
  };

  return (
    <Modal open={show} onClose={markInstallPrompt}>
      <div className="center" style={{ padding: "4px 0" }}>
        <div className="floaty" style={{ color: "var(--c-primary)", display: "flex", justifyContent: "center" }}>
          <Icon name="starFour" size={52} />
        </div>
        <h2 style={{ margin: "10px 0 6px" }}>Instala o Athenas no celular 🌸</h2>

        {canInstall ? (
          <>
            <p className="muted small" style={{ maxWidth: 340 }}>
              Adicione um atalho na tela inicial pra abrir o app direto do
              ícone — sem ficar digitando o endereço toda vez. O progresso
              continua salvo aqui no seu celular.
            </p>
            <Button block className="mt-3" onClick={onInstall}>
              <Icon name="phoneCall" size={18} /> Adicionar à tela inicial
            </Button>
            <Button variant="ghost" block className="mt-2" onClick={markInstallPrompt}>
              Agora não
            </Button>
          </>
        ) : (
          <>
            <p className="muted small" style={{ maxWidth: 340 }}>
              No seu navegador, toque em <strong>Compartilhar</strong> (o
              quadrado com a seta pra cima) e depois em{" "}
              <strong>“Adicionar à Tela de Início”</strong>. Pronto: o Athenas
              vira um app com ícone na home.
            </p>
            <Button block className="mt-3" onClick={markInstallPrompt}>
              Entendi 💗
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
