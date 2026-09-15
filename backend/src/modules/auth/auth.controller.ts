import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../../validators/auth.validators";
import { getUserById, loginUser, registerUser } from "./auth.service";
import { AppError } from "../../utils/AppError";

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const result = await registerUser(input);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);
  res.status(200).json(result);
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw AppError.unauthorized();
  }

  const user = await getUserById(req.user.id);
  res.status(200).json({ user });
}
