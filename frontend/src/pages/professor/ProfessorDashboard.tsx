import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, HelpCircle, MessageCircleQuestion, UploadCloud, Users } from "lucide-react";
import { DashboardHeader } from "../../components/layout/DashboardHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SkeletonGrid } from "../../components/ui/Skeleton";
import { TurmasEntregaChart } from "../../components/charts/TurmasEntregaChart";
import * as progressoService from "../../services/progresso.service";
import type { ProgressoTurma } from "../../types";

export function ProfessorDashboard() {
  const [turmas, setTurmas] = useState<ProgressoTurma[] | null>(null);

  useEffect(() => {
    progressoService.getProgressoProfessor().then((res) => setTurmas(res.turmas));
  }, []);

  return (
    <>
      <DashboardHeader subtitle="Este é o seu painel de turmas." />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/professor/atividades">
          <Button>
            <CalendarPlus size={16} aria-hidden="true" />
            Criar atividade
          </Button>
        </Link>
        <Link to="/professor/materiais">
          <Button variant="secondary">
            <UploadCloud size={16} aria-hidden="true" />
            Publicar material
          </Button>
        </Link>
        <Link to="/professor/duvidas">
          <Button variant="secondary">
            <MessageCircleQuestion size={16} aria-hidden="true" />
            Responder dúvidas
          </Button>
        </Link>
      </div>

      {!turmas && <SkeletonGrid />}

      {turmas && turmas.length === 0 && (
        <div className="card text-center text-ink-muted">
          Você ainda não tem turmas.{" "}
          <Link to="/professor/turmas" className="font-semibold text-brand-700 dark:text-brand-300 hover:underline">
            Crie sua primeira turma
          </Link>{" "}
          para começar.
        </div>
      )}

      {turmas && turmas.length > 1 && (
        <div className="card mb-6">
          <h2 className="section-title mb-3">Entrega de atividades por turma</h2>
          <TurmasEntregaChart turmas={turmas} />
        </div>
      )}

      {turmas && turmas.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {turmas.map((turma) => (
            <div key={turma.turmaId} className="card">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink">{turma.nome}</h2>
                <Badge tone="sun">{turma.disciplina}</Badge>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Atividades entregues</dt>
                  <dd className="font-semibold text-ink">{turma.percentualEntrega}%</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <HelpCircle size={14} aria-hidden="true" />
                    Dúvidas pendentes
                  </dt>
                  <dd className="font-semibold text-ink">{turma.duvidasPendentes}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Tema com mais dúvidas</dt>
                  <dd className="font-semibold text-ink">{turma.temaComMaisDuvidas ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <Users size={14} aria-hidden="true" />
                    Alunos matriculados
                  </dt>
                  <dd className="font-semibold text-ink">{turma.totalAlunos}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
