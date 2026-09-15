import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { BANCO_DE_QUIZZES } from "./bancoDeQuizzes";

const prisma = new PrismaClient();

const SENHA_PADRAO = "123456";

async function main() {
  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

  const professor = await prisma.user.upsert({
    where: { email: "professor@educa.com" },
    update: {},
    create: {
      nome: "Carla Mendes",
      email: "professor@educa.com",
      senhaHash,
      role: "PROFESSOR",
    },
  });

  const ana = await prisma.user.upsert({
    where: { email: "ana@educa.com" },
    update: {},
    create: {
      nome: "Ana Silva",
      email: "ana@educa.com",
      senhaHash,
      role: "ALUNO",
    },
  });

  const bruno = await prisma.user.upsert({
    where: { email: "bruno@educa.com" },
    update: {},
    create: {
      nome: "Bruno Costa",
      email: "bruno@educa.com",
      senhaHash,
      role: "ALUNO",
    },
  });

  const responsavel = await prisma.user.upsert({
    where: { email: "responsavel@educa.com" },
    update: {},
    create: {
      nome: "Marta Silva",
      email: "responsavel@educa.com",
      senhaHash,
      role: "RESPONSAVEL",
    },
  });

  const turma = await prisma.turma.upsert({
    where: { id: "seed-turma-9a-matematica" },
    update: {},
    create: {
      id: "seed-turma-9a-matematica",
      nome: "9º Ano A",
      disciplina: "Matemática",
      codigo: "MATE9A",
      professorId: professor.id,
    },
  });

  await prisma.matricula.upsert({
    where: { alunoId_turmaId: { alunoId: ana.id, turmaId: turma.id } },
    update: {},
    create: { alunoId: ana.id, turmaId: turma.id },
  });

  await prisma.matricula.upsert({
    where: { alunoId_turmaId: { alunoId: bruno.id, turmaId: turma.id } },
    update: {},
    create: { alunoId: bruno.id, turmaId: turma.id },
  });

  await prisma.vinculoResponsavel.upsert({
    where: {
      responsavelId_alunoId: { responsavelId: responsavel.id, alunoId: ana.id },
    },
    update: {},
    create: {
      responsavelId: responsavel.id,
      alunoId: ana.id,
      parentesco: "mãe",
    },
  });

  await seedBancoDeQuizzes();

  console.log("Seed concluído. Contas de teste (senha para todas: 123456):");
  console.log("  Professor:   professor@educa.com");
  console.log("  Aluno:       ana@educa.com");
  console.log("  Aluno:       bruno@educa.com");
  console.log("  Responsável: responsavel@educa.com (vinculado à Ana)");
}

/** Fisher-Yates: embaralha uma cópia do array. */
function embaralhar<T>(itens: T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Popula o banco de perguntas da plataforma. As perguntas são recriadas a cada
 * execução para que ajustes em `bancoDeQuizzes.ts` sejam refletidos — por isso
 * o seed é uma operação de desenvolvimento/instalação, não de produção.
 */
async function seedBancoDeQuizzes() {
  for (const quizBanco of BANCO_DE_QUIZZES) {
    await prisma.quiz.upsert({
      where: { id: quizBanco.id },
      update: {
        titulo: quizBanco.titulo,
        descricao: quizBanco.descricao,
        disciplina: quizBanco.disciplina,
        tema: quizBanco.tema,
      },
      create: {
        id: quizBanco.id,
        titulo: quizBanco.titulo,
        descricao: quizBanco.descricao,
        disciplina: quizBanco.disciplina,
        tema: quizBanco.tema,
        doBanco: true,
      },
    });

    await prisma.quizPergunta.deleteMany({ where: { quizId: quizBanco.id } });

    for (const [indice, pergunta] of quizBanco.perguntas.entries()) {
      await prisma.quizPergunta.create({
        data: {
          quizId: quizBanco.id,
          enunciado: pergunta.enunciado,
          ordem: indice,
          tempoLimiteSegundos: pergunta.tempoLimiteSegundos ?? 20,
          opcoes: {
            // No arquivo do banco a primeira opção é sempre a correta (por
            // legibilidade). Embaralhamos aqui para que a resposta certa não
            // caia sempre no mesmo botão durante o jogo.
            create: embaralhar(
              pergunta.opcoes.map((texto, indiceOriginal) => ({
                texto,
                correta: indiceOriginal === 0,
              }))
            ).map((opcao, ordem) => ({ ...opcao, ordem })),
          },
        },
      });
    }
  }

  const totalPerguntas = BANCO_DE_QUIZZES.reduce((soma, q) => soma + q.perguntas.length, 0);
  console.log(
    `Banco de jogos: ${BANCO_DE_QUIZZES.length} quizzes / ${totalPerguntas} perguntas.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
