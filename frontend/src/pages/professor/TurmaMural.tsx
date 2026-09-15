import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import clsx from "clsx";
import { CalendarPlus, Layers, Megaphone, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { TarefaForm } from "../../components/tarefas/TarefaForm";
import { TarefaListItem } from "../../components/tarefas/TarefaListItem";
import { MaterialForm } from "../../components/materiais/MaterialForm";
import { MaterialListItem } from "../../components/materiais/MaterialListItem";
import { AvisoForm } from "../../components/avisos/AvisoForm";
import { AvisoListItem } from "../../components/avisos/AvisoListItem";
import { CopyCodeButton } from "../../components/turmas/CopyCodeButton";
import * as turmaService from "../../services/turma.service";
import * as tarefaService from "../../services/tarefa.service";
import * as materialService from "../../services/material.service";
import * as avisoService from "../../services/aviso.service";
import type { CreateTarefaInput } from "../../services/tarefa.service";
import type { CreateMaterialInput } from "../../services/material.service";
import type { CreateAvisoInput } from "../../services/aviso.service";
import type { Aviso, Material, MuralItem, MuralResponse, Tarefa } from "../../types";
import { corDaTurma } from "../../utils/turmaCor";

const SEM_TOPICO = "Mural geral";
type FormAberto = "tarefa" | "material" | "aviso" | null;

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
  const [formAberto, setFormAberto] = useState<FormAberto>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [regenerando, setRegenerando] = useState(false);

  function carregar() {
    if (!id) return;
    turmaService.getMural(id).then(setMural).catch(() => setErro("Não foi possível carregar o mural."));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCreateTarefa(input: CreateTarefaInput) {
    await tarefaService.createTarefa(input);
    setFormAberto(null);
    carregar();
  }

  async function handleCreateMaterial(input: CreateMaterialInput) {
    await materialService.createMaterial(input);
    setFormAberto(null);
    carregar();
  }

  async function handleCreateAviso(input: CreateAvisoInput) {
    await avisoService.createAviso(input);
    setFormAberto(null);
    carregar();
  }

  async function handleDeleteTarefa(tarefaId: string) {
    await tarefaService.deleteTarefa(tarefaId);
    carregar();
  }

  async function handleDeleteMaterial(materialId: string) {
    await materialService.deleteMaterial(materialId);
    carregar();
  }

  async function handleRegenerarCodigo() {
    if (!id) return;
    setRegenerando(true);
    try {
      await turmaService.regenerarCodigo(id);
      carregar();
    } finally {
      setRegenerando(false);
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
  const turmaResumo = { id: mural.turma.id, nome: mural.turma.nome, disciplina: mural.turma.disciplina };

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

      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xs">
          <CopyCodeButton codigo={mural.turma.codigo} />
        </div>
        <Button variant="secondary" onClick={handleRegenerarCodigo} isLoading={regenerando}>
          <RefreshCw size={16} aria-hidden="true" />
          Gerar novo código
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setFormAberto(formAberto === "tarefa" ? null : "tarefa")}>
          <CalendarPlus size={16} aria-hidden="true" />
          Atividade
        </Button>
        <Button variant="secondary" onClick={() => setFormAberto(formAberto === "material" ? null : "material")}>
          <UploadCloud size={16} aria-hidden="true" />
          Material
        </Button>
        <Button variant="secondary" onClick={() => setFormAberto(formAberto === "aviso" ? null : "aviso")}>
          <Megaphone size={16} aria-hidden="true" />
          Aviso
        </Button>
      </div>

      {formAberto === "tarefa" && (
        <TarefaForm turmas={[turmaResumo]} onSubmit={handleCreateTarefa} onCancel={() => setFormAberto(null)} />
      )}
      {formAberto === "material" && (
        <MaterialForm turmas={[turmaResumo]} onSubmit={handleCreateMaterial} onCancel={() => setFormAberto(null)} />
      )}
      {formAberto === "aviso" && (
        <AvisoForm turmas={[turmaResumo]} onSubmit={handleCreateAviso} onCancel={() => setFormAberto(null)} />
      )}

      {mural.itens.length === 0 && (
        <EmptyState
          icon={Layers}
          title="Nada publicado ainda"
          description="Use os botões acima para criar a primeira atividade, material ou aviso."
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
                    canManage
                    onDelete={() => handleDeleteTarefa(tarefa.id)}
                  />
                );
              }
              if (entry.tipo === "MATERIAL") {
                const material = entry.item as Material;
                return (
                  <MaterialListItem
                    key={entry.id}
                    material={material}
                    canManage
                    onDelete={() => handleDeleteMaterial(material.id)}
                  />
                );
              }
              return <AvisoListItem key={entry.id} aviso={entry.item as Aviso} />;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
