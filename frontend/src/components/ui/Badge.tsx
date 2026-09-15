import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

const TONES = {
  brand: "bg-brand-500/10 text-brand-700 dark:text-brand-300",
  sun: "bg-sun-500/15 text-sun-800 dark:text-sun-200",
  leaf: "bg-leaf-500/15 text-leaf-700 dark:text-leaf-300",
  coral: "bg-coral-500/15 text-coral-700 dark:text-coral-300",
  slate: "bg-surface-sunken text-ink-soft",
} as const;

export function Badge({
  tone = "slate",
  icon: Icon,
  children,
}: {
  tone?: keyof typeof TONES;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone]
      )}
    >
      {Icon && <Icon size={12} strokeWidth={2.25} aria-hidden="true" />}
      {children}
    </span>
  );
}
