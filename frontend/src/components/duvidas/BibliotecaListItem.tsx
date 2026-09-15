import type { DuvidaBiblioteca } from "../../types";
import { Badge } from "../ui/Badge";
import { formatDataHora } from "../../utils/date";
import { resolveFileUrl } from "../../services/api";

export function BibliotecaListItem({ duvida }: { duvida: DuvidaBiblioteca }) {
  return (
    <li className="border-b border-line-soft py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{duvida.disciplina}</Badge>
        <Badge tone="sun">{duvida.tema}</Badge>
      </div>

      <p className="mt-2 font-medium text-ink">{duvida.pergunta}</p>

      {duvida.imagemUrl && (
        <img
          src={resolveFileUrl(duvida.imagemUrl)}
          alt={`Foto anexada à dúvida sobre ${duvida.tema}`}
          className="mt-2 max-h-40 rounded-lg border border-line"
        />
      )}

      {duvida.respostas.map((resposta) => (
        <div key={resposta.id} className="mt-3 rounded-lg bg-brand-500/10 p-3">
          <p className="text-sm text-ink-soft">{resposta.resposta}</p>
          <p className="mt-1 text-xs text-ink-faint">
            {resposta.professor.nome} · {formatDataHora(resposta.createdAt)}
          </p>
        </div>
      ))}
    </li>
  );
}
