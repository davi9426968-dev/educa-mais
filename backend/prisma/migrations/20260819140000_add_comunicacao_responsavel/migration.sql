-- CreateEnum
CREATE TYPE "TipoObservacao" AS ENUM ('ELOGIO', 'ATENCAO', 'NEUTRA');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "codigoVinculo" TEXT;

-- CreateTable
CREATE TABLE "aviso_leituras" (
    "id" TEXT NOT NULL,
    "avisoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aviso_leituras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "lidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observacoes_aluno" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "turmaId" TEXT,
    "tipo" "TipoObservacao" NOT NULL DEFAULT 'NEUTRA',
    "texto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "observacoes_aluno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aviso_leituras_avisoId_userId_key" ON "aviso_leituras"("avisoId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_professorId_responsavelId_alunoId_key" ON "conversas"("professorId", "responsavelId", "alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "users_codigoVinculo_key" ON "users"("codigoVinculo");

-- AddForeignKey
ALTER TABLE "aviso_leituras" ADD CONSTRAINT "aviso_leituras_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "avisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aviso_leituras" ADD CONSTRAINT "aviso_leituras_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacoes_aluno" ADD CONSTRAINT "observacoes_aluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacoes_aluno" ADD CONSTRAINT "observacoes_aluno_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacoes_aluno" ADD CONSTRAINT "observacoes_aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
