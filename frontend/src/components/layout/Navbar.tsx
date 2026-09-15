import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/roles";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/85 backdrop-blur-md">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <Link to="/" className="font-display text-xl font-bold text-brand-700 dark:text-brand-300 transition-opacity hover:opacity-80">
          Educa<span className="text-sun-500">+</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar nome={user.nome} size="sm" />
              <span className="text-sm text-ink-soft">
                <strong className="font-semibold text-ink">{user.nome.split(" ")[0]}</strong>
              </span>
              <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
            </div>
          )}

          <ThemeToggle />

          {user && (
            <button
              type="button"
              onClick={logout}
              className="btn-ghost py-1.5 text-xs"
              aria-label="Sair da conta"
            >
              <LogOut size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
