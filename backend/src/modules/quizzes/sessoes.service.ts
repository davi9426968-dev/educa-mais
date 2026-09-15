import { QuizModo, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CriarSessaoInput, ResponderInput } from "../../validators/quiz.validators";
import { turmaIdsDoUsuario } from "./quizzes.service";

const PONTOS_MAXIMOS = 1000;
/** Mesmo respondendo no último segundo, acertar vale metade dos pontos. */
const FRACAO_MINIMA_ACERTO = 0.5;
/** Tolerância para diferença de relógio/latência ao registrar a resposta. */
const GRACA_MS = 1500;

/**
 * Pontuação no estilo Kahoot: acertar rápido vale mais. Errar (ou não responder)
 * vale zero.
 */
export function calcularPontos(correta: boolean, tempoMs: number, tempoLimiteMs: number): number {
  if (!correta) return 0;

  const proporcaoUsada = Math.min(Math.max(tempoMs / tempoLimiteMs, 0), 1);
  const fator = 1 - proporcaoUsada * (1 - FRACAO_MINIMA_ACERTO);

  return Math.round(PONTOS_MAXIMOS * fator);
}

function gerarPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function gerarPinUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const pin = gerarPin();
    const existente = await prisma.quizSessao.findUnique({ where: { pin } });
    if (!existente) return pin;
  }
  throw new AppError("Não foi possível abrir a sala agora. Tente novamente.", 500, "PIN_GERACAO_FALHOU");
}

async function assertPodeUsarQuiz(quizId: string, userId: string, role: Role) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { _count: { select: { perguntas: true } } },
  });

  if (!quiz) {
    throw AppError.notFound("Jogo não encontrado");
  }

  if (quiz._count.perguntas === 0) {
    throw new AppError("Este jogo ainda não tem perguntas", 400, "QUIZ_SEM_PERGUNTAS");
  }

  const turmaIds = await turmaIdsDoUsuario(userId, role);
  const temAcesso =
    quiz.doBanco || quiz.criadoPorId === userId || (quiz.turmaId && turmaIds.includes(quiz.turmaId));

  if (!temAcesso) {
    throw AppError.forbidden("Você não tem acesso a este jogo");
  }

  return quiz;
}

export async function criarSessao(
  userId: string,
  role: Role,
  nome: string,
  quizId: string,
  input: CriarSessaoInput
) {
  await assertPodeUsarQuiz(quizId, userId, role);

  if (input.modo === "AO_VIVO" && role !== "PROFESSOR") {
    throw AppError.forbidden("Apenas professores podem abrir uma sala ao vivo");
  }

  if (input.turmaId) {
    const turma = await prisma.turma.findUnique({ where: { id: input.turmaId } });
    if (!turma || turma.professorId !== userId) {
      throw AppError.forbidden("Você só pode abrir salas para turmas que leciona");
    }
  }

  const aoVivo = input.modo === "AO_VIVO";

  const sessao = await prisma.quizSessao.create({
    data: {
      quizId,
      modo: input.modo as QuizModo,
      pin: aoVivo ? await gerarPinUnico() : null,
      hostId: userId,
      turmaId: input.turmaId ?? null,
      // No solo o jogo já começa na primeira pergunta; ao vivo espera no lobby.
      status: aoVivo ? "LOBBY" : "EM_ANDAMENTO",
      perguntaIndex: aoVivo ? -1 : 0,
      perguntaIniciadaEm: aoVivo ? null : new Date(),
      // Quem joga solo já entra como participante da própria sessão.
      participantes: aoVivo ? undefined : { create: { userId, nome } },
    },
  });

  return sessao;
}

/** Monta um jogo solo escolhendo um quiz aleatório da matéria pedida. */
export async function criarJogoRapido(userId: string, role: Role, nome: string, disciplina: string) {
  const turmaIds = await turmaIdsDoUsuario(userId, role);

  const candidatos = await prisma.quiz.findMany({
    where: {
      disciplina: { equals: disciplina, mode: "insensitive" },
      perguntas: { some: {} },
      OR: [{ doBanco: true }, { criadoPorId: userId }, { turmaId: { in: turmaIds } }],
    },
    select: { id: true },
  });

  if (candidatos.length === 0) {
    throw AppError.notFound("Nenhum jogo disponível para esta matéria ainda");
  }

  const escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];

  return criarSessao(userId, role, nome, escolhido.id, { modo: "SOLO" });
}

export async function entrarPorPin(userId: string, nome: string, pinDigitado: string) {
  const pin = pinDigitado.trim();
  const sessao = await prisma.quizSessao.findUnique({ where: { pin } });

  if (!sessao) {
    throw AppError.notFound("Sala não encontrada. Confira o PIN.");
  }

  if (sessao.status === "ENCERRADA") {
    throw new AppError("Esta sala já foi encerrada", 400, "SESSAO_ENCERRADA");
  }

  if (sessao.status === "EM_ANDAMENTO") {
    // Depois que o jogo começa, quem não estava no lobby não entra — senão
    // começaria com desvantagem nas perguntas já passadas.
    const jaParticipa = await prisma.quizParticipante.findUnique({
      where: { sessaoId_userId: { sessaoId: sessao.id, userId } },
    });
    if (!jaParticipa) {
      throw new AppError("O jogo já começou nesta sala", 400, "JOGO_JA_COMECOU");
    }
    return sessao;
  }

  await prisma.quizParticipante.upsert({
    where: { sessaoId_userId: { sessaoId: sessao.id, userId } },
    update: { nome },
    create: { sessaoId: sessao.id, userId, nome },
  });

  return sessao;
}

async function carregarSessaoCompleta(sessaoId: string) {
  const sessao = await prisma.quizSessao.findUnique({
    where: { id: sessaoId },
    include: {
      quiz: {
        include: {
          perguntas: {
            orderBy: { ordem: "asc" },
            include: { opcoes: { orderBy: { ordem: "asc" } } },
          },
        },
      },
      turma: { select: { id: true, nome: true, disciplina: true } },
      participantes: { orderBy: [{ pontuacao: "desc" }, { createdAt: "asc" }] },
    },
  });

  if (!sessao) {
    throw AppError.notFound("Sessão não encontrada");
  }

  return sessao;
}

/**
 * Estado do jogo para o cliente que está fazendo polling. O gabarito só é
 * incluído depois que o jogador respondeu, quando o tempo da pergunta acabou,
 * ou para quem está hospedando.
 */
export async function getEstado(sessaoId: string, userId: string) {
  const sessao = await carregarSessaoCompleta(sessaoId);

  const souHost = sessao.hostId === userId;
  const participante = sessao.participantes.find((p) => p.userId === userId) ?? null;

  if (!souHost && !participante) {
    throw AppError.forbidden("Você não está participando desta sessão");
  }

  const perguntaAtual =
    sessao.perguntaIndex >= 0 ? sessao.quiz.perguntas[sessao.perguntaIndex] ?? null : null;

  // Uma única leitura das respostas da pergunta atual serve para o contador do
  // host, para a lista de quem já respondeu e para o meu próprio resultado.
  const respostasDaPergunta = perguntaAtual
    ? await prisma.quizResposta.findMany({
        where: { perguntaId: perguntaAtual.id, participante: { sessaoId: sessao.id } },
      })
    : [];
  const idsQueResponderam = new Set(respostasDaPergunta.map((r) => r.participanteId));

  let pergunta = null;
  let gabarito: { opcaoCorretaId: string } | null = null;
  let minhaResposta = null;

  if (perguntaAtual && sessao.status === "EM_ANDAMENTO") {
    const tempoLimiteMs = perguntaAtual.tempoLimiteSegundos * 1000;
    const iniciadaEm = sessao.perguntaIniciadaEm?.getTime() ?? Date.now();
    const restanteMs = Math.max(0, iniciadaEm + tempoLimiteMs - Date.now());

    const respostaRegistrada = participante
      ? respostasDaPergunta.find((r) => r.participanteId === participante.id) ?? null
      : null;

    const tempoEsgotado = restanteMs <= 0;
    const todosResponderam =
      sessao.participantes.length > 0 &&
      respostasDaPergunta.length >= sessao.participantes.length;

    // Regras para revelar o gabarito, nesta ordem de cuidado:
    //  - quem respondeu vê o próprio resultado na hora (como no Kahoot);
    //  - todo mundo vê quando o tempo acaba ou quando a turma toda respondeu.
    // Ser host NÃO libera nada por si só: no modo SOLO o host é o próprio
    // jogador (veria a resposta certa inspecionando a rede) e, no modo AO VIVO,
    // a tela do professor costuma estar projetada para a turma.
    const podeVerGabarito =
      Boolean(respostaRegistrada) || tempoEsgotado || todosResponderam;

    pergunta = {
      id: perguntaAtual.id,
      enunciado: perguntaAtual.enunciado,
      ordem: perguntaAtual.ordem,
      tempoLimiteSegundos: perguntaAtual.tempoLimiteSegundos,
      restanteMs,
      encerrada: tempoEsgotado,
      totalRespostas: respostasDaPergunta.length,
      opcoes: perguntaAtual.opcoes.map((o) => ({ id: o.id, texto: o.texto, ordem: o.ordem })),
    };

    if (podeVerGabarito) {
      const correta = perguntaAtual.opcoes.find((o) => o.correta);
      if (correta) gabarito = { opcaoCorretaId: correta.id };
    }

    if (respostaRegistrada) {
      minhaResposta = {
        opcaoId: respostaRegistrada.opcaoId,
        correta: respostaRegistrada.correta,
        pontos: respostaRegistrada.pontos,
      };
    }
  }

  return {
    sessao: {
      id: sessao.id,
      modo: sessao.modo,
      pin: sessao.pin,
      status: sessao.status,
      perguntaIndex: sessao.perguntaIndex,
      totalPerguntas: sessao.quiz.perguntas.length,
      quiz: {
        id: sessao.quiz.id,
        titulo: sessao.quiz.titulo,
        disciplina: sessao.quiz.disciplina,
        tema: sessao.quiz.tema,
      },
      turma: sessao.turma,
    },
    souHost,
    souParticipante: Boolean(participante),
    pergunta,
    gabarito,
    minhaResposta,
    participantes: sessao.participantes.map((p) => ({
      id: p.id,
      nome: p.nome,
      pontuacao: p.pontuacao,
      respondeu: idsQueResponderam.has(p.id),
    })),
  };
}

/** Avança para a próxima pergunta (ou encerra o jogo). Só o host pode chamar. */
export async function avancar(sessaoId: string, userId: string) {
  const sessao = await carregarSessaoCompleta(sessaoId);

  if (sessao.hostId !== userId) {
    throw AppError.forbidden("Apenas quem abriu o jogo pode avançar");
  }

  if (sessao.status === "ENCERRADA") {
    throw new AppError("Este jogo já terminou", 400, "SESSAO_ENCERRADA");
  }

  const proximoIndex = sessao.perguntaIndex + 1;
  const acabou = proximoIndex >= sessao.quiz.perguntas.length;

  if (acabou) {
    return prisma.quizSessao.update({
      where: { id: sessaoId },
      data: {
        status: "ENCERRADA",
        encerradaEm: new Date(),
        // Libera o PIN para reuso por outra sala.
        pin: null,
      },
    });
  }

  return prisma.quizSessao.update({
    where: { id: sessaoId },
    data: {
      status: "EM_ANDAMENTO",
      perguntaIndex: proximoIndex,
      perguntaIniciadaEm: new Date(),
    },
  });
}

export async function responder(sessaoId: string, userId: string, input: ResponderInput) {
  const sessao = await carregarSessaoCompleta(sessaoId);

  if (sessao.status !== "EM_ANDAMENTO") {
    throw new AppError("O jogo não está em andamento", 400, "SESSAO_NAO_ATIVA");
  }

  const participante = sessao.participantes.find((p) => p.userId === userId);
  if (!participante) {
    throw AppError.forbidden("Você não está participando desta sessão");
  }

  const perguntaAtual = sessao.quiz.perguntas[sessao.perguntaIndex];
  if (!perguntaAtual || perguntaAtual.id !== input.perguntaId) {
    throw new AppError("Esta não é a pergunta atual do jogo", 400, "PERGUNTA_INVALIDA");
  }

  const jaRespondeu = await prisma.quizResposta.findUnique({
    where: {
      participanteId_perguntaId: { participanteId: participante.id, perguntaId: perguntaAtual.id },
    },
  });
  if (jaRespondeu) {
    throw AppError.conflict("Você já respondeu esta pergunta");
  }

  const opcao = input.opcaoId
    ? perguntaAtual.opcoes.find((o) => o.id === input.opcaoId)
    : null;
  if (input.opcaoId && !opcao) {
    throw new AppError("Alternativa inválida", 400, "OPCAO_INVALIDA");
  }

  const tempoLimiteMs = perguntaAtual.tempoLimiteSegundos * 1000;
  const iniciadaEm = sessao.perguntaIniciadaEm?.getTime() ?? Date.now();
  const tempoMs = Math.max(0, Date.now() - iniciadaEm);
  const tempoEsgotado = tempoMs > tempoLimiteMs + GRACA_MS;

  // Fora do tempo (ou sem escolher alternativa) a resposta é registrada como
  // errada em vez de dar erro — evita travar o jogo por lentidão de rede.
  const correta = !tempoEsgotado && Boolean(opcao?.correta);
  const pontos = calcularPontos(correta, Math.min(tempoMs, tempoLimiteMs), tempoLimiteMs);

  await prisma.$transaction([
    prisma.quizResposta.create({
      data: {
        participanteId: participante.id,
        perguntaId: perguntaAtual.id,
        opcaoId: opcao?.id ?? null,
        correta,
        tempoMs,
        pontos,
      },
    }),
    prisma.quizParticipante.update({
      where: { id: participante.id },
      data: { pontuacao: { increment: pontos } },
    }),
  ]);

  const opcaoCorreta = perguntaAtual.opcoes.find((o) => o.correta);

  return {
    correta,
    pontos,
    opcaoCorretaId: opcaoCorreta?.id ?? null,
    tempoEsgotado,
  };
}

/** Histórico de jogos do usuário (como host ou participante). */
export async function listMinhasSessoes(userId: string) {
  const sessoes = await prisma.quizSessao.findMany({
    where: {
      OR: [{ hostId: userId }, { participantes: { some: { userId } } }],
    },
    include: {
      quiz: { select: { id: true, titulo: true, disciplina: true } },
      turma: { select: { id: true, nome: true } },
      participantes: {
        orderBy: { pontuacao: "desc" },
        select: { userId: true, nome: true, pontuacao: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return sessoes.map((s) => ({
    id: s.id,
    modo: s.modo,
    status: s.status,
    pin: s.pin,
    quiz: s.quiz,
    turma: s.turma,
    createdAt: s.createdAt,
    encerradaEm: s.encerradaEm,
    totalParticipantes: s.participantes.length,
    minhaPontuacao: s.participantes.find((p) => p.userId === userId)?.pontuacao ?? null,
    vencedor: s.participantes[0] ? { nome: s.participantes[0].nome, pontuacao: s.participantes[0].pontuacao } : null,
  }));
}
