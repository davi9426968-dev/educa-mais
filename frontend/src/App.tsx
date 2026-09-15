import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { Cadastro } from "./pages/auth/Cadastro";
import { AlunoDashboard } from "./pages/aluno/AlunoDashboard";
import { AlunoTurmas } from "./pages/aluno/AlunoTurmas";
import { TurmaMural as AlunoTurmaMural } from "./pages/aluno/TurmaMural";
import { AlunoAgenda } from "./pages/aluno/AlunoAgenda";
import { AlunoMateriais } from "./pages/aluno/AlunoMateriais";
import { AlunoDuvidas } from "./pages/aluno/AlunoDuvidas";
import { AlunoJogos } from "./pages/aluno/AlunoJogos";
import { AlunoJogoSessao } from "./pages/aluno/AlunoJogoSessao";
import { ProfessorDashboard } from "./pages/professor/ProfessorDashboard";
import { ProfessorTurmas } from "./pages/professor/ProfessorTurmas";
import { TurmaMural as ProfessorTurmaMural } from "./pages/professor/TurmaMural";
import { ProfessorAtividades } from "./pages/professor/ProfessorAtividades";
import { ProfessorMateriais } from "./pages/professor/ProfessorMateriais";
import { ProfessorDuvidas } from "./pages/professor/ProfessorDuvidas";
import { ProfessorAvisos } from "./pages/professor/ProfessorAvisos";
import { ProfessorJogos } from "./pages/professor/ProfessorJogos";
import { ProfessorJogoSessao } from "./pages/professor/ProfessorJogoSessao";
import { ProfessorAlunos } from "./pages/professor/ProfessorAlunos";
import { ResponsavelDashboard } from "./pages/responsavel/ResponsavelDashboard";
import { CoordenacaoDashboard } from "./pages/coordenacao/CoordenacaoDashboard";
import { NotFound } from "./pages/NotFound";
import { roleHomePath } from "./utils/roles";

function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        Carregando...
      </div>
    );
  }

  return <Navigate to={user ? roleHomePath(user.role) : "/login"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route element={<ProtectedRoute allow={["ALUNO"]} />}>
        <Route path="/aluno" element={<AlunoDashboard />} />
        <Route path="/aluno/turmas" element={<AlunoTurmas />} />
        <Route path="/aluno/turmas/:id" element={<AlunoTurmaMural />} />
        <Route path="/aluno/agenda" element={<AlunoAgenda />} />
        <Route path="/aluno/materiais" element={<AlunoMateriais />} />
        <Route path="/aluno/duvidas" element={<AlunoDuvidas />} />
        <Route path="/aluno/jogos" element={<AlunoJogos />} />
        <Route path="/aluno/jogos/:id" element={<AlunoJogoSessao />} />
      </Route>

      <Route element={<ProtectedRoute allow={["PROFESSOR"]} />}>
        <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/professor/turmas" element={<ProfessorTurmas />} />
        <Route path="/professor/turmas/:id" element={<ProfessorTurmaMural />} />
        <Route path="/professor/atividades" element={<ProfessorAtividades />} />
        <Route path="/professor/materiais" element={<ProfessorMateriais />} />
        <Route path="/professor/duvidas" element={<ProfessorDuvidas />} />
        <Route path="/professor/avisos" element={<ProfessorAvisos />} />
        <Route path="/professor/jogos" element={<ProfessorJogos />} />
        <Route path="/professor/jogos/:id" element={<ProfessorJogoSessao />} />
        <Route path="/professor/alunos" element={<ProfessorAlunos />} />
      </Route>

      <Route element={<ProtectedRoute allow={["RESPONSAVEL"]} />}>
        <Route path="/responsavel" element={<ResponsavelDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allow={["COORDENACAO"]} />}>
        <Route path="/coordenacao" element={<CoordenacaoDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
