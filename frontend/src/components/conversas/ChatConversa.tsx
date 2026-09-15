import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import clsx from "clsx";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { SkeletonList } from "../ui/Skeleton";
import * as responsavelService from "../../services/responsavel.service";
import { useAuth } from "../../context/AuthContext";
import type { ConversaDetalhe } from "../../types";
import { formatDataHora } from "../../utils/date";

export function ChatConversa({
  conversaId,
  onFechar,
}: {
  conversaId: string;
  onFechar?: () => void;
}) {
  const { user } = useAuth();
  const [conversa, setConversa] = useState<ConversaDetalhe | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimDaListaRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    try {
      const { conversa } = await responsavelService.getConversa(conversaId);
      setConversa(conversa);
    } catch {
      setErro("Não foi possível abrir a conversa.");
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId]);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ block: "nearest" });
  }, [conversa?.mensagens.length]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    try {
      await responsavelService.enviarMensagem(conversaId, texto);
      setTexto("");
      await carregar();
    } catch {
      setErro("Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  if (erro) {
    return (
      <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
        {erro}
      </p>
    );
  }

  if (!conversa) return <SkeletonList rows={3} />;

  // Do meu lado da conversa, o "outro" é quem interessa mostrar no cabeçalho.
  const outro = user?.id === conversa.professor.id ? conversa.responsavel : conversa.professor;

  return (
    <div className="card flex flex-col">
      <div className="mb-3 flex items-center gap-3 border-b border-line-soft pb-3">
        <Avatar nome={outro.nome} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{outro.nome}</p>
          <p className="text-xs text-ink-faint">sobre {conversa.aluno.nome}</p>
        </div>
        {onFechar && (
          <button type="button" onClick={onFechar} className="btn-ghost py-1 text-xs">
            Fechar
          </button>
        )}
      </div>

      <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {conversa.mensagens.map((mensagem) => {
          const minha = mensagem.autor.id === user?.id;
          return (
            <li key={mensagem.id} className={clsx("flex", minha ? "justify-end" : "justify-start")}>
              <div
                className={clsx(
                  "max-w-[80%] rounded-2xl px-3.5 py-2",
                  minha
                    ? "bg-brand-600 text-white"
                    : "bg-surface-sunken text-ink"
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{mensagem.texto}</p>
                <p className={clsx("mt-1 text-[11px]", minha ? "text-white/70" : "text-ink-faint")}>
                  {formatDataHora(mensagem.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
        <div ref={fimDaListaRef} />
      </ul>

      <form onSubmit={enviar} className="mt-3 flex gap-2 border-t border-line-soft pt-3">
        <label htmlFor={`msg-${conversaId}`} className="sr-only">
          Escreva uma mensagem
        </label>
        <input
          id={`msg-${conversaId}`}
          className="field-input"
          placeholder="Escreva uma mensagem..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          required
        />
        <Button type="submit" isLoading={enviando} disabled={!texto.trim()}>
          <Send size={16} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
