import { Link } from 'react-router-dom';
import { useEstadisticas } from '../../core/hooks/useEstadisticas';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { data: estadisticas, isLoading, error } = useEstadisticas();

  const cards = useMemo(() => {
    if (!estadisticas) return [];
    
    return [
      { 
        title: 'Equipos Totales', 
        value: estadisticas.equipos.total, 
        to: '/equipos',
        icon: '💻',
        description: `${estadisticas.equipos.activos} activos, ${estadisticas.equipos.enReparacion} en reparación`
      },
      { 
        title: 'Equipos Activos', 
        value: estadisticas.equipos.activos, 
        to: '/equipos',
        icon: '✅',
        tone: 'success'
      },
      { 
        title: 'En Reparación', 
        value: estadisticas.equipos.enReparacion, 
        to: '/equipos',
        icon: '🔧',
        tone: 'warning'
      },
      { 
        title: 'Equipos de Baja', 
        value: estadisticas.equipos.deBaja, 
        to: '/equipos',
        icon: '❌',
        tone: 'danger'
      },
      { 
        title: 'Alertas', 
        value: estadisticas.alertas.total, 
        to: '/alertas',
        icon: '⚠️',
        description: `${estadisticas.alertas.recientes} recientes`,
        tone: estadisticas.alertas.total > 0 ? 'danger' : 'success'
      },
      { 
        title: 'Mantenimientos', 
        value: estadisticas.mantenimientos.total, 
        to: '/mantenimientos',
        icon: '🛠️',
        description: `${estadisticas.mantenimientos.programados} programados`
      },
      { 
        title: 'Técnicos', 
        value: estadisticas.tecnicos.total, 
        to: '/tecnicos',
        icon: '👨‍💻',
        description: `${estadisticas.tecnicos.internos} internos, ${estadisticas.tecnicos.externos} externos`
      },
      { 
        title: 'Usuarios', 
        value: estadisticas.usuarios.total, 
        to: '/usuarios',
        icon: '👥',
        description: `${estadisticas.usuarios.activos} activos, ${estadisticas.usuarios.inactivos} inactivos`
      },
      { 
        title: 'Administradores', 
        value: estadisticas.usuarios.porRol.administrador, 
        to: '/usuarios',
        icon: '👑',
        tone: 'success'
      },
      { 
        title: 'Técnicos (Usuarios)', 
        value: estadisticas.usuarios.porRol.tecnico, 
        to: '/usuarios',
        icon: '🔧',
        tone: 'info'
      },
      { 
        title: 'Consulta', 
        value: estadisticas.usuarios.porRol.consulta, 
        to: '/usuarios',
        icon: '👁️',
        tone: 'info'
      },
    ];
  }, [estadisticas]);

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>Error al cargar las estadísticas: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '1.875rem', fontWeight: '700', color: '#1f2937' }}>
        Dashboard del Sistema de Inventario
      </h1>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {cards.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            style={{
              display: 'block',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>{c.icon}</span>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                {c.title}
              </h3>
            </div>
            
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
              {c.value}
            </div>
            
            {c.description && (
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                {c.description}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#3b82f6' 
            }}>
              <span>Ver más</span>
              <span style={{ marginLeft: '0.5rem' }}>→</span>
            </div>

            {/* Barra de color inferior */}
            <div
              style={{
                height: '4px',
                width: '100%',
                borderRadius: '0 0 0.75rem 0.75rem',
                margin: '1rem -1.5rem -1.5rem -1.5rem',
                background: c.tone === 'danger' ? '#ef4444' :
                           c.tone === 'warning' ? '#f59e0b' :
                           c.tone === 'success' ? '#10b981' : '#6b7280'
              }}
            />
          </Link>
        ))}
      </div>

      {/* Sección de resumen adicional */}
      {estadisticas && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
            Resumen del Sistema
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                Equipos por Tipo
              </h4>
              <div style={{ fontSize: '0.875rem' }}>
                <div>PC: {estadisticas.equipos.porTipo.PC}</div>
                <div>Notebook: {estadisticas.equipos.porTipo.NOTEBOOK}</div>
                <div>Servidor: {estadisticas.equipos.porTipo.SERVIDOR}</div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                Estado de Mantenimientos
              </h4>
              <div style={{ fontSize: '0.875rem' }}>
                <div>Programados: {estadisticas.mantenimientos.programados}</div>
                <div>En Progreso: {estadisticas.mantenimientos.enProgreso}</div>
                <div>Completos: {estadisticas.mantenimientos.completos}</div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                Usuarios por Rol
              </h4>
              <div style={{ fontSize: '0.875rem' }}>
                <div>Administradores: {estadisticas.usuarios.porRol.administrador}</div>
                <div>Técnicos: {estadisticas.usuarios.porRol.tecnico}</div>
                <div>Consulta: {estadisticas.usuarios.porRol.consulta}</div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                Estado de Equipos
              </h4>
              <div style={{ fontSize: '0.875rem' }}>
                <div>Activos: {estadisticas.equipos.activos}</div>
                <div>En Reparación: {estadisticas.equipos.enReparacion}</div>
                <div>De Baja: {estadisticas.equipos.deBaja}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
