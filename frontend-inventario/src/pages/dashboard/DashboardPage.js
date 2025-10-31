// src/pages/dashboard/DashboardPage.js
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useEstadisticas } from '../../core/hooks/useEstadisticas';
import { useGarantiasPorVencer } from '../../core/hooks/useEquipos';
import { useMantenimientosProximos } from '../../core/hooks/useMantenimientos';

/** Utils */
const fmtDate = (val) => {
  if (!val) return '—';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const badgeClassesPorDias = (d) => {
  if (d <= 7) return 'bg-red-100 text-red-700 ring-1 ring-red-200';
  if (d <= 15) return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
  return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
};

export default function DashboardPage() {
  const location = useLocation();
  const { data: estadisticas, isLoading, error, refetch: refetchEst } = useEstadisticas();
  const {
    data: garantias,
    isLoading: guarLoading,
    error: guarError,
    dias: ventanaDias,
    refetch: refetchGarantias,
  } = useGarantiasPorVencer({ dias: 30 });
  const {
    data: proximos,
    isLoading: mantLoading,
    error: mantError,
    refetch: refetchProximos,
  } = useMantenimientosProximos({ dias: 30 });

  // Forzar refetch al entrar/navegar al Dashboard o al volver el foco
  useEffect(() => {
    if (location?.pathname === '/' || location?.pathname === '/dashboard') {
      try { refetchEst(); } catch {}
      try { refetchGarantias(); } catch {}
      try { refetchProximos(); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.key]);

  useEffect(() => {
    const onFocus = () => {
      if (location?.pathname === '/' || location?.pathname === '/dashboard') {
        try { refetchEst(); } catch {}
        try { refetchGarantias(); } catch {}
        try { refetchProximos(); } catch {}
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname]);

  const topCards = useMemo(() => {
    if (!estadisticas) return [];
    return [
      { title: 'Equipos totales', value: estadisticas.equipos?.total ?? 0, to: '/equipos', icon: '💻' },
      { title: 'Equipos activos', value: estadisticas.equipos?.activos ?? 0, to: '/equipos?estado=ACTIVO', icon: '✅' },
      { title: 'En reparación', value: estadisticas.equipos?.enReparacion ?? 0, to: '/equipos?estado=REPARACION', icon: '🔧' },
      {
        title: 'Alertas activas',
        value: estadisticas.alertas?.activas ?? estadisticas.alertas?.total ?? 0,
        to: '/alertas?estado=ACTIVA',
        icon: '⚠️',
        tone: (estadisticas.alertas?.activas ?? estadisticas.alertas?.total ?? 0) > 0 ? 'danger' : 'ok',
      },
    ];
  }, [estadisticas]);

  if (isLoading) {
    return (
      <div className="card">
        <div className="text-center py-8">Cargando estadísticas…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8 text-red-600">
          Error al cargar estadísticas: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Fila 1: Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {topCards.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{c.icon}</span>
              <h3 className="m-0 text-base font-semibold text-gray-700">{c.title}</h3>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">{c.value}</div>
            {c.desc && <p className="text-sm text-gray-500">{c.desc}</p>}
            <div className={`h-1.5 w-full rounded-b-xl mt-4 -mb-5 ${c.tone === 'danger' ? 'bg-red-500' : 'bg-blue-500'}`} />
          </Link>
        ))}
      </div>

      {/* Fila 2: Garantías por vencer (grande) + Mantenimientos próximos (derecha) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6 items-start">
        {/* Columna izquierda (2/3): Garantías */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Garantías por vencer <span className="text-gray-400">({ventanaDias} días)</span>
            </h2>
            <Link to="/equipos?garantia=por-vencer" className="text-sm font-medium text-blue-600 hover:underline">
              Ver todos →
            </Link>
          </div>

          {guarLoading && <div className="py-6 text-center">Cargando garantías…</div>}
          {guarError && <div className="py-6 text-center text-red-600">Error al cargar garantías: {guarError.message}</div>}

          {!guarLoading && !guarError && (
            <>
              {!garantias || garantias.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No hay garantías por vencer en {ventanaDias} días.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left font-medium px-4 py-3">Equipo</th>
                        <th className="text-left font-medium px-4 py-3">Vence</th>
                        <th className="text-right font-medium px-4 py-3">Días restantes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {garantias.map((g) => (
                        <tr key={g.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link to={`/equipos/${g.id}`} className="text-blue-700 hover:underline font-medium">
                              {g.nombre}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{fmtDate(g.venceEl)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClassesPorDias(g.diasRestantes)}`}>
                              {g.diasRestantes} días
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Columna derecha (1/3): Mantenimientos próximos */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Mantenimientos próximos</h2>
            <Link to="/mantenimientos?estado=programado" className="text-sm font-medium text-blue-600 hover:underline">
              Ver todos →
            </Link>
          </div>

          {mantLoading && <div className="py-6 text-center">Cargando mantenimientos…</div>}
          {mantError && <div className="py-6 text-center text-red-600">Error al cargar mantenimientos: {mantError.message}</div>}

          {!mantLoading && !mantError && (
            <>
              {!proximos || proximos.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No hay mantenimientos próximos.</div>
              ) : (
                <ul className="space-y-3">
                  {proximos.map((m) => (
                    <li key={m.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-gray-500">{fmtDate(m.fecha)}</div>
                          <div className="font-medium text-gray-800">
                            <Link to={`/equipos/${m.equipoId ?? ''}`} className="hover:underline text-blue-700">
                              {m.equipo}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-600">{m.detalle}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                          {m.tecnico ?? 'Sin técnico'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
