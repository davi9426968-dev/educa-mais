import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { isoDateKey, weekStart } from "../../utils/date";

const SEMANAS_HISTORICO = 6;

interface TarefaParaProgresso {
  id: string;
  turmaId: string | null;
  dataEntrega: Date;
  concluida: boolean;
}

function calcularSemanas(tarefas: TarefaParaProgresso[], resolveConcluida: (t: TarefaParaProgresso) => boolean) {
  const semanas = new Map<string, { total: number; concluidas: number }>();

  for (const tarefa of tarefas) {
    const chave = isoDateKey(weekStart(tarefa.dataEntrega));
    const bucket = semanas.get(chave) ?? { total: 0, concluidas: 0 };
    bucket.total += 1;
    if (resolveConcluida(tarefa)) bucket.concluidas += 1;
    semanas.set(chave, bucket);
  }

  const ordenadas = Array.from(semanas.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const recentes = ordenadas.slice(-SEMANAS_HISTORICO);

  return recentes.map(([semana, b]) => ({
    semana,
    tarefasConcluidas: b.concluidas,
    tarefasTotal: b.total,
    percentual: b.total ? Math.round((b.concluidas / b.total) * 100) : 0,
  }));
}

export async function getProgressoAluno(alunoId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: { alunoId },
    select: { turmaId: true },
  });
  const turmaIds = matriculas.map((m) => m.turmaId);

  const tarefas = await prisma.tarefa.findMany({
    where: { OR: [{ alunoId }, { turmaId: { in: turmaIds } }] },
    select: { id: true, turmaId: true, dataEntrega: true, concluida: true },
  });

  const tarefaTurmaIds = tarefas.filter((t) => t.turmaId).map((t) => t.id);
  const conclusoes = await prisma.tarefaConclusao.findMany({
    where: { alunoId, tarefaId: { in: tarefaTurmaIds } },
  });
  const conclusaoMap = new Map(conclusoes.map((c) => [c.tarefaId, c.concluida]));

  const resolveConcluida = (t: TarefaParaProgresso) =>
    t.turmaId ? conclusaoMap.get(t.id) ?? false : t.concluida;

  const evolucao = calcularSemanas(tarefas, resolveConcluida);

  const chaveAtual = isoDateKey(weekStart(new Date()));
  const semanaAtual = evolucao.find((s) => s.semana === chaveAtual) ?? {
    semana: chaveAtual,
    tarefasConcluidas: 0,
    tarefasTotal: 0,
    percentual: 0,
  };

  const totalDuvidas = await prisma.duvida.count({ where: { alunoId } });

  return { atual: semanaAtual, evolucao, totalDuvidas };
}

export async function getProgressoProfessor(professorId: string) {
  const turmas = await prisma.turma.findMany({
    where: { professorId },
    include: { _count: { select: { matriculas: true } } },
  });

  const resultado = [];

  for (const turma of turmas) {
    const totalAlunos = turma._count.matriculas;

    const tarefas = await prisma.tarefa.findMany({
      where: { turmaId: turma.id },
      include: { _count: { select: { conclusoes: { where: { concluida: true } } } } },
    });

    const entregasPossiveis = tarefas.length * totalAlunos;
    const entregasFeitas = tarefas.reduce((soma, t) => soma + t._count.conclusoes, 0);
    const percentualEntrega = entregasPossiveis
      ? Math.round((entregasFeitas / entregasPossiveis) * 100)
      : 0;

    const duvidasPendentes = await prisma.duvida.count({
      where: { turmaId: turma.id, status: "PENDENTE" },
    });

    const temasComDuvidas = await prisma.duvida.groupBy({
      by: ["tema"],
      where: { turmaId: turma.id },
      _count: { tema: true },
      orderBy: { _count: { tema: "desc" } },
      take: 1,
    });

    resultado.push({
      turmaId: turma.id,
      nome: turma.nome,
      disciplina: turma.disciplina,
      totalAlunos,
      totalAtividades: tarefas.length,
      percentualEntrega,
      duvidasPendentes,
      temaComMaisDuvidas: temasComDuvidas[0]?.tema ?? null,
    });
  }

  return { turmas: resultado };
}

export async function getProgresso(userId: string, role: Role) {
  return role === "PROFESSOR" ? getProgressoProfessor(userId) : getProgressoAluno(userId);
}
