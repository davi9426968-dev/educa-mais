import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProgressoSemana } from "../../types";
import { formatSemana } from "../../utils/date";
import { useCoresGrafico } from "./coresGrafico";

interface TooltipPayloadItem {
  payload: ProgressoSemana;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const dado = payload[0].payload;

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
      <p className="font-medium text-ink-soft">Semana de {formatSemana(dado.semana)}</p>
      <p className="text-ink-muted">
        {dado.percentual}% concluído ({dado.tarefasConcluidas}/{dado.tarefasTotal} tarefas)
      </p>
    </div>
  );
}

export function ProgressoSemanalChart({ dados }: { dados: ProgressoSemana[] }) {
  const cores = useCoresGrafico();

  if (dados.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Ainda não há tarefas suficientes para mostrar a evolução semanal.
      </p>
    );
  }

  return (
    <div className="h-56 w-full" role="img" aria-label="Gráfico da evolução semanal de tarefas concluídas">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={cores.grade} />
          <XAxis
            dataKey="semana"
            tickFormatter={formatSemana}
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
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="percentual"
            stroke={cores.serie}
            strokeWidth={2}
            fill={cores.serie}
            fillOpacity={cores.opacidadeArea}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
