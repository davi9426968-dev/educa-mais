import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: "brand" | "sun" | "leaf";
}) {
  const toneClass = {
    brand: "bg-brand-500/10 text-brand-600",
    sun: "bg-sun-500/15 text-sun-700 dark:text-sun-300",
    leaf: "bg-leaf-500/15 text-leaf-700 dark:text-leaf-300",
  }[tone];

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        {Icon && (
          <span className={`icon-chip ${toneClass}`}>
            <Icon size={18} strokeWidth={2} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-4xl font-bold text-heading">{value}</p>
      {sublabel && <p className="mt-1 text-sm text-ink-faint">{sublabel}</p>}
    </div>
  );
}
