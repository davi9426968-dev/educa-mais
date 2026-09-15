const FAIXAS = [
  "from-brand-600 to-brand-700",
  "from-sun-500 to-sun-600",
  "from-leaf-500 to-leaf-600",
  "from-coral-500 to-coral-600",
];

// Escolhe uma cor de faixa de forma estável a partir do id da turma, só para dar variedade
// visual aos cartões (estilo Google Sala de Aula), sem depender de estado extra.
export function corDaTurma(turmaId: string): string {
  let soma = 0;
  for (let i = 0; i < turmaId.length; i++) soma += turmaId.charCodeAt(i);
  return FAIXAS[soma % FAIXAS.length];
}
