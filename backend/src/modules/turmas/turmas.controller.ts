import { Request, Response } from "express";
import { createTurmaSchema, entrarTurmaSchema } from "../../validators/turma.validators";
import * as turmasService from "./turmas.service";
import { AppError } from "../../utils/AppError";

export async function list(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const turmas = await turmasService.listMinhasTurmas(req.user.id, req.user.role);
  res.status(200).json({ turmas });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createTurmaSchema.parse(req.body);
  const turma = await turmasService.createTurma(req.user.id, input);
  res.status(201).json({ turma });
}

export async function entrar(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = entrarTurmaSchema.parse(req.body);
  const turma = await turmasService.entrarNaTurma(req.user.id, input.codigo);
  res.status(200).json({ turma });
}

export async function regenerarCodigo(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const turma = await turmasService.regenerarCodigo(req.user.id, req.params.id);
  res.status(200).json({ turma });
}

export async function mural(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const resultado = await turmasService.getMural(req.params.id, req.user.id, req.user.role);
  res.status(200).json(resultado);
}
