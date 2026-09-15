import type { TarefaTipo } from "../types";

export const TAREFA_TIPO_LABELS: Record<TarefaTipo, string> = {
  TRABALHO: "Trabalho",
  TESTE: "Teste",
  LEITURA: "Leitura",
  REVISAO: "Revisão",
  OUTRO: "Outro",
};

export const TAREFA_TIPO_OPTIONS: TarefaTipo[] = [
  "TRABALHO",
  "TESTE",
  "LEITURA",
  "REVISAO",
  "OUTRO",
];
