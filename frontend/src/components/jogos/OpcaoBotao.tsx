import { Check, Circle, Diamond, Square, Triangle, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

/**
 * As quatro alternativas ganham cor + forma (como no Kahoot). A forma é o que
 * garante que a alternativa continue identificável sem depender só da cor.
 */
const ESTILOS: { icone: LucideIcon; base: string; anel: string }[] = [
  { icone: Triangle, base: "bg-coral-600 hover:bg-coral-700", anel: "ring-coral-300" },
  { icone: Diamond, base: "bg-brand-600 hover:bg-brand-700", anel: "ring-brand-300" },
  { icone: Circle, base: "bg-sun-600 hover:bg-sun-700", anel: "ring-sun-300" },
  { icone: Square, base: "bg-leaf-600 hover:bg-leaf-700", anel: "ring-leaf-300" },
];

interface OpcaoBotaoProps {
  indice: number;
  texto: string;
  onClick?: () => void;
  desabilitado?: boolean;
  /** Depois que a pergunta fecha: destaca a certa e apaga as demais. */
  revelacao?: "correta" | "incorreta" | "neutra" | null;
  escolhida?: boolean;
}

export function OpcaoBotao({
  indice,
  texto,
  onClick,
  desabilitado,
  revelacao,
  escolhida,
}: OpcaoBotaoProps) {
  const estilo = ESTILOS[indice % ESTILOS.length];
  const Icone = estilo.icone;

  const revelando = Boolean(revelacao);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-pressed={escolhida}
      className={clsx(
        "flex min-h-[92px] items-center gap-3 rounded-2xl px-4 py-4 text-left font-semibold text-white shadow-md transition-all duration-150 ease-smooth",
        !revelando && estilo.base,
        !revelando && !desabilitado && "hover:-translate-y-0.5 active:scale-[0.98]",
        revelacao === "correta" && "bg-leaf-600 ring-4 ring-leaf-300",
        revelacao === "incorreta" && "bg-coral-600 ring-4 ring-coral-300",
        revelacao === "neutra" && "bg-slate-400 opacity-60 dark:bg-slate-600",
        escolhida && !revelando && `ring-4 ${estilo.anel}`,
        desabilitado && !revelando && "cursor-not-allowed opacity-70"
      )}
    >
      <Icone size={24} strokeWidth={2.5} className="shrink-0 fill-white/25" aria-hidden="true" />
      <span className="flex-1 text-base leading-snug">{texto}</span>

      {revelacao === "correta" && <Check size={22} strokeWidth={3} aria-label="Resposta correta" />}
      {revelacao === "incorreta" && <X size={22} strokeWidth={3} aria-label="Resposta incorreta" />}
    </button>
  );
}
