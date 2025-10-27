import { useState } from 'react';
import { useEquiposList } from '../../core/hooks/useEquipos';

export default function EquiposListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useEquiposList({ page, limit: 10, search });

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <h3>Equipos</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Buscar por código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setPage(1)}>Buscar</button>
        </div>
      </div>

      <div className="card">
        {isLoading ? 'Cargando…' : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Área</th>
                  <th>Asignado a</th>
                  <th>Garantía</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map((eq) => (
                  <tr key={String(eq.id)}>
                    <td>{eq.codigoInterno}</td>
                    <td><span className="badge">{eq.tipo}</span></td>
                    <td><span className="badge">{eq.estado}</span></td>
                    <td>{eq.area?.nombre || '-'}</td>
                    <td>{eq.empleadoAsignado ? `${eq.empleadoAsignado.nombre} ${eq.empleadoAsignado.apellido}` : '-'}</td>
                    <td>{eq.garantia || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
              <button disabled={(data?.page || 1) === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
              <span>Página {data?.page || 1}</span>
              <button
                disabled={(data?.page || 1) * (data?.limit || 10) >= (data?.total || 0)}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
