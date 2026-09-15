import { z } from "zod";

export const createDuvidaSchema = z.object({
  pergunta: z.string().trim().min(5, "Descreva sua dúvida com um pouco mais de detalhe"),
  disciplina: z.string().trim().min(2, "Informe a disciplina"),
  tema: z.string().trim().min(2, "Informe o tema"),
  turmaId: z.string().min(1, "Selecione a turma"),
  nivelDificuldade: z.enum(["BAIXO", "MEDIO", "ALTO"]).default("MEDIO"),
});

export const responderDuvidaSchema = z.object({
  resposta: z.string().trim().min(2, "Escreva uma resposta"),
  destacar: z.boolean().optional().default(false),
});

export type CreateDuvidaInput = z.infer<typeof createDuvidaSchema>;
export type ResponderDuvidaInput = z.infer<typeof responderDuvidaSchema>;
