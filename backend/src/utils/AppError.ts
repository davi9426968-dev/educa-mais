export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static notFound(message = "Recurso não encontrado") {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static unauthorized(message = "Não autenticado") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Sem permissão para acessar este recurso") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static conflict(message = "Conflito com dados existentes") {
    return new AppError(message, 409, "CONFLICT");
  }
}
