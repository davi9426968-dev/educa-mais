import { Request, Response } from "express";
import {
  createQuizSchema,
  criarSessaoSchema,
  jogoRapidoSchema,
  listQuizzesQuerySchema,
} from "../../validators/quiz.validators";
import * as quizzesService from "./quizzes.service";
import * as sessoesService from "./sessoes.service";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../config/prisma";

function usuarioAtual(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

/** O nome exibido no ranking vem do cadastro, não de entrada do jogador. */
async function nomeDoUsuario(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { nome: true },
  });
  return user.nome;
}

export async function list(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const query = listQuizzesQuerySchema.parse(req.query);
  const quizzes = await quizzesService.listQuizzes(user.id, user.role, query);
  res.status(200).json({ quizzes });
}

export async function listDisciplinas(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const disciplinas = await quizzesService.listDisciplinasDisponiveis(user.id, user.role);
  res.status(200).json({ disciplinas });
}

export async function show(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const quiz = await quizzesService.getQuiz(req.params.id, user.id, user.role);
  res.status(200).json({ quiz });
}

export async function create(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = createQuizSchema.parse(req.body);
  const quiz = await quizzesService.createQuiz(user.id, input);
  res.status(201).json({ quiz });
}

export async function remove(req: Request, res: Response) {
  const user = usuarioAtual(req);
  await quizzesService.deleteQuiz(user.id, req.params.id);
  res.status(204).send();
}

export async function criarSessao(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = criarSessaoSchema.parse(req.body);
  const nome = await nomeDoUsuario(user.id);
  const sessao = await sessoesService.criarSessao(user.id, user.role, nome, req.params.id, input);
  res.status(201).json({ sessao });
}

export async function jogoRapido(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = jogoRapidoSchema.parse(req.body);
  const nome = await nomeDoUsuario(user.id);
  const sessao = await sessoesService.criarJogoRapido(user.id, user.role, nome, input.disciplina);
  res.status(201).json({ sessao });
}
