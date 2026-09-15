import { useState } from "react";
import { NovaTurmaForm } from "./NovaTurmaForm";

export function NovaTurmaCard({ onCreated }: { onCreated: () => void }) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-surface text-brand-700 dark:text-brand-300 transition-colors hover:border-brand-400 hover:bg-brand-500/10"
      >
        <span aria-hidden="true" className="text-2xl">
          +
        </span>
        <span className="text-sm font-semibold">Nova turma</span>
      </button>
    );
  }

  return (
    <NovaTurmaForm
      onCreated={() => {
        setAberto(false);
        onCreated();
      }}
    />
  );
}
