import { Link } from 'react-router-dom';
import { useEquiposList } from '../../core/hooks/useEquipos';
import { useGarantias } from '../../core/hooks/useAlertas';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { data: equiposPage } = useEquiposList({ page: 1, limit: 1 });
  const totalEquipos = equiposPage?.total || 0;

  const { data: garantias } = useGarantias(30);
  const garantiasVencidas = garantias?.vencidas?.total || 0;
  const garantiasProximas = garantias?.proximas?.total || 0;

  const cards = useMemo(() => ([
    { title: 'Equipos totales', value: totalEquipos, to: '/equipos' },
    { title: 'Garantías: vencidas', value: garantiasVencidas, to: '/alertas' },
    { title: 'Garantías: próximas 30d', value: garantiasProximas, to: '/alertas' },
  ]), [totalEquipos, garantiasVencidas, garantiasProximas]);

  return (
    <div className="grid grid-3">
      {cards.map((c) => (
        <Link to={c.to} key={c.title} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>{c.title}</h3>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</div>
          <small>ver más →</small>
        </Link>
      ))}
    </div>
  );
}
