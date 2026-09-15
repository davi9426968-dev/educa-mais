import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateTurmaInput } from "../../validators/turma.validators";

// Sem 0, O, 1, I, L para evitar confusão ao digitar o código (mesma lógica do Google Classroom).
const CODIGO_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function gerarCodigoAleatorio(): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)];
  }
  return codigo;
}

async function gerarCodigoUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const codigo = gerarCodigoAleatorio();
    const existente = await prisma.turma.findUnique({ where: { codigo } });
    if (!existente) return codigo;
  }
  throw new AppError("Não foi possível gerar um código de turma. Tente novamente.", 500, "CODIGO_GERACAO_FALHOU");
}

export async function listMinhasTurmas(userId: string, role: Role) {
  if (role === "PROFESSOR") {
    const turmas = await prisma.turma.findMany({
      where: { professorId: userId },
      include: { _count: { select: { matriculas: true } } },
      orderBy: { nome: "asc" },
    });

    return turmas.map((t) => ({
      id: t.id,
      nome: t.nome,
      disciplina: t.disciplina,
      codigo: t.codigo,
      totalAlunos: t._count.matriculas,
    }));
  }

  // ALUNO
  const matriculas = await prisma.matricula.findMany({
    where: { alunoId: userId },
    include: {
      turma: { include: { professor: { select: { id: true, nome: true } } } },
    },
  });

  return matriculas.map((m) => ({
    id: m.turma.id,
    nome: m.turma.nome,
    disciplina: m.turma.disciplina,
    professor: m.turma.professor,
  }));
}

export async function createTurma(professorId: string, input: CreateTurmaInput) {
  const codigo = await gerarCodigoUnico();

  return prisma.turma.create({
    data: { nome: input.nome, disciplina: input.disciplina, professorId, codigo },
  });
}

export async function entrarNaTurma(alunoId: string, codigoDigitado: string) {
  const codigo = codigoDigitado.trim().toUpperCase();
  const turma = await prisma.turma.findUnique({ where: { codigo } });

  if (!turma) {
    throw AppError.notFound("Código de turma inválido");
  }

  const jaMatriculado = await prisma.matricula.findUnique({
    where: { alunoId_turmaId: { alunoId, turmaId: turma.id } },
  });

  if (jaMatriculado) {
    throw AppError.conflict("Você já está matriculado nesta turma");
  }

  await prisma.matricula.create({ data: { alunoId, turmaId: turma.id } });

  return turma;
}

export async function regenerarCodigo(professorId: string, turmaId: string) {
  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!turma || turma.professorId !== professorId) {
    throw AppError.forbidden("Você só pode gerenciar turmas que leciona");
  }

  const codigo = await gerarCodigoUnico();

  return prisma.turma.update({ where: { id: turmaId }, data: { codigo } });
}

async function verificarAcessoTurma(turmaId: string, userId: string, role: Role) {
  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });

  if (!turma) {
    throw AppError.notFound("Turma não encontrada");
  }

  if (role === "PROFESSOR") {
    if (turma.professorId !== userId) {
      throw AppError.forbidden("Você não leciona esta turma");
    }
    return turma;
  }

  const matricula = await prisma.matricula.findUnique({
    where: { alunoId_turmaId: { alunoId: userId, turmaId } },
  });

  if (!matricula) {
    throw AppError.forbidden("Você não está matriculado nesta turma");
  }

  return turma;
}

// "Mural" da turma, no espírito do Stream do Google Classroom: atividades, materiais e avisos
// daquela turma juntos, em ordem cronológica.
export async function getMural(turmaId: string, userId: string, role: Role) {
  const turma = await verificarAcessoTurma(turmaId, userId, role);

  const turmaResumo = { id: turma.id, nome: turma.nome, disciplina: turma.disciplina };

  const [tarefas, materiais, avisos] = await Promise.all([
    prisma.tarefa.findMany({
      where: { turmaId },
      include: { criadoPor: { select: { id: true, nome: true } } },
    }),
    prisma.material.findMany({
      where: { turmaId },
      include: { autor: { select: { id: true, nome: true } } },
    }),
    prisma.aviso.findMany({
      where: { turmaId },
      include: {
        autor: { select: { id: true, nome: true } },
        turma: { select: { id: true, nome: true, disciplina: true } },
      },
    }),
  ]);

  const itens = [
    ...tarefas.map((t) => ({
      id: `tarefa-${t.id}`,
      tipo: "TAREFA" as const,
      topico: t.topico,
      createdAt: t.createdAt,
      // Toda tarefa que aparece no mural pertence a esta turma (nunca é pessoal).
      item: { ...t, turma: turmaResumo, pessoal: false },
    })),
    ...materiais.map((m) => ({
      id: `material-${m.id}`,
      tipo: "MATERIAL" as const,
      topico: m.topico,
      createdAt: m.createdAt,
      item: { ...m, turma: turmaResumo },
    })),
    ...avisos.map((a) => ({
      id: `aviso-${a.id}`,
      tipo: "AVISO" as const,
      topico: null as string | null,
      createdAt: a.createdAt,
      item: a,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { turma, itens };
}
