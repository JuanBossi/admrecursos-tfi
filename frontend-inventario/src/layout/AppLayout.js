import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import './layout.css';

export default function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.tecnico
    ? [user.tecnico?.nombre, user.tecnico?.apellido].filter(Boolean).join(' ')
    : (user?.empleado
      ? [user.empleado?.nombre, user.empleado?.apellido].filter(Boolean).join(' ')
      : user?.username || user?.email || 'Usuario');
  const roleNames = Array.isArray(user?.roles) && user.roles.length > 0
    ? user.roles.map((r) => r?.nombre).filter(Boolean).join(', ')
    : 'Sin rol';
  const isAdmin = !!user?.roles?.some(r => r?.nombre === 'Administrador');
  const isTecnico = !!user?.roles?.some(r => r?.nombre === 'Tecnico');

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
          {(isAdmin || isTecnico) && <NavLink to="/proveedores">Proveedores</NavLink>}
          {isAdmin && <NavLink to="/empleados">Empleados</NavLink>}
          {isAdmin && <NavLink to="/tecnicos">Técnicos</NavLink>}
        </nav>
      </aside>
      <div className="content">
        <header className="topbar">
          <span>Panel</span>
          <div className="userbar">
            <div className="userinfo">
              <span className="username">{displayName}</span>
              <span className="rolebadge">{roleNames}</span>
            </div>
            <button className="logoutbtn" onClick={() => navigate('/logout')}>Salir</button>
          </div>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  );
}
