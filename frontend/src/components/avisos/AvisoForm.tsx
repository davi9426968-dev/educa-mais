import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { TextareaField } from "../ui/TextareaField";
import { SelectField } from "../ui/SelectField";
import type { TurmaResumo } from "../../types";
import type { CreateAvisoInput } from "../../services/aviso.service";

const TODA_ESCOLA = "TODA_ESCOLA";

interface AvisoFormProps {
  turmas: TurmaResumo[];
  onSubmit: (input: CreateAvisoInput) => Promise<void>;
  onCancel: () => void;
}

export function AvisoForm({ turmas, onSubmit, onCancel }: AvisoFormProps) {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [turmaId, setTurmaId] = useState(turmas.length === 1 ? turmas[0].id : TODA_ESCOLA);
  const [dataLimite, setDataLimite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        titulo,
        mensagem,
        turmaId: turmaId === TODA_ESCOLA ? undefined : turmaId,
        dataLimite: dataLimite ? new Date(dataLimite).toISOString() : undefined,
      });
    } catch {
      setError("Não foi possível enviar o aviso. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-4">
      <TextField label="Título" required minLength={3} value={titulo} onChange={(e) => setTitulo(e.target.value)} />

      <TextareaField
        label="Mensagem"
        required
        minLength={5}
        rows={3}
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Destinatário" value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
          <option value={TODA_ESCOLA}>Toda a escola</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} — {t.disciplina}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Prazo (opcional)"
          type="date"
          value={dataLimite}
          onChange={(e) => setDataLimite(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          <Send size={16} aria-hidden="true" />
          Enviar aviso
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
