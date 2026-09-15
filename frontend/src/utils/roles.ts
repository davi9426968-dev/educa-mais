import type { Role } from "../types";

export const ROLE_LABELS: Record<Role, string> = {
  ALUNO: "Aluno",
  PROFESSOR: "Professor",
  RESPONSAVEL: "Responsável",
  COORDENACAO: "Coordenação",
};

export function roleHomePath(role: Role): string {
  switch (role) {
    case "ALUNO":
      return "/aluno";
    case "PROFESSOR":
      return "/professor";
    case "RESPONSAVEL":
      return "/responsavel";
    case "COORDENACAO":
      return "/coordenacao";
  }
}
