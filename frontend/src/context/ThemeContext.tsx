import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Tema = "claro" | "escuro";

const CHAVE_ARMAZENAMENTO = "educamais:tema";

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
  /** true quando o tema veio da preferência do sistema, sem escolha manual. */
  seguindoSistema: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function preferenciaDoSistema(): Tema {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

function temaSalvo(): Tema | null {
  const valor = localStorage.getItem(CHAVE_ARMAZENAMENTO);
  return valor === "claro" || valor === "escuro" ? valor : null;
}

function aplicarNoDocumento(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "escuro");
  document.documentElement.style.colorScheme = tema === "escuro" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => temaSalvo() ?? preferenciaDoSistema());
  const [seguindoSistema, setSeguindoSistema] = useState(() => temaSalvo() === null);

  useEffect(() => {
    aplicarNoDocumento(tema);
  }, [tema]);

  // Enquanto o usuário não escolher manualmente, acompanhamos o sistema.
  useEffect(() => {
    if (!seguindoSistema) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const aoMudar = (evento: MediaQueryListEvent) => setTema(evento.matches ? "escuro" : "claro");

    media.addEventListener("change", aoMudar);
    return () => media.removeEventListener("change", aoMudar);
  }, [seguindoSistema]);

  const alternarTema = useCallback(() => {
    setTema((atual) => {
      const novo: Tema = atual === "claro" ? "escuro" : "claro";
      localStorage.setItem(CHAVE_ARMAZENAMENTO, novo);
      return novo;
    });
    setSeguindoSistema(false);
  }, []);

  const value = useMemo(
    () => ({ tema, alternarTema, seguindoSistema }),
    [tema, alternarTema, seguindoSistema]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return ctx;
}
