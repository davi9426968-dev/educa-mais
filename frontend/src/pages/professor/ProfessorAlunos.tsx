import { FormEvent, useEffect, useState } from "react";
import clsx from "clsx";
import {
  Copy,
  KeyRound,
  MessagesSquare,
  NotebookPen,
  Send,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Skeleton";
import { ObservacaoItem, OBSERVACAO_ESTILO } from "../../components/observacoes/ObservacaoItem";
import { ListaConversas } from "../../components/conversas/ListaConversas";
import { ChatConversa } from "../../components/conversas/ChatConversa";
import * as responsavelService from "../../services/responsavel.service";
import type { AlunoDoProfessor, ConversaResumo, Observacao, TipoObservacao } from "../../types";

export function ProfessorAlunos() {
  const [alunos, setAlunos] = useState<AlunoDoProfessor[] | null>(null);
  const [conversas, setConversas] = useState<ConversaResumo[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [conversaAberta, setConversaAberta] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [alunosRes, conversasRes] = await Promise.all([
        responsavelService.listAlunosDoProfessor(),
        responsavelService.listConversas(),
      ]);
      setAlunos(alunosRes.alunos);
      setConversas(conversasRes.conversas);
      setSelecionado((atual) => atual ?? alunosRes.alunos[0]?.aluno.id ?? null);
    } catch {
      setErro("Não foi possível carregar seus alunos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const alunoAtual = alunos?.find((a) => a.aluno.id === selecionado) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alunos e responsáveis</h1>
        <p className="mt-1 text-ink-muted">
          Compartilhe o código de acompanhamento, registre observações e fale com as famílias.
        </p>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
          {erro}
        </p>
      )}

      {!alunos && <SkeletonList />}

      {alunos && alunos.length === 0 && (
        <EmptyState
          icon={Users}
          title="Nenhum aluno nas suas turmas ainda"
          description="Compartilhe o código da turma para os alunos entrarem."
        />
      )}

      {alunos && alunos.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
          {/* Lista de alunos */}
          <div className="card h-fit">
            <h2 className="section-title mb-3">
              <Users size={14} aria-hidden="true" />
              Meus alunos ({alunos.length})
            </h2>
            <ul className="space-y-1">
              {alunos.map(({ aluno, responsaveis }) => (
                <li key={aluno.id}>
                  <button
                    type="button"
                    onClick={() => setSelecionado(aluno.id)}
                    className={clsx(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors",
                      aluno.id === selecionado
                        ? "bg-brand-500/10 ring-1 ring-brand-300"
                        : "hover:bg-surface-sunken"
                    )}
                  >
                    <Avatar nome={aluno.nome} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{aluno.nome}</p>
                      <p className="text-xs text-ink-faint">
                        {responsaveis.length === 0
                          ? "sem responsável"
                          : `${responsaveis.length} responsável(is)`}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {alunoAtual && (
            <DetalheAluno
              key={alunoAtual.aluno.id}
              dados={alunoAtual}
              conversas={conversas.filter((c) => c.aluno.id === alunoAtual.aluno.id)}
              conversaAberta={conversaAberta}
              onAbrirConversa={setConversaAberta}
              onAtualizar={carregar}
            />
          )}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------

function DetalheAluno({
  dados,
  conversas,
  conversaAberta,
  onAbrirConversa,
  onAtualizar,
}: {
  dados: AlunoDoProfessor;
  conversas: ConversaResumo[];
  conversaAberta: string | null;
  onAbrirConversa: (id: string) => void;
  onAtualizar: () => void;
}) {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);

  useEffect(() => {
    responsavelService
      .codigoDoAluno(dados.aluno.id)
      .then(({ codigo }) => setCodigo(codigo))
      .catch(() => setCodigo(null));
    recarregarObservacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados.aluno.id]);

  function recarregarObservacoes() {
    responsavelService
      .listObservacoes(dados.aluno.id)
      .then(({ observacoes }) => setObservacoes(observacoes))
      .catch(() => setObservacoes([]));
  }

  async function copiar() {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sem permissão de clipboard: o código já está visível na tela
    }
  }

  return (
    <div className="space-y-6">
      {/* Código de acompanhamento */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="section-title mb-1">
              <KeyRound size={14} aria-hidden="true" />
              Código de acompanhamento
            </h2>
            <p className="text-sm text-ink-muted">
              O responsável de <strong className="text-ink">{dados.aluno.nome}</strong> usa este
              código para acompanhar o aluno.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
            <span className="font-mono text-lg font-semibold tracking-wider text-ink">
              {codigo ?? "······"}
            </span>
            <button
              type="button"
              onClick={copiar}
              disabled={!codigo}
              className="btn-ghost px-2 py-1 text-xs"
            >
              <Copy size={14} aria-hidden="true" />
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {dados.responsaveis.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <UserRoundSearch size={14} aria-hidden="true" />
              Nenhum responsável vinculado ainda
            </span>
          ) : (
            dados.responsaveis.map((r) => (
              <Badge key={r.id} tone="leaf">
                {r.nome}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Observações */}
      <div className="card">
        <h2 className="section-title mb-3">
          <NotebookPen size={14} aria-hidden="true" />
          Observações sobre {dados.aluno.nome.split(" ")[0]}
        </h2>

        <NovaObservacaoForm
          alunoId={dados.aluno.id}
          turmas={dados.turmas}
          onCriada={recarregarObservacoes}
        />

        {observacoes.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            Nenhuma observação registrada. O que você escrever aqui fica visível para o responsável.
          </p>
        ) : (
          <ul className="mt-2">
            {observacoes.map((obs) => (
              <ObservacaoItem
                key={obs.id}
                observacao={obs}
                onExcluir={async () => {
                  await responsavelService.excluirObservacao(obs.id);
                  recarregarObservacoes();
                }}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Mensagens com os responsáveis */}
      <div className="card">
        <h2 className="section-title mb-3">
          <MessagesSquare size={14} aria-hidden="true" />
          Conversas com a família
        </h2>

        {dados.responsaveis.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Assim que um responsável se vincular com o código acima, você poderá conversar com ele
            por aqui.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <ListaConversas
                conversas={conversas}
                selecionadaId={conversaAberta}
                onSelecionar={onAbrirConversa}
              />
              <NovaConversaForm
                alunoId={dados.aluno.id}
                responsaveis={dados.responsaveis}
                onCriada={(id) => {
                  onAtualizar();
                  onAbrirConversa(id);
                }}
              />
            </div>
            <div>
              {conversaAberta ? (
                <ChatConversa conversaId={conversaAberta} />
              ) : (
                <p className="text-sm text-ink-muted">
                  Selecione uma conversa ou envie uma mensagem nova.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------

function NovaObservacaoForm({
  alunoId,
  turmas,
  onCriada,
}: {
  alunoId: string;
  turmas: { id: string; nome: string; disciplina: string }[];
  onCriada: () => void;
}) {
  const [tipo, setTipo] = useState<TipoObservacao>("ELOGIO");
  const [texto, setTexto] = useState("");
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    try {
      await responsavelService.criarObservacao({ alunoId, turmaId: turmaId || undefined, tipo, texto });
      setTexto("");
      onCriada();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-surface-muted p-3">
      <div role="radiogroup" aria-label="Tipo de observação" className="flex flex-wrap gap-2">
        {(Object.keys(OBSERVACAO_ESTILO) as TipoObservacao[]).map((t) => {
          const estilo = OBSERVACAO_ESTILO[t];
          const Icone = estilo.icone;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tipo === t}
              onClick={() => setTipo(t)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                tipo === t ? `${estilo.chip} ring-2 ring-brand-300` : "bg-surface text-ink-muted"
              )}
            >
              <Icone size={13} aria-hidden="true" />
              {estilo.rotulo}
            </button>
          );
        })}
      </div>

      {turmas.length > 1 && (
        <div>
          <label htmlFor={`turma-obs-${alunoId}`} className="sr-only">
            Turma
          </label>
          <select
            id={`turma-obs-${alunoId}`}
            className="field-input"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
          >
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} — {t.disciplina}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor={`obs-${alunoId}`} className="sr-only">
          Texto da observação
        </label>
        <textarea
          id={`obs-${alunoId}`}
          className="field-input"
          rows={2}
          placeholder="Ex: Participou muito bem da atividade em grupo."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      <Button type="submit" isLoading={enviando} disabled={!texto.trim()} className="py-1.5 text-xs">
        <NotebookPen size={14} aria-hidden="true" />
        Registrar observação
      </Button>
    </form>
  );
}

function NovaConversaForm({
  alunoId,
  responsaveis,
  onCriada,
}: {
  alunoId: string;
  responsaveis: { id: string; nome: string }[];
  onCriada: (conversaId: string) => void;
}) {
  const [responsavelId, setResponsavelId] = useState(responsaveis[0]?.id ?? "");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    setErro(null);
    try {
      const { conversa } = await responsavelService.iniciarConversa({
        alunoId,
        responsavelId,
        texto,
      });
      setTexto("");
      onCriada(conversa.id);
    } catch {
      setErro("Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-surface-muted p-3">
      {responsaveis.length > 1 && (
        <div>
          <label htmlFor={`resp-${alunoId}`} className="field-label">
            Responsável
          </label>
          <select
            id={`resp-${alunoId}`}
            className="field-input"
            value={responsavelId}
            onChange={(e) => setResponsavelId(e.target.value)}
          >
            {responsaveis.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor={`nova-msg-${alunoId}`} className="sr-only">
          Nova mensagem
        </label>
        <textarea
          id={`nova-msg-${alunoId}`}
          className="field-input"
          rows={2}
          placeholder={`Escrever para ${responsaveis[0]?.nome ?? "o responsável"}...`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {erro && (
        <p role="alert" className="text-sm text-coral-600 dark:text-coral-400">
          {erro}
        </p>
      )}

      <Button type="submit" isLoading={enviando} disabled={!texto.trim()} className="py-1.5 text-xs">
        <Send size={14} aria-hidden="true" />
        Enviar
      </Button>
    </form>
  );
}
