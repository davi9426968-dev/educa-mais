import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} aria-hidden="true" />;
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card space-y-4" role="status" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando conteúdo...</span>
    </div>
  );
}

export function SkeletonGrid({ items = 3 }: { items?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-card">
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando conteúdo...</span>
    </div>
  );
}
