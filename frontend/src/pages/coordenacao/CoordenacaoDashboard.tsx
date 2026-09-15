import { DashboardHeader } from "../../components/layout/DashboardHeader";
import { ComingSoonCard } from "../../components/layout/ComingSoonCard";

export function CoordenacaoDashboard() {
  return (
    <>
      <DashboardHeader subtitle="Visão agregada das turmas da escola." />
      <ComingSoonCard
        title="Painel da coordenação"
        items={["Indicadores gerais de múltiplas turmas", "Funcionalidade opcional, prevista para o final do projeto"]}
      />
    </>
  );
}
