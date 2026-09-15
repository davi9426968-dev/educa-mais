import { Request, Response } from "express";
import * as responsavelService from "./responsavel.service";
import * as mensagensService from "./mensagens.service";
import * as observacoesService from "./observacoes.service";
import {
  criarObservacaoSchema,
  enviarMensagemSchema,
  iniciarConversaSchema,
  vincularSchema,
} from "../../validators/responsavel.validators";
import { AppError } from "../../utils/AppError";

function usuarioAtual(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

// ---- Vínculo e visão do responsável -------------------------------------

export async function listAlunos(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const alunos = await responsavelService.listAlunosVinculados(user.id);
  res.status(200).json({ alunos });
}

export async function vincular(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = vincularSchema.parse(req.body);
  const aluno = await responsavelService.vincularPorCodigo(user.id, input);
  res.status(201).json({ aluno });
}

export async function desvincular(req: Request, res: Response) {
  const user = usuarioAtual(req);
  await responsavelService.desvincular(user.id, req.params.alunoId);
  res.status(204).send();
}

export async function agendaDoAluno(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const tarefas = await responsavelService.getAgendaDoAluno(user.id, req.params.alunoId);
  res.status(200).json({ tarefas });
}

export async function professoresDoAluno(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const professores = await responsavelService.listProfessoresDoAluno(user.id, req.params.alunoId);
  res.status(200).json({ professores });
}

// ---- Códigos de vínculo --------------------------------------------------

/** O aluno consulta o próprio código para entregar ao responsável. */
export async function meuCodigo(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const codigo = await responsavelService.obterOuCriarCodigoDoAluno(user.id);
  res.status(200).json({ codigo });
}

/** O professor consulta o código de um aluno das turmas dele. */
export async function codigoDoAluno(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const codigo = await responsavelService.obterCodigoComoProfessor(user.id, req.params.alunoId);
  res.status(200).json({ codigo });
}

export async function alunosDoProfessor(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const alunos = await responsavelService.listAlunosDoProfessor(user.id);
  res.status(200).json({ alunos });
}

// ---- Mensagens -----------------------------------------------------------

export async function listConversas(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const conversas = await mensagensService.listConversas(user.id, user.role);
  res.status(200).json({ conversas });
}

export async function contarNaoLidas(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const total = await mensagensService.contarNaoLidas(user.id, user.role);
  res.status(200).json({ total });
}

export async function getConversa(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const conversa = await mensagensService.getConversa(req.params.id, user.id);
  res.status(200).json({ conversa });
}

export async function iniciarConversa(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = iniciarConversaSchema.parse(req.body);
  const conversa = await mensagensService.iniciarConversa(user.id, user.role, input);
  res.status(201).json({ conversa });
}

export async function enviarMensagem(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = enviarMensagemSchema.parse(req.body);
  const mensagem = await mensagensService.enviarMensagem(req.params.id, user.id, input);
  res.status(201).json({ mensagem });
}

// ---- Observações pedagógicas --------------------------------------------

export async function criarObservacao(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const input = criarObservacaoSchema.parse(req.body);
  const observacao = await observacoesService.criarObservacao(user.id, input);
  res.status(201).json({ observacao });
}

export async function listObservacoes(req: Request, res: Response) {
  const user = usuarioAtual(req);
  const observacoes = await observacoesService.listObservacoesDoAluno(
    user.id,
    user.role,
    req.params.alunoId
  );
  res.status(200).json({ observacoes });
}

export async function excluirObservacao(req: Request, res: Response) {
  const user = usuarioAtual(req);
  await observacoesService.excluirObservacao(user.id, req.params.id);
  res.status(204).send();
}
