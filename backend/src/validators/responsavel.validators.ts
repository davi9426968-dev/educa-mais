import { z } from "zod";

export const vincularSchema = z.object({
  codigo: z.string().trim().min(4, "Informe o código do aluno"),
  parentesco: z.string().trim().max(40).optional(),
});

export const enviarMensagemSchema = z.object({
  texto: z.string().trim().min(1, "Escreva a mensagem").max(2000),
});

export const iniciarConversaSchema = z.object({
  alunoId: z.string().min(1),
  /** Quem inicia informa o outro lado: professor manda `responsavelId`, responsável manda `professorId`. */
  responsavelId: z.string().min(1).optional(),
  professorId: z.string().min(1).optional(),
  texto: z.string().trim().min(1, "Escreva a mensagem").max(2000),
});

export const criarObservacaoSchema = z.object({
  alunoId: z.string().min(1),
  turmaId: z.string().min(1).optional(),
  tipo: z.enum(["ELOGIO", "ATENCAO", "NEUTRA"]).default("NEUTRA"),
  texto: z.string().trim().min(3, "Escreva a observação").max(1000),
});

export type VincularInput = z.infer<typeof vincularSchema>;
export type EnviarMensagemInput = z.infer<typeof enviarMensagemSchema>;
export type IniciarConversaInput = z.infer<typeof iniciarConversaSchema>;
export type CriarObservacaoInput = z.infer<typeof criarObservacaoSchema>;
