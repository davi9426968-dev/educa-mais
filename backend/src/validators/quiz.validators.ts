import { z } from "zod";

const opcaoSchema = z.object({
  texto: z.string().trim().min(1, "A alternativa não pode ficar vazia"),
  correta: z.boolean(),
});

const perguntaSchema = z
  .object({
    enunciado: z.string().trim().min(3, "Escreva a pergunta"),
    tempoLimiteSegundos: z.coerce.number().int().min(5).max(120).default(20),
    opcoes: z.array(opcaoSchema).length(4, "Cada pergunta precisa de 4 alternativas"),
  })
  .refine((p) => p.opcoes.filter((o) => o.correta).length === 1, {
    message: "Marque exatamente uma alternativa como correta",
    path: ["opcoes"],
  });

export const createQuizSchema = z.object({
  titulo: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().trim().optional(),
  disciplina: z.string().trim().min(2, "Informe a disciplina"),
  tema: z.string().trim().optional(),
  turmaId: z.string().min(1).optional(),
  perguntas: z.array(perguntaSchema).min(1, "Adicione pelo menos uma pergunta"),
});

export const listQuizzesQuerySchema = z.object({
  disciplina: z.string().trim().optional(),
});

export const criarSessaoSchema = z.object({
  modo: z.enum(["SOLO", "AO_VIVO"]),
  turmaId: z.string().min(1).optional(),
});

/** Monta um jogo solo a partir da matéria escolhida pelo aluno. */
export const jogoRapidoSchema = z.object({
  disciplina: z.string().trim().min(2, "Escolha uma matéria"),
});

export const entrarSessaoSchema = z.object({
  pin: z.string().trim().min(4, "Informe o PIN da sala"),
});

export const responderSchema = z.object({
  perguntaId: z.string().min(1),
  /** null quando o tempo acabou sem resposta. */
  opcaoId: z.string().min(1).nullable(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type ListQuizzesQuery = z.infer<typeof listQuizzesQuerySchema>;
export type CriarSessaoInput = z.infer<typeof criarSessaoSchema>;
export type JogoRapidoInput = z.infer<typeof jogoRapidoSchema>;
export type EntrarSessaoInput = z.infer<typeof entrarSessaoSchema>;
export type ResponderInput = z.infer<typeof responderSchema>;
