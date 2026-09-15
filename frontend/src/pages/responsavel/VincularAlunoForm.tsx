import { FormEvent, useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import * as responsavelService from "../../services/responsavel.service";

export function VincularAlunoForm({ onVinculado }: { onVinculado: () => void }) {
  const [codigo, setCodigo] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await responsavelService.vincularPorCodigo(codigo, parentesco || undefined);
      setCodigo("");
      setParentesco("");
      onVinculado();
    } catch {
      setErro("Código inválido, ou você já acompanha este aluno.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-chip bg-brand-500/10 text-brand-500">
          <UserPlus size={18} strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Acompanhar um aluno</h2>
          <p className="text-sm text-ink-muted">
            Peça o código ao aluno (ele encontra no painel dele) ou à escola.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="codigo-aluno" className="field-label">
            <span className="flex items-center gap-1.5">
              <KeyRound size={14} aria-hidden="true" />
              Código do aluno
            </span>
          </label>
          <input
            id="codigo-aluno"
            className="field-input text-center font-mono text-xl uppercase tracking-[0.25em]"
            placeholder="ABC123"
            maxLength={6}
            required
            minLength={4}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          />
        </div>

        <TextField
          label="Seu parentesco (opcional)"
          placeholder="Ex: mãe, pai, avó"
          value={parentesco}
          onChange={(e) => setParentesco(e.target.value)}
        />
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      <Button type="submit" isLoading={enviando} disabled={codigo.length < 4}>
        <UserPlus size={16} aria-hidden="true" />
        Vincular
      </Button>
    </form>
  );
}
