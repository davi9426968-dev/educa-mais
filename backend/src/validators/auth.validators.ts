import { z } from "zod";

// COORDENACAO não pode ser criado por autocadastro público — só via seed/administração.
export const registerSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ALUNO", "PROFESSOR", "RESPONSAVEL"], {
    errorMap: () => ({ message: "Perfil inválido" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
