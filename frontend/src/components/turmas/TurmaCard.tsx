import { ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { corDaTurma } from "../../utils/turmaCor";

interface TurmaCardProps {
  to: string;
  turmaId: string;
  nome: string;
  disciplina: string;
  rodape: ReactNode;
}

export function TurmaCard({ to, turmaId, nome, disciplina, rodape }: TurmaCardProps) {
  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-card transition-shadow hover:shadow-lg"
    >
      <div className={clsx("bg-gradient-to-br px-4 py-6 text-white", corDaTurma(turmaId))}>
        <p className="font-display text-lg font-bold group-hover:underline">{nome}</p>
        <p className="text-sm text-white/85">{disciplina}</p>
      </div>
      <div className="p-4">{rodape}</div>
    </Link>
  );
}
