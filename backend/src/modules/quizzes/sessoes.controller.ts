import { Request, Response } from "express";
import { entrarSessaoSchema, responderSchema } from "../../validators/quiz.validators";
import * as sessoesService from "./sessoes.service";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../config/prisma";

function usuarioAtual(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export async function entrar(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = entrarSessaoSchema.parse(req.body);
  const { nome } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { nome: true },
  });
  const sessao = await sessoesService.entrarPorPin(user.id, nome, input.pin);
  res.status(200).json({ sessao });
}

export async function estado(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const estado = await sessoesService.getEstado(req.params.id, user.id);
  res.status(200).json(estado);
}

export async function avancar(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const sessao = await sessoesService.avancar(req.params.id, user.id);
  res.status(200).json({ sessao });
}

export async function responder(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = responderSchema.parse(req.body);
  const resultado = await sessoesService.responder(req.params.id, user.id, input);
  res.status(200).json({ resultado });
}

export async function minhas(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const sessoes = await sessoesService.listMinhasSessoes(user.id);
  res.status(200).json({ sessoes });
}
