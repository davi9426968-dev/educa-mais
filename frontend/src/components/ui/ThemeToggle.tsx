import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { tema, alternarTema } = useTheme();
  const paraEscuro = tema === "claro";

  return (
    <button
      type="button"
      onClick={alternarTema}
      className="btn-ghost px-2 py-1.5"
      aria-label={paraEscuro ? "Ativar modo escuro" : "Ativar modo claro"}
      title={paraEscuro ? "Modo escuro" : "Modo claro"}
    >
      {paraEscuro ? (
        <Moon size={16} aria-hidden="true" />
      ) : (
        <Sun size={16} aria-hidden="true" />
      )}
    </button>
  );
}
