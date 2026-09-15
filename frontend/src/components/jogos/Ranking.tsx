import { Check, Crown, Hourglass } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import type { ParticipanteJogo } from "../../types";

const MEDALHAS = ["bg-sun-400 text-sun-900", "bg-slate-300 text-slate-800", "bg-orange-300 text-orange-900"];

export function Ranking({
  participantes,
  mostrarStatusResposta,
  destacarUserId,
}: {
  participantes: ParticipanteJogo[];
  /** No jogo ao vivo, mostra quem já respondeu a pergunta atual. */
  mostrarStatusResposta?: boolean;
  destacarUserId?: string;
}) {
  if (participantes.length === 0) {
    return <p className="text-sm text-ink-muted">Ninguém entrou na sala ainda.</p>;
  }

  return (
    <ol className="space-y-2">
      {participantes.map((participante, posicao) => (
        <li
          key={participante.id}
          className={clsx(
            "flex items-center gap-3 rounded-xl px-3 py-2",
            participante.id === destacarUserId ? "bg-brand-500/10 ring-1 ring-brand-200" : "bg-surface-muted"
          )}
        >
          <span
            className={clsx(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              MEDALHAS[posicao] ?? "bg-surface-sunken text-ink-soft"
            )}
          >
            {posicao + 1}
          </span>
          <Avatar nome={participante.nome} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-soft">
            {participante.nome}
          </span>

          {mostrarStatusResposta &&
            (participante.respondeu ? (
              <Check size={16} className="text-leaf-600 dark:text-leaf-400" aria-label="Já respondeu" />
            ) : (
              <Hourglass size={16} className="text-ink-faint" aria-label="Aguardando resposta" />
            ))}

          <span className="font-display text-sm font-bold tabular-nums text-brand-800 dark:text-brand-300">
            {participante.pontuacao}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Podio({ participantes }: { participantes: ParticipanteJogo[] }) {
  const top3 = participantes.slice(0, 3);
  if (top3.length === 0) return null;

  // Ordem visual do pódio: 2º, 1º, 3º.
  const ordemVisual = [top3[1], top3[0], top3[2]].filter(Boolean);
  const alturas: Record<string, string> = {};
  top3.forEach((p, i) => {
    alturas[p.id] = ["h-28", "h-20", "h-14"][i];
  });

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5">
      {ordemVisual.map((participante) => {
        const posicao = top3.findIndex((p) => p.id === participante.id);
        return (
          <div key={participante.id} className="flex w-24 flex-col items-center gap-2 sm:w-28">
            {posicao === 0 && <Crown size={26} className="text-sun-500" aria-hidden="true" />}
            <Avatar nome={participante.nome} size={posicao === 0 ? "lg" : "md"} />
            <p className="w-full truncate text-center text-sm font-medium text-ink-soft">
              {participante.nome}
            </p>
            <div
              className={clsx(
                "flex w-full items-start justify-center rounded-t-xl pt-2 font-display text-lg font-bold text-white",
                alturas[participante.id],
                ["bg-gradient-to-b from-sun-400 to-sun-500", "bg-gradient-to-b from-slate-300 to-slate-400", "bg-gradient-to-b from-orange-300 to-orange-400"][
                  posicao
                ]
              )}
            >
              {participante.pontuacao}
            </div>
          </div>
        );
      })}
    </div>
  );
}
