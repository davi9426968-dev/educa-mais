import { apiRequest } from "./api";
import type {
  AlunoDoProfessor,
  AlunoVinculado,
  ConversaDetalhe,
  ConversaResumo,
  Observacao,
  ProfessorDoAluno,
  TarefaDoAluno,
  TipoObservacao,
} from "../types";

// ---- Vínculo -------------------------------------------------------------

export function listAlunosVinculados() {
  return apiRequest<{ alunos: AlunoVinculado[] }>("/responsavel/alunos");
}

export function vincularPorCodigo(codigo: string, parentesco?: string) {
  return apiRequest<{ aluno: { id: string; nome: string } }>("/responsavel/vincular", {
    method: "POST",
    body: { codigo, parentesco },
  });
}

export function desvincular(alunoId: string) {
  return apiRequest<void>(`/responsavel/alunos/${alunoId}`, { method: "DELETE" });
}

/** O aluno consulta o próprio código para entregar ao responsável. */
export function meuCodigoDeVinculo() {
  return apiRequest<{ codigo: string }>("/vinculos/meu-codigo");
}

export function codigoDoAluno(alunoId: string) {
  return apiRequest<{ codigo: string }>(`/vinculos/professor/alunos/${alunoId}/codigo`);
}

export function listAlunosDoProfessor() {
  return apiRequest<{ alunos: AlunoDoProfessor[] }>("/vinculos/professor/alunos");
}

// ---- Acompanhamento ------------------------------------------------------

export function getAgendaDoAluno(alunoId: string) {
  return apiRequest<{ tarefas: TarefaDoAluno[] }>(`/responsavel/alunos/${alunoId}/agenda`);
}

export function listProfessoresDoAluno(alunoId: string) {
  return apiRequest<{ professores: ProfessorDoAluno[] }>(
    `/responsavel/alunos/${alunoId}/professores`
  );
}

export function confirmarCiencia(avisoId: string) {
  return apiRequest<void>(`/avisos/${avisoId}/ciencia`, { method: "POST" });
}

// ---- Conversas -----------------------------------------------------------

export function listConversas() {
  return apiRequest<{ conversas: ConversaResumo[] }>("/conversas");
}

export function contarNaoLidas() {
  return apiRequest<{ total: number }>("/conversas/nao-lidas");
}

export function getConversa(id: string) {
  return apiRequest<{ conversa: ConversaDetalhe }>(`/conversas/${id}`);
}

export function iniciarConversa(input: {
  alunoId: string;
  responsavelId?: string;
  professorId?: string;
  texto: string;
}) {
  return apiRequest<{ conversa: { id: string } }>("/conversas", { method: "POST", body: input });
}

export function enviarMensagem(conversaId: string, texto: string) {
  return apiRequest<{ mensagem: unknown }>(`/conversas/${conversaId}/mensagens`, {
    method: "POST",
    body: { texto },
  });
}

// ---- Observações ---------------------------------------------------------

export function listObservacoes(alunoId: string) {
  return apiRequest<{ observacoes: Observacao[] }>(`/observacoes/aluno/${alunoId}`);
}

export function criarObservacao(input: {
  alunoId: string;
  turmaId?: string;
  tipo: TipoObservacao;
  texto: string;
}) {
  return apiRequest<{ observacao: Observacao }>("/observacoes", { method: "POST", body: input });
}

export function excluirObservacao(id: string) {
  return apiRequest<void>(`/observacoes/${id}`, { method: "DELETE" });
}
