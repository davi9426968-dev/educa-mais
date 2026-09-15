import type { ApiErrorBody } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

// Origem "crua" da API (sem o /api final), usada para montar URLs de arquivos servidos em /uploads.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const TOKEN_STORAGE_KEY = "educamais:token";

/** Resolve a URL de um arquivo salvo pelo backend (já absoluta, ou relativa em /uploads). */
export function resolveFileUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Sobrescreve o token usado; por padrão o token salvo no localStorage é anexado automaticamente. */
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;
  const token = options.token !== undefined ? options.token : localStorage.getItem(TOKEN_STORAGE_KEY);

  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {};
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | null;
    throw new ApiError(
      errorBody?.error?.message ?? "Erro inesperado ao comunicar com o servidor",
      errorBody?.error?.code ?? "UNKNOWN_ERROR",
      response.status,
      errorBody?.error?.details
    );
  }

  return data as T;
}
