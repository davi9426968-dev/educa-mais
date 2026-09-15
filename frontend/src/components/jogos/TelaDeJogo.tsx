import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flag, PartyPopper, Play, Trophy, Users } from "lucide-react";
import clsx from "clsx";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { SkeletonList } from "../ui/Skeleton";
import { OpcaoBotao } from "./OpcaoBotao";
import { TimerBar } from "./TimerBar";
import { Podio, Ranking } from "./Ranking";
import { useContagemRegressiva, useEstadoJogo } from "../../hooks/useEstadoJogo";
import * as quizService from "../../services/quiz.service";

export function TelaDeJogo({ sessaoId, voltarPara }: { sessaoId: string; voltarPara: string }) {
  const { estado, recebidoEm, erro, recarregar } = useEstadoJogo(sessaoId);
  const restanteMs = useContagemRegressiva(estado?.pergunta?.restanteMs ?? null, recebidoEm);

  const [enviando, setEnviando] = useState(false);
  const [avancando, setAvancando] = useState(false);
  // Guarda para não enviar a resposta automática duas vezes na mesma pergunta.
  const timeoutEnviadoRef = useRef<string | null>(null);

  const pergunta = estado?.pergunta ?? null;
  const jaRespondi = Boolean(estado?.minhaResposta);
  // Quem hospeda uma sala ao vivo conduz o jogo e não responde.
  const conduzindo = Boolean(estado?.souHost && estado.sessao.modo === "AO_VIVO");
  const souJogador = Boolean(estado?.souParticipante) && !conduzindo;

  const responder = useCallback(
    async (opcaoId: string | null) => {
      if (!pergunta || !sessaoId) return;
      setEnviando(true);
      try {
        await quizService.responder(sessaoId, pergunta.id, opcaoId);
      } catch {
        // Conflito por resposta duplicada ou tempo esgotado: o estado seguinte
        // já reflete a situação real, então só ressincronizamos.
      } finally {
        setEnviando(false);
        await recarregar();
      }
    },
    [pergunta, sessaoId, recarregar]
  );

  // Tempo acabou sem resposta: registra automaticamente para o jogo seguir.
  useEffect(() => {
    if (!pergunta || !souJogador || jaRespondi) return;
    if (restanteMs > 0) return;
    if (timeoutEnviadoRef.current === pergunta.id) return;

    timeoutEnviadoRef.current = pergunta.id;
    responder(null);
  }, [pergunta, souJogador, jaRespondi, restanteMs, responder]);

  async function avancar() {
    if (!sessaoId) return;
    setAvancando(true);
    try {
      await quizService.avancar(sessaoId);
      await recarregar();
    } finally {
      setAvancando(false);
    }
  }

  if (erro && !estado) {
    return (
      <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
        {erro}
      </p>
    );
  }

  if (!estado) return <SkeletonList rows={4} />;

  const { sessao, participantes, gabarito, minhaResposta } = estado;
  // O servidor só manda o gabarito quando ele já pode ser mostrado (respondi,
  // tempo esgotado ou todos responderam), então basta seguir o que ele diz.
  const revelando = Boolean(gabarito);

  // ----- Lobby (só existe no modo ao vivo) -----
  if (sessao.status === "LOBBY") {
    return (
      <div className="space-y-6">
        <CabecalhoJogo titulo={sessao.quiz.titulo} disciplina={sessao.quiz.disciplina} />

        <div className="card text-center">
          <p className="text-sm text-ink-muted">PIN da sala</p>
          <p className="my-2 font-display text-6xl font-bold tracking-[0.2em] text-brand-700 dark:text-brand-300">
            {sessao.pin}
          </p>
          <p className="text-sm text-ink-muted">
            Os alunos entram em <strong>Jogos → Entrar com PIN</strong>.
          </p>
        </div>

        <div className="card">
          <h2 className="section-title mb-3">
            <Users size={14} aria-hidden="true" />
            Na sala ({participantes.length})
          </h2>
          <Ranking participantes={participantes} />
        </div>

        {conduzindo ? (
          <Button
            className="w-full"
            onClick={avancar}
            isLoading={avancando}
            disabled={participantes.length === 0}
          >
            <Play size={16} aria-hidden="true" />
            {participantes.length === 0 ? "Aguardando alunos entrarem..." : "Começar o jogo"}
          </Button>
        ) : (
          <p className="text-center text-ink-muted">Aguardando o professor começar o jogo...</p>
        )}
      </div>
    );
  }

  // ----- Fim de jogo -----
  if (sessao.status === "ENCERRADA") {
    return (
      <div className="space-y-6">
        <CabecalhoJogo titulo={sessao.quiz.titulo} disciplina={sessao.quiz.disciplina} />

        <div className="card">
          <div className="mb-6 flex flex-col items-center gap-1 text-center">
            <PartyPopper size={30} className="text-sun-500" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold">Fim de jogo!</h2>
            <p className="text-sm text-ink-muted">
              {sessao.totalPerguntas} pergunta(s) · {participantes.length} jogador(es)
            </p>
          </div>

          <Podio participantes={participantes} />
        </div>

        <div className="card">
          <h2 className="section-title mb-3">
            <Trophy size={14} aria-hidden="true" />
            Classificação final
          </h2>
          <Ranking participantes={participantes} />
        </div>

        <Link to={voltarPara}>
          <Button variant="secondary" className="w-full">
            <Flag size={16} aria-hidden="true" />
            Voltar aos jogos
          </Button>
        </Link>
      </div>
    );
  }

  // ----- Jogo em andamento -----
  return (
    <div className="space-y-6">
      <CabecalhoJogo titulo={sessao.quiz.titulo} disciplina={sessao.quiz.disciplina} />

      <div className="card space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Badge tone="brand">
            Pergunta {sessao.perguntaIndex + 1} de {sessao.totalPerguntas}
          </Badge>
          {conduzindo && pergunta && (
            <span className="text-sm text-ink-muted">
              {pergunta.totalRespostas} de {participantes.length} responderam
            </span>
          )}
        </div>

        {pergunta && (
          <>
            <TimerBar restanteMs={restanteMs} totalSegundos={pergunta.tempoLimiteSegundos} />

            <h2 className="py-2 text-center font-display text-xl font-bold leading-snug sm:text-2xl">
              {pergunta.enunciado}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {pergunta.opcoes.map((opcao, indice) => {
                const escolhida = minhaResposta?.opcaoId === opcao.id;
                let revelacao: "correta" | "incorreta" | "neutra" | null = null;
                if (revelando) {
                  if (gabarito?.opcaoCorretaId === opcao.id) revelacao = "correta";
                  else if (escolhida) revelacao = "incorreta";
                  else revelacao = "neutra";
                }

                return (
                  <OpcaoBotao
                    key={opcao.id}
                    indice={indice}
                    texto={opcao.texto}
                    escolhida={escolhida}
                    revelacao={revelacao}
                    desabilitado={!souJogador || jaRespondi || restanteMs <= 0 || enviando}
                    onClick={() => responder(opcao.id)}
                  />
                );
              })}
            </div>
          </>
        )}

        {souJogador && minhaResposta && (
          <div
            role="status"
            className={clsx(
              "rounded-xl px-4 py-3 text-center font-semibold",
              minhaResposta.correta ? "bg-leaf-500/15 text-leaf-700 dark:text-leaf-300" : "bg-coral-500/15 text-coral-700 dark:text-coral-300"
            )}
          >
            {minhaResposta.correta
              ? `Acertou! +${minhaResposta.pontos} pontos`
              : minhaResposta.opcaoId
                ? "Resposta incorreta"
                : "Tempo esgotado"}
          </div>
        )}

        {souJogador && !minhaResposta && restanteMs <= 0 && (
          <p className="text-center text-sm text-ink-muted">Tempo esgotado.</p>
        )}
      </div>

      {(conduzindo || sessao.modo === "SOLO") && (
        <Button
          className="w-full"
          onClick={avancar}
          isLoading={avancando}
          disabled={sessao.modo === "SOLO" && !jaRespondi && restanteMs > 0}
        >
          {sessao.perguntaIndex + 1 >= sessao.totalPerguntas ? (
            <>
              <Flag size={16} aria-hidden="true" />
              Ver resultado final
            </>
          ) : (
            <>
              Próxima pergunta
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </Button>
      )}

      {sessao.modo === "AO_VIVO" && (
        <div className="card">
          <h2 className="section-title mb-3">
            <Trophy size={14} aria-hidden="true" />
            Ranking
          </h2>
          <Ranking participantes={participantes} mostrarStatusResposta={conduzindo} />
        </div>
      )}
    </div>
  );
}

function CabecalhoJogo({ titulo, disciplina }: { titulo: string; disciplina: string }) {
  return (
    <div className="relative -mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-6 text-white shadow-lg sm:-mx-6">
      <Trophy
        size={120}
        strokeWidth={1}
        className="pointer-events-none absolute -right-4 -top-4 text-white/10"
        aria-hidden="true"
      />
      <h1 className="relative font-display text-xl font-bold sm:text-2xl">{titulo}</h1>
      <p className="relative text-white/85">{disciplina}</p>
    </div>
  );
}
