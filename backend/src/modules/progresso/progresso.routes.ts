import { Router } from "express";
import * as progressoController from "./progresso.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

export const progressoRouter = Router();

progressoRouter.use(requireAuth, requireRole("ALUNO", "PROFESSOR"));
progressoRouter.get("/", asyncHandler(progressoController.show));
