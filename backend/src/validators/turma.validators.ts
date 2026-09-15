import { z } from "zod";

export const createTurmaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da turma"),
  disciplina: z.string().trim().min(2, "Informe a disciplina"),
});

export const entrarTurmaSchema = z.object({
  codigo: z.string().trim().min(4, "Informe o código da turma"),
});

export type CreateTurmaInput = z.infer<typeof createTurmaSchema>;
export type EntrarTurmaInput = z.infer<typeof entrarTurmaSchema>;
