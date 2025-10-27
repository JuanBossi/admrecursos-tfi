import { useGarantias } from '../../core/hooks/useAlertas';

export default function AlertasListPage() {
  const { data, isLoading } = useGarantias(30);
  if (isLoading) return <div className="card">Cargando…</div>;
  if (!data) return <div className="card">Sin datos</div>;

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <h3>Garantías</h3>
        <p>Rango: {data?.rango?.desde} → {data?.rango?.hasta}</p>
        <div style={{ display:'flex', gap:12 }}>
          <div className="card"><b>Vencidas</b><div style={{ fontSize:22 }}>{data?.vencidas?.total || 0}</div></div>
          <div className="card"><b>Próximas (30d)</b><div style={{ fontSize:22 }}>{data?.proximas?.total || 0}</div></div>
        </div>
      </div>

      <div className="card">
        <h4>Detalle (vencidas + próximas)</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th><th>Área</th><th>Asignado</th><th>Garantía</th>
            </tr>
          </thead>
          <tbody>
            {[
              ...(data?.vencidas?.items || []),
              ...(data?.proximas?.items || []),
            ].map((eq, idx) => (
              <tr key={eq?.id ?? idx}>
                <td>{eq?.codigoInterno || '-'}</td>
                <td>{eq?.area?.nombre || '-'}</td>
                <td>{eq?.empleadoAsignado ? `${eq.empleadoAsignado.nombre} ${eq.empleadoAsignado.apellido}` : '-'}</td>
                <td>{eq?.garantia || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
