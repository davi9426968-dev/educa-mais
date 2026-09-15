import { useTheme } from "../../context/ThemeContext";

/**
 * O Recharts desenha em SVG e precisa de cores concretas, então não dá para
 * usar as classes do Tailwind aqui. Este hook devolve a paleta do gráfico já
 * ajustada ao tema atual (grade e textos mais claros no escuro, série com
 * saturação um pouco maior para não sumir no fundo escuro).
 */
export function useCoresGrafico() {
  const { tema } = useTheme();
  const escuro = tema === "escuro";

  return {
    grade: escuro ? "#37374f" : "#e2e8f0",
    eixo: escuro ? "#37374f" : "#e2e8f0",
    texto: escuro ? "#9ca3b8" : "#64748b",
    serie: escuro ? "#4ade80" : "#16a34a",
    serieBarra: escuro ? "#818cf8" : "#4f46e5",
    cursor: escuro ? "rgb(99 102 241 / 0.15)" : "#f1f5f9",
    opacidadeArea: escuro ? 0.18 : 0.1,
  };
}
