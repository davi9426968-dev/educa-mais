import { Clock3 } from "lucide-react";

export function ComingSoonCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <span className="icon-chip bg-brand-500/10 text-brand-500">
          <Clock3 size={18} strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink-muted">Estas funcionalidades chegam nas próximas etapas.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-ink-soft">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sun-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
