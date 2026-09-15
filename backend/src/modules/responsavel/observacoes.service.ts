import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertPodeFalarSobreAluno, turmaIdsDoProfessorComAluno } from "./responsavel.service";
import { CriarObservacaoInput } from "../../validators/responsavel.validators";

const observacaoInclude = {
  professor: { select: { id: true, nome: true } },
  aluno: { select: { id: true, nome: true } },
  turma: { select: { id: true, nome: true, disciplina: true } },
};

/**
 * Registro pedagógico do professor sobre um aluno (elogio ou ponto de atenção).
 *
 * Visível para o professor autor e para os responsáveis do aluno — é um canal
 * professor↔família, não um mural público. O próprio aluno não vê, para que um
 * "ponto de atenção" não vire exposição, na linha do que o projeto define sobre
 * não expor o estudante sem autorização.
 */
export async function criarObservacao(professorId: string, input: CriarObservacaoInput) {
  const turmas = await turmaIdsDoProfessorComAluno(professorId, input.alunoId);

  if (turmas.length === 0) {
    throw AppError.forbidden("Este aluno não está em nenhuma das suas turmas");
  }

  if (input.turmaId && !turmas.includes(input.turmaId)) {
    throw AppError.forbidden("Turma inválida para este aluno");
  }

  return prisma.observacaoAluno.create({
    data: {
      alunoId: input.alunoId,
      professorId,
      turmaId: input.turmaId ?? turmas[0],
      tipo: input.tipo,
      texto: input.texto,
    },
    include: observacaoInclude,
  });
}

export async function listObservacoesDoAluno(userId: string, role: Role, alunoId: string) {
  await assertPodeFalarSobreAluno(userId, role, alunoId);

  return prisma.observacaoAluno.findMany({
    where: {
      alunoId,
      // O professor vê apenas o que ele mesmo registrou; o responsável vê tudo
      // sobre o aluno que acompanha.
      ...(role === "PROFESSOR" ? { professorId: userId } : {}),
    },
    include: observacaoInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function excluirObservacao(professorId: string, observacaoId: string) {
  const observacao = await prisma.observacaoAluno.findUnique({ where: { id: observacaoId } });

  if (!observacao) {
    throw AppError.notFound("Observação não encontrada");
  }

  if (observacao.professorId !== professorId) {
    throw AppError.forbidden("Você só pode remover observações que registrou");
  }

  await prisma.observacaoAluno.delete({ where: { id: observacaoId } });
}
