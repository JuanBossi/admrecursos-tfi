import { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHistorialPorEquipo } from '../../core/hooks/useHistorialCambios';
import { useAuth } from '../../core/auth/AuthContext';

export default function HistorialEquipoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.some(r => r?.nombre === 'Administrador');
  const isTecnico = !!user?.roles?.some(r => r?.nombre === 'Tecnico');
  useEffect(() => {
    if (!isAdmin && !isTecnico) navigate('/equipos', { replace: true });
  }, [isAdmin, isTecnico, navigate]);
  const { data, isLoading, error } = useHistorialPorEquipo(id);

  const rows = useMemo(() => Array.isArray(data) ? data : [], [data]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Historial de cambios — Equipo {id}</h2>
        <button onClick={() => navigate('/equipos')} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Volver</button>
      </div>

      {isLoading ? (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Cargando…</div>
      ) : error ? (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#b91c1c' }}>{error?.message || 'Error al cargar historial'}</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Sin registros de historial</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Motivo</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id}>
                  <td>{h.fecha ? new Date(h.fecha).toLocaleString() : '-'}</td>
                  <td>{h.accion || '-'}</td>
                  <td>{h.motivo || '-'}</td>
                  <td>{h.usuario ? (h.usuario.username || h.usuario.email || h.usuario.id) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
