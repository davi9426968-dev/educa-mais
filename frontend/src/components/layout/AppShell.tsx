import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { RoleNav } from "./RoleNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-surface focus-visible:px-4 focus-visible:py-2 focus-visible:text-brand-700 dark:text-brand-300 focus-visible:shadow-card"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <RoleNav />
      <main id="main-content" className="mx-auto max-w-5xl animate-fade-in px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
