-- CreateEnum
CREATE TYPE "QuizModo" AS ENUM ('SOLO', 'AO_VIVO');

-- CreateEnum
CREATE TYPE "SessaoStatus" AS ENUM ('LOBBY', 'EM_ANDAMENTO', 'ENCERRADA');

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "disciplina" TEXT NOT NULL,
    "tema" TEXT,
    "doBanco" BOOLEAN NOT NULL DEFAULT false,
    "turmaId" TEXT,
    "criadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_perguntas" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "tempoLimiteSegundos" INTEGER NOT NULL DEFAULT 20,

    CONSTRAINT "quiz_perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_opcoes" (
    "id" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "quiz_opcoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sessoes" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "modo" "QuizModo" NOT NULL,
    "pin" TEXT,
    "status" "SessaoStatus" NOT NULL DEFAULT 'LOBBY',
    "perguntaIndex" INTEGER NOT NULL DEFAULT -1,
    "perguntaIniciadaEm" TIMESTAMP(3),
    "hostId" TEXT NOT NULL,
    "turmaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerradaEm" TIMESTAMP(3),

    CONSTRAINT "quiz_sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_participantes" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_respostas" (
    "id" TEXT NOT NULL,
    "participanteId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "opcaoId" TEXT,
    "correta" BOOLEAN NOT NULL,
    "tempoMs" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_respostas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_sessoes_pin_key" ON "quiz_sessoes"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_participantes_sessaoId_userId_key" ON "quiz_participantes"("sessaoId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_respostas_participanteId_perguntaId_key" ON "quiz_respostas"("participanteId", "perguntaId");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_perguntas" ADD CONSTRAINT "quiz_perguntas_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_opcoes" ADD CONSTRAINT "quiz_opcoes_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "quiz_perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessoes" ADD CONSTRAINT "quiz_sessoes_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessoes" ADD CONSTRAINT "quiz_sessoes_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessoes" ADD CONSTRAINT "quiz_sessoes_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_participantes" ADD CONSTRAINT "quiz_participantes_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "quiz_sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_participantes" ADD CONSTRAINT "quiz_participantes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_respostas" ADD CONSTRAINT "quiz_respostas_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "quiz_participantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_respostas" ADD CONSTRAINT "quiz_respostas_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "quiz_perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_respostas" ADD CONSTRAINT "quiz_respostas_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES "quiz_opcoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
