import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import clsx from "clsx";
import { Layers } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { TarefaListItem } from "../../components/tarefas/TarefaListItem";
import { MaterialListItem } from "../../components/materiais/MaterialListItem";
import { AvisoListItem } from "../../components/avisos/AvisoListItem";
import * as turmaService from "../../services/turma.service";
import * as tarefaService from "../../services/tarefa.service";
import type { Aviso, Material, MuralItem, MuralResponse, Tarefa } from "../../types";
import { corDaTurma } from "../../utils/turmaCor";

const SEM_TOPICO = "Mural geral";

function agruparPorTopico(itens: MuralItem[]) {
  const grupos = new Map<string, MuralItem[]>();
  for (const item of itens) {
    const chave = item.topico ?? SEM_TOPICO;
    const grupo = grupos.get(chave) ?? [];
    grupo.push(item);
    grupos.set(chave, grupo);
  }
  return grupos;
}

export function TurmaMural() {
  const { id } = useParams<{ id: string }>();
  const [mural, setMural] = useState<MuralResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    if (!id) return;
    turmaService.getMural(id).then(setMural).catch(() => setErro("Não foi possível carregar o mural."));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleToggle(tarefa: Tarefa, concluida: boolean) {
    // Atualização otimista: o checkbox reflete o clique na hora, sem esperar a rede.
    setMural((prev) =>
      prev
        ? {
            ...prev,
            itens: prev.itens.map((entry) =>
              entry.tipo === "TAREFA" && (entry.item as Tarefa).id === tarefa.id
                ? { ...entry, item: { ...(entry.item as Tarefa), concluida } }
                : entry
            ),
          }
        : prev
    );

    try {
      await tarefaService.concluirTarefa(tarefa.id, concluida);
    } catch {
      setErro("Não foi possível atualizar a tarefa.");
      carregar();
    }
  }

  if (erro) {
    return (
      <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
        {erro}
      </p>
    );
  }

  if (!mural) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-surface-sunken" />
        <SkeletonList />
      </div>
    );
  }

  const grupos = agruparPorTopico(mural.itens);

  return (
    <div className="space-y-6">
      <div
        className={clsx(
          "relative -mx-4 overflow-hidden rounded-2xl bg-gradient-to-br px-6 py-8 text-white shadow-lg sm:-mx-6",
          corDaTurma(mural.turma.id)
        )}
      >
        <Layers
          size={140}
          strokeWidth={1}
          className="pointer-events-none absolute -right-6 -top-6 text-white/10"
          aria-hidden="true"
        />
        <h1 className="relative font-display text-2xl font-bold">{mural.turma.nome}</h1>
        <p className="relative text-white/85">{mural.turma.disciplina}</p>
      </div>

      {mural.itens.length === 0 && (
        <EmptyState
          icon={Layers}
          title="Ainda não há nada por aqui"
          description="Quando o professor publicar atividades, materiais ou avisos, eles aparecem neste mural."
        />
      )}

      {Array.from(grupos.entries()).map(([topico, itens]) => (
        <div key={topico} className="card">
          <h2 className="section-title mb-2">{topico}</h2>
          <ul>
            {itens.map((entry) => {
              if (entry.tipo === "TAREFA") {
                const tarefa = entry.item as Tarefa;
                return (
                  <TarefaListItem
                    key={entry.id}
                    tarefa={tarefa}
                    showCheckbox
                    onToggleConcluida={(concluida) => handleToggle(tarefa, concluida)}
                  />
                );
              }
              if (entry.tipo === "MATERIAL") {
                return <MaterialListItem key={entry.id} material={entry.item as Material} />;
              }
              return <AvisoListItem key={entry.id} aviso={entry.item as Aviso} />;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
