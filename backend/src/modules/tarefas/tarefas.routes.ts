import { Router } from "express";
import * as tarefasController from "./tarefas.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

export const tarefasRouter = Router();

tarefasRouter.use(requireAuth);

tarefasRouter.get("/", asyncHandler(tarefasController.list));
tarefasRouter.post("/", requireRole("ALUNO", "PROFESSOR"), asyncHandler(tarefasController.create));
tarefasRouter.patch("/:id", requireRole("ALUNO", "PROFESSOR"), asyncHandler(tarefasController.update));
tarefasRouter.delete("/:id", requireRole("ALUNO", "PROFESSOR"), asyncHandler(tarefasController.remove));
tarefasRouter.patch("/:id/concluir", requireRole("ALUNO"), asyncHandler(tarefasController.concluir));
