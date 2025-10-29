import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import EquiposListPage from './pages/equipos/EquiposListPage';
import MantenimientosListPage from './pages/mantenimientos/MantenimientosListPage';
import AlertasListPage from './pages/alertas/AlertasListPage';
import PerifericosListPage from './pages/perifericos/PerifericosListPage';
import TecnicosListPage from './pages/tecnicos/TecnicosListPage';

// 👇 importa tu login en usuarios/loginpage.js (respetando tu path real)
import { LoginPage } from './pages/usuarios/loginpage';

const queryClient = new QueryClient();

// Wrapper de protección
function RequireAuth({ children }) {
  const location = useLocation();
  const pwd = typeof window !== 'undefined'
    ? localStorage.getItem('adm-tfi.password')
    : null;

  if (!pwd) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

// Logout mínimo (opcional)
function LogoutPage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adm-tfi.password');
    localStorage.removeItem('adm-tfi.auth-email');
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* RUTA PÚBLICA */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />

          {/* RUTAS PROTEGIDAS */}
          <Route element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/equipos" element={<EquiposListPage />} />
            <Route path="/mantenimientos" element={<MantenimientosListPage />} />
            <Route path="/alertas" element={<AlertasListPage />} />
            <Route path="/perifericos" element={<PerifericosListPage />} />
            <Route path="/tecnicos" element={<TecnicosListPage />} />
          </Route>

          {/* Fallback: si no matchea nada, va al dashboard o login según corresponda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
