import { Router } from "express";
import * as duvidasController from "./duvidas.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { upload } from "../../middlewares/upload.middleware";

export const duvidasRouter = Router();

duvidasRouter.use(requireAuth, requireRole("ALUNO", "PROFESSOR"));

duvidasRouter.get("/", asyncHandler(duvidasController.list));
duvidasRouter.get("/biblioteca", asyncHandler(duvidasController.biblioteca));
duvidasRouter.post(
  "/",
  requireRole("ALUNO"),
  upload.single("imagem"),
  asyncHandler(duvidasController.create)
);
duvidasRouter.post(
  "/:id/responder",
  requireRole("PROFESSOR"),
  asyncHandler(duvidasController.responder)
);
