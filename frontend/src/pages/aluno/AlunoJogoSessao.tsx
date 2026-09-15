import { useParams } from "react-router-dom";
import { TelaDeJogo } from "../../components/jogos/TelaDeJogo";

export function AlunoJogoSessao() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <TelaDeJogo sessaoId={id} voltarPara="/aluno/jogos" />;
}
