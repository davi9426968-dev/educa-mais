import clsx from "clsx";

export function TimerBar({
  restanteMs,
  totalSegundos,
}: {
  restanteMs: number;
  totalSegundos: number;
}) {
  const totalMs = totalSegundos * 1000;
  const proporcao = totalMs > 0 ? Math.min(1, Math.max(0, restanteMs / totalMs)) : 0;
  const segundos = Math.ceil(restanteMs / 1000);
  const acabando = restanteMs <= 5000;

  return (
    <div className="flex items-center gap-3">
      <span
        className={clsx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold tabular-nums text-white transition-colors",
          acabando ? "bg-coral-600" : "bg-brand-600"
        )}
        role="timer"
        aria-live="off"
      >
        {segundos}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-100 ease-linear",
            acabando ? "bg-coral-500" : "bg-brand-500"
          )}
          style={{ width: `${proporcao * 100}%` }}
        />
      </div>
      <span className="sr-only">{segundos} segundos restantes</span>
    </div>
  );
}
