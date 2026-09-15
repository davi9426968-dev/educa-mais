-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ALUNO', 'PROFESSOR', 'RESPONSAVEL', 'COORDENACAO');

-- CreateEnum
CREATE TYPE "TarefaTipo" AS ENUM ('TRABALHO', 'TESTE', 'LEITURA', 'REVISAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "MaterialTipo" AS ENUM ('TEXTO', 'LINK', 'ARQUIVO', 'VIDEO');

-- CreateEnum
CREATE TYPE "NivelDificuldade" AS ENUM ('BAIXO', 'MEDIO', 'ALTO');

-- CreateEnum
CREATE TYPE "DuvidaStatus" AS ENUM ('PENDENTE', 'RESPONDIDA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "disciplina" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriculas" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TarefaTipo" NOT NULL DEFAULT 'OUTRO',
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "turmaId" TEXT,
    "alunoId" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefa_conclusoes" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "tarefa_conclusoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "MaterialTipo" NOT NULL,
    "conteudo" TEXT,
    "arquivoUrl" TEXT,
    "disciplina" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duvidas" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "disciplina" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "nivelDificuldade" "NivelDificuldade" NOT NULL DEFAULT 'MEDIO',
    "status" "DuvidaStatus" NOT NULL DEFAULT 'PENDENTE',
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duvidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_duvida" (
    "id" TEXT NOT NULL,
    "duvidaId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_duvida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "turmaId" TEXT,
    "autorId" TEXT NOT NULL,
    "dataLimite" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinculos_responsavel" (
    "id" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "parentesco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vinculos_responsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresso_aluno" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "turmaId" TEXT,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "tarefasConcluidas" INTEGER NOT NULL,
    "tarefasTotal" INTEGER NOT NULL,
    "percentualConcluido" DOUBLE PRECISION NOT NULL,
    "duvidasEnviadas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progresso_aluno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "matriculas_alunoId_turmaId_key" ON "matriculas"("alunoId", "turmaId");

-- CreateIndex
CREATE UNIQUE INDEX "tarefa_conclusoes_tarefaId_alunoId_key" ON "tarefa_conclusoes"("tarefaId", "alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculos_responsavel_responsavelId_alunoId_key" ON "vinculos_responsavel"("responsavelId", "alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "progresso_aluno_alunoId_turmaId_periodoInicio_key" ON "progresso_aluno"("alunoId", "turmaId", "periodoInicio");

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_conclusoes" ADD CONSTRAINT "tarefa_conclusoes_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "tarefas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_conclusoes" ADD CONSTRAINT "tarefa_conclusoes_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duvidas" ADD CONSTRAINT "duvidas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duvidas" ADD CONSTRAINT "duvidas_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_duvida" ADD CONSTRAINT "respostas_duvida_duvidaId_fkey" FOREIGN KEY ("duvidaId") REFERENCES "duvidas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_duvida" ADD CONSTRAINT "respostas_duvida_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculos_responsavel" ADD CONSTRAINT "vinculos_responsavel_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculos_responsavel" ADD CONSTRAINT "vinculos_responsavel_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aluno" ADD CONSTRAINT "progresso_aluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_aluno" ADD CONSTRAINT "progresso_aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
