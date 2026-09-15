import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import * as turmaService from "../../services/turma.service";

export function NovaTurmaForm({ onCreated }: { onCreated: () => void }) {
  const [nome, setNome] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await turmaService.createTurma(nome, disciplina);
      setNome("");
      setDisciplina("");
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-semibold text-ink">Criar sua primeira turma</h2>
      <p className="text-sm text-ink-muted">Você precisa de ao menos uma turma para continuar.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nome da turma"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: 9º Ano A"
        />
        <TextField
          label="Disciplina"
          required
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          placeholder="Ex: Matemática"
        />
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        <Plus size={16} aria-hidden="true" />
        Criar turma
      </Button>
    </form>
  );
}
