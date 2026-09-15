import { Router } from "express";
import * as materiaisController from "./materiais.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { upload } from "../../middlewares/upload.middleware";

export const materiaisRouter = Router();

materiaisRouter.use(requireAuth, requireRole("ALUNO", "PROFESSOR"));

materiaisRouter.get("/", asyncHandler(materiaisController.list));
materiaisRouter.post(
  "/",
  requireRole("PROFESSOR"),
  upload.single("arquivo"),
  asyncHandler(materiaisController.create)
);
materiaisRouter.delete("/:id", requireRole("PROFESSOR"), asyncHandler(materiaisController.remove));
