// ══════════════════════════════════════════════════════════════
// Athenas — Shell do aplicativo
// ══════════════════════════════════════════════════════════════
import { useEffect } from "react";
import { AppProvider, useApp } from "@/hooks/useApp";
import { RouterProvider, routeParts, useRouter } from "@/lib/router";
import { dayKey } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";
import { FloatingBackdrop } from "@/components/FloatingBackdrop";
import { LevelUpModal, AchievementModal } from "@/components/Celebrations";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Onboarding } from "@/features/onboarding/Onboarding";
import { WelcomeBack } from "@/features/onboarding/WelcomeBack";
import { Home } from "@/features/home/Home";
import { MapPage } from "@/features/map/Map";
import { WorldDetail } from "@/features/map/WorldDetail";
import { LessonPlayer } from "@/features/learning/LessonPlayer";
import { BossBattle } from "@/features/learning/BossBattle";
import { ReviewPage } from "@/features/review/Review";
import { AIHub } from "@/features/ai/AIHub";
import { ProfilePage } from "@/features/profile/Profile";
import { AchievementsPage } from "@/features/profile/Achievements";
import { GrammarPage } from "@/features/learning/Grammar";
import { GrammarPracticePage } from "@/features/learning/GrammarPractice";
import { GrammarDuelPage } from "@/features/learning/GrammarDuel";
import { NegotiationGamePage } from "@/features/learning/NegotiationGame";
import { PronunciationPage } from "@/features/practice/Pronunciation";
import { VocabularyPage } from "@/features/profile/Vocabulary";
import { CustomizePage } from "@/features/profile/Customize";
import { MentorPage } from "@/features/mentor/Mentor";

function Shell() {
  const { state, touchStreak, setLastRoute } = useApp();
  const { path } = useRouter();
  const parts = routeParts(path);

  // "Memória": a rota onde o usuário parou (para continuar de onde parou).
  // Só registra quando o app está aberto de verdade (não na tela de boas-vindas).
  const showWelcomeBack = state.onboarded && state.lastLoginDate !== dayKey();
  useEffect(() => {
    if (state.onboarded && !showWelcomeBack) setLastRoute(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, state.onboarded, showWelcomeBack]);

  // Aplica tema + escala de fonte no <html>
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.font = String(state.settings.fontScale);
    document.documentElement.style.colorScheme = state.settings.theme === "nuit" ? "dark" : "light";
  }, [state.settings.theme, state.settings.fontScale]);

  // Streak carinhoso em cada visita
  useEffect(() => {
    touchStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.onboarded) {
    return (
      <>
        <FloatingBackdrop theme={state.settings.theme} />
        <Onboarding />
        <Celebrations />
      </>
    );
  }

  const page = (() => {
    switch (parts[0] ?? "") {
      case "": return <Home />;
      case "map": return <MapPage />;
      case "world": return <WorldDetail worldId={parts[1] ?? ""} />;
      case "lesson": return <LessonPlayer lessonId={parts[1] ?? ""} />;
      case "boss": return <BossBattle bossId={parts[1] ?? ""} />;
      case "review": return <ReviewPage />;
      case "ai": return <AIHub />;
      case "achievements": return <AchievementsPage />;
      case "grammar": return <GrammarPage />;
      case "duel": return <GrammarDuelPage />;
      case "negociation": return <NegotiationGamePage />;
      case "practice":
        if (parts[1] === "pronunciation") return <PronunciationPage />;
        if (parts[1] === "grammar" && parts[2]) return <GrammarPracticePage nodeId={parts[2]} />;
        return <GrammarPage />;
      case "vocabulary": return <VocabularyPage />;
      case "customize": return <CustomizePage />;
      case "mentor": return <MentorPage />;
      case "profile": return <ProfilePage />;
      case "welcome":
        // já onboarded: volta pra home
        window.location.hash = "/";
        return <Home />;
      default:
        return (
          <div className="page center">
            <h2>Página não encontrada</h2>
            <p className="muted small">A antena perdeu o sinal dessa página…</p>
          </div>
        );
    }
  })();

  return (
    <>
      <FloatingBackdrop theme={state.settings.theme} />
      {showWelcomeBack ? (
        <WelcomeBack />
      ) : (
        <>
          <div className="app">{page}</div>
          <BottomNav />
        </>
      )}
      <Celebrations />
      <InstallPrompt />
    </>
  );
}

function Celebrations() {
  return (
    <>
      <LevelUpModal />
      <AchievementModal />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider>
        <Shell />
      </RouterProvider>
    </AppProvider>
  );
}
