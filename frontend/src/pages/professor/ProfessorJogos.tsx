import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Library, Plus, Radio, Trash2, Trophy, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { QuizForm } from "../../components/jogos/QuizForm";
import { NovaTurmaForm } from "../../components/turmas/NovaTurmaForm";
import * as quizService from "../../services/quiz.service";
import type { CreateQuizInput } from "../../services/quiz.service";
import * as turmaService from "../../services/turma.service";
import type { MinhaTurmaProfessor, QuizResumo, SessaoResumo } from "../../types";
import { formatDataHora } from "../../utils/date";

export function ProfessorJogos() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<MinhaTurmaProfessor[] | null>(null);
  const [quizzes, setQuizzes] = useState<QuizResumo[] | null>(null);
  const [sessoes, setSessoes] = useState<SessaoResumo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [abrindoSala, setAbrindoSala] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [turmasRes, quizzesRes, sessoesRes] = await Promise.all([
        turmaService.listMinhasTurmas(),
        quizService.listQuizzes(),
        quizService.listMinhasSessoes(),
      ]);
      setTurmas(turmasRes.turmas as MinhaTurmaProfessor[]);
      setQuizzes(quizzesRes.quizzes);
      setSessoes(sessoesRes.sessoes.filter((s) => s.status === "ENCERRADA").slice(0, 5));
    } catch {
      setErro("Não foi possível carregar os jogos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCreate(input: CreateQuizInput) {
    await quizService.createQuiz(input);
    setShowForm(false);
    await carregar();
  }

  async function abrirSalaAoVivo(quizId: string) {
    setAbrindoSala(quizId);
    setErro(null);
    try {
      const { sessao } = await quizService.criarSessao(quizId, "AO_VIVO");
      navigate(`/professor/jogos/${sessao.id}`);
    } catch {
      setErro("Não foi possível abrir a sala ao vivo.");
      setAbrindoSala(null);
    }
  }

  async function excluir(quizId: string) {
    await quizService.deleteQuiz(quizId);
    await carregar();
  }

  const meusQuizzes = quizzes?.filter((q) => !q.doBanco) ?? [];
  const quizzesDoBanco = quizzes?.filter((q) => q.doBanco) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jogos interativos</h1>
          <p className="mt-1 text-ink-muted">
            Crie um questionário ou use um do banco e abra uma sala ao vivo para a turma.
          </p>
        </div>
        {turmas && turmas.length > 0 && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {showForm ? "Fechar" : "Novo jogo"}
          </Button>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {!quizzes && <SkeletonList />}

      {turmas && turmas.length === 0 && <NovaTurmaForm onCreated={carregar} />}

      {showForm && turmas && (
        <QuizForm turmas={turmas} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {quizzes && (
        <>
          <section>
            <h2 className="section-title mb-3">
              <Gamepad2 size={14} aria-hidden="true" />
              Meus jogos
            </h2>

            {meusQuizzes.length === 0 ? (
              <EmptyState
                icon={Gamepad2}
                title="Você ainda não criou nenhum jogo"
                description="Crie um questionário próprio ou use um dos jogos prontos do banco abaixo."
              />
            ) : (
              <div className="card">
                <ul className="divide-y divide-line-soft">
                  {meusQuizzes.map((quiz) => (
                    <ListaQuiz
                      key={quiz.id}
                      quiz={quiz}
                      abrindo={abrindoSala === quiz.id}
                      onAbrirSala={() => abrirSalaAoVivo(quiz.id)}
                      onExcluir={() => excluir(quiz.id)}
                    />
                  ))}
                </ul>
              </div>
            )}
          </section>

          {quizzesDoBanco.length > 0 && (
            <section>
              <h2 className="section-title mb-3">
                <Library size={14} aria-hidden="true" />
                Banco de jogos da plataforma
              </h2>
              <div className="card">
                <ul className="divide-y divide-line-soft">
                  {quizzesDoBanco.map((quiz) => (
                    <ListaQuiz
                      key={quiz.id}
                      quiz={quiz}
                      abrindo={abrindoSala === quiz.id}
                      onAbrirSala={() => abrirSalaAoVivo(quiz.id)}
                    />
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      {sessoes.length > 0 && (
        <section>
          <h2 className="section-title mb-3">
            <Trophy size={14} aria-hidden="true" />
            Últimas partidas
          </h2>
          <div className="card">
            <ul className="divide-y divide-line-soft">
              {sessoes.map((sessao) => (
                <li key={sessao.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{sessao.quiz.titulo}</p>
                    <p className="text-xs text-ink-faint">
                      {sessao.totalParticipantes} jogador(es) ·{" "}
                      {formatDataHora(sessao.encerradaEm ?? sessao.createdAt)}
                    </p>
                  </div>
                  {sessao.vencedor && (
                    <span className="shrink-0 text-sm text-ink-muted">
                      🏆 {sessao.vencedor.nome} ({sessao.vencedor.pontuacao})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function ListaQuiz({
  quiz,
  abrindo,
  onAbrirSala,
  onExcluir,
}: {
  quiz: QuizResumo;
  abrindo: boolean;
  onAbrirSala: () => void;
  onExcluir?: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-ink">{quiz.titulo}</p>
          <Badge tone="sun">{quiz.disciplina}</Badge>
          <Badge tone="slate">{quiz.totalPerguntas} perguntas</Badge>
          {quiz.turma && <Badge tone="brand">{quiz.turma.nome}</Badge>}
        </div>
        {quiz.descricao && <p className="mt-1 text-sm text-ink-muted">{quiz.descricao}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button onClick={onAbrirSala} isLoading={abrindo} className="py-1.5 text-xs">
          <Radio size={14} aria-hidden="true" />
          Jogar ao vivo
        </Button>
        {onExcluir && (
          <button
            type="button"
            onClick={onExcluir}
            className="btn-danger-ghost py-1.5 text-xs"
            aria-label={`Excluir o jogo ${quiz.titulo}`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </li>
  );
}
