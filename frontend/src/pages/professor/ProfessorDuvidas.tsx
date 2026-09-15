import { useEffect, useState } from "react";
import clsx from "clsx";
import { Inbox, Library, MessageSquare, PartyPopper } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { DuvidaListItem } from "../../components/duvidas/DuvidaListItem";
import { BibliotecaListItem } from "../../components/duvidas/BibliotecaListItem";
import * as duvidaService from "../../services/duvida.service";
import type { Duvida, DuvidaBiblioteca } from "../../types";

export function ProfessorDuvidas() {
  const [aba, setAba] = useState<"pendentes" | "todas" | "biblioteca">("pendentes");
  const [duvidas, setDuvidas] = useState<Duvida[] | null>(null);
  const [biblioteca, setBiblioteca] = useState<DuvidaBiblioteca[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [duvidasRes, bibliotecaRes] = await Promise.all([
        duvidaService.listDuvidas(),
        duvidaService.listBiblioteca(),
      ]);
      setDuvidas(duvidasRes.duvidas);
      setBiblioteca(bibliotecaRes.duvidas);
    } catch {
      setErro("Não foi possível carregar as dúvidas.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleResponder(id: string, resposta: string, destacar: boolean) {
    await duvidaService.responderDuvida(id, resposta, destacar);
    await carregar();
  }

  const pendentes = duvidas?.filter((d) => d.status === "PENDENTE") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dúvidas dos alunos</h1>
        <p className="mt-1 text-ink-muted">Responda dúvidas e destaque as mais úteis para a turma.</p>
      </div>

      <div role="tablist" aria-label="Seções de dúvidas" className="flex gap-1 border-b border-line">
        {(
          [
            ["pendentes", "Pendentes", Inbox, pendentes.length],
            ["todas", "Todas", MessageSquare, null],
            ["biblioteca", "Biblioteca", Library, null],
          ] as const
        ).map(([tab, label, Icon, count]) => (
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
            {count !== null && count > 0 && (
              <span className="rounded-full bg-sun-500/15 px-1.5 py-0.5 text-xs font-semibold text-sun-800 dark:text-sun-200">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {(aba === "pendentes" || aba === "todas") && (
        <>
          {!duvidas && !erro && <SkeletonList />}
          {(() => {
            const lista = aba === "pendentes" ? pendentes : duvidas ?? [];
            if (duvidas && lista.length === 0) {
              return aba === "pendentes" ? (
                <EmptyState icon={PartyPopper} title="Nenhuma dúvida pendente" description="Tudo em dia por aqui." />
              ) : (
                <EmptyState icon={Inbox} title="Nenhuma dúvida recebida ainda" />
              );
            }
            return (
              lista.length > 0 && (
                <div className="card">
                  <ul>
                    {lista.map((duvida) => (
                      <DuvidaListItem
                        key={duvida.id}
                        duvida={duvida}
                        onResponder={(resposta, destacar) => handleResponder(duvida.id, resposta, destacar)}
                      />
                    ))}
                  </ul>
                </div>
              )
            );
          })()}
        </>
      )}

      {aba === "biblioteca" && (
        <>
          {biblioteca && biblioteca.length === 0 && (
            <EmptyState
              icon={Library}
              title="Nenhuma dúvida destacada ainda"
              description='Marque respostas como "Adicionar à biblioteca" para formar uma coleção de explicações da turma.'
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
