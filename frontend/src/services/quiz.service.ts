import { apiRequest } from "./api";
import type {
  DisciplinaDisponivel,
  EstadoJogo,
  QuizDetalhe,
  QuizModo,
  QuizResumo,
  SessaoResumo,
} from "../types";

export interface NovaPerguntaInput {
  enunciado: string;
  tempoLimiteSegundos: number;
  opcoes: { texto: string; correta: boolean }[];
}

export interface CreateQuizInput {
  titulo: string;
  descricao?: string;
  disciplina: string;
  tema?: string;
  turmaId?: string;
  perguntas: NovaPerguntaInput[];
}

interface SessaoCriada {
  sessao: { id: string; modo: QuizModo; pin: string | null };
}

export function listQuizzes(disciplina?: string) {
  const query = disciplina ? `?disciplina=${encodeURIComponent(disciplina)}` : "";
  return apiRequest<{ quizzes: QuizResumo[] }>(`/quizzes${query}`);
}

export function listDisciplinas() {
  return apiRequest<{ disciplinas: DisciplinaDisponivel[] }>("/quizzes/disciplinas");
}

export function getQuiz(id: string) {
  return apiRequest<{ quiz: QuizDetalhe }>(`/quizzes/${id}`);
}

export function createQuiz(input: CreateQuizInput) {
  return apiRequest<{ quiz: QuizResumo }>("/quizzes", { method: "POST", body: input });
}

export function deleteQuiz(id: string) {
  return apiRequest<void>(`/quizzes/${id}`, { method: "DELETE" });
}

/** O sistema escolhe um jogo da matéria e já abre a partida solo. */
export function jogoRapido(disciplina: string) {
  return apiRequest<SessaoCriada>("/quizzes/jogo-rapido", {
    method: "POST",
    body: { disciplina },
  });
}

export function criarSessao(quizId: string, modo: QuizModo, turmaId?: string) {
  return apiRequest<SessaoCriada>(`/quizzes/${quizId}/sessoes`, {
    method: "POST",
    body: { modo, turmaId },
  });
}

export function entrarPorPin(pin: string) {
  return apiRequest<SessaoCriada>("/quiz-sessoes/entrar", { method: "POST", body: { pin } });
}

export function getEstado(sessaoId: string) {
  return apiRequest<EstadoJogo>(`/quiz-sessoes/${sessaoId}`);
}

export function avancar(sessaoId: string) {
  return apiRequest<SessaoCriada>(`/quiz-sessoes/${sessaoId}/avancar`, { method: "POST" });
}

export function responder(sessaoId: string, perguntaId: string, opcaoId: string | null) {
  return apiRequest<{ resultado: { correta: boolean; pontos: number; opcaoCorretaId: string | null } }>(
    `/quiz-sessoes/${sessaoId}/responder`,
    { method: "POST", body: { perguntaId, opcaoId } }
  );
}

export function listMinhasSessoes() {
  return apiRequest<{ sessoes: SessaoResumo[] }>("/quiz-sessoes/minhas");
}
