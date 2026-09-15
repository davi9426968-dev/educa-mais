import { apiRequest } from "./api";
import type { Role, User } from "../types";

export interface AuthResponse {
  user: User;
  token: string;
}

export function login(email: string, senha: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, senha },
  });
}

export function register(nome: string, email: string, senha: string, role: Role) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: { nome, email, senha, role },
  });
}

export function fetchMe() {
  return apiRequest<{ user: User }>("/auth/me");
}
