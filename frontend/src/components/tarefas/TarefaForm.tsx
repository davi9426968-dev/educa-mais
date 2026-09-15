import { FormEvent, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { TextareaField } from "../ui/TextareaField";
import { SelectField } from "../ui/SelectField";
import type { TarefaTipo, TurmaResumo } from "../../types";
import { TAREFA_TIPO_LABELS, TAREFA_TIPO_OPTIONS } from "../../utils/tarefaTipo";
import type { CreateTarefaInput } from "../../services/tarefa.service";

interface TarefaFormProps {
  turmas?: TurmaResumo[];
  onSubmit: (input: CreateTarefaInput) => Promise<void>;
  onCancel: () => void;
}

export function TarefaForm({ turmas, onSubmit, onCancel }: TarefaFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<TarefaTipo>("OUTRO");
  const [topico, setTopico] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [turmaId, setTurmaId] = useState(turmas?.[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const precisaTurma = turmas !== undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (precisaTurma && !turmaId) {
      setError("Selecione uma turma");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        titulo,
        descricao: descricao || undefined,
        tipo,
        topico: topico || undefined,
        dataEntrega: new Date(dataEntrega).toISOString(),
        turmaId: precisaTurma ? turmaId : undefined,
      });
    } catch {
      setError("Não foi possível salvar. Verifique os dados e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-4">
      <TextField
        label="Título"
        required
        minLength={3}
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ex: Exercícios de frações"
      />

      {precisaTurma && (
        <SelectField
          label="Turma"
          required
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
        >
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} — {t.disciplina}
            </option>
          ))}
        </SelectField>
      )}

      {precisaTurma && (
        <TextField
          label="Tópico/unidade (opcional)"
          placeholder="Ex: Unidade 2 — Frações"
          value={topico}
          onChange={(e) => setTopico(e.target.value)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TarefaTipo)}>
          {TAREFA_TIPO_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {TAREFA_TIPO_LABELS[t]}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Data de entrega"
          type="date"
          required
          value={dataEntrega}
          onChange={(e) => setDataEntrega(e.target.value)}
        />
      </div>

      <TextareaField
        label="Descrição (opcional)"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      {error && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          <Check size={16} aria-hidden="true" />
          Salvar
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
