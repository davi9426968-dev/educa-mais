import { ReactNode } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { Aviso } from "../../types";
import { Badge } from "../ui/Badge";
import { formatDataCurta, formatDataHora } from "../../utils/date";

export function AvisoListItem({ aviso, rodape }: { aviso: Aviso; rodape?: ReactNode }) {
  // Na visão do professor a API devolve quem já confirmou ciência.
  const temCiencia = typeof aviso.totalDestinatarios === "number";

  return (
    <li className="border-b border-line-soft py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-ink">{aviso.titulo}</p>
        <Badge tone={aviso.turma ? "sun" : "brand"}>
          {aviso.turma ? aviso.turma.nome : "Toda a escola"}
        </Badge>
        {aviso.dataLimite && <Badge tone="coral">Prazo: {formatDataCurta(aviso.dataLimite)}</Badge>}
      </div>

      <p className="mt-2 text-sm text-ink-soft">{aviso.mensagem}</p>
      <p className="mt-1 text-xs text-ink-faint">
        {aviso.autor.nome} · {formatDataHora(aviso.createdAt)}
      </p>

      {temCiencia && (
        <div className="mt-2.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <CheckCircle2 size={13} className="text-leaf-600 dark:text-leaf-400" aria-hidden="true" />
            {aviso.cientes?.length ?? 0} de {aviso.totalDestinatarios} responsável(is) confirmaram
            leitura
          </p>

          {(aviso.pendentes?.length ?? 0) > 0 && (
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
              <Clock size={13} aria-hidden="true" />
              Aguardando: {aviso.pendentes!.map((p) => p.nome).join(", ")}
            </p>
          )}
        </div>
      )}

      {rodape && <div className="mt-2.5">{rodape}</div>}
    </li>
  );
}
