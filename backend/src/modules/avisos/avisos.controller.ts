import { Request, Response } from "express";
import { createAvisoSchema } from "../../validators/aviso.validators";
import * as avisosService from "./avisos.service";
import { AppError } from "../../utils/AppError";

export async function create(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createAvisoSchema.parse(req.body);
  const aviso = await avisosService.createAviso(req.user.id, input);
  res.status(201).json({ aviso });
}

export async function list(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const avisos =
    req.user.role === "PROFESSOR"
      ? await avisosService.listAvisosProfessor(req.user.id)
      : await avisosService.listAvisosResponsavel(req.user.id);
  res.status(200).json({ avisos });
}

export async function confirmarCiencia(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  await avisosService.confirmarCiencia(req.params.id, req.user.id);
  res.status(204).send();
}
