import { apiRequest } from "./api";
import type { Duvida, DuvidaBiblioteca, NivelDificuldade } from "../types";

export interface CreateDuvidaInput {
  pergunta: string;
  disciplina: string;
  tema: string;
  turmaId: string;
  nivelDificuldade: NivelDificuldade;
  imagem?: File;
}

export function listDuvidas() {
  return apiRequest<{ duvidas: Duvida[] }>("/duvidas");
}

export function listBiblioteca() {
  return apiRequest<{ duvidas: DuvidaBiblioteca[] }>("/duvidas/biblioteca");
}

export function createDuvida(input: CreateDuvidaInput) {
  const formData = new FormData();
  formData.set("pergunta", input.pergunta);
  formData.set("disciplina", input.disciplina);
  formData.set("tema", input.tema);
  formData.set("turmaId", input.turmaId);
  formData.set("nivelDificuldade", input.nivelDificuldade);
  if (input.imagem) formData.set("imagem", input.imagem);

  return apiRequest<{ duvida: Duvida }>("/duvidas", { method: "POST", body: formData });
}

export function responderDuvida(id: string, resposta: string, destacar: boolean) {
  return apiRequest<{ duvida: Duvida }>(`/duvidas/${id}/responder`, {
    method: "POST",
    body: { resposta, destacar },
  });
}
