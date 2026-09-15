import { FormEvent, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { TextareaField } from "../ui/TextareaField";
import { SelectField } from "../ui/SelectField";
import type { TurmaResumo } from "../../types";
import type { CreateQuizInput, NovaPerguntaInput } from "../../services/quiz.service";

const SEM_TURMA = "SEM_TURMA";
const FORMAS = ["Triângulo", "Losango", "Círculo", "Quadrado"];
const CORES_OPCAO = ["bg-coral-600", "bg-brand-600", "bg-sun-600", "bg-leaf-600"];

function perguntaVazia(): NovaPerguntaInput {
  return {
    enunciado: "",
    tempoLimiteSegundos: 20,
    opcoes: [
      { texto: "", correta: true },
      { texto: "", correta: false },
      { texto: "", correta: false },
      { texto: "", correta: false },
    ],
  };
}

interface QuizFormProps {
  turmas: TurmaResumo[];
  onSubmit: (input: CreateQuizInput) => Promise<void>;
  onCancel: () => void;
}

export function QuizForm({ turmas, onSubmit, onCancel }: QuizFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disciplina, setDisciplina] = useState(turmas[0]?.disciplina ?? "");
  const [tema, setTema] = useState("");
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? SEM_TURMA);
  const [perguntas, setPerguntas] = useState<NovaPerguntaInput[]>([perguntaVazia()]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function atualizarPergunta(indice: number, patch: Partial<NovaPerguntaInput>) {
    setPerguntas((prev) => prev.map((p, i) => (i === indice ? { ...p, ...patch } : p)));
  }

  function atualizarOpcao(indicePergunta: number, indiceOpcao: number, texto: string) {
    setPerguntas((prev) =>
      prev.map((pergunta, i) =>
        i === indicePergunta
          ? {
              ...pergunta,
              opcoes: pergunta.opcoes.map((o, j) => (j === indiceOpcao ? { ...o, texto } : o)),
            }
          : pergunta
      )
    );
  }

  function marcarCorreta(indicePergunta: number, indiceOpcao: number) {
    setPerguntas((prev) =>
      prev.map((pergunta, i) =>
        i === indicePergunta
          ? {
              ...pergunta,
              opcoes: pergunta.opcoes.map((o, j) => ({ ...o, correta: j === indiceOpcao })),
            }
          : pergunta
      )
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    const semTexto = perguntas.findIndex((p) => p.opcoes.some((o) => !o.texto.trim()));
    if (semTexto >= 0) {
      setErro(`Preencha as 4 alternativas da pergunta ${semTexto + 1}.`);
      return;
    }

    setEnviando(true);
    try {
      await onSubmit({
        titulo,
        descricao: descricao || undefined,
        disciplina,
        tema: tema || undefined,
        turmaId: turmaId === SEM_TURMA ? undefined : turmaId,
        perguntas,
      });
    } catch {
      setErro("Não foi possível salvar o jogo. Verifique os dados e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="card space-y-4">
        <TextField
          label="Título do jogo"
          required
          minLength={3}
          placeholder="Ex: Revisão de frações"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Disciplina"
            required
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
          />
          <TextField
            label="Tema (opcional)"
            placeholder="Ex: Frações"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
          />
        </div>

        <SelectField label="Turma" value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
          <option value={SEM_TURMA}>Todas as minhas turmas</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} — {t.disciplina}
            </option>
          ))}
        </SelectField>

        <TextareaField
          label="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      {perguntas.map((pergunta, indicePergunta) => (
        <div key={indicePergunta} className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Pergunta {indicePergunta + 1}</h3>
            {perguntas.length > 1 && (
              <button
                type="button"
                onClick={() => setPerguntas((prev) => prev.filter((_, i) => i !== indicePergunta))}
                className="btn-danger-ghost py-1 text-xs"
              >
                <Trash2 size={14} aria-hidden="true" />
                Remover
              </button>
            )}
          </div>

          <TextareaField
            label="Enunciado"
            required
            rows={2}
            placeholder="Ex: Quanto é 1/2 + 1/4?"
            value={pergunta.enunciado}
            onChange={(e) => atualizarPergunta(indicePergunta, { enunciado: e.target.value })}
          />

          <TextField
            label="Tempo para responder (segundos)"
            type="number"
            min={5}
            max={120}
            required
            value={pergunta.tempoLimiteSegundos}
            onChange={(e) =>
              atualizarPergunta(indicePergunta, {
                tempoLimiteSegundos: Number(e.target.value) || 20,
              })
            }
          />

          <fieldset>
            <legend className="field-label">
              Alternativas — clique no círculo para marcar a correta
            </legend>
            <div className="space-y-2">
              {pergunta.opcoes.map((opcao, indiceOpcao) => (
                <div key={indiceOpcao} className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                      CORES_OPCAO[indiceOpcao]
                    )}
                    aria-hidden="true"
                  >
                    {indiceOpcao + 1}
                  </span>
                  <input
                    className="field-input"
                    placeholder={`Alternativa ${indiceOpcao + 1} (${FORMAS[indiceOpcao]})`}
                    aria-label={`Alternativa ${indiceOpcao + 1} da pergunta ${indicePergunta + 1}`}
                    required
                    value={opcao.texto}
                    onChange={(e) => atualizarOpcao(indicePergunta, indiceOpcao, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => marcarCorreta(indicePergunta, indiceOpcao)}
                    aria-pressed={opcao.correta}
                    aria-label={`Marcar alternativa ${indiceOpcao + 1} como correta`}
                    className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      opcao.correta
                        ? "border-leaf-600 bg-leaf-600 text-white"
                        : "border-line text-transparent hover:border-leaf-400"
                    )}
                  >
                    <Check size={16} strokeWidth={3} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => setPerguntas((prev) => [...prev, perguntaVazia()])}
      >
        <Plus size={16} aria-hidden="true" />
        Adicionar pergunta
      </Button>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={enviando}>
          <Check size={16} aria-hidden="true" />
          Salvar jogo
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
