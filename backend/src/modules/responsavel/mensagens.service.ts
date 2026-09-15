import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertPodeFalarSobreAluno } from "./responsavel.service";
import { EnviarMensagemInput, IniciarConversaInput } from "../../validators/responsavel.validators";

const conversaInclude = {
  professor: { select: { id: true, nome: true } },
  responsavel: { select: { id: true, nome: true } },
  aluno: { select: { id: true, nome: true } },
};

/** Conversas em que o usuário participa, com prévia da última mensagem. */
export async function listConversas(userId: string, role: Role) {
  const conversas = await prisma.conversa.findMany({
    where: role === "PROFESSOR" ? { professorId: userId } : { responsavelId: userId },
    include: {
      ...conversaInclude,
      mensagens: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { atualizadaEm: "desc" },
  });

  const resultado = [];

  for (const conversa of conversas) {
    const naoLidas = await prisma.mensagem.count({
      where: { conversaId: conversa.id, autorId: { not: userId }, lidaEm: null },
    });

    resultado.push({
      id: conversa.id,
      professor: conversa.professor,
      responsavel: conversa.responsavel,
      aluno: conversa.aluno,
      atualizadaEm: conversa.atualizadaEm,
      ultimaMensagem: conversa.mensagens[0]
        ? {
            texto: conversa.mensagens[0].texto,
            autorId: conversa.mensagens[0].autorId,
            createdAt: conversa.mensagens[0].createdAt,
          }
        : null,
      naoLidas,
    });
  }

  return resultado;
}

/** Total de mensagens não lidas, para o indicador na navegação. */
export async function contarNaoLidas(userId: string, role: Role) {
  return prisma.mensagem.count({
    where: {
      autorId: { not: userId },
      lidaEm: null,
      conversa: role === "PROFESSOR" ? { professorId: userId } : { responsavelId: userId },
    },
  });
}

async function assertParticipa(conversaId: string, userId: string) {
  const conversa = await prisma.conversa.findUnique({
    where: { id: conversaId },
    include: conversaInclude,
  });

  if (!conversa) {
    throw AppError.notFound("Conversa não encontrada");
  }

  if (conversa.professorId !== userId && conversa.responsavelId !== userId) {
    throw AppError.forbidden("Você não participa desta conversa");
  }

  return conversa;
}

/** Abre a conversa e já marca como lidas as mensagens que o outro enviou. */
export async function getConversa(conversaId: string, userId: string) {
  const conversa = await assertParticipa(conversaId, userId);

  await prisma.mensagem.updateMany({
    where: { conversaId, autorId: { not: userId }, lidaEm: null },
    data: { lidaEm: new Date() },
  });

  const mensagens = await prisma.mensagem.findMany({
    where: { conversaId },
    include: { autor: { select: { id: true, nome: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return {
    id: conversa.id,
    professor: conversa.professor,
    responsavel: conversa.responsavel,
    aluno: conversa.aluno,
    mensagens: mensagens.map((m) => ({
      id: m.id,
      texto: m.texto,
      autor: m.autor,
      lidaEm: m.lidaEm,
      createdAt: m.createdAt,
    })),
  };
}

/**
 * Cria a conversa se ainda não existir e envia a primeira mensagem.
 * O par (professor, responsável, aluno) é único, então reabrir o assunto com a
 * mesma pessoa continua na mesma thread.
 */
export async function iniciarConversa(userId: string, role: Role, input: IniciarConversaInput) {
  await assertPodeFalarSobreAluno(userId, role, input.alunoId);

  let professorId: string;
  let responsavelId: string;

  if (role === "PROFESSOR") {
    if (!input.responsavelId) {
      throw new AppError("Informe o responsável", 400, "RESPONSAVEL_OBRIGATORIO");
    }
    // O responsável precisa mesmo acompanhar este aluno.
    const vinculo = await prisma.vinculoResponsavel.findUnique({
      where: { responsavelId_alunoId: { responsavelId: input.responsavelId, alunoId: input.alunoId } },
    });
    if (!vinculo) {
      throw AppError.forbidden("Esse responsável não acompanha este aluno");
    }
    professorId = userId;
    responsavelId = input.responsavelId;
  } else {
    if (!input.professorId) {
      throw new AppError("Informe o professor", 400, "PROFESSOR_OBRIGATORIO");
    }
    const lecionaParaOAluno = await prisma.matricula.findFirst({
      where: { alunoId: input.alunoId, turma: { professorId: input.professorId } },
    });
    if (!lecionaParaOAluno) {
      throw AppError.forbidden("Esse professor não leciona para este aluno");
    }
    professorId = input.professorId;
    responsavelId = userId;
  }

  const conversa = await prisma.conversa.upsert({
    where: {
      professorId_responsavelId_alunoId: { professorId, responsavelId, alunoId: input.alunoId },
    },
    update: { atualizadaEm: new Date() },
    create: { professorId, responsavelId, alunoId: input.alunoId },
  });

  await prisma.mensagem.create({
    data: { conversaId: conversa.id, autorId: userId, texto: input.texto },
  });

  return conversa;
}

export async function enviarMensagem(
  conversaId: string,
  userId: string,
  input: EnviarMensagemInput
) {
  await assertParticipa(conversaId, userId);

  const mensagem = await prisma.mensagem.create({
    data: { conversaId, autorId: userId, texto: input.texto },
    include: { autor: { select: { id: true, nome: true, role: true } } },
  });

  await prisma.conversa.update({
    where: { id: conversaId },
    data: { atualizadaEm: new Date() },
  });

  return mensagem;
}
