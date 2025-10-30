import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMantenimientosList, useMantenimientoCreate } from '../../core/hooks/useMantenimientos';
import { useEquiposForSelect } from '../../core/hooks/usePerifericos';
import { updateMantenimiento } from '../../core/api/mantenimientos.api';
import { updateEquipo, darDeBajaEquipo } from '../../core/api/equipos.api';

export default function MantenimientosListPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [equipoId, setEquipoId] = useState('');
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ equipoId: '', fecha: '', tipo: 'PREVENTIVO', descripcion: '' });

  const { data: equipos } = useEquiposForSelect();
  const { data, isLoading, error } = useMantenimientosList({ page, limit, equipoId: equipoId || undefined, estado: estado || undefined, search: search || undefined });

  const items = data?.items || [];
  const total = data?.total || 0;
  const pageSize = data?.limit || limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const qc = useQueryClient();
  const createMut = useMantenimientoCreate();
  const updateMantMut = useMutation({ mutationFn: ({ id, data }) => updateMantenimiento(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['mantenimientos'] }) });
  const updateEquipoMut = useMutation({ mutationFn: ({ id, data }) => updateEquipo(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['equipos'] }) });
  const bajaEquipoMut = useMutation({ mutationFn: ({ id, motivo }) => darDeBajaEquipo(id, motivo), onSuccess: () => qc.invalidateQueries({ queryKey: ['equipos'] }) });

  async function handleEmpezar(m) {
    await updateMantMut.mutateAsync({ id: m.id, data: { estado: 'EN PROGRESO', fecha_inicio: new Date().toISOString() } });
    if (m?.equipo?.id) await updateEquipoMut.mutateAsync({ id: m.equipo.id, data: { estado: 'REPARACION' } });
  }
  async function handleCancelar(m) {
    if (m.estado !== 'PROGRAMADO') return;
    await updateMantMut.mutateAsync({ id: m.id, data: { estado: 'CANCELADO' } });
  }

  const [completarModal, setCompletarModal] = useState({ open: false, mant: null, decision: 'ACTIVO', motivo: '' });
  function handleCompletar(m) { setCompletarModal({ open: true, mant: m, decision: 'ACTIVO', motivo: '' }); }
  async function confirmarCompletar() {
    const m = completarModal.mant; if (!m) return;
    await updateMantMut.mutateAsync({ id: m.id, data: { estado: 'COMPLETO', fecha_fin: new Date().toISOString() } });
    if (m?.equipo?.id) {
      if (completarModal.decision === 'BAJA') {
        const motivo = completarModal.motivo.trim() || 'Baja por mantenimiento';
        await bajaEquipoMut.mutateAsync({ id: m.equipo.id, motivo });
      } else {
        await updateEquipoMut.mutateAsync({ id: m.equipo.id, data: { estado: 'ACTIVO' } });
      }
    }
    setCompletarModal({ open: false, mant: null, decision: 'ACTIVO', motivo: '' });
  }

  async function onSubmitCrear(e) {
    e.preventDefault();
    await createMut.mutateAsync({ equipo_id: Number(form.equipoId), fecha_programada: form.fecha, tipo: form.tipo === 'PREVENTIVO' ? 'Preventivo' : 'Correctivo', descripcion: form.descripcion });
    setShowCreate(false);
    setForm({ equipoId: '', fecha: '', tipo: 'PREVENTIVO', descripcion: '' });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Gestion de Mantenimientos</h1>
        <button onClick={() => setShowCreate(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>+ Programar</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar (descripcion, equipo, tecnico)" style={{ width: 220, border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 14 }} />
        <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', background: 'white' }}>
          <option value="">Equipo (todos)</option>
          {(equipos || []).map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', background: 'white' }}>
          <option value="">Estado (todos)</option>
          <option value="PROGRAMADO">PROGRAMADO</option>
          <option value="EN PROGRESO">EN PROGRESO</option>
          <option value="COMPLETO">COMPLETO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
        <button onClick={() => setPage(1)} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Filtrar</button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
          <span>Mostrar por pagina</span>
          <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 8px', background: 'white' }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: '0.5rem', padding: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>Total: {total}</h3>
        </div>
        {isLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#b91c1c' }}>{error.message}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No se encontraron mantenimientos con los filtros aplicados</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th>ID</th>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Descripcion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m, idx) => (
                  <tr key={m.id} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td>{m.id}</td>
                    <td>{m?.equipo?.codigoInterno || '-'}</td>
                    <td>{m.tipo}</td>
                    <td>
                      <span style={{ background: m.estado === 'COMPLETO' ? '#dcfce7' : m.estado === 'EN PROGRESO' ? '#dbeafe' : m.estado === 'PROGRAMADO' ? '#fef3c7' : '#fee2e2', color: m.estado === 'COMPLETO' ? '#166534' : m.estado === 'EN PROGRESO' ? '#1e40af' : m.estado === 'PROGRAMADO' ? '#92400e' : '#991b1b', borderRadius: '0.25rem', padding: '0.125rem 0.5rem', fontSize: '0.75rem' }}>{m.estado}</span>
                    </td>
                    <td>{m.fecha_programada ? new Date(m.fecha_programada).toLocaleDateString() : '-'}</td>
                    <td>{m.descripcion || '-'}</td>
                    <td>
                      {m.estado === 'PROGRAMADO' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEmpezar(m)} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Empezar</button>
                          <button onClick={() => handleCancelar(m)} style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                      )}
                      {m.estado === 'EN PROGRESO' && (
                        <button onClick={() => handleCompletar(m)} style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Completar</button>
                      )}
                      {(m.estado === 'COMPLETO' || m.estado === 'CANCELADO') && (
                        <span style={{ color: '#64748b', fontSize: 12 }}>Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginacion */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem', border: '1px solid #d1d5db', background: page === 1 ? '#f9fafb' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', borderRadius: '0.25rem' }}>Anterior</button>
          <span style={{ padding: '0 1rem', color: '#6b7280' }}>Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.5rem', border: '1px solid #d1d5db', background: page === totalPages ? '#f9fafb' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', borderRadius: '0.25rem' }}>Siguiente</button>
        </div>
      )}

      {/* Modal crear */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowCreate(false)}>
          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Programar mantenimiento</h3>
              <button onClick={() => setShowCreate(false)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, width: 32, height: 32 }}>×</button>
            </div>
            <form onSubmit={onSubmitCrear} style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                <span>Equipo *</span>
                <select required value={form.equipoId} onChange={(e) => setForm(f => ({ ...f, equipoId: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
                  <option value="">Seleccionar…</option>
                  {(equipos || []).map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                <span>Fecha *</span>
                <input type="date" required value={form.fecha} onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                <span>Tipo</span>
                <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
                  <option value="PREVENTIVO">PREVENTIVO</option>
                  <option value="CORRECTIVO">CORRECTIVO</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                <span>Descripcion</span>
                <textarea rows={3} required value={form.descripcion} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', resize: 'vertical' }} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Cancelar</button>
                <button type="submit" disabled={createMut.isPending} style={{ border: 'none', background: '#3b82f6', color: 'white', borderRadius: 6, padding: '6px 10px', opacity: createMut.isPending ? 0.6 : 1 }}>{createMut.isPending ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal completar */}
      {completarModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setCompletarModal({ open: false, mant: null, decision: 'ACTIVO', motivo: '' })}>
          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1rem', width: '90%', maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Completar mantenimiento #{completarModal.mant?.id}</h3>
            <p style={{ color: '#6b7280', marginTop: 0 }}>Elegir que hacer con el equipo luego de completar:</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setCompletarModal(s => ({ ...s, decision: 'ACTIVO' }))} style={{ background: completarModal.decision === 'ACTIVO' ? '#dcfce7' : '#f3f4f6', border: '1px solid ' + (completarModal.decision === 'ACTIVO' ? '#bbf7d0' : '#d1d5db'), color: completarModal.decision === 'ACTIVO' ? '#166534' : '#111827', padding: '0.5rem 0.75rem', borderRadius: 8, cursor: 'pointer' }}>Dejar ACTIVO</button>
              <button onClick={() => setCompletarModal(s => ({ ...s, decision: 'BAJA' }))} style={{ background: completarModal.decision === 'BAJA' ? '#fff7ed' : '#f3f4f6', border: '1px solid ' + (completarModal.decision === 'BAJA' ? '#fed7aa' : '#d1d5db'), color: completarModal.decision === 'BAJA' ? '#9a3412' : '#111827', padding: '0.5rem 0.75rem', borderRadius: 8, cursor: 'pointer' }}>Dar de BAJA</button>
            </div>
            {completarModal.decision === 'BAJA' && (
              <label style={{ display: 'grid', gap: 6, fontSize: 14, marginTop: 12 }}>
                <span>Motivo de baja</span>
                <input value={completarModal.motivo} onChange={(e) => setCompletarModal(s => ({ ...s, motivo: e.target.value }))} placeholder="Ej: falla irreparable, obsolescencia, robo…" style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px' }} />
              </label>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setCompletarModal({ open: false, mant: null, decision: 'ACTIVO', motivo: '' })} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Cancelar</button>
              <button disabled={updateMantMut.isPending || updateEquipoMut.isPending || bajaEquipoMut.isPending || (completarModal.decision === 'BAJA' && !completarModal.motivo.trim())} onClick={confirmarCompletar} style={{ border: 'none', background: '#3b82f6', color: 'white', borderRadius: 6, padding: '6px 10px', opacity: (updateMantMut.isPending || updateEquipoMut.isPending || bajaEquipoMut.isPending || (completarModal.decision === 'BAJA' && !completarModal.motivo.trim())) ? 0.6 : 1, cursor: 'pointer' }}>{updateMantMut.isPending || updateEquipoMut.isPending || bajaEquipoMut.isPending ? 'Aplicando…' : 'Confirmar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

