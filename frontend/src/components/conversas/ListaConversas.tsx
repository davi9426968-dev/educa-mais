import { MessagesSquare } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import { EmptyState } from "../ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import type { ConversaResumo } from "../../types";
import { formatDataHora } from "../../utils/date";

export function ListaConversas({
  conversas,
  selecionadaId,
  onSelecionar,
}: {
  conversas: ConversaResumo[];
  selecionadaId?: string | null;
  onSelecionar: (id: string) => void;
}) {
  const { user } = useAuth();

  if (conversas.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Nenhuma conversa ainda"
        description="Quando houver troca de mensagens, ela aparece aqui."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {conversas.map((conversa) => {
        const outro = user?.id === conversa.professor.id ? conversa.responsavel : conversa.professor;
        return (
          <li key={conversa.id}>
            <button
              type="button"
              onClick={() => onSelecionar(conversa.id)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                conversa.id === selecionadaId
                  ? "bg-brand-500/10 ring-1 ring-brand-300"
                  : "hover:bg-surface-sunken"
              )}
            >
              <Avatar nome={outro.nome} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink">{outro.nome}</p>
                  {conversa.naoLidas > 0 && (
                    <span className="rounded-full bg-coral-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {conversa.naoLidas}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-ink-faint">
                  sobre {conversa.aluno.nome}
                  {conversa.ultimaMensagem ? ` · ${conversa.ultimaMensagem.texto}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-ink-faint">
                {formatDataHora(conversa.atualizadaEm).split(",")[0]}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
