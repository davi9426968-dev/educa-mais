import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { GraduationCap, Lock, Mail, School, User, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";
import type { Role } from "../../types";
import { ROLE_LABELS, roleHomePath } from "../../utils/roles";

const CADASTRO_ROLES: Role[] = ["ALUNO", "PROFESSOR", "RESPONSAVEL"];
const ROLE_ICONS: Record<Role, LucideIcon> = {
  ALUNO: GraduationCap,
  PROFESSOR: School,
  RESPONSAVEL: Users,
  COORDENACAO: Users,
};

export function Cadastro() {
  const { register, user } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<Role>("ALUNO");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await register(nome, email, senha, role);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Não foi possível criar a conta. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Cadastre-se para começar a usar o Educa+.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <span className="field-label">Eu sou</span>
          <div role="radiogroup" aria-label="Perfil" className="grid grid-cols-3 gap-2">
            {CADASTRO_ROLES.map((r) => {
              const Icon = ROLE_ICONS[r];
              const selecionado = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={selecionado}
                  onClick={() => setRole(r)}
                  className={clsx(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all duration-150",
                    selecionado
                      ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 shadow-sm"
                      : "border-line text-ink-muted hover:border-line hover:bg-surface-muted"
                  )}
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  {ROLE_LABELS[r]}
                </button>
              );
            })}
          </div>
        </div>

        <TextField
          label="Nome completo"
          name="nome"
          autoComplete="name"
          icon={User}
          required
          minLength={3}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
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
          autoComplete="new-password"
          icon={Lock}
          required
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-700 dark:text-coral-300">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          <UserPlus size={16} aria-hidden="true" />
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Já tem uma conta?{" "}
        <Link to="/login" className="font-semibold text-brand-700 dark:text-brand-300 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
