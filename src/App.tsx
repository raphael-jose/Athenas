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
import { ChallengePage } from "@/features/practice/Challenge";
import { VocabularyPage } from "@/features/profile/Vocabulary";
import { CustomizePage } from "@/features/profile/Customize";
import { FeedbackPage } from "@/features/profile/Feedback";
import { AboutPage } from "@/features/profile/About";
import { MentorPage } from "@/features/mentor/Mentor";
import { lessonById, WORLDS, worldById, worldProgress } from "@/data/worlds";
import { playBossMusic, playWorldMusic, setMusicEnabled, stopMusic } from "@/lib/music";

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

  // Aplica tema + escala de fonte + roupinha da Lulu no <html>
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.font = String(state.settings.fontScale);
    document.documentElement.dataset.costume = state.settings.costume;
    document.documentElement.style.colorScheme = state.settings.theme === "nuit" ? "dark" : "light";
  }, [state.settings.theme, state.settings.fontScale, state.settings.costume]);

  // Música de fundo conforme o mapa: cada mundo tem sua trilha que
  // EVOLUI em camadas conforme as aulas concluídas (pad → baixo →
  // melodia → brilho), o boss fica tenso, e as demais telas em silêncio.
  useEffect(() => {
    setMusicEnabled(state.settings.music);
    if (!state.settings.music || !state.onboarded) {
      stopMusic();
      return;
    }
    const seg = parts[0];
    if (seg === "boss") {
      playBossMusic();
      return;
    }
    let world: (typeof WORLDS)[number] | undefined;
    if (seg === "world") {
      world = worldById(parts[1] ?? "");
    } else if (seg === "lesson") {
      world = worldById(lessonById(parts[1] ?? "")?.worldId ?? "");
    } else {
      // mapa/home: o mundo atual = o primeiro com aula pendente
      for (const w of WORLDS) {
        if (w.lessons.length === 0) continue;
        if (!state.worldsUnlocked.includes(w.id) && !state.worldsCleared.includes(w.id)) continue;
        world = w;
        break;
      }
    }
    if (!world) {
      stopMusic();
      return;
    }
    const p = worldProgress(world, state.lessonsCompleted);
    playWorldMusic(world.order, p.total > 0 ? p.done / p.total : 0);
  }, [path, state.settings.music, state.onboarded, state.lessonsCompleted]);

  // Streak carinhoso em cada visita
  useEffect(() => {
    touchStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A voz natural é aquecida junto com o PRIMEIRO áudio tocado (tap no
  // alto-falante) — ver kickOffNaturalWarmup em useSpeech. Sem aquecimento
  // automático em segundo plano: nada carrega enquanto o usuário digita
  // ou estuda (nada de congelar a tela).

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
      // key={lessonId}: sem ela, o React reaproveita o estado interno do
      // player ao trocar de aula (ex.: botão "Próxima aula" ficava preso
      // na tela de "Bravo!" da aula anterior).
      case "lesson": return <LessonPlayer key={parts[1] ?? ""} lessonId={parts[1] ?? ""} />;
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
      case "challenge": return <ChallengePage />;
      case "vocabulary": return <VocabularyPage />;
      case "customize": return <CustomizePage />;
      case "mentor": return <MentorPage />;
      case "profile": return <ProfilePage />;
      case "feedback": return <FeedbackPage />;
      case "about": return <AboutPage />;
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
