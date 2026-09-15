import { useState } from "react";
import type { Material } from "../../types";
import { Badge } from "../ui/Badge";
import { resolveFileUrl } from "../../services/api";

const TIPO_LABELS: Record<Material["tipo"], string> = {
  TEXTO: "Texto",
  LINK: "Link",
  ARQUIVO: "Arquivo",
  VIDEO: "Vídeo",
};

export function MaterialListItem({
  material,
  canManage,
  onDelete,
}: {
  material: Material;
  canManage?: boolean;
  onDelete?: () => void;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <li className="border-b border-line-soft py-3 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-ink">{material.titulo}</p>
            <Badge tone="brand">{TIPO_LABELS[material.tipo]}</Badge>
            <Badge tone="sun">{material.tema}</Badge>
          </div>
          {material.descricao && <p className="mt-1 text-sm text-ink-muted">{material.descricao}</p>}

          <div className="mt-2">
            {material.tipo === "TEXTO" && (
              <>
                <button
                  type="button"
                  onClick={() => setExpandido((v) => !v)}
                  className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:underline"
                  aria-expanded={expandido}
                >
                  {expandido ? "Ocultar conteúdo" : "Ler conteúdo"}
                </button>
                {expandido && (
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-muted p-3 text-sm text-ink-soft">
                    {material.conteudo}
                  </p>
                )}
              </>
            )}

            {(material.tipo === "LINK" || material.tipo === "VIDEO") && material.conteudo && (
              <a
                href={material.conteudo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:underline"
              >
                Abrir material ↗
              </a>
            )}

            {material.tipo === "ARQUIVO" && material.arquivoUrl && (
              <a
                href={resolveFileUrl(material.arquivoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:underline"
              >
                Baixar arquivo ↗
              </a>
            )}
          </div>
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
      </div>
    </li>
  );
}
