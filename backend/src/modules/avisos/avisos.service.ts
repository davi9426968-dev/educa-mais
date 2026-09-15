import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateAvisoInput } from "../../validators/aviso.validators";

const avisoInclude = {
  turma: { select: { id: true, nome: true, disciplina: true } },
  autor: { select: { id: true, nome: true } },
};

export async function createAviso(professorId: string, input: CreateAvisoInput) {
  if (input.turmaId) {
    const turma = await prisma.turma.findUnique({ where: { id: input.turmaId } });
    if (!turma || turma.professorId !== professorId) {
      throw AppError.forbidden("Você só pode enviar avisos para turmas que leciona");
    }
  }

  return prisma.aviso.create({
    data: {
      titulo: input.titulo,
      mensagem: input.mensagem,
      turmaId: input.turmaId ?? null,
      dataLimite: input.dataLimite ?? null,
      autorId: professorId,
    },
    include: avisoInclude,
  });
}

/**
 * Responsáveis que devem receber um aviso: os vinculados a alunos da turma
 * indicada — ou todos os responsáveis, quando o aviso é geral da escola.
 */
async function destinatariosDoAviso(turmaId: string | null) {
  if (!turmaId) {
    return prisma.user.findMany({
      where: { role: "RESPONSAVEL" },
      select: { id: true, nome: true },
    });
  }

  const matriculas = await prisma.matricula.findMany({
    where: { turmaId },
    select: { alunoId: true },
  });

  const vinculos = await prisma.vinculoResponsavel.findMany({
    where: { alunoId: { in: matriculas.map((m) => m.alunoId) } },
    include: { responsavel: { select: { id: true, nome: true } } },
  });

  const unicos = new Map(vinculos.map((v) => [v.responsavel.id, v.responsavel]));
  return Array.from(unicos.values());
}

export async function listAvisosProfessor(professorId: string) {
  const avisos = await prisma.aviso.findMany({
    where: { autorId: professorId },
    include: { ...avisoInclude, leituras: { select: { userId: true, lidoEm: true } } },
    orderBy: { createdAt: "desc" },
  });

  const resultado = [];

  for (const aviso of avisos) {
    const destinatarios = await destinatariosDoAviso(aviso.turmaId);
    const lidoPor = new Set(aviso.leituras.map((l) => l.userId));

    resultado.push({
      id: aviso.id,
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      turma: aviso.turma,
      autor: aviso.autor,
      dataLimite: aviso.dataLimite,
      createdAt: aviso.createdAt,
      // Quem já confirmou ciência e quem ainda não — é o que o professor quer
      // saber depois de mandar um comunicado.
      cientes: destinatarios.filter((d) => lidoPor.has(d.id)),
      pendentes: destinatarios.filter((d) => !lidoPor.has(d.id)),
      totalDestinatarios: destinatarios.length,
    });
  }

  return resultado;
}

export async function confirmarCiencia(avisoId: string, userId: string) {
  const aviso = await prisma.aviso.findUnique({ where: { id: avisoId } });

  if (!aviso) {
    throw AppError.notFound("Aviso não encontrado");
  }

  await prisma.avisoLeitura.upsert({
    where: { avisoId_userId: { avisoId, userId } },
    update: {},
    create: { avisoId, userId },
  });
}

async function turmaIdsDoResponsavel(responsavelId: string) {
  const vinculos = await prisma.vinculoResponsavel.findMany({
    where: { responsavelId },
    select: { alunoId: true },
  });
  const alunoIds = vinculos.map((v) => v.alunoId);

  if (alunoIds.length === 0) return [];

  const matriculas = await prisma.matricula.findMany({
    where: { alunoId: { in: alunoIds } },
    select: { turmaId: true },
  });

  return Array.from(new Set(matriculas.map((m) => m.turmaId)));
}

export async function listAvisosResponsavel(responsavelId: string) {
  const turmaIds = await turmaIdsDoResponsavel(responsavelId);

  const avisos = await prisma.aviso.findMany({
    where: { OR: [{ turmaId: null }, { turmaId: { in: turmaIds } }] },
    include: {
      ...avisoInclude,
      leituras: { where: { userId: responsavelId }, select: { lidoEm: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return avisos.map((aviso) => ({
    id: aviso.id,
    titulo: aviso.titulo,
    mensagem: aviso.mensagem,
    turma: aviso.turma,
    autor: aviso.autor,
    dataLimite: aviso.dataLimite,
    createdAt: aviso.createdAt,
    cienteEm: aviso.leituras[0]?.lidoEm ?? null,
  }));
}
