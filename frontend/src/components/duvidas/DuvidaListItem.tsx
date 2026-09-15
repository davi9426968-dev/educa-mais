import { FormEvent, useId, useState } from "react";
import type { Duvida } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { NIVEL_LABELS, NIVEL_TONES } from "../../utils/nivelDificuldade";
import { formatDataHora } from "../../utils/date";
import { resolveFileUrl } from "../../services/api";

function RespostaForm({ onResponder }: { onResponder: (resposta: string, destacar: boolean) => Promise<void> }) {
  const [resposta, setResposta] = useState("");
  const [destacar, setDestacar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaId = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onResponder(resposta, destacar);
      setResposta("");
      setDestacar(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-lg bg-surface-muted p-3">
      <label htmlFor={textareaId} className="sr-only">
        Responder dúvida
      </label>
      <textarea
        id={textareaId}
        className="field-input"
        rows={2}
        required
        placeholder="Escreva sua resposta..."
        value={resposta}
        onChange={(e) => setResposta(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={destacar}
            onChange={(e) => setDestacar(e.target.checked)}
            className="h-4 w-4 rounded border-line text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          Adicionar à biblioteca de explicações da turma
        </label>
        <Button type="submit" isLoading={isSubmitting} className="py-1.5 text-xs">
          Responder
        </Button>
      </div>
    </form>
  );
}

export function DuvidaListItem({
  duvida,
  onResponder,
}: {
  duvida: Duvida;
  onResponder?: (resposta: string, destacar: boolean) => Promise<void>;
}) {
  return (
    <li className="border-b border-line-soft py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{duvida.disciplina}</Badge>
        <Badge tone="sun">{duvida.tema}</Badge>
        <Badge tone={NIVEL_TONES[duvida.nivelDificuldade]}>Dificuldade {NIVEL_LABELS[duvida.nivelDificuldade]}</Badge>
        <Badge tone={duvida.status === "RESPONDIDA" ? "leaf" : "slate"}>
          {duvida.status === "RESPONDIDA" ? "Respondida" : "Pendente"}
        </Badge>
        {duvida.destacada && <Badge tone="brand">Na biblioteca</Badge>}
      </div>

      <p className="mt-2 text-ink">{duvida.pergunta}</p>

      {duvida.imagemUrl && (
        <a href={resolveFileUrl(duvida.imagemUrl)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
          <img
            src={resolveFileUrl(duvida.imagemUrl)}
            alt={`Foto anexada à dúvida sobre ${duvida.tema}`}
            className="max-h-40 rounded-lg border border-line"
          />
        </a>
      )}

      <p className="mt-1 text-xs text-ink-faint">
        {duvida.aluno.nome} · {formatDataHora(duvida.createdAt)}
      </p>

      {duvida.respostas.map((resposta) => (
        <div key={resposta.id} className="mt-3 rounded-lg bg-brand-500/10 p-3">
          <p className="text-sm text-ink-soft">{resposta.resposta}</p>
          <p className="mt-1 text-xs text-ink-faint">
            {resposta.professor.nome} · {formatDataHora(resposta.createdAt)}
          </p>
        </div>
      ))}

      {duvida.status === "PENDENTE" && onResponder && <RespostaForm onResponder={onResponder} />}
    </li>
  );
}
