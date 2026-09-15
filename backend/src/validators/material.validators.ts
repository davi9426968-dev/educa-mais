import { z } from "zod";

export const createMaterialSchema = z.object({
  titulo: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().trim().optional(),
  tipo: z.enum(["TEXTO", "LINK", "ARQUIVO", "VIDEO"], {
    errorMap: () => ({ message: "Tipo de material inválido" }),
  }),
  conteudo: z.string().trim().optional(),
  disciplina: z.string().trim().min(2, "Informe a disciplina"),
  tema: z.string().trim().min(2, "Informe o tema"),
  topico: z.string().trim().min(1).optional(),
  turmaId: z.string().min(1, "Selecione a turma"),
});

export const listMateriaisQuerySchema = z.object({
  busca: z.string().trim().optional(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type ListMateriaisQuery = z.infer<typeof listMateriaisQuerySchema>;
