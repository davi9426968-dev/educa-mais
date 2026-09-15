import { apiRequest } from "./api";
import type { Material, MaterialTipo } from "../types";

export interface CreateMaterialInput {
  titulo: string;
  descricao?: string;
  tipo: MaterialTipo;
  conteudo?: string;
  disciplina: string;
  tema: string;
  topico?: string;
  turmaId: string;
  arquivo?: File;
}

export function listMateriais(busca?: string) {
  const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
  return apiRequest<{ materiais: Material[] }>(`/materiais${query}`);
}

export function createMaterial(input: CreateMaterialInput) {
  const formData = new FormData();
  formData.set("titulo", input.titulo);
  formData.set("tipo", input.tipo);
  formData.set("disciplina", input.disciplina);
  formData.set("tema", input.tema);
  formData.set("turmaId", input.turmaId);
  if (input.topico) formData.set("topico", input.topico);
  if (input.descricao) formData.set("descricao", input.descricao);
  if (input.conteudo) formData.set("conteudo", input.conteudo);
  if (input.arquivo) formData.set("arquivo", input.arquivo);

  return apiRequest<{ material: Material }>("/materiais", { method: "POST", body: formData });
}

export function deleteMaterial(id: string) {
  return apiRequest<void>(`/materiais/${id}`, { method: "DELETE" });
}
