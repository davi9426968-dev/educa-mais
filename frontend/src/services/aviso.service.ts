import { apiRequest } from "./api";
import type { Aviso } from "../types";

export interface CreateAvisoInput {
  titulo: string;
  mensagem: string;
  turmaId?: string;
  dataLimite?: string;
}

export function listAvisos() {
  return apiRequest<{ avisos: Aviso[] }>("/avisos");
}

export function createAviso(input: CreateAvisoInput) {
  return apiRequest<{ aviso: Aviso }>("/avisos", { method: "POST", body: input });
}
