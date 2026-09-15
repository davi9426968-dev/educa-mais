import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { getProgressoAluno } from "../progresso/progresso.service";
import { VincularInput } from "../../validators/responsavel.validators";

// Sem 0, O, 1, I, L para evitar confusão ao ditar/digitar o código.
const CODIGO_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function gerarCodigo(): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)];
  }
  return codigo;
}

async function gerarCodigoUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const codigo = gerarCodigo();
    const existente = await prisma.user.findUnique({ where: { codigoVinculo: codigo } });
    if (!existente) return codigo;
  }
  throw new AppError("Não foi possível gerar o código agora. Tente novamente.", 500, "CODIGO_FALHOU");
}

/**
 * Código que o aluno entrega ao responsável. Gerado sob demanda e reaproveitado
 * nas próximas consultas, para não mudar toda vez que a tela abre.
 */
export async function obterOuCriarCodigoDoAluno(alunoId: string) {
  const aluno = await prisma.user.findUnique({ where: { id: alunoId } });

  if (!aluno || aluno.role !== "ALUNO") {
    throw AppError.notFound("Aluno não encontrado");
  }

  if (aluno.codigoVinculo) return aluno.codigoVinculo;

  const codigo = await gerarCodigoUnico();
  await prisma.user.update({ where: { id: alunoId }, data: { codigoVinculo: codigo } });
  return codigo;
}

/** Um professor só pode ver o código de alunos matriculados nas turmas dele. */
export async function obterCodigoComoProfessor(professorId: string, alunoId: string) {
  const matricula = await prisma.matricula.findFirst({
    where: { alunoId, turma: { professorId } },
  });

  if (!matricula) {
    throw AppError.forbidden("Este aluno não está em nenhuma das suas turmas");
  }

  return obterOuCriarCodigoDoAluno(alunoId);
}

export async function vincularPorCodigo(responsavelId: string, input: VincularInput) {
  const codigo = input.codigo.trim().toUpperCase();
  const aluno = await prisma.user.findUnique({ where: { codigoVinculo: codigo } });

  if (!aluno || aluno.role !== "ALUNO") {
    throw AppError.notFound("Código inválido. Confira com o aluno ou com a escola.");
  }

  const jaVinculado = await prisma.vinculoResponsavel.findUnique({
    where: { responsavelId_alunoId: { responsavelId, alunoId: aluno.id } },
  });

  if (jaVinculado) {
    throw AppError.conflict("Você já acompanha este aluno");
  }

  await prisma.vinculoResponsavel.create({
    data: { responsavelId, alunoId: aluno.id, parentesco: input.parentesco },
  });

  return { id: aluno.id, nome: aluno.nome };
}

export async function desvincular(responsavelId: string, alunoId: string) {
  const vinculo = await prisma.vinculoResponsavel.findUnique({
    where: { responsavelId_alunoId: { responsavelId, alunoId } },
  });

  if (!vinculo) {
    throw AppError.notFound("Vínculo não encontrado");
  }

  await prisma.vinculoResponsavel.delete({ where: { id: vinculo.id } });
}

/** Garante que o responsável realmente acompanha aquele aluno. */
export async function assertAcompanha(responsavelId: string, alunoId: string) {
  const vinculo = await prisma.vinculoResponsavel.findUnique({
    where: { responsavelId_alunoId: { responsavelId, alunoId } },
  });

  if (!vinculo) {
    throw AppError.forbidden("Você não acompanha este aluno");
  }

  return vinculo;
}

export async function listAlunosVinculados(responsavelId: string) {
  const vinculos = await prisma.vinculoResponsavel.findMany({
    where: { responsavelId },
    include: { aluno: { select: { id: true, nome: true } } },
    orderBy: { createdAt: "asc" },
  });

  const resultado = [];

  for (const vinculo of vinculos) {
    const matriculas = await prisma.matricula.findMany({
      where: { alunoId: vinculo.alunoId },
      include: { turma: { select: { id: true, nome: true, disciplina: true } } },
    });

    const progresso = await getProgressoAluno(vinculo.alunoId);

    const totalObservacoes = await prisma.observacaoAluno.count({
      where: { alunoId: vinculo.alunoId },
    });

    resultado.push({
      aluno: vinculo.aluno,
      parentesco: vinculo.parentesco,
      turmas: matriculas.map((m) => m.turma),
      progresso,
      totalObservacoes,
    });
  }

  return resultado;
}

/**
 * Agenda do aluno para o responsável: apenas leitura, sem permitir concluir
 * tarefa no lugar dele.
 */
export async function getAgendaDoAluno(responsavelId: string, alunoId: string) {
  await assertAcompanha(responsavelId, alunoId);

  const matriculas = await prisma.matricula.findMany({
    where: { alunoId },
    select: { turmaId: true },
  });
  const turmaIds = matriculas.map((m) => m.turmaId);

  const tarefas = await prisma.tarefa.findMany({
    where: { OR: [{ alunoId }, { turmaId: { in: turmaIds } }] },
    include: {
      turma: { select: { id: true, nome: true, disciplina: true } },
      conclusoes: { where: { alunoId } },
    },
    orderBy: { dataEntrega: "asc" },
  });

  return tarefas.map((tarefa) => ({
    id: tarefa.id,
    titulo: tarefa.titulo,
    descricao: tarefa.descricao,
    tipo: tarefa.tipo,
    dataEntrega: tarefa.dataEntrega,
    turma: tarefa.turma,
    pessoal: tarefa.turmaId === null,
    // Tarefa pessoal guarda a conclusão na própria linha; tarefa de turma usa
    // a tabela de conclusões por aluno.
    concluida: tarefa.turmaId ? (tarefa.conclusoes[0]?.concluida ?? false) : tarefa.concluida,
  }));
}

/** Professores das turmas do aluno — com quem o responsável pode conversar. */
export async function listProfessoresDoAluno(responsavelId: string, alunoId: string) {
  await assertAcompanha(responsavelId, alunoId);

  const matriculas = await prisma.matricula.findMany({
    where: { alunoId },
    include: {
      turma: {
        select: {
          id: true,
          nome: true,
          disciplina: true,
          professor: { select: { id: true, nome: true } },
        },
      },
    },
  });

  return matriculas.map((m) => ({
    turma: { id: m.turma.id, nome: m.turma.nome, disciplina: m.turma.disciplina },
    professor: m.turma.professor,
  }));
}

/** Alunos das turmas do professor, para ele escolher sobre quem falar. */
export async function listAlunosDoProfessor(professorId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: { turma: { professorId } },
    include: {
      aluno: { select: { id: true, nome: true } },
      turma: { select: { id: true, nome: true, disciplina: true } },
    },
    orderBy: { aluno: { nome: "asc" } },
  });

  const porAluno = new Map<
    string,
    { aluno: { id: string; nome: string }; turmas: { id: string; nome: string; disciplina: string }[]; responsaveis: { id: string; nome: string }[] }
  >();

  for (const matricula of matriculas) {
    const atual = porAluno.get(matricula.alunoId) ?? {
      aluno: matricula.aluno,
      turmas: [],
      responsaveis: [],
    };
    atual.turmas.push(matricula.turma);
    porAluno.set(matricula.alunoId, atual);
  }

  // Responsáveis vinculados, para o professor saber com quem pode falar.
  const vinculos = await prisma.vinculoResponsavel.findMany({
    where: { alunoId: { in: Array.from(porAluno.keys()) } },
    include: { responsavel: { select: { id: true, nome: true } } },
  });

  for (const vinculo of vinculos) {
    porAluno.get(vinculo.alunoId)?.responsaveis.push(vinculo.responsavel);
  }

  return Array.from(porAluno.values());
}

export async function turmaIdsDoProfessorComAluno(professorId: string, alunoId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: { alunoId, turma: { professorId } },
    select: { turmaId: true },
  });
  return matriculas.map((m) => m.turmaId);
}

/** O professor precisa lecionar para o aluno; o responsável precisa acompanhá-lo. */
export async function assertPodeFalarSobreAluno(userId: string, role: Role, alunoId: string) {
  if (role === "PROFESSOR") {
    const turmas = await turmaIdsDoProfessorComAluno(userId, alunoId);
    if (turmas.length === 0) {
      throw AppError.forbidden("Este aluno não está em nenhuma das suas turmas");
    }
    return;
  }

  await assertAcompanha(userId, alunoId);
}
