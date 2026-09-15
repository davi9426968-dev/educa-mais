import { FormEvent, useState } from "react";
import { LogIn, Plus } from "lucide-react";
import { Button } from "../ui/Button";
import * as turmaService from "../../services/turma.service";

export function EntrarTurmaCard({ onEntrou }: { onEntrou: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setIsSubmitting(true);
    try {
      await turmaService.entrarNaTurma(codigo);
      setCodigo("");
      setAberto(false);
      onEntrou();
    } catch {
      setErro("Código inválido ou você já está nesta turma.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-surface text-brand-700 dark:text-brand-300 transition-colors hover:border-brand-400 hover:bg-brand-500/10"
      >
        <Plus size={24} aria-hidden="true" />
        <span className="text-sm font-semibold">Entrar em turma</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <div>
        <label htmlFor="codigo-turma" className="field-label">
          Código da turma
        </label>
        <input
          id="codigo-turma"
          className="field-input font-mono uppercase tracking-wider"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ex: K7X9QP"
          required
          minLength={4}
          autoFocus
        />
      </div>
      {erro && (
        <p role="alert" className="text-sm text-coral-600 dark:text-coral-400">
          {erro}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          <LogIn size={16} aria-hidden="true" />
          Entrar
        </Button>
        <Button type="button" variant="secondary" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
