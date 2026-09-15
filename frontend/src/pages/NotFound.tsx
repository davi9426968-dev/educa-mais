import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-4xl font-bold text-brand-700 dark:text-brand-300">404</p>
      <p className="text-ink-muted">Página não encontrada.</p>
      <Link to="/" className="font-semibold text-brand-700 dark:text-brand-300 hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
