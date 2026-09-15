import { useEffect, useState } from "react";
import { CalendarDays, Plus, Sparkles, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { TarefaForm } from "../../components/tarefas/TarefaForm";
import { TarefaListItem } from "../../components/tarefas/TarefaListItem";
import * as tarefaService from "../../services/tarefa.service";
import type { CreateTarefaInput } from "../../services/tarefa.service";
import type { Tarefa } from "../../types";
import { formatDataCurta } from "../../utils/date";

function agruparPorDia(tarefas: Tarefa[]) {
  const grupos = new Map<string, Tarefa[]>();
  for (const tarefa of tarefas) {
    const chave = formatDataCurta(tarefa.dataEntrega);
    const grupo = grupos.get(chave) ?? [];
    grupo.push(tarefa);
    grupos.set(chave, grupo);
  }
  return grupos;
}

export function AlunoAgenda() {
  const [tarefas, setTarefas] = useState<Tarefa[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const { tarefas } = await tarefaService.listTarefas();
      setTarefas(tarefas);
    } catch {
      setErro("Não foi possível carregar sua agenda.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCreate(input: CreateTarefaInput) {
    await tarefaService.createTarefa(input);
    setShowForm(false);
    await carregar();
  }

  async function handleToggle(tarefa: Tarefa, concluida: boolean) {
    setTarefas((prev) =>
      prev ? prev.map((t) => (t.id === tarefa.id ? { ...t, concluida } : t)) : prev
    );
    try {
      await tarefaService.concluirTarefa(tarefa.id, concluida);
    } catch {
      setErro("Não foi possível atualizar a tarefa.");
      await carregar();
    }
  }

  async function handleDelete(id: string) {
    await tarefaService.deleteTarefa(id);
    await carregar();
  }

  const grupos = tarefas ? agruparPorDia(tarefas) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda de estudos</h1>
          <p className="mt-1 text-ink-muted">Suas tarefas, trabalhos e revisões.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {showForm ? "Fechar" : "Nova tarefa"}
        </Button>
      </div>

      {showForm && <TarefaForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {!tarefas && !erro && <SkeletonList />}

      {tarefas && tarefas.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Nenhuma tarefa por aqui ainda"
          description="Que tal adicionar a primeira ou aguardar uma atividade do professor?"
        />
      )}

      {grupos &&
        Array.from(grupos.entries()).map(([dia, tarefasDoDia]) => (
          <div key={dia} className="card">
            <h2 className="section-title mb-2">
              <CalendarDays size={14} aria-hidden="true" />
              {dia}
            </h2>
            <ul>
              {tarefasDoDia.map((tarefa) => (
                <TarefaListItem
                  key={tarefa.id}
                  tarefa={tarefa}
                  showCheckbox
                  onToggleConcluida={(concluida) => handleToggle(tarefa, concluida)}
                  canManage={tarefa.pessoal}
                  onDelete={() => handleDelete(tarefa.id)}
                />
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
