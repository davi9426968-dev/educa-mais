import clsx from "clsx";
import type { Tarefa } from "../../types";
import { Badge } from "../ui/Badge";
import { TAREFA_TIPO_LABELS } from "../../utils/tarefaTipo";
import { formatDataCurta, isVencida } from "../../utils/date";

interface TarefaListItemProps {
  tarefa: Tarefa;
  showCheckbox?: boolean;
  onToggleConcluida?: (concluida: boolean) => void;
  canManage?: boolean;
  onDelete?: () => void;
}

export function TarefaListItem({
  tarefa,
  showCheckbox,
  onToggleConcluida,
  canManage,
  onDelete,
}: TarefaListItemProps) {
  const vencida = !tarefa.concluida && isVencida(tarefa.dataEntrega);

  return (
    <li className="flex items-start gap-3 border-b border-line-soft py-3 last:border-0">
      {showCheckbox && (
        <input
          type="checkbox"
          checked={tarefa.concluida}
          onChange={(e) => onToggleConcluida?.(e.target.checked)}
          aria-label={`Marcar "${tarefa.titulo}" como ${tarefa.concluida ? "não concluída" : "concluída"}`}
          className="mt-1 h-4 w-4 shrink-0 rounded border-line text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={clsx("font-medium text-ink", tarefa.concluida && "text-ink-faint line-through")}>
            {tarefa.titulo}
          </p>
          <Badge tone="brand">{TAREFA_TIPO_LABELS[tarefa.tipo]}</Badge>
          {tarefa.turma && <Badge tone="sun">{tarefa.turma.disciplina}</Badge>}
          {vencida && <Badge tone="coral">Atrasada</Badge>}
        </div>

        {tarefa.descricao && <p className="mt-1 text-sm text-ink-muted">{tarefa.descricao}</p>}

        <p className="mt-1 text-xs text-ink-faint">
          Entrega: {formatDataCurta(tarefa.dataEntrega)}
          {tarefa.resumoConclusao &&
            ` · ${tarefa.resumoConclusao.concluidas}/${tarefa.resumoConclusao.totalAlunos} concluíram`}
        </p>
      </div>

      {canManage && (
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-coral-600 dark:text-coral-400 hover:bg-coral-500/10"
        >
          Excluir
        </button>
      )}
    </li>
  );
}
