import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { DashboardHeader } from "../../components/layout/DashboardHeader";
import { StatTile } from "../../components/ui/StatTile";
import { Skeleton } from "../../components/ui/Skeleton";
import { ProgressoSemanalChart } from "../../components/charts/ProgressoSemanalChart";
import { TarefaListItem } from "../../components/tarefas/TarefaListItem";
import { Button } from "../../components/ui/Button";
import { MeuCodigoVinculo } from "../../components/vinculo/MeuCodigoVinculo";
import * as progressoService from "../../services/progresso.service";
import * as tarefaService from "../../services/tarefa.service";
import type { ProgressoAlunoResponse, Tarefa } from "../../types";

export function AlunoDashboard() {
  const [progresso, setProgresso] = useState<ProgressoAlunoResponse | null>(null);
  const [proximasTarefas, setProximasTarefas] = useState<Tarefa[] | null>(null);

  useEffect(() => {
    progressoService.getProgressoAluno().then(setProgresso).catch(() => {});
    tarefaService
      .listTarefas()
      .then(({ tarefas }) => setProximasTarefas(tarefas.filter((t) => !t.concluida).slice(0, 4)));
  }, []);

  return (
    <>
      <DashboardHeader subtitle="Este é o seu painel de estudos." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <StatTile
            icon={TrendingUp}
            tone="leaf"
            label="Progresso da semana"
            value={progresso ? `${progresso.atual.percentual}%` : "…"}
            sublabel={
              progresso
                ? `${progresso.atual.tarefasConcluidas}/${progresso.atual.tarefasTotal} tarefas concluídas`
                : undefined
            }
          />
          <Link to="/aluno/agenda">
            <Button className="w-full">
              Continuar a estudar
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="section-title mb-3">Evolução semanal</h2>
          {progresso ? <ProgressoSemanalChart dados={progresso.evolucao} /> : <Skeleton className="h-56 w-full" />}
        </div>
      </div>

      <div className="card mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-title">Próximas tarefas</h2>
          <Link to="/aluno/agenda" className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:underline">
            Ver agenda
          </Link>
        </div>

        {!proximasTarefas && (
          <div className="space-y-3 py-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {proximasTarefas && proximasTarefas.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <CheckCircle2 size={16} className="text-leaf-600 dark:text-leaf-400" aria-hidden="true" />
            Nenhuma tarefa pendente. Você está em dia!
          </p>
        )}

        {proximasTarefas && proximasTarefas.length > 0 && (
          <ul>
            {proximasTarefas.map((tarefa) => (
              <TarefaListItem key={tarefa.id} tarefa={tarefa} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <MeuCodigoVinculo />
      </div>
    </>
  );
}
