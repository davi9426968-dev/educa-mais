import { z } from "zod";

const tarefaTipoEnum = z.enum(["TRABALHO", "TESTE", "LEITURA", "REVISAO", "OUTRO"]);

export const createTarefaSchema = z.object({
  titulo: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().trim().optional(),
  tipo: tarefaTipoEnum.default("OUTRO"),
  topico: z.string().trim().min(1).optional(),
  dataEntrega: z.coerce.date({ errorMap: () => ({ message: "Data de entrega inválida" }) }),
  turmaId: z.string().min(1).optional(),
});

export const updateTarefaSchema = z.object({
  titulo: z.string().trim().min(3).optional(),
  descricao: z.string().trim().optional(),
  tipo: tarefaTipoEnum.optional(),
  topico: z.string().trim().min(1).optional(),
  dataEntrega: z.coerce.date().optional(),
});

export const concluirTarefaSchema = z.object({
  concluida: z.boolean(),
});

export const listTarefasQuerySchema = z.object({
  de: z.coerce.date().optional(),
  ate: z.coerce.date().optional(),
});

export type CreateTarefaInput = z.infer<typeof createTarefaSchema>;
export type UpdateTarefaInput = z.infer<typeof updateTarefaSchema>;
export type ConcluirTarefaInput = z.infer<typeof concluirTarefaSchema>;
export type ListTarefasQuery = z.infer<typeof listTarefasQuerySchema>;
