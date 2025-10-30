import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import EquiposListPage from './pages/equipos/EquiposListPage';
import MantenimientosListPage from './pages/mantenimientos/MantenimientosListPage';
import AlertasListPage from './pages/alertas/AlertasListPage';
import PerifericosListPage from './pages/perifericos/PerifericosListPage';
import TecnicosListPage from './pages/tecnicos/TecnicosListPage';

import LoginPage from './pages/usuarios/loginpage';
import { AuthProvider, useAuth } from './core/auth/AuthContext';

const queryClient = new QueryClient();

function RequireAuth({ children }) {
  const location = useLocation();
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function LogoutPage() {
  const { logout } = useAuth();
  logout();
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />

            {/* Protected routes */}
            <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/equipos" element={<EquiposListPage />} />
              <Route path="/mantenimientos" element={<MantenimientosListPage />} />
              <Route path="/alertas" element={<AlertasListPage />} />
              <Route path="/perifericos" element={<PerifericosListPage />} />
              <Route path="/tecnicos" element={<TecnicosListPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

