import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { LoginInput, RegisterInput } from "../../validators/auth.validators";

const SALT_ROUNDS = 10;

function signToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function toPublicUser(user: { id: string; nome: string; email: string; role: string }) {
  return { id: user.id, nome: user.nome, email: user.email, role: user.role };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw AppError.conflict("Já existe uma conta cadastrada com este e-mail");
  }

  const senhaHash = await bcrypt.hash(input.senha, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      nome: input.nome,
      email: input.email,
      senhaHash,
      role: input.role,
    },
  });

  const token = signToken(user.id, user.role);

  return { user: toPublicUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw AppError.unauthorized("E-mail ou senha inválidos");
  }

  const senhaValida = await bcrypt.compare(input.senha, user.senhaHash);

  if (!senhaValida) {
    throw AppError.unauthorized("E-mail ou senha inválidos");
  }

  const token = signToken(user.id, user.role);

  return { user: toPublicUser(user), token };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw AppError.notFound("Usuário não encontrado");
  }

  return toPublicUser(user);
}
