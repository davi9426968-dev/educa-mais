import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Megaphone,
  MessagesSquare,
  NotebookPen,
  TrendingUp,
  UserRoundSearch,
} from "lucide-react";
import { DashboardHeader } from "../../components/layout/DashboardHeader";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { AvisoListItem } from "../../components/avisos/AvisoListItem";
import { ProgressoSemanalChart } from "../../components/charts/ProgressoSemanalChart";
import { ObservacaoItem } from "../../components/observacoes/ObservacaoItem";
import { ListaConversas } from "../../components/conversas/ListaConversas";
import { ChatConversa } from "../../components/conversas/ChatConversa";
import { VincularAlunoForm } from "./VincularAlunoForm";
import * as avisoService from "../../services/aviso.service";
import * as responsavelService from "../../services/responsavel.service";
import type {
  AlunoVinculado,
  Aviso,
  ConversaResumo,
  Observacao,
  ProfessorDoAluno,
  TarefaDoAluno,
} from "../../types";
import { formatDataCurta, isVencida } from "../../utils/date";
import { TAREFA_TIPO_LABELS } from "../../utils/tarefaTipo";

type Aba = "acompanhamento" | "avisos" | "mensagens";

export function ResponsavelDashboard() {
  const [alunos, setAlunos] = useState<AlunoVinculado[] | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [conversas, setConversas] = useState<ConversaResumo[]>([]);
  const [aba, setAba] = useState<Aba>("acompanhamento");
  const [alunoSelecionado, setAlunoSelecionado] = useState<string | null>(null);
  const [conversaAberta, setConversaAberta] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [alunosRes, avisosRes, conversasRes] = await Promise.all([
        responsavelService.listAlunosVinculados(),
        avisoService.listAvisos(),
        responsavelService.listConversas(),
      ]);
      setAlunos(alunosRes.alunos);
      setAvisos(avisosRes.avisos);
      setConversas(conversasRes.conversas);
      setAlunoSelecionado((atual) => atual ?? alunosRes.alunos[0]?.aluno.id ?? null);
    } catch {
      setErro("Não foi possível carregar as informações.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarCiencia(avisoId: string) {
    await responsavelService.confirmarCiencia(avisoId);
    await carregar();
  }

  const totalNaoLidas = conversas.reduce((soma, c) => soma + c.naoLidas, 0);
  const avisosPendentes = avisos.filter((a) => !a.cienteEm).length;
  const dadosDoAluno = alunos?.find((a) => a.aluno.id === alunoSelecionado) ?? null;

  return (
    <>
      <DashboardHeader subtitle="Acompanhe aqui o dia a dia escolar do(s) seu(s) aluno(s)." />

      {erro && (
        <p role="alert" className="mb-4 rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {!alunos && <SkeletonList />}

      {alunos && alunos.length === 0 && (
        <div className="space-y-6">
          <EmptyState
            icon={UserRoundSearch}
            title="Nenhum aluno vinculado ainda"
            description="Use o código do aluno para começar a acompanhá-lo."
          />
          <VincularAlunoForm onVinculado={carregar} />
        </div>
      )}

      {alunos && alunos.length > 0 && (
        <>
          {/* Seletor de aluno quando o responsável acompanha mais de um */}
          {alunos.length > 1 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {alunos.map(({ aluno }) => (
                <button
                  key={aluno.id}
                  type="button"
                  onClick={() => setAlunoSelecionado(aluno.id)}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    aluno.id === alunoSelecionado
                      ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300"
                      : "border-line text-ink-muted hover:bg-surface-sunken"
                  )}
                >
                  <Avatar nome={aluno.nome} size="sm" />
                  {aluno.nome}
                </button>
              ))}
            </div>
          )}

          <div role="tablist" aria-label="Seções" className="mb-6 flex gap-1 border-b border-line">
            {(
              [
                ["acompanhamento", "Acompanhamento", ClipboardList, 0],
                ["avisos", "Avisos", Megaphone, avisosPendentes],
                ["mensagens", "Mensagens", MessagesSquare, totalNaoLidas],
              ] as const
            ).map(([id, rotulo, Icone, contador]) => (
              <button
                key={id}
                role="tab"
                aria-selected={aba === id}
                onClick={() => setAba(id)}
                className={clsx(
                  "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  aba === id
                    ? "border-brand-600 text-brand-700 dark:text-brand-300"
                    : "border-transparent text-ink-muted hover:text-brand-600"
                )}
              >
                <Icone size={15} aria-hidden="true" />
                {rotulo}
                {contador > 0 && (
                  <span className="rounded-full bg-coral-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {contador}
                  </span>
                )}
              </button>
            ))}
          </div>

          {aba === "acompanhamento" && alunoSelecionado && dadosDoAluno && (
            <Acompanhamento
              alunoId={alunoSelecionado}
              dados={dadosDoAluno}
              onDesvinculado={() => {
                setAlunoSelecionado(null);
                carregar();
              }}
            />
          )}

          {aba === "avisos" && (
            <div className="card">
              <h2 className="section-title mb-2">
                <Megaphone size={14} aria-hidden="true" />
                Avisos da escola
              </h2>
              {avisos.length === 0 ? (
                <p className="text-sm text-ink-muted">Nenhum aviso por enquanto.</p>
              ) : (
                <ul>
                  {avisos.map((aviso) => (
                    <AvisoListItem
                      key={aviso.id}
                      aviso={aviso}
                      rodape={
                        aviso.cienteEm ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-leaf-700 dark:text-leaf-300">
                            <CheckCircle2 size={14} aria-hidden="true" />
                            Ciente
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            className="py-1 text-xs"
                            onClick={() => confirmarCiencia(aviso.id)}
                          >
                            <CheckCircle2 size={14} aria-hidden="true" />
                            Marcar como lido
                          </Button>
                        )
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          )}

          {aba === "mensagens" && alunoSelecionado && (
            <Mensagens
              alunoId={alunoSelecionado}
              conversas={conversas}
              conversaAberta={conversaAberta}
              onAbrir={(id) => setConversaAberta(id)}
              onAtualizar={carregar}
            />
          )}

          <div className="mt-8">
            <VincularAlunoForm onVinculado={carregar} />
          </div>
        </>
      )}
    </>
  );
}

// --------------------------------------------------------------------------

function Acompanhamento({
  alunoId,
  dados,
  onDesvinculado,
}: {
  alunoId: string;
  dados: AlunoVinculado;
  onDesvinculado: () => void;
}) {
  const [tarefas, setTarefas] = useState<TarefaDoAluno[] | null>(null);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);

  useEffect(() => {
    setTarefas(null);
    Promise.all([
      responsavelService.getAgendaDoAluno(alunoId),
      responsavelService.listObservacoes(alunoId),
    ])
      .then(([agenda, obs]) => {
        setTarefas(agenda.tarefas);
        setObservacoes(obs.observacoes);
      })
      .catch(() => setTarefas([]));
  }, [alunoId]);

  const pendentes = tarefas?.filter((t) => !t.concluida) ?? [];
  const atrasadas = pendentes.filter((t) => isVencida(t.dataEntrega));

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Avatar nome={dados.aluno.nome} size="sm" />
            <h2 className="font-semibold text-ink">{dados.aluno.nome}</h2>
            {dados.parentesco && <Badge tone="slate">{dados.parentesco}</Badge>}
            {dados.turmas.map((t) => (
              <Badge key={t.id} tone="sun">
                {t.nome} — {t.disciplina}
              </Badge>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              await responsavelService.desvincular(alunoId);
              onDesvinculado();
            }}
            className="btn-danger-ghost py-1 text-xs"
          >
            Deixar de acompanhar
          </button>
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-ink-muted">
              <TrendingUp size={14} aria-hidden="true" />
              Progresso da semana
            </p>
            <p className="font-display text-3xl font-bold text-heading">
              {dados.progresso.atual.percentual}%
            </p>
            <p className="text-sm text-ink-faint">
              {dados.progresso.atual.tarefasConcluidas}/{dados.progresso.atual.tarefasTotal} tarefas
            </p>
            {atrasadas.length > 0 && (
              <p className="mt-2 text-sm font-medium text-coral-600 dark:text-coral-400">
                {atrasadas.length} tarefa(s) em atraso
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <ProgressoSemanalChart dados={dados.progresso.evolucao} />
          </div>
        </div>
      </div>

      {/* Prazos e tarefas */}
      <div className="card">
        <h2 className="section-title mb-3">
          <CalendarDays size={14} aria-hidden="true" />
          Próximos prazos
        </h2>

        {!tarefas && <SkeletonList rows={2} />}

        {tarefas && pendentes.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <CheckCircle2 size={16} className="text-leaf-600 dark:text-leaf-400" aria-hidden="true" />
            Nenhuma tarefa pendente. Está tudo em dia!
          </p>
        )}

        {tarefas && pendentes.length > 0 && (
          <ul className="divide-y divide-line-soft">
            {pendentes.slice(0, 8).map((tarefa) => (
              <li key={tarefa.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{tarefa.titulo}</p>
                    <Badge tone="brand">{TAREFA_TIPO_LABELS[tarefa.tipo]}</Badge>
                    {tarefa.turma && <Badge tone="sun">{tarefa.turma.disciplina}</Badge>}
                    {isVencida(tarefa.dataEntrega) && <Badge tone="coral">Atrasada</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    Entrega: {formatDataCurta(tarefa.dataEntrega)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Observações do professor */}
      <div className="card">
        <h2 className="section-title mb-3">
          <NotebookPen size={14} aria-hidden="true" />
          Observações dos professores
        </h2>
        {observacoes.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhuma observação registrada até agora.</p>
        ) : (
          <ul>
            {observacoes.map((obs) => (
              <ObservacaoItem key={obs.id} observacao={obs} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------

function Mensagens({
  alunoId,
  conversas,
  conversaAberta,
  onAbrir,
  onAtualizar,
}: {
  alunoId: string;
  conversas: ConversaResumo[];
  conversaAberta: string | null;
  onAbrir: (id: string) => void;
  onAtualizar: () => void;
}) {
  const [professores, setProfessores] = useState<ProfessorDoAluno[]>([]);
  const [professorId, setProfessorId] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    responsavelService
      .listProfessoresDoAluno(alunoId)
      .then(({ professores }) => {
        setProfessores(professores);
        setProfessorId((atual) => atual || professores[0]?.professor.id || "");
      })
      .catch(() => setProfessores([]));
  }, [alunoId]);

  async function iniciar() {
    if (!professorId || !texto.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      const { conversa } = await responsavelService.iniciarConversa({
        alunoId,
        professorId,
        texto,
      });
      setTexto("");
      onAtualizar();
      onAbrir(conversa.id);
    } catch {
      setErro("Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card">
          <h2 className="section-title mb-3">
            <MessagesSquare size={14} aria-hidden="true" />
            Conversas
          </h2>
          <ListaConversas
            conversas={conversas}
            selecionadaId={conversaAberta}
            onSelecionar={onAbrir}
          />
        </div>

        {professores.length > 0 && (
          <div className="card space-y-3">
            <h2 className="section-title">Falar com um professor</h2>
            <div>
              <label htmlFor="professor-destino" className="field-label">
                Professor
              </label>
              <select
                id="professor-destino"
                className="field-input"
                value={professorId}
                onChange={(e) => setProfessorId(e.target.value)}
              >
                {professores.map((p) => (
                  <option key={p.professor.id} value={p.professor.id}>
                    {p.professor.nome} — {p.turma.disciplina}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="primeira-mensagem" className="field-label">
                Mensagem
              </label>
              <textarea
                id="primeira-mensagem"
                className="field-input"
                rows={3}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva sua mensagem ao professor..."
              />
            </div>
            {erro && (
              <p role="alert" className="text-sm text-coral-600 dark:text-coral-400">
                {erro}
              </p>
            )}
            <Button onClick={iniciar} isLoading={enviando} disabled={!texto.trim()}>
              Enviar
            </Button>
          </div>
        )}
      </div>

      <div>
        {conversaAberta ? (
          <ChatConversa conversaId={conversaAberta} />
        ) : (
          <EmptyState
            icon={MessagesSquare}
            title="Selecione uma conversa"
            description="Escolha uma conversa à esquerda ou inicie uma nova com o professor."
          />
        )}
      </div>
    </div>
  );
}
