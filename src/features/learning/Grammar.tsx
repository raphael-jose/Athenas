// ══════════════════════════════════════════════════════════════
// Athenas — Árvore de gramática
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { useRouter } from "@/lib/router";
import { GRAMMAR_TREE, type GrammarNode } from "@/data/grammar";
import { grammarExercises } from "@/data/grammarPractice";
import { Button, Chip, Modal, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";

export function GrammarPage() {
  const { navigate } = useRouter();
  const [selected, setSelected] = useState<GrammarNode | null>(null);
  const { state } = useApp();

  return (
    <div className="page">
      <PageHeader title={<><Icon name="book" size={20} style={{ verticalAlign: -3 }} /> Árvore de gramática</>} sub="Do pronome às nuances do Modo Deus Supremo" onBack={() => navigate("/")} />

      <Button variant="gold" block className="mb-3" onClick={() => navigate("/duel")}>
        <Icon name="sword" size={16} /> Grammar Duel — desafie a Lulu
      </Button>

      <div className="stack">
        {GRAMMAR_TREE.map((g, i) => (
          <div key={g.id}>
            <button className="lesson-card" onClick={() => setSelected(g)}>
              <div className="lc-emoji">
                <Icon name={g.icon} size={24} />
              </div>
              <div className="grow">
                <h4>
                  {i + 1}. {g.title}{" "}
                  {g.advanced && (
                    <Chip variant="gold">
                      <Icon name="crownSimple" size={13} /> Avançado
                    </Chip>
                  )}
                </h4>
                <div className="lc-meta">{g.blurb}</div>
              </div>
              <span aria-hidden>→</span>
            </button>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.title}` : undefined}>
        {selected && (
          <>
            <p className="small">{selected.blurb}</p>
            {grammarExercises(selected.id).length > 0 && (
              <Button
                variant="accent"
                block
                onClick={() => {
                  const id = selected.id;
                  setSelected(null);
                  navigate(`/practice/grammar/${id}`);
                }}
              >
                Praticar este tópico
              </Button>
            )}
            {selected.lessonId && (
              <Button
                variant="ghost"
                block
                className="mt-2"
                onClick={() => {
                  const lid = selected.lessonId!;
                  setSelected(null);
                  navigate(`/lesson/${lid}`);
                }}
              >
                Ir para a aula sobre isso
              </Button>
            )}
            {selected.advanced && (
              <p className="muted small mt-3">
                Conteúdo avançado — disponível conforme você avança no CEFR e nas fases do Modo Deus Supremo.
              </p>
            )}
            {state.cefr < 3 && selected.advanced && (
              <p className="muted small">Seu nível atual: {["A0","A1","A2","B1","B2","C1","C2","NATIF"][state.cefr]}. Continue a aventura!</p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
