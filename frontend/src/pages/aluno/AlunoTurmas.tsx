import { useEffect, useState } from "react";
import { TurmaCard } from "../../components/turmas/TurmaCard";
import { EntrarTurmaCard } from "../../components/turmas/EntrarTurmaCard";
import { SkeletonGrid } from "../../components/ui/Skeleton";
import * as turmaService from "../../services/turma.service";
import type { MinhaTurmaAluno } from "../../types";

export function AlunoTurmas() {
  const [turmas, setTurmas] = useState<MinhaTurmaAluno[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    turmaService
      .listMinhasTurmas()
      .then((res) => setTurmas(res.turmas as MinhaTurmaAluno[]))
      .catch(() => setErro("Não foi possível carregar suas turmas."));
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas turmas</h1>
        <p className="mt-1 text-ink-muted">Entre com o código que o professor compartilhou para acessar uma nova turma.</p>
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
              to={`/aluno/turmas/${turma.id}`}
              turmaId={turma.id}
              nome={turma.nome}
              disciplina={turma.disciplina}
              rodape={<p className="text-sm text-ink-muted">Prof. {turma.professor.nome}</p>}
            />
          ))}
          <EntrarTurmaCard onEntrou={carregar} />
        </div>
      )}
    </div>
  );
}
