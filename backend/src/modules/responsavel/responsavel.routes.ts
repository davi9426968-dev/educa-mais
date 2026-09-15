import { Router } from "express";
import * as controller from "./responsavel.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

/** Rotas exclusivas do responsável. */
export const responsavelRouter = Router();

responsavelRouter.use(requireAuth, requireRole("RESPONSAVEL"));

responsavelRouter.get("/alunos", asyncHandler(controller.listAlunos));
responsavelRouter.post("/vincular", asyncHandler(controller.vincular));
responsavelRouter.delete("/alunos/:alunoId", asyncHandler(controller.desvincular));
responsavelRouter.get("/alunos/:alunoId/agenda", asyncHandler(controller.agendaDoAluno));
responsavelRouter.get("/alunos/:alunoId/professores", asyncHandler(controller.professoresDoAluno));

/** Código de vínculo: o aluno vê o seu, o professor vê o dos alunos das turmas dele. */
export const codigosRouter = Router();

codigosRouter.use(requireAuth);

codigosRouter.get("/meu-codigo", requireRole("ALUNO"), asyncHandler(controller.meuCodigo));
codigosRouter.get(
  "/professor/alunos",
  requireRole("PROFESSOR"),
  asyncHandler(controller.alunosDoProfessor)
);
codigosRouter.get(
  "/professor/alunos/:alunoId/codigo",
  requireRole("PROFESSOR"),
  asyncHandler(controller.codigoDoAluno)
);

/** Conversas professor ↔ responsável. */
export const conversasRouter = Router();

conversasRouter.use(requireAuth, requireRole("PROFESSOR", "RESPONSAVEL"));

conversasRouter.get("/", asyncHandler(controller.listConversas));
conversasRouter.get("/nao-lidas", asyncHandler(controller.contarNaoLidas));
conversasRouter.post("/", asyncHandler(controller.iniciarConversa));
conversasRouter.get("/:id", asyncHandler(controller.getConversa));
conversasRouter.post("/:id/mensagens", asyncHandler(controller.enviarMensagem));

/** Observações pedagógicas sobre um aluno. */
export const observacoesRouter = Router();

observacoesRouter.use(requireAuth, requireRole("PROFESSOR", "RESPONSAVEL"));

observacoesRouter.post("/", requireRole("PROFESSOR"), asyncHandler(controller.criarObservacao));
observacoesRouter.get("/aluno/:alunoId", asyncHandler(controller.listObservacoes));
observacoesRouter.delete(
  "/:id",
  requireRole("PROFESSOR"),
  asyncHandler(controller.excluirObservacao)
);
