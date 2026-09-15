import { NavLink } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  FolderOpen,
  Gamepad2,
  HelpCircle,
  LayoutGrid,
  Megaphone,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  ALUNO: [
    { to: "/aluno", label: "Painel", icon: LayoutGrid, end: true },
    { to: "/aluno/turmas", label: "Turmas", icon: BookOpen },
    { to: "/aluno/agenda", label: "Agenda", icon: CalendarDays },
    { to: "/aluno/materiais", label: "Materiais", icon: FolderOpen },
    { to: "/aluno/duvidas", label: "Dúvidas", icon: HelpCircle },
    { to: "/aluno/jogos", label: "Jogos", icon: Gamepad2 },
  ],
  PROFESSOR: [
    { to: "/professor", label: "Painel", icon: LayoutGrid, end: true },
    { to: "/professor/turmas", label: "Turmas", icon: BookOpen },
    { to: "/professor/atividades", label: "Atividades", icon: CalendarDays },
    { to: "/professor/materiais", label: "Materiais", icon: FolderOpen },
    { to: "/professor/duvidas", label: "Dúvidas", icon: HelpCircle },
    { to: "/professor/avisos", label: "Avisos", icon: Megaphone },
    { to: "/professor/jogos", label: "Jogos", icon: Gamepad2 },
    { to: "/professor/alunos", label: "Alunos", icon: Users },
  ],
  RESPONSAVEL: [{ to: "/responsavel", label: "Painel", icon: LayoutGrid, end: true }],
  COORDENACAO: [{ to: "/coordenacao", label: "Painel", icon: LayoutGrid, end: true }],
};

export function RoleNav() {
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_ITEMS[user.role] ?? [];
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Seções do painel" className="sticky top-[57px] z-30 border-b border-line bg-surface/95 backdrop-blur-md">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand-600 text-brand-700 dark:text-brand-300"
                    : "border-transparent text-ink-muted hover:text-brand-600"
                )
              }
            >
              <item.icon size={16} strokeWidth={2} aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
