import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { uploadsDir } from "./lib/storage";
import { authRouter } from "./modules/auth/auth.routes";
import { turmasRouter } from "./modules/turmas/turmas.routes";
import { tarefasRouter } from "./modules/tarefas/tarefas.routes";
import { materiaisRouter } from "./modules/materiais/materiais.routes";
import { duvidasRouter } from "./modules/duvidas/duvidas.routes";
import { progressoRouter } from "./modules/progresso/progresso.routes";
import { avisosRouter } from "./modules/avisos/avisos.routes";
import {
  codigosRouter,
  conversasRouter,
  observacoesRouter,
  responsavelRouter,
} from "./modules/responsavel/responsavel.routes";
import { quizzesRouter, quizSessoesRouter } from "./modules/quizzes/quizzes.routes";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/turmas", turmasRouter);
app.use("/api/tarefas", tarefasRouter);
app.use("/api/materiais", materiaisRouter);
app.use("/api/duvidas", duvidasRouter);
app.use("/api/progresso", progressoRouter);
app.use("/api/avisos", avisosRouter);
app.use("/api/responsavel", responsavelRouter);
app.use("/api/vinculos", codigosRouter);
app.use("/api/conversas", conversasRouter);
app.use("/api/observacoes", observacoesRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/quiz-sessoes", quizSessoesRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
