-- Adiciona a coluna como opcional primeiro para não quebrar as turmas já existentes
ALTER TABLE "turmas" ADD COLUMN "codigo" TEXT;

-- Gera um código aleatório para as turmas que já existem no banco
UPDATE "turmas"
SET "codigo" = upper(substr(md5(random()::text || id), 1, 6))
WHERE "codigo" IS NULL;

-- Agora que todas as linhas têm valor, torna a coluna obrigatória e única
ALTER TABLE "turmas" ALTER COLUMN "codigo" SET NOT NULL;
CREATE UNIQUE INDEX "turmas_codigo_key" ON "turmas"("codigo");

-- Campos opcionais de tópico/unidade (estilo Google Classroom), usados para agrupar o mural
ALTER TABLE "tarefas" ADD COLUMN "topico" TEXT;
ALTER TABLE "materiais" ADD COLUMN "topico" TEXT;
