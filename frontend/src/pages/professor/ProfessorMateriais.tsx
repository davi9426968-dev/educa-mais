import { useEffect, useState } from "react";
import { FolderOpen, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { MaterialForm } from "../../components/materiais/MaterialForm";
import { MaterialListItem } from "../../components/materiais/MaterialListItem";
import { NovaTurmaForm } from "../../components/turmas/NovaTurmaForm";
import * as materialService from "../../services/material.service";
import type { CreateMaterialInput } from "../../services/material.service";
import * as turmaService from "../../services/turma.service";
import type { Material, MinhaTurmaProfessor } from "../../types";

export function ProfessorMateriais() {
  const [turmas, setTurmas] = useState<MinhaTurmaProfessor[] | null>(null);
  const [materiais, setMateriais] = useState<Material[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [turmasRes, materiaisRes] = await Promise.all([
        turmaService.listMinhasTurmas(),
        materialService.listMateriais(),
      ]);
      setTurmas(turmasRes.turmas as MinhaTurmaProfessor[]);
      setMateriais(materiaisRes.materiais);
    } catch {
      setErro("Não foi possível carregar os materiais.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCreate(input: CreateMaterialInput) {
    await materialService.createMaterial(input);
    setShowForm(false);
    await carregar();
  }

  async function handleDelete(id: string) {
    await materialService.deleteMaterial(id);
    await carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materiais de apoio</h1>
          <p className="mt-1 text-ink-muted">Publique textos, links, vídeos e arquivos para suas turmas.</p>
        </div>
        {turmas && turmas.length > 0 && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {showForm ? "Fechar" : "Novo material"}
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
        <MaterialForm turmas={turmas} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {materiais && materiais.length === 0 && turmas && turmas.length > 0 && (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum material publicado ainda"
          description="Publique textos, links, vídeos ou arquivos para seus alunos."
        />
      )}

      {materiais && materiais.length > 0 && (
        <div className="card">
          <ul>
            {materiais.map((material) => (
              <MaterialListItem
                key={material.id}
                material={material}
                canManage
                onDelete={() => handleDelete(material.id)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
