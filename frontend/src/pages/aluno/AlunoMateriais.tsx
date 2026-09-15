import { useEffect, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { MaterialListItem } from "../../components/materiais/MaterialListItem";
import * as materialService from "../../services/material.service";
import type { Material } from "../../types";

function agruparPorDisciplina(materiais: Material[]) {
  const grupos = new Map<string, Material[]>();
  for (const material of materiais) {
    const grupo = grupos.get(material.disciplina) ?? [];
    grupo.push(material);
    grupos.set(material.disciplina, grupo);
  }
  return grupos;
}

export function AlunoMateriais() {
  const [materiais, setMateriais] = useState<Material[] | null>(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      materialService
        .listMateriais(busca || undefined)
        .then((res) => setMateriais(res.materiais))
        .catch(() => setErro("Não foi possível carregar os materiais."));
    }, 300);

    return () => clearTimeout(timeout);
  }, [busca]);

  const grupos = materiais ? agruparPorDisciplina(materiais) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Materiais de apoio</h1>
        <p className="mt-1 text-ink-muted">Conteúdos publicados pelos seus professores.</p>
      </div>

      <div className="relative max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <label htmlFor="busca-material" className="sr-only">
          Pesquisar por assunto
        </label>
        <input
          id="busca-material"
          type="search"
          className="field-input pl-10"
          placeholder="Pesquisar por assunto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {!materiais && !erro && <SkeletonList />}

      {materiais && materiais.length === 0 && (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum material encontrado"
          description={busca ? "Tente pesquisar por outro termo." : "Seus professores ainda não publicaram nada."}
        />
      )}

      {grupos &&
        Array.from(grupos.entries()).map(([disciplina, itens]) => (
          <div key={disciplina} className="card">
            <h2 className="section-title mb-2">{disciplina}</h2>
            <ul>
              {itens.map((material) => (
                <MaterialListItem key={material.id} material={material} />
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
