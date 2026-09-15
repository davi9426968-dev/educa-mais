import { useEffect, useState } from "react";
import clsx from "clsx";
import { HelpCircle, Library, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { DuvidaForm } from "../../components/duvidas/DuvidaForm";
import { DuvidaListItem } from "../../components/duvidas/DuvidaListItem";
import { BibliotecaListItem } from "../../components/duvidas/BibliotecaListItem";
import * as duvidaService from "../../services/duvida.service";
import type { CreateDuvidaInput } from "../../services/duvida.service";
import * as turmaService from "../../services/turma.service";
import type { Duvida, DuvidaBiblioteca, MinhaTurmaAluno } from "../../types";

export function AlunoDuvidas() {
  const [aba, setAba] = useState<"minhas" | "biblioteca">("minhas");
  const [turmas, setTurmas] = useState<MinhaTurmaAluno[] | null>(null);
  const [duvidas, setDuvidas] = useState<Duvida[] | null>(null);
  const [biblioteca, setBiblioteca] = useState<DuvidaBiblioteca[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [turmasRes, duvidasRes, bibliotecaRes] = await Promise.all([
        turmaService.listMinhasTurmas(),
        duvidaService.listDuvidas(),
        duvidaService.listBiblioteca(),
      ]);
      setTurmas(turmasRes.turmas as MinhaTurmaAluno[]);
      setDuvidas(duvidasRes.duvidas);
      setBiblioteca(bibliotecaRes.duvidas);
    } catch {
      setErro("Não foi possível carregar as dúvidas.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCreate(input: CreateDuvidaInput) {
    await duvidaService.createDuvida(input);
    setShowForm(false);
    await carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Canal de dúvidas</h1>
          <p className="mt-1 text-ink-muted">Tire suas dúvidas diretamente com o professor.</p>
        </div>
        {turmas && turmas.length > 0 && aba === "minhas" && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {showForm ? "Fechar" : "Enviar dúvida"}
          </Button>
        )}
      </div>

      <div role="tablist" aria-label="Seções de dúvidas" className="flex gap-1 border-b border-line">
        {(
          [
            ["minhas", "Minhas dúvidas", HelpCircle],
            ["biblioteca", "Biblioteca de explicações", Library],
          ] as const
        ).map(([tab, label, Icon]) => (
          <button
            key={tab}
            role="tab"
            aria-selected={aba === tab}
            onClick={() => setAba(tab)}
            className={clsx(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              aba === tab ? "border-brand-600 text-brand-700 dark:text-brand-300" : "border-transparent text-ink-muted hover:text-brand-600"
            )}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {aba === "minhas" && (
        <>
          {showForm && turmas && (
            <DuvidaForm turmas={turmas} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          )}

          {!duvidas && !erro && <SkeletonList />}

          {duvidas && duvidas.length === 0 && (
            <EmptyState
              icon={HelpCircle}
              title="Você ainda não enviou nenhuma dúvida"
              description="Ficou com uma pergunta? Envie para o professor responder."
            />
          )}

          {duvidas && duvidas.length > 0 && (
            <div className="card">
              <ul>
                {duvidas.map((duvida) => (
                  <DuvidaListItem key={duvida.id} duvida={duvida} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {aba === "biblioteca" && (
        <>
          {!biblioteca && !erro && <SkeletonList />}

          {biblioteca && biblioteca.length === 0 && (
            <EmptyState
              icon={Library}
              title="Nenhuma explicação disponível ainda"
              description="Quando o professor destacar uma resposta, ela aparece aqui para toda a turma."
            />
          )}
          {biblioteca && biblioteca.length > 0 && (
            <div className="card">
              <ul>
                {biblioteca.map((duvida) => (
                  <BibliotecaListItem key={duvida.id} duvida={duvida} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
