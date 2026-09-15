import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
      code: "ROUTE_NOT_FOUND",
    },
  });
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Dados inválidos",
        code: "VALIDATION_ERROR",
        details: err.flatten().fieldErrors,
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: {
          message: "Já existe um registro com esses dados",
          code: "UNIQUE_CONSTRAINT_VIOLATION",
          details: err.meta,
        },
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        error: { message: "Recurso não encontrado", code: "NOT_FOUND" },
      });
    }
  }

  console.error(err);

  return res.status(500).json({
    error: { message: "Erro interno do servidor", code: "INTERNAL_ERROR" },
  });
}
