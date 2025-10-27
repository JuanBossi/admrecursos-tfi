import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import EquiposListPage from './pages/equipos/EquiposListPage';
import MantenimientosListPage from './pages/mantenimientos/MantenimientosListPage';
import AlertasListPage from './pages/alertas/AlertasListPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/equipos" element={<EquiposListPage />} />
            <Route path="/mantenimientos" element={<MantenimientosListPage />} />
            <Route path="/alertas" element={<AlertasListPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
