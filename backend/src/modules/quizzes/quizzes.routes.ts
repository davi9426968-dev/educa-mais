import { Router } from "express";
import * as quizzesController from "./quizzes.controller";
import * as sessoesController from "./sessoes.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

export const quizzesRouter = Router();

quizzesRouter.use(requireAuth, requireRole("ALUNO", "PROFESSOR"));

quizzesRouter.get("/", asyncHandler(quizzesController.list));
quizzesRouter.get("/disciplinas", asyncHandler(quizzesController.listDisciplinas));
quizzesRouter.post("/jogo-rapido", asyncHandler(quizzesController.jogoRapido));
quizzesRouter.get("/:id", asyncHandler(quizzesController.show));
quizzesRouter.post("/", requireRole("PROFESSOR"), asyncHandler(quizzesController.create));
quizzesRouter.delete("/:id", requireRole("PROFESSOR"), asyncHandler(quizzesController.remove));
quizzesRouter.post("/:id/sessoes", asyncHandler(quizzesController.criarSessao));

export const quizSessoesRouter = Router();

quizSessoesRouter.use(requireAuth, requireRole("ALUNO", "PROFESSOR"));

quizSessoesRouter.get("/minhas", asyncHandler(sessoesController.minhas));
quizSessoesRouter.post("/entrar", asyncHandler(sessoesController.entrar));
quizSessoesRouter.get("/:id", asyncHandler(sessoesController.estado));
quizSessoesRouter.post("/:id/avancar", asyncHandler(sessoesController.avancar));
quizSessoesRouter.post("/:id/responder", asyncHandler(sessoesController.responder));
