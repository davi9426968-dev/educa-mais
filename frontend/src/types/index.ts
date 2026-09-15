export type Role = "ALUNO" | "PROFESSOR" | "RESPONSAVEL" | "COORDENACAO";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export type TarefaTipo = "TRABALHO" | "TESTE" | "LEITURA" | "REVISAO" | "OUTRO";

export interface TurmaResumo {
  id: string;
  nome: string;
  disciplina: string;
}

export interface MinhaTurmaProfessor extends TurmaResumo {
  codigo: string;
  totalAlunos: number;
}

export interface MinhaTurmaAluno extends TurmaResumo {
  professor: { id: string; nome: string };
}

export interface TurmaCompleta extends TurmaResumo {
  codigo: string;
  professorId: string;
  createdAt: string;
}

export type MaterialTipo = "TEXTO" | "LINK" | "ARQUIVO" | "VIDEO";

export interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: MaterialTipo;
  conteudo: string | null;
  arquivoUrl: string | null;
  disciplina: string;
  tema: string;
  topico: string | null;
  turma: TurmaResumo;
  autor: { id: string; nome: string };
  createdAt: string;
}

export type NivelDificuldade = "BAIXO" | "MEDIO" | "ALTO";
export type DuvidaStatus = "PENDENTE" | "RESPONDIDA";

export interface RespostaDuvida {
  id: string;
  resposta: string;
  createdAt: string;
  professor: { id: string; nome: string };
}

export interface Duvida {
  id: string;
  pergunta: string;
  disciplina: string;
  tema: string;
  imagemUrl: string | null;
  nivelDificuldade: NivelDificuldade;
  status: DuvidaStatus;
  destacada: boolean;
  createdAt: string;
  turma: TurmaResumo;
  aluno: { id: string; nome: string };
  respostas: RespostaDuvida[];
}

export interface DuvidaBiblioteca {
  id: string;
  pergunta: string;
  disciplina: string;
  tema: string;
  imagemUrl: string | null;
  turma: TurmaResumo;
  respostas: RespostaDuvida[];
  createdAt: string;
}

export interface ProgressoSemana {
  semana: string;
  tarefasConcluidas: number;
  tarefasTotal: number;
  percentual: number;
}

export interface ProgressoAlunoResponse {
  atual: ProgressoSemana;
  evolucao: ProgressoSemana[];
  totalDuvidas: number;
}

export interface ProgressoTurma {
  turmaId: string;
  nome: string;
  disciplina: string;
  totalAlunos: number;
  totalAtividades: number;
  percentualEntrega: number;
  duvidasPendentes: number;
  temaComMaisDuvidas: string | null;
}

export interface ProgressoProfessorResponse {
  turmas: ProgressoTurma[];
}

export interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  turma: TurmaResumo | null;
  autor: { id: string; nome: string };
  dataLimite: string | null;
  createdAt: string;
  /** Só na visão do responsável: quando ele confirmou ciência. */
  cienteEm?: string | null;
  /** Só na visão do professor: quem já confirmou e quem falta. */
  cientes?: { id: string; nome: string }[];
  pendentes?: { id: string; nome: string }[];
  totalDestinatarios?: number;
}

export interface AlunoVinculado {
  aluno: { id: string; nome: string };
  parentesco: string | null;
  turmas: TurmaResumo[];
  progresso: ProgressoAlunoResponse;
  totalObservacoes: number;
}

// --- Comunicação professor <-> responsável --------------------------------

export interface TarefaDoAluno {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TarefaTipo;
  dataEntrega: string;
  turma: TurmaResumo | null;
  pessoal: boolean;
  concluida: boolean;
}

export interface ProfessorDoAluno {
  turma: TurmaResumo;
  professor: { id: string; nome: string };
}

export interface AlunoDoProfessor {
  aluno: { id: string; nome: string };
  turmas: TurmaResumo[];
  responsaveis: { id: string; nome: string }[];
}

export interface ConversaResumo {
  id: string;
  professor: { id: string; nome: string };
  responsavel: { id: string; nome: string };
  aluno: { id: string; nome: string };
  atualizadaEm: string;
  ultimaMensagem: { texto: string; autorId: string; createdAt: string } | null;
  naoLidas: number;
}

export interface MensagemConversa {
  id: string;
  texto: string;
  autor: { id: string; nome: string; role: Role };
  lidaEm: string | null;
  createdAt: string;
}

export interface ConversaDetalhe {
  id: string;
  professor: { id: string; nome: string };
  responsavel: { id: string; nome: string };
  aluno: { id: string; nome: string };
  mensagens: MensagemConversa[];
}

export type TipoObservacao = "ELOGIO" | "ATENCAO" | "NEUTRA";

export interface Observacao {
  id: string;
  tipo: TipoObservacao;
  texto: string;
  createdAt: string;
  professor: { id: string; nome: string };
  aluno: { id: string; nome: string };
  turma: TurmaResumo | null;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TarefaTipo;
  topico: string | null;
  dataEntrega: string;
  turma: TurmaResumo | null;
  pessoal: boolean;
  criadoPor: { id: string; nome: string };
  concluida: boolean;
  createdAt: string;
  resumoConclusao?: { concluidas: number; totalAlunos: number } | null;
}

// --- Jogos interativos (quiz estilo Kahoot) -------------------------------

export type QuizModo = "SOLO" | "AO_VIVO";
export type SessaoStatus = "LOBBY" | "EM_ANDAMENTO" | "ENCERRADA";

export interface QuizResumo {
  id: string;
  titulo: string;
  descricao: string | null;
  disciplina: string;
  tema: string | null;
  doBanco: boolean;
  turma: TurmaResumo | null;
  criadoPor: { id: string; nome: string } | null;
  totalPerguntas: number;
  createdAt: string;
}

export interface DisciplinaDisponivel {
  disciplina: string;
  totalQuizzes: number;
}

export interface QuizOpcaoDetalhe {
  id: string;
  texto: string;
  ordem: number;
  /** Só vem para o professor dono do jogo. */
  correta?: boolean;
}

export interface QuizPerguntaDetalhe {
  id: string;
  enunciado: string;
  ordem: number;
  tempoLimiteSegundos: number;
  opcoes: QuizOpcaoDetalhe[];
}

export interface QuizDetalhe {
  id: string;
  titulo: string;
  descricao: string | null;
  disciplina: string;
  tema: string | null;
  doBanco: boolean;
  turma: TurmaResumo | null;
  criadoPor: { id: string; nome: string } | null;
  podeEditar: boolean;
  perguntas: QuizPerguntaDetalhe[];
}

export interface PerguntaEmJogo {
  id: string;
  enunciado: string;
  ordem: number;
  tempoLimiteSegundos: number;
  restanteMs: number;
  encerrada: boolean;
  totalRespostas: number;
  opcoes: { id: string; texto: string; ordem: number }[];
}

export interface ParticipanteJogo {
  id: string;
  nome: string;
  pontuacao: number;
  respondeu: boolean;
}

export interface EstadoJogo {
  sessao: {
    id: string;
    modo: QuizModo;
    pin: string | null;
    status: SessaoStatus;
    perguntaIndex: number;
    totalPerguntas: number;
    quiz: { id: string; titulo: string; disciplina: string; tema: string | null };
    turma: TurmaResumo | null;
  };
  souHost: boolean;
  souParticipante: boolean;
  pergunta: PerguntaEmJogo | null;
  gabarito: { opcaoCorretaId: string } | null;
  minhaResposta: { opcaoId: string | null; correta: boolean; pontos: number } | null;
  participantes: ParticipanteJogo[];
}

export interface SessaoResumo {
  id: string;
  modo: QuizModo;
  status: SessaoStatus;
  pin: string | null;
  quiz: { id: string; titulo: string; disciplina: string };
  turma: { id: string; nome: string } | null;
  createdAt: string;
  encerradaEm: string | null;
  totalParticipantes: number;
  minhaPontuacao: number | null;
  vencedor: { nome: string; pontuacao: number } | null;
}

export type MuralItemTipo = "TAREFA" | "MATERIAL" | "AVISO";

export interface MuralItem {
  id: string;
  tipo: MuralItemTipo;
  topico: string | null;
  createdAt: string;
  item: Tarefa | Material | Aviso;
}

export interface MuralResponse {
  turma: TurmaCompleta;
  itens: MuralItem[];
}
