import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import {
  ConcluirTarefaInput,
  CreateTarefaInput,
  ListTarefasQuery,
  UpdateTarefaInput,
} from "../../validators/tarefa.validators";

const tarefaInclude = {
  turma: { select: { id: true, nome: true, disciplina: true } },
  criadoPor: { select: { id: true, nome: true } },
};

function serializeTarefa(
  tarefa: {
    id: string;
    titulo: string;
    descricao: string | null;
    tipo: string;
    topico: string | null;
    dataEntrega: Date;
    turmaId: string | null;
    alunoId: string | null;
    concluida: boolean;
    createdAt: Date;
    turma: { id: string; nome: string; disciplina: string } | null;
    criadoPor: { id: string; nome: string };
  },
  concluidaResolvida?: boolean
) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    descricao: tarefa.descricao,
    tipo: tarefa.tipo,
    topico: tarefa.topico,
    dataEntrega: tarefa.dataEntrega,
    turma: tarefa.turma,
    pessoal: tarefa.turmaId === null,
    criadoPor: tarefa.criadoPor,
    concluida: concluidaResolvida ?? tarefa.concluida,
    createdAt: tarefa.createdAt,
  };
}

export async function createTarefa(userId: string, role: Role, input: CreateTarefaInput) {
  if (role === "ALUNO") {
    if (input.turmaId) {
      throw new AppError(
        "Alunos criam apenas tarefas pessoais, sem vínculo com uma turma",
        400,
        "TAREFA_PESSOAL_SEM_TURMA"
      );
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo: input.titulo,
        descricao: input.descricao,
        tipo: input.tipo,
        topico: input.topico,
        dataEntrega: input.dataEntrega,
        alunoId: userId,
        criadoPorId: userId,
      },
      include: tarefaInclude,
    });

    return serializeTarefa(tarefa);
  }

  // PROFESSOR
  if (!input.turmaId) {
    throw new AppError("Informe a turma para atribuir a tarefa", 400, "TURMA_OBRIGATORIA");
  }

  const turma = await prisma.turma.findUnique({ where: { id: input.turmaId } });

  if (!turma || turma.professorId !== userId) {
    throw AppError.forbidden("Você só pode criar tarefas para turmas que leciona");
  }

  const tarefa = await prisma.tarefa.create({
    data: {
      titulo: input.titulo,
      descricao: input.descricao,
      tipo: input.tipo,
      topico: input.topico,
      dataEntrega: input.dataEntrega,
      turmaId: input.turmaId,
      criadoPorId: userId,
    },
    include: tarefaInclude,
  });

  return serializeTarefa(tarefa);
}

export async function listTarefas(userId: string, role: Role, query: ListTarefasQuery) {
  const dateFilter =
    query.de || query.ate
      ? { dataEntrega: { gte: query.de, lte: query.ate } }
      : {};

  if (role === "ALUNO") {
    const matriculas = await prisma.matricula.findMany({
      where: { alunoId: userId },
      select: { turmaId: true },
    });
    const turmaIds = matriculas.map((m) => m.turmaId);

    const tarefas = await prisma.tarefa.findMany({
      where: {
        AND: [
          { OR: [{ alunoId: userId }, { turmaId: { in: turmaIds } }] },
          dateFilter,
        ],
      },
      include: tarefaInclude,
      orderBy: { dataEntrega: "asc" },
    });

    const turmaTarefaIds = tarefas.filter((t) => t.turmaId).map((t) => t.id);
    const conclusoes = await prisma.tarefaConclusao.findMany({
      where: { alunoId: userId, tarefaId: { in: turmaTarefaIds } },
    });
    const conclusaoPorTarefa = new Map(conclusoes.map((c) => [c.tarefaId, c.concluida]));

    return tarefas.map((t) =>
      serializeTarefa(t, t.turmaId ? conclusaoPorTarefa.get(t.id) ?? false : undefined)
    );
  }

  // PROFESSOR
  const turmasLecionadas = await prisma.turma.findMany({
    where: { professorId: userId },
    select: { id: true },
  });
  const turmaIds = turmasLecionadas.map((t) => t.id);

  const tarefas = await prisma.tarefa.findMany({
    where: { AND: [{ turmaId: { in: turmaIds } }, dateFilter] },
    include: {
      ...tarefaInclude,
      _count: { select: { conclusoes: { where: { concluida: true } } } },
    },
    orderBy: { dataEntrega: "asc" },
  });

  const totalAlunosPorTurma = new Map<string, number>();
  for (const turmaId of turmaIds) {
    const total = await prisma.matricula.count({ where: { turmaId } });
    totalAlunosPorTurma.set(turmaId, total);
  }

  return tarefas.map((t) => ({
    ...serializeTarefa(t),
    resumoConclusao: t.turmaId
      ? { concluidas: t._count.conclusoes, totalAlunos: totalAlunosPorTurma.get(t.turmaId) ?? 0 }
      : null,
  }));
}

async function findOwnedTarefa(userId: string, tarefaId: string) {
  const tarefa = await prisma.tarefa.findUnique({ where: { id: tarefaId } });

  if (!tarefa) {
    throw AppError.notFound("Tarefa não encontrada");
  }

  if (tarefa.criadoPorId !== userId) {
    throw AppError.forbidden("Você só pode alterar tarefas que você criou");
  }

  return tarefa;
}

export async function updateTarefa(userId: string, tarefaId: string, input: UpdateTarefaInput) {
  await findOwnedTarefa(userId, tarefaId);

  const tarefa = await prisma.tarefa.update({
    where: { id: tarefaId },
    data: input,
    include: tarefaInclude,
  });

  return serializeTarefa(tarefa);
}

export async function deleteTarefa(userId: string, tarefaId: string) {
  await findOwnedTarefa(userId, tarefaId);
  await prisma.tarefa.delete({ where: { id: tarefaId } });
}

export async function setConclusao(userId: string, tarefaId: string, input: ConcluirTarefaInput) {
  const tarefa = await prisma.tarefa.findUnique({ where: { id: tarefaId } });

  if (!tarefa) {
    throw AppError.notFound("Tarefa não encontrada");
  }

  if (tarefa.alunoId) {
    if (tarefa.alunoId !== userId) {
      throw AppError.forbidden("Esta tarefa pertence a outro aluno");
    }

    const atualizada = await prisma.tarefa.update({
      where: { id: tarefaId },
      data: { concluida: input.concluida },
      include: tarefaInclude,
    });

    return serializeTarefa(atualizada);
  }

  if (!tarefa.turmaId) {
    throw new AppError("Tarefa inválida", 400, "TAREFA_INVALIDA");
  }

  const matricula = await prisma.matricula.findUnique({
    where: { alunoId_turmaId: { alunoId: userId, turmaId: tarefa.turmaId } },
  });

  if (!matricula) {
    throw AppError.forbidden("Você não está matriculado nesta turma");
  }

  await prisma.tarefaConclusao.upsert({
    where: { tarefaId_alunoId: { tarefaId, alunoId: userId } },
    update: { concluida: input.concluida, concluidaEm: input.concluida ? new Date() : null },
    create: {
      tarefaId,
      alunoId: userId,
      concluida: input.concluida,
      concluidaEm: input.concluida ? new Date() : null,
    },
  });

  const atualizada = await prisma.tarefa.findUniqueOrThrow({
    where: { id: tarefaId },
    include: tarefaInclude,
  });

  return serializeTarefa(atualizada, input.concluida);
}
