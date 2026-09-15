import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { TurmaCard } from "../../components/turmas/TurmaCard";
import { NovaTurmaCard } from "../../components/turmas/NovaTurmaCard";
import { CopyCodeButton } from "../../components/turmas/CopyCodeButton";
import { SkeletonGrid } from "../../components/ui/Skeleton";
import * as turmaService from "../../services/turma.service";
import type { MinhaTurmaProfessor } from "../../types";

export function ProfessorTurmas() {
  const [turmas, setTurmas] = useState<MinhaTurmaProfessor[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    turmaService
      .listMinhasTurmas()
      .then((res) => setTurmas(res.turmas as MinhaTurmaProfessor[]))
      .catch(() => setErro("Não foi possível carregar suas turmas."));
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas turmas</h1>
        <p className="mt-1 text-ink-muted">Compartilhe o código com os alunos para eles entrarem na turma.</p>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {!turmas && !erro && <SkeletonGrid />}

      {turmas && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <TurmaCard
              key={turma.id}
              to={`/professor/turmas/${turma.id}`}
              turmaId={turma.id}
              nome={turma.nome}
              disciplina={turma.disciplina}
              rodape={
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <Users size={14} aria-hidden="true" />
                    {turma.totalAlunos} aluno(s) matriculado(s)
                  </p>
                  <CopyCodeButton codigo={turma.codigo} />
                </div>
              }
            />
          ))}
          <NovaTurmaCard onCreated={carregar} />
        </div>
      )}
    </div>
  );
}
