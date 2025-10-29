import { Outlet, NavLink } from 'react-router-dom';
import './layout.css';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Inventario</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/equipos">Equipos</NavLink>
          <NavLink to="/mantenimientos">Mantenimientos</NavLink>
          <NavLink to="/perifericos">Periféricos</NavLink>
          <NavLink to="/alertas">Alertas</NavLink>
          <NavLink to="/tecnicos">Técnicos</NavLink>
        </nav>
      </aside>
      <div className="content">
        <header className="topbar"><span>Panel</span></header>
        <main><Outlet /></main>
      </div>
    </div>
  );
}
