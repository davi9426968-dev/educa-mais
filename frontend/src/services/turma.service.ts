import { apiRequest } from "./api";
import type { MinhaTurmaAluno, MinhaTurmaProfessor, MuralResponse, TurmaCompleta } from "../types";

export function listMinhasTurmas() {
  return apiRequest<{ turmas: MinhaTurmaProfessor[] | MinhaTurmaAluno[] }>("/turmas");
}

export function createTurma(nome: string, disciplina: string) {
  return apiRequest<{ turma: TurmaCompleta }>("/turmas", {
    method: "POST",
    body: { nome, disciplina },
  });
}

export function entrarNaTurma(codigo: string) {
  return apiRequest<{ turma: TurmaCompleta }>("/turmas/entrar", {
    method: "POST",
    body: { codigo },
  });
}

export function regenerarCodigo(turmaId: string) {
  return apiRequest<{ turma: TurmaCompleta }>(`/turmas/${turmaId}/regenerar-codigo`, {
    method: "POST",
  });
}

export function getMural(turmaId: string) {
  return apiRequest<MuralResponse>(`/turmas/${turmaId}/mural`);
}
