import { ChangeEvent, FormEvent, useState } from "react";
import { Camera, Send } from "lucide-react";
import { Button } from "../ui/Button";
import { TextareaField } from "../ui/TextareaField";
import { TextField } from "../ui/TextField";
import { SelectField } from "../ui/SelectField";
import type { NivelDificuldade, TurmaResumo } from "../../types";
import { NIVEL_LABELS, NIVEL_OPTIONS } from "../../utils/nivelDificuldade";
import type { CreateDuvidaInput } from "../../services/duvida.service";

interface DuvidaFormProps {
  turmas: TurmaResumo[];
  onSubmit: (input: CreateDuvidaInput) => Promise<void>;
  onCancel: () => void;
}

export function DuvidaForm({ turmas, onSubmit, onCancel }: DuvidaFormProps) {
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [disciplina, setDisciplina] = useState(turmas[0]?.disciplina ?? "");
  const [tema, setTema] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [nivelDificuldade, setNivelDificuldade] = useState<NivelDificuldade>("MEDIO");
  const [imagem, setImagem] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setImagem(e.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        turmaId,
        disciplina,
        tema,
        pergunta,
        nivelDificuldade,
        imagem: imagem ?? undefined,
      });
    } catch {
      setError("Não foi possível enviar sua dúvida. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-4">
      <SelectField
        label="Turma"
        required
        value={turmaId}
        onChange={(e) => {
          setTurmaId(e.target.value);
          const turma = turmas.find((t) => t.id === e.target.value);
          if (turma) setDisciplina(turma.disciplina);
        }}
      >
        {turmas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome} — {t.disciplina}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Disciplina" required value={disciplina} onChange={(e) => setDisciplina(e.target.value)} />
        <TextField label="Tema" required placeholder="Ex: Frações" value={tema} onChange={(e) => setTema(e.target.value)} />
      </div>

      <TextareaField
        label="Sua dúvida"
        required
        minLength={5}
        rows={4}
        placeholder="Explique o que você não conseguiu entender..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />

      <SelectField
        label="Nível de dificuldade que você sentiu"
        value={nivelDificuldade}
        onChange={(e) => setNivelDificuldade(e.target.value as NivelDificuldade)}
      >
        {NIVEL_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {NIVEL_LABELS[n]}
          </option>
        ))}
      </SelectField>

      <div>
        <label htmlFor="imagem" className="field-label">
          Anexar foto do exercício (opcional)
        </label>
        <label
          htmlFor="imagem"
          className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-line px-4 py-3 text-sm text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-500/10"
        >
          <Camera size={18} className="text-brand-500" aria-hidden="true" />
          {imagem ? imagem.name : "Clique para tirar ou escolher uma foto"}
          <input id="imagem" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          <Send size={16} aria-hidden="true" />
          Enviar ao professor
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
