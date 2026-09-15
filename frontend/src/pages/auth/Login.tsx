import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";
import { roleHomePath } from "../../utils/roles";

export function Login() {
  const { login, user } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    return <Navigate to={from ?? roleHomePath(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await login(email, senha);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta para continuar aprendendo.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          icon={Mail}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          name="senha"
          autoComplete="current-password"
          icon={Lock}
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          <LogIn size={16} aria-hidden="true" />
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-brand-700 dark:text-brand-300 hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}
