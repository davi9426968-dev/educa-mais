import { Router } from "express";
import * as avisosController from "./avisos.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

export const avisosRouter = Router();

avisosRouter.use(requireAuth, requireRole("PROFESSOR", "RESPONSAVEL"));

avisosRouter.get("/", asyncHandler(avisosController.list));
avisosRouter.post("/", requireRole("PROFESSOR"), asyncHandler(avisosController.create));
avisosRouter.post(
  "/:id/ciencia",
  requireRole("RESPONSAVEL"),
  asyncHandler(avisosController.confirmarCiencia)
);
