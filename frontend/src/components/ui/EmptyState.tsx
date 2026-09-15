import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <span className="icon-chip h-14 w-14 bg-brand-500/10 text-brand-500">
        <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div>
        <p className="font-medium text-ink-soft">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
