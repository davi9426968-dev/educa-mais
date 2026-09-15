import { apiRequest } from "./api";
import type { ProgressoAlunoResponse, ProgressoProfessorResponse } from "../types";

export function getProgressoAluno() {
  return apiRequest<ProgressoAlunoResponse>("/progresso");
}

export function getProgressoProfessor() {
  return apiRequest<ProgressoProfessorResponse>("/progresso");
}
