// ══════════════════════════════════════════════════════════════
// Athenas — Meu vocabulário: significados + áudio de cada palavra
// ══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { wordById } from "@/data/words";
import { masteryLevel } from "@/services/srs";
import { AudioButton } from "@/components/AudioButton";
import { Card, Chip, EmptyState, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { normalize } from "@/lib/utils";

export function VocabularyPage() {
  const { state } = useApp();
  const { navigate } = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todas" | "dominadas">("todas");

  const words = useMemo(() => {
    const list = state.wordsLearned
      .map((id) => wordById(id))
      .filter((w): w is NonNullable<typeof w> => !!w);
    const filtered = list.filter((w) => {
      if (filter === "dominadas") {
        const item = state.reviewQueue.find((r) => r.wordId === w.id);
        if (!item || masteryLevel(item) !== "dominada") return false;
      }
      if (!q) return true;
      const n = normalize(q);
      return normalize(w.fr).includes(n) || normalize(w.pt).includes(n);
    });
    return filtered;
  }, [state.wordsLearned, state.reviewQueue, q, filter]);

  return (
    <div className="page">
      <PageHeader title={<><Icon name="book" size={20} style={{ verticalAlign: -3 }} /> Meu vocabulário</>} sub={`${state.wordsLearned.length} palavras aprendidas`} onBack={() => navigate("/")} />

      <input
        className="text-input mb-3"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar palavra (francês ou português)…"
        aria-label="Buscar palavra"
      />

      <div className="mb-3">
        <div className="seg" role="group" aria-label="Filtro">
          <button className={filter === "todas" ? "active" : ""} onClick={() => setFilter("todas")}>
            Todas ({state.wordsLearned.length})
          </button>
          <button className={filter === "dominadas" ? "active" : ""} onClick={() => setFilter("dominadas")}>
            Dominadas
          </button>
        </div>
      </div>

      {words.length === 0 ? (
        <EmptyState
          icon="leaf"
          title={state.wordsLearned.length === 0 ? "Nenhuma palavra ainda" : "Nada encontrado"}
          text={state.wordsLearned.length === 0 ? "Complete aulas para ver suas palavras aqui — sempre com o significado e o gênero." : "Tente outra busca."}
          action={state.wordsLearned.length === 0 ? <></> : undefined}
        />
      ) : (
        <Card>
          <div className="stack">
            {words.map((w) => {
              const item = state.reviewQueue.find((r) => r.wordId === w.id);
              const mastery = item ? masteryLevel(item) : "nova";
              return (
                <div key={w.id} className="row-between">
                  <div className="row grow">
                    <AudioButton text={w.fr} size="sm" label={`Ouvir ${w.fr}`} />
                    <div className="grow">
                      <div className="bold" style={{ fontSize: "1.02rem" }}>
                        {w.gender === "m" && <span className="muted">un </span>}
                        {w.gender === "f" && <span className="muted">une </span>}
                        {w.fr}
                      </div>
                      <div className="muted small row" style={{ gap: 6 }}>
                        {w.pt}
                        <AudioButton text={w.pt} size="sm" label={`Ouvir em português: ${w.pt}`} />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    {w.gender && <Chip variant="accent">{w.gender === "m" ? "masc" : "fem"}</Chip>}
                    {mastery === "dominada" && (
                      <Chip variant="green">
                        <Icon name="medal" size={14} />
                      </Chip>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="center mt-4">
        <Mascot mood="proud" size={90} />
      </div>
    </div>
  );
}
