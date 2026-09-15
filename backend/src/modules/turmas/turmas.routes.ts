import { Router } from "express";
import * as turmasController from "./turmas.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

export const turmasRouter = Router();

turmasRouter.use(requireAuth, requireRole("ALUNO", "PROFESSOR"));

turmasRouter.get("/", asyncHandler(turmasController.list));
turmasRouter.post("/", requireRole("PROFESSOR"), asyncHandler(turmasController.create));
turmasRouter.post("/entrar", requireRole("ALUNO"), asyncHandler(turmasController.entrar));
turmasRouter.get("/:id/mural", asyncHandler(turmasController.mural));
turmasRouter.post(
  "/:id/regenerar-codigo",
  requireRole("PROFESSOR"),
  asyncHandler(turmasController.regenerarCodigo)
);
