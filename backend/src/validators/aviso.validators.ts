import { z } from "zod";

export const createAvisoSchema = z.object({
  titulo: z.string().trim().min(3, "Informe um título para o aviso"),
  mensagem: z.string().trim().min(5, "Escreva a mensagem do aviso"),
  turmaId: z.string().min(1).optional(),
  dataLimite: z.coerce.date().optional(),
});

export type CreateAvisoInput = z.infer<typeof createAvisoSchema>;
