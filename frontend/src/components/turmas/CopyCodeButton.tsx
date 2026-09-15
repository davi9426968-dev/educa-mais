import { useState } from "react";

export function CopyCodeButton({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // navegador sem permissão de clipboard: sem problema, o código já está visível na tela
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
      <div>
        <p className="text-xs text-ink-faint">Código da turma</p>
        <p className="font-mono text-base font-semibold tracking-wider text-ink">{codigo}</p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-500/10"
      >
        {copiado ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
