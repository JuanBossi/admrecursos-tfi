import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EquiposListPage from '../pages/equipos/EquiposListPage';
import MantenimientosListPage from '../pages/mantenimientos/MantenimientosListPage';
import AlertasListPage from '../pages/alertas/AlertasListPage';
import PerifericosListPage from '../pages/perifericos/PerifericosListPage';
import TecnicosListPage from '../pages/tecnicos/TecnicosListPage';
import EmpleadosListPage from '../pages/empleados/EmpleadosListPage';
import LoginPage from '../pages/usuarios/loginpage';
import { useAuth } from '../core/auth/AuthContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}

function LogoutPage() {
  const { logout } = useAuth();
  logout();
  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/logout', element: <LogoutPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'equipos', element: <EquiposListPage /> },
      { path: 'mantenimientos', element: <MantenimientosListPage /> },
      { path: 'perifericos', element: <PerifericosListPage /> },
      { path: 'alertas', element: <AlertasListPage /> },
      { path: 'empleados', element: <EmpleadosListPage /> },
      { path: 'tecnicos', element: <TecnicosListPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
