import { AlertTriangle, Info, Trash2, ThumbsUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import type { Observacao, TipoObservacao } from "../../types";
import { formatDataHora } from "../../utils/date";

export const OBSERVACAO_ESTILO: Record<
  TipoObservacao,
  { rotulo: string; icone: LucideIcon; chip: string; barra: string }
> = {
  ELOGIO: {
    rotulo: "Elogio",
    icone: ThumbsUp,
    chip: "bg-leaf-500/15 text-leaf-700 dark:text-leaf-300",
    barra: "bg-leaf-500",
  },
  ATENCAO: {
    rotulo: "Ponto de atenção",
    icone: AlertTriangle,
    chip: "bg-sun-500/15 text-sun-800 dark:text-sun-200",
    barra: "bg-sun-500",
  },
  NEUTRA: {
    rotulo: "Observação",
    icone: Info,
    chip: "bg-brand-500/10 text-brand-700 dark:text-brand-300",
    barra: "bg-brand-500",
  },
};

export function ObservacaoItem({
  observacao,
  onExcluir,
}: {
  observacao: Observacao;
  onExcluir?: () => void;
}) {
  const estilo = OBSERVACAO_ESTILO[observacao.tipo];
  const Icone = estilo.icone;

  return (
    <li className="flex gap-3 border-b border-line-soft py-3 last:border-0">
      <span className={clsx("w-1 shrink-0 rounded-full", estilo.barra)} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              estilo.chip
            )}
          >
            <Icone size={12} strokeWidth={2.25} aria-hidden="true" />
            {estilo.rotulo}
          </span>
          {observacao.turma && (
            <span className="text-xs text-ink-faint">{observacao.turma.disciplina}</span>
          )}
        </div>

        <p className="mt-1.5 text-sm text-ink-soft">{observacao.texto}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {observacao.professor.nome} · {formatDataHora(observacao.createdAt)}
        </p>
      </div>

      {onExcluir && (
        <button
          type="button"
          onClick={onExcluir}
          className="btn-danger-ghost h-8 shrink-0 px-2 py-1 text-xs"
          aria-label="Excluir observação"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
