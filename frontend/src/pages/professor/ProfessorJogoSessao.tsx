import { useParams } from "react-router-dom";
import { TelaDeJogo } from "../../components/jogos/TelaDeJogo";

export function ProfessorJogoSessao() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <TelaDeJogo sessaoId={id} voltarPara="/professor/jogos" />;
}
