import { useEffect, useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import * as responsavelService from "../../services/responsavel.service";

/**
 * Mostra ao aluno o código que ele entrega ao responsável para que este passe
 * a acompanhar sua vida escolar.
 */
export function MeuCodigoVinculo() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    responsavelService
      .meuCodigoDeVinculo()
      .then(({ codigo }) => setCodigo(codigo))
      .catch(() => setCodigo(null));
  }, []);

  async function copiar() {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sem permissão de clipboard: o código já está visível
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="icon-chip bg-brand-500/10 text-brand-500">
            <UserPlus size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink">Código para o responsável</h2>
            <p className="text-sm text-ink-muted">
              Entregue este código a quem vai acompanhar seus estudos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
          <span className="font-mono text-lg font-semibold tracking-wider text-ink">
            {codigo ?? "······"}
          </span>
          <button
            type="button"
            onClick={copiar}
            disabled={!codigo}
            className="btn-ghost px-2 py-1 text-xs"
          >
            <Copy size={14} aria-hidden="true" />
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
