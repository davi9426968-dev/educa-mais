import { Request, Response } from "express";
import { createMaterialSchema, listMateriaisQuerySchema } from "../../validators/material.validators";
import * as materiaisService from "./materiais.service";
import { AppError } from "../../utils/AppError";

export async function create(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createMaterialSchema.parse(req.body);
  const material = await materiaisService.createMaterial(req.user.id, input, req.file);
  res.status(201).json({ material });
}

export async function list(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const query = listMateriaisQuerySchema.parse(req.query);
  const materiais = await materiaisService.listMateriais(req.user.id, req.user.role, query);
  res.status(200).json({ materiais });
}

export async function remove(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  await materiaisService.deleteMaterial(req.user.id, req.params.id);
  res.status(204).send();
}
