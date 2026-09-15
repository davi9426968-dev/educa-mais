import { useEffect, useState } from "react";
import { CalendarCheck, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { TarefaForm } from "../../components/tarefas/TarefaForm";
import { TarefaListItem } from "../../components/tarefas/TarefaListItem";
import { NovaTurmaForm } from "../../components/turmas/NovaTurmaForm";
import * as tarefaService from "../../services/tarefa.service";
import type { CreateTarefaInput } from "../../services/tarefa.service";
import * as turmaService from "../../services/turma.service";
import type { MinhaTurmaProfessor, Tarefa } from "../../types";

export function ProfessorAtividades() {
  const [turmas, setTurmas] = useState<MinhaTurmaProfessor[] | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [turmasRes, tarefasRes] = await Promise.all([
        turmaService.listMinhasTurmas(),
        tarefaService.listTarefas(),
      ]);
      setTurmas(turmasRes.turmas as MinhaTurmaProfessor[]);
      setTarefas(tarefasRes.tarefas);
    } catch {
      setErro("Não foi possível carregar as atividades.");
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

  async function handleDelete(id: string) {
    await tarefaService.deleteTarefa(id);
    await carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Atividades</h1>
          <p className="mt-1 text-ink-muted">Tarefas atribuídas às suas turmas.</p>
        </div>
        {turmas && turmas.length > 0 && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {showForm ? "Fechar" : "Nova atividade"}
          </Button>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {!turmas && !erro && <SkeletonList />}

      {turmas && turmas.length === 0 && <NovaTurmaForm onCreated={carregar} />}

      {showForm && turmas && turmas.length > 0 && (
        <TarefaForm turmas={turmas} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {tarefas && tarefas.length === 0 && turmas && turmas.length > 0 && (
        <EmptyState
          icon={CalendarCheck}
          title="Nenhuma atividade criada ainda"
          description="Crie a primeira atividade para começar a acompanhar a turma."
        />
      )}

      {tarefas && tarefas.length > 0 && (
        <div className="card">
          <ul>
            {tarefas.map((tarefa) => (
              <TarefaListItem key={tarefa.id} tarefa={tarefa} canManage onDelete={() => handleDelete(tarefa.id)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
