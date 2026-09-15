import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { resolveUploadUrl } from "../../lib/storage";
import { CreateDuvidaInput, ResponderDuvidaInput } from "../../validators/duvida.validators";

const duvidaInclude = {
  aluno: { select: { id: true, nome: true } },
  turma: { select: { id: true, nome: true, disciplina: true } },
  respostas: {
    include: { professor: { select: { id: true, nome: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function createDuvida(
  alunoId: string,
  input: CreateDuvidaInput,
  imagem: Express.Multer.File | undefined
) {
  const matricula = await prisma.matricula.findUnique({
    where: { alunoId_turmaId: { alunoId, turmaId: input.turmaId } },
  });

  if (!matricula) {
    throw AppError.forbidden("Você não está matriculado nesta turma");
  }

  return prisma.duvida.create({
    data: {
      alunoId,
      turmaId: input.turmaId,
      disciplina: input.disciplina,
      tema: input.tema,
      pergunta: input.pergunta,
      nivelDificuldade: input.nivelDificuldade,
      imagemUrl: imagem ? resolveUploadUrl(imagem.filename) : null,
    },
    include: duvidaInclude,
  });
}

export async function listDuvidas(userId: string, role: Role) {
  if (role === "ALUNO") {
    return prisma.duvida.findMany({
      where: { alunoId: userId },
      include: duvidaInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  const turmaIds = (
    await prisma.turma.findMany({ where: { professorId: userId }, select: { id: true } })
  ).map((t) => t.id);

  return prisma.duvida.findMany({
    where: { turmaId: { in: turmaIds } },
    include: duvidaInclude,
    orderBy: { createdAt: "desc" },
  });
}

async function turmaIdsDoUsuario(userId: string, role: Role) {
  if (role === "PROFESSOR") {
    return (
      await prisma.turma.findMany({ where: { professorId: userId }, select: { id: true } })
    ).map((t) => t.id);
  }

  return (
    await prisma.matricula.findMany({ where: { alunoId: userId }, select: { turmaId: true } })
  ).map((m) => m.turmaId);
}

// Biblioteca de explicações: dúvidas destacadas pelo professor, visíveis para toda a turma.
// O nome do aluno que perguntou nunca é incluído aqui — apenas pergunta, resposta e contexto.
export async function listBiblioteca(userId: string, role: Role) {
  const turmaIds = await turmaIdsDoUsuario(userId, role);

  const duvidas = await prisma.duvida.findMany({
    where: { turmaId: { in: turmaIds }, destacada: true },
    include: {
      turma: { select: { id: true, nome: true, disciplina: true } },
      respostas: {
        include: { professor: { select: { id: true, nome: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return duvidas.map((d) => ({
    id: d.id,
    disciplina: d.disciplina,
    tema: d.tema,
    pergunta: d.pergunta,
    imagemUrl: d.imagemUrl,
    turma: d.turma,
    respostas: d.respostas,
    createdAt: d.createdAt,
  }));
}

export async function responderDuvida(
  professorId: string,
  duvidaId: string,
  input: ResponderDuvidaInput
) {
  const duvida = await prisma.duvida.findUnique({
    where: { id: duvidaId },
    include: { turma: true },
  });

  if (!duvida) {
    throw AppError.notFound("Dúvida não encontrada");
  }

  if (duvida.turma.professorId !== professorId) {
    throw AppError.forbidden("Você só pode responder dúvidas das suas turmas");
  }

  await prisma.respostaDuvida.create({
    data: { duvidaId, professorId, resposta: input.resposta },
  });

  return prisma.duvida.update({
    where: { id: duvidaId },
    data: { status: "RESPONDIDA", destacada: input.destacar || duvida.destacada },
    include: duvidaInclude,
  });
}
