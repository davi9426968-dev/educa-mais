import { ReactNode } from "react";
import { GraduationCap, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { tema, alternarTema } = useTheme();
  const paraEscuro = tema === "claro";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 px-4 py-10 dark:from-brand-900 dark:via-brand-950 dark:to-slate-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(600px 400px at 15% 15%, rgb(251 191 36 / 0.25), transparent 60%), radial-gradient(700px 500px at 85% 85%, rgb(255 255 255 / 0.10), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="icon-chip mb-3 h-14 w-14 bg-surface/15 text-sun-300 ring-1 ring-white/20">
            <GraduationCap size={28} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="font-display text-3xl font-bold text-white">
            Educa<span className="text-sun-400">+</span>
          </p>
          <p className="mt-1 text-sm text-brand-100">tecnologia para apoiar a aprendizagem</p>
        </div>

        <div className="card shadow-2xl shadow-brand-950/30">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-ink-muted">{subtitle}</p>
          {children}
        </div>
      </div>

      {/*
        Fica depois do formulário no DOM de propósito: visualmente no canto, mas
        no fim da ordem de tabulação. Quem entra pelo teclado chega direto ao
        campo de e-mail, sem passar antes por um botão secundário.
      */}
      <button
        type="button"
        onClick={alternarTema}
        className="absolute right-4 top-4 z-10 rounded-xl p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        aria-label={paraEscuro ? "Ativar modo escuro" : "Ativar modo claro"}
        title={paraEscuro ? "Modo escuro" : "Modo claro"}
      >
        {paraEscuro ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
