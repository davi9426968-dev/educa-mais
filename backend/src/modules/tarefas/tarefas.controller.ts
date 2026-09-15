import { Request, Response } from "express";
import {
  concluirTarefaSchema,
  createTarefaSchema,
  listTarefasQuerySchema,
  updateTarefaSchema,
} from "../../validators/tarefa.validators";
import * as tarefasService from "./tarefas.service";
import { AppError } from "../../utils/AppError";

function currentUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export async function create(req: Request, res: Response) {
  const user = currentUser(req);
  const input = createTarefaSchema.parse(req.body);
  const tarefa = await tarefasService.createTarefa(user.id, user.role, input);
  res.status(201).json({ tarefa });
}

export async function list(req: Request, res: Response) {
  const user = currentUser(req);
  const query = listTarefasQuerySchema.parse(req.query);
  const tarefas = await tarefasService.listTarefas(user.id, user.role, query);
  res.status(200).json({ tarefas });
}

export async function update(req: Request, res: Response) {
  const user = currentUser(req);
  const input = updateTarefaSchema.parse(req.body);
  const tarefa = await tarefasService.updateTarefa(user.id, req.params.id, input);
  res.status(200).json({ tarefa });
}

export async function remove(req: Request, res: Response) {
  const user = currentUser(req);
  await tarefasService.deleteTarefa(user.id, req.params.id);
  res.status(204).send();
}

export async function concluir(req: Request, res: Response) {
  const user = currentUser(req);
  const input = concluirTarefaSchema.parse(req.body);
  const tarefa = await tarefasService.setConclusao(user.id, req.params.id, input);
  res.status(200).json({ tarefa });
}
