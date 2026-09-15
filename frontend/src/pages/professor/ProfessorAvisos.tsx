import { useEffect, useState } from "react";
import { Megaphone, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { AvisoForm } from "../../components/avisos/AvisoForm";
import { AvisoListItem } from "../../components/avisos/AvisoListItem";
import * as avisoService from "../../services/aviso.service";
import type { CreateAvisoInput } from "../../services/aviso.service";
import * as turmaService from "../../services/turma.service";
import type { Aviso, MinhaTurmaProfessor } from "../../types";

export function ProfessorAvisos() {
  const [turmas, setTurmas] = useState<MinhaTurmaProfessor[] | null>(null);
  const [avisos, setAvisos] = useState<Aviso[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [turmasRes, avisosRes] = await Promise.all([
        turmaService.listMinhasTurmas(),
        avisoService.listAvisos(),
      ]);
      setTurmas(turmasRes.turmas as MinhaTurmaProfessor[]);
      setAvisos(avisosRes.avisos);
    } catch {
      setErro("Não foi possível carregar os avisos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCreate(input: CreateAvisoInput) {
    await avisoService.createAviso(input);
    setShowForm(false);
    await carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avisos</h1>
          <p className="mt-1 text-ink-muted">Comunicados para responsáveis e alunos.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {showForm ? "Fechar" : "Novo aviso"}
        </Button>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {showForm && turmas && (
        <AvisoForm turmas={turmas} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {!avisos && !erro && <SkeletonList />}

      {avisos && avisos.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="Nenhum aviso enviado ainda"
          description="Envie comunicados para uma turma específica ou para toda a escola."
        />
      )}

      {avisos && avisos.length > 0 && (
        <div className="card">
          <ul>
            {avisos.map((aviso) => (
              <AvisoListItem key={aviso.id} aviso={aviso} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


