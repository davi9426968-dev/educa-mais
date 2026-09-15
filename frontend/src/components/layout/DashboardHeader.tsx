import { useAuth } from "../../context/AuthContext";

export function DashboardHeader({ subtitle }: { subtitle: string }) {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold">Olá, {user?.nome.split(" ")[0]}!</h1>
      <p className="mt-1 text-ink-muted">{subtitle}</p>
    </div>
  );
}
