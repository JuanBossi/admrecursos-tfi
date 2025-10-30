import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EquiposListPage from '../pages/equipos/EquiposListPage';
import MantenimientosListPage from '../pages/mantenimientos/MantenimientosListPage';
import AlertasListPage from '../pages/alertas/AlertasListPage';
import PerifericosListPage from '../pages/perifericos/PerifericosListPage';
import TecnicosListPage from '../pages/tecnicos/TecnicosListPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'equipos', element: <EquiposListPage /> },
      { path: 'mantenimientos', element: <MantenimientosListPage /> },
      { path: 'perifericos', element: <PerifericosListPage /> },
      { path: 'alertas', element: <AlertasListPage /> },
      { path: 'tecnicos', element: <TecnicosListPage /> },
    ],
  },
]);
