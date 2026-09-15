import { Request, Response } from "express";
import * as progressoService from "./progresso.service";
import { AppError } from "../../utils/AppError";

export async function show(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const progresso = await progressoService.getProgresso(req.user.id, req.user.role);
  res.status(200).json(progresso);
}
