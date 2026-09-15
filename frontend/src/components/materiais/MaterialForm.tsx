import { ChangeEvent, FormEvent, useState } from "react";
import { Send, UploadCloud } from "lucide-react";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { TextareaField } from "../ui/TextareaField";
import { SelectField } from "../ui/SelectField";
import type { MaterialTipo, TurmaResumo } from "../../types";
import type { CreateMaterialInput } from "../../services/material.service";

const TIPO_LABELS: Record<MaterialTipo, string> = {
  TEXTO: "Texto",
  LINK: "Link",
  ARQUIVO: "Arquivo",
  VIDEO: "Vídeo",
};

interface MaterialFormProps {
  turmas: TurmaResumo[];
  onSubmit: (input: CreateMaterialInput) => Promise<void>;
  onCancel: () => void;
}

export function MaterialForm({ turmas, onSubmit, onCancel }: MaterialFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<MaterialTipo>("TEXTO");
  const [conteudo, setConteudo] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [disciplina, setDisciplina] = useState(turmas[0]?.disciplina ?? "");
  const [tema, setTema] = useState("");
  const [topico, setTopico] = useState("");
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setArquivo(e.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (tipo === "ARQUIVO" && !arquivo) {
      setError("Selecione um arquivo para enviar");
      return;
    }
    if (tipo !== "ARQUIVO" && !conteudo.trim()) {
      setError(tipo === "TEXTO" ? "Escreva o conteúdo do material" : "Informe a URL");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        titulo,
        descricao: descricao || undefined,
        tipo,
        conteudo: tipo !== "ARQUIVO" ? conteudo : undefined,
        arquivo: tipo === "ARQUIVO" ? arquivo ?? undefined : undefined,
        disciplina,
        tema,
        topico: topico || undefined,
        turmaId,
      });
    } catch {
      setError("Não foi possível publicar o material. Verifique os dados e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-4">
      <TextField label="Título" required minLength={3} value={titulo} onChange={(e) => setTitulo(e.target.value)} />

      <SelectField label="Turma" required value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
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

      <TextField
        label="Tópico/unidade (opcional)"
        placeholder="Ex: Unidade 2 — Frações"
        value={topico}
        onChange={(e) => setTopico(e.target.value)}
      />

      <SelectField label="Tipo de material" value={tipo} onChange={(e) => setTipo(e.target.value as MaterialTipo)}>
        {(Object.keys(TIPO_LABELS) as MaterialTipo[]).map((t) => (
          <option key={t} value={t}>
            {TIPO_LABELS[t]}
          </option>
        ))}
      </SelectField>

      {tipo === "TEXTO" && (
        <TextareaField
          label="Conteúdo"
          required
          rows={5}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
      )}

      {(tipo === "LINK" || tipo === "VIDEO") && (
        <TextField
          label={tipo === "LINK" ? "URL do link" : "URL do vídeo"}
          type="url"
          required
          placeholder="https://..."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
      )}

      {tipo === "ARQUIVO" && (
        <div>
          <label htmlFor="arquivo" className="field-label">
            Arquivo
          </label>
          <label
            htmlFor="arquivo"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line px-4 py-6 text-center transition-colors hover:border-brand-300 hover:bg-brand-500/10"
          >
            <UploadCloud size={22} className="text-brand-500" aria-hidden="true" />
            <span className="text-sm font-medium text-ink-soft">
              {arquivo ? arquivo.name : "Clique para escolher um arquivo"}
            </span>
            <input
              id="arquivo"
              type="file"
              required
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </div>
      )}

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
          <Send size={16} aria-hidden="true" />
          Publicar
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
