import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateQuizInput, ListQuizzesQuery } from "../../validators/quiz.validators";

/** Turmas em que o usuário participa (leciona, se professor; matriculado, se aluno). */
export async function turmaIdsDoUsuario(userId: string, role: Role): Promise<string[]> {
  if (role === "PROFESSOR") {
    const turmas = await prisma.turma.findMany({
      where: { professorId: userId },
      select: { id: true },
    });
    return turmas.map((t) => t.id);
  }

  const matriculas = await prisma.matricula.findMany({
    where: { alunoId: userId },
    select: { turmaId: true },
  });
  return matriculas.map((m) => m.turmaId);
}

/**
 * Quizzes visíveis para o usuário: os do banco da plataforma (abertos a todos)
 * mais os criados por professores nas turmas de que ele participa.
 */
export async function listQuizzes(userId: string, role: Role, query: ListQuizzesQuery) {
  const turmaIds = await turmaIdsDoUsuario(userId, role);

  const quizzes = await prisma.quiz.findMany({
    where: {
      AND: [
        query.disciplina ? { disciplina: { equals: query.disciplina, mode: "insensitive" } } : {},
        {
          OR: [
            { doBanco: true },
            { criadoPorId: userId },
            { turmaId: { in: turmaIds } },
          ],
        },
      ],
    },
    include: {
      turma: { select: { id: true, nome: true, disciplina: true } },
      criadoPor: { select: { id: true, nome: true } },
      _count: { select: { perguntas: true } },
    },
    orderBy: [{ doBanco: "desc" }, { createdAt: "desc" }],
  });

  return quizzes.map((q) => ({
    id: q.id,
    titulo: q.titulo,
    descricao: q.descricao,
    disciplina: q.disciplina,
    tema: q.tema,
    doBanco: q.doBanco,
    turma: q.turma,
    criadoPor: q.criadoPor,
    totalPerguntas: q._count.perguntas,
    createdAt: q.createdAt,
  }));
}

/** Disciplinas com pelo menos um quiz disponível para este usuário. */
export async function listDisciplinasDisponiveis(userId: string, role: Role) {
  const quizzes = await listQuizzes(userId, role, {});

  const porDisciplina = new Map<string, number>();
  for (const quiz of quizzes) {
    porDisciplina.set(quiz.disciplina, (porDisciplina.get(quiz.disciplina) ?? 0) + 1);
  }

  return Array.from(porDisciplina.entries())
    .map(([disciplina, totalQuizzes]) => ({ disciplina, totalQuizzes }))
    .sort((a, b) => a.disciplina.localeCompare(b.disciplina));
}

async function assertPodeVerQuiz(quizId: string, userId: string, role: Role) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

  if (!quiz) {
    throw AppError.notFound("Jogo não encontrado");
  }

  if (quiz.doBanco || quiz.criadoPorId === userId) {
    return quiz;
  }

  const turmaIds = await turmaIdsDoUsuario(userId, role);
  if (quiz.turmaId && turmaIds.includes(quiz.turmaId)) {
    return quiz;
  }

  throw AppError.forbidden("Você não tem acesso a este jogo");
}

/**
 * Detalhe do quiz. O gabarito (`correta`) só vai para quem pode editar o jogo —
 * um aluno nunca recebe a resposta certa por esta rota.
 */
export async function getQuiz(quizId: string, userId: string, role: Role) {
  const quiz = await assertPodeVerQuiz(quizId, userId, role);
  const podeVerGabarito = role === "PROFESSOR" && quiz.criadoPorId === userId;

  const completo = await prisma.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: {
      turma: { select: { id: true, nome: true, disciplina: true } },
      criadoPor: { select: { id: true, nome: true } },
      perguntas: {
        orderBy: { ordem: "asc" },
        include: { opcoes: { orderBy: { ordem: "asc" } } },
      },
    },
  });

  return {
    id: completo.id,
    titulo: completo.titulo,
    descricao: completo.descricao,
    disciplina: completo.disciplina,
    tema: completo.tema,
    doBanco: completo.doBanco,
    turma: completo.turma,
    criadoPor: completo.criadoPor,
    podeEditar: podeVerGabarito,
    perguntas: completo.perguntas.map((p) => ({
      id: p.id,
      enunciado: p.enunciado,
      ordem: p.ordem,
      tempoLimiteSegundos: p.tempoLimiteSegundos,
      opcoes: p.opcoes.map((o) => ({
        id: o.id,
        texto: o.texto,
        ordem: o.ordem,
        ...(podeVerGabarito ? { correta: o.correta } : {}),
      })),
    })),
  };
}

export async function createQuiz(professorId: string, input: CreateQuizInput) {
  if (input.turmaId) {
    const turma = await prisma.turma.findUnique({ where: { id: input.turmaId } });
    if (!turma || turma.professorId !== professorId) {
      throw AppError.forbidden("Você só pode criar jogos para turmas que leciona");
    }
  }

  return prisma.quiz.create({
    data: {
      titulo: input.titulo,
      descricao: input.descricao,
      disciplina: input.disciplina,
      tema: input.tema,
      turmaId: input.turmaId ?? null,
      criadoPorId: professorId,
      perguntas: {
        create: input.perguntas.map((pergunta, ordem) => ({
          enunciado: pergunta.enunciado,
          ordem,
          tempoLimiteSegundos: pergunta.tempoLimiteSegundos,
          opcoes: {
            create: pergunta.opcoes.map((opcao, ordemOpcao) => ({
              texto: opcao.texto,
              correta: opcao.correta,
              ordem: ordemOpcao,
            })),
          },
        })),
      },
    },
    include: { _count: { select: { perguntas: true } } },
  });
}

export async function deleteQuiz(professorId: string, quizId: string) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

  if (!quiz) {
    throw AppError.notFound("Jogo não encontrado");
  }

  if (quiz.doBanco) {
    throw AppError.forbidden("Jogos do banco da plataforma não podem ser removidos");
  }

  if (quiz.criadoPorId !== professorId) {
    throw AppError.forbidden("Você só pode remover jogos que criou");
  }

  await prisma.quiz.delete({ where: { id: quizId } });
}
