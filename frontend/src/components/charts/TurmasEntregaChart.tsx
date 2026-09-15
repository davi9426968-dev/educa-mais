import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProgressoTurma } from "../../types";
import { useCoresGrafico } from "./coresGrafico";

interface TooltipPayloadItem {
  payload: ProgressoTurma;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const turma = payload[0].payload;

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
      <p className="font-medium text-ink-soft">{turma.nome}</p>
      <p className="text-ink-muted">{turma.percentualEntrega}% de entrega</p>
    </div>
  );
}

export function TurmasEntregaChart({ turmas }: { turmas: ProgressoTurma[] }) {
  const cores = useCoresGrafico();

  return (
    <div className="h-56 w-full" role="img" aria-label="Gráfico de percentual de entrega de atividades por turma">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={turmas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={cores.grade} />
          <XAxis
            dataKey="nome"
            tick={{ fill: cores.texto, fontSize: 12 }}
            axisLine={{ stroke: cores.eixo }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: cores.texto, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: cores.cursor }} />
          <Bar dataKey="percentualEntrega" fill={cores.serieBarra} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
