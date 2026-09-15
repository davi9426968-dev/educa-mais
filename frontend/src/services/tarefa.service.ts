import { apiRequest } from "./api";
import type { Tarefa, TarefaTipo } from "../types";

export interface CreateTarefaInput {
  titulo: string;
  descricao?: string;
  tipo: TarefaTipo;
  topico?: string;
  dataEntrega: string;
  turmaId?: string;
}

export function listTarefas() {
  return apiRequest<{ tarefas: Tarefa[] }>("/tarefas");
}

export function createTarefa(input: CreateTarefaInput) {
  return apiRequest<{ tarefa: Tarefa }>("/tarefas", { method: "POST", body: input });
}

export function updateTarefa(id: string, input: Partial<CreateTarefaInput>) {
  return apiRequest<{ tarefa: Tarefa }>(`/tarefas/${id}`, { method: "PATCH", body: input });
}

export function deleteTarefa(id: string) {
  return apiRequest<void>(`/tarefas/${id}`, { method: "DELETE" });
}

export function concluirTarefa(id: string, concluida: boolean) {
  return apiRequest<{ tarefa: Tarefa }>(`/tarefas/${id}/concluir`, {
    method: "PATCH",
    body: { concluida },
  });
}
