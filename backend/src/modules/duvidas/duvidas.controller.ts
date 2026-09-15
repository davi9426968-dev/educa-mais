import { Request, Response } from "express";
import { createDuvidaSchema, responderDuvidaSchema } from "../../validators/duvida.validators";
import * as duvidasService from "./duvidas.service";
import { AppError } from "../../utils/AppError";

export async function create(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createDuvidaSchema.parse(req.body);
  const duvida = await duvidasService.createDuvida(req.user.id, input, req.file);
  res.status(201).json({ duvida });
}

export async function list(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const duvidas = await duvidasService.listDuvidas(req.user.id, req.user.role);
  res.status(200).json({ duvidas });
}

export async function biblioteca(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const duvidas = await duvidasService.listBiblioteca(req.user.id, req.user.role);
  res.status(200).json({ duvidas });
}

export async function responder(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = responderDuvidaSchema.parse(req.body);
  const duvida = await duvidasService.responderDuvida(req.user.id, req.params.id, input);
  res.status(200).json({ duvida });
}
