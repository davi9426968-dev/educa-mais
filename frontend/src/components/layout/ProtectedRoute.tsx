import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types";
import { roleHomePath } from "../../utils/roles";
import { AppShell } from "./AppShell";

export function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
