import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, KeyRound, Rocket, Trophy, Zap } from "lucide-react";
import clsx from "clsx";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonGrid } from "../../components/ui/Skeleton";
import * as quizService from "../../services/quiz.service";
import type { DisciplinaDisponivel, QuizResumo, SessaoResumo } from "../../types";
import { formatDataHora } from "../../utils/date";

/** Cor do cartão por matéria, estável entre recarregamentos. */
const CORES_MATERIA = [
  "from-brand-500 to-brand-700",
  "from-sun-500 to-sun-600",
  "from-leaf-500 to-leaf-700",
  "from-coral-500 to-coral-600",
];

function corDaMateria(disciplina: string): string {
  let soma = 0;
  for (let i = 0; i < disciplina.length; i++) soma += disciplina.charCodeAt(i);
  return CORES_MATERIA[soma % CORES_MATERIA.length];
}

export function AlunoJogos() {
  const navigate = useNavigate();
  const [disciplinas, setDisciplinas] = useState<DisciplinaDisponivel[] | null>(null);
  const [quizzes, setQuizzes] = useState<QuizResumo[]>([]);
  const [historico, setHistorico] = useState<SessaoResumo[]>([]);
  const [pin, setPin] = useState("");
  const [erroPin, setErroPin] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [iniciando, setIniciando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      quizService.listDisciplinas(),
      quizService.listQuizzes(),
      quizService.listMinhasSessoes(),
    ])
      .then(([d, q, s]) => {
        setDisciplinas(d.disciplinas);
        setQuizzes(q.quizzes);
        setHistorico(s.sessoes.filter((sessao) => sessao.status === "ENCERRADA").slice(0, 5));
      })
      .catch(() => setErro("Não foi possível carregar os jogos."));
  }, []);

  async function jogarMateria(disciplina: string) {
    setIniciando(disciplina);
    setErro(null);
    try {
      const { sessao } = await quizService.jogoRapido(disciplina);
      navigate(`/aluno/jogos/${sessao.id}`);
    } catch {
      setErro("Não foi possível iniciar o jogo desta matéria.");
      setIniciando(null);
    }
  }

  async function jogarQuiz(quizId: string) {
    setIniciando(quizId);
    setErro(null);
    try {
      const { sessao } = await quizService.criarSessao(quizId, "SOLO");
      navigate(`/aluno/jogos/${sessao.id}`);
    } catch {
      setErro("Não foi possível iniciar este jogo.");
      setIniciando(null);
    }
  }

  async function entrarComPin(event: FormEvent) {
    event.preventDefault();
    setErroPin(null);
    setEntrando(true);
    try {
      const { sessao } = await quizService.entrarPorPin(pin);
      navigate(`/aluno/jogos/${sessao.id}`);
    } catch {
      setErroPin("PIN inválido, sala encerrada ou o jogo já começou.");
    } finally {
      setEntrando(false);
    }
  }

  const quizzesDaTurma = quizzes.filter((q) => !q.doBanco);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Jogos interativos</h1>
        <p className="mt-1 text-ink-muted">
          Escolha uma matéria para jogar sozinho ou entre na sala do seu professor com um PIN.
        </p>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {/* Entrar em sala ao vivo */}
      <form onSubmit={entrarComPin} className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="pin-sala" className="field-label">
              <span className="flex items-center gap-1.5">
                <KeyRound size={14} aria-hidden="true" />
                Entrar na sala do professor
              </span>
            </label>
            <input
              id="pin-sala"
              className="field-input text-center font-mono text-2xl tracking-[0.3em]"
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
          <Button type="submit" isLoading={entrando} disabled={pin.length < 4}>
            <Rocket size={16} aria-hidden="true" />
            Entrar
          </Button>
        </div>
        {erroPin && (
          <p role="alert" className="field-error">
            {erroPin}
          </p>
        )}
      </form>

      {/* Jogo rápido por matéria */}
      <section>
        <h2 className="section-title mb-3">
          <Zap size={14} aria-hidden="true" />
          Jogo rápido por matéria
        </h2>

        {!disciplinas && <SkeletonGrid />}

        {disciplinas && disciplinas.length === 0 && (
          <EmptyState
            icon={Gamepad2}
            title="Nenhum jogo disponível ainda"
            description="Assim que houver jogos nas suas turmas, eles aparecem aqui."
          />
        )}

        {disciplinas && disciplinas.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {disciplinas.map((materia) => (
              <button
                key={materia.disciplina}
                type="button"
                onClick={() => jogarMateria(materia.disciplina)}
                disabled={iniciando !== null}
                className={clsx(
                  "group relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-left text-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover disabled:opacity-60",
                  corDaMateria(materia.disciplina)
                )}
              >
                <Gamepad2
                  size={90}
                  strokeWidth={1}
                  className="pointer-events-none absolute -right-3 -top-3 text-white/15"
                  aria-hidden="true"
                />
                <p className="relative font-display text-lg font-bold">{materia.disciplina}</p>
                <p className="relative mt-1 text-sm text-white/85">
                  {materia.totalQuizzes} jogo(s) disponível(is)
                </p>
                <p className="relative mt-4 text-sm font-semibold">
                  {iniciando === materia.disciplina ? "Preparando..." : "Jogar agora →"}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Jogos criados pelos professores */}
      {quizzesDaTurma.length > 0 && (
        <section>
          <h2 className="section-title mb-3">
            <Trophy size={14} aria-hidden="true" />
            Jogos das suas turmas
          </h2>
          <div className="card">
            <ul className="divide-y divide-line-soft">
              {quizzesDaTurma.map((quiz) => (
                <li key={quiz.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{quiz.titulo}</p>
                      <Badge tone="sun">{quiz.disciplina}</Badge>
                      <Badge tone="slate">{quiz.totalPerguntas} perguntas</Badge>
                    </div>
                    {quiz.criadoPor && (
                      <p className="mt-0.5 text-xs text-ink-faint">Prof. {quiz.criadoPor.nome}</p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => jogarQuiz(quiz.id)}
                    isLoading={iniciando === quiz.id}
                    className="shrink-0 py-1.5 text-xs"
                  >
                    Jogar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <section>
          <h2 className="section-title mb-3">
            <Trophy size={14} aria-hidden="true" />
            Seus últimos jogos
          </h2>
          <div className="card">
            <ul className="divide-y divide-line-soft">
              {historico.map((sessao) => (
                <li key={sessao.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{sessao.quiz.titulo}</p>
                    <p className="text-xs text-ink-faint">
                      {sessao.modo === "SOLO" ? "Solo" : "Ao vivo"} ·{" "}
                      {formatDataHora(sessao.encerradaEm ?? sessao.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-lg font-bold text-brand-800 dark:text-brand-300">
                    {sessao.minhaPontuacao ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
