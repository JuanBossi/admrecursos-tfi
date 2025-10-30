import { useState } from 'react';
import { useMantenimientosList, useMantenimientoCreate } from '../../core/hooks/useMantenimientos';
import { useEquiposForSelect } from '../../core/hooks/usePerifericos';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMantenimiento } from '../../core/api/mantenimientos.api';
import { updateEquipo, darDeBajaEquipo } from '../../core/api/equipos.api';

export default function MantenimientosListPage() {
  const [page, setPage] = useState(1);
  const [equipoId, setEquipoId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ equipoId: '', fecha: '', tipo: 'PREVENTIVO', descripcion: '' });
  const { data, isLoading, error } = useMantenimientosList({ page, limit: 10, equipoId: equipoId || undefined });
  const { data: equipos } = useEquiposForSelect();
  const createMut = useMantenimientoCreate();
  const qc = useQueryClient();

  const updateMantMut = useMutation({
    mutationFn: ({ id, data }) => updateMantenimiento(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mantenimientos'] }),
  });
  const updateEquipoMut = useMutation({
    mutationFn: ({ id, data }) => updateEquipo(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipos'] }),
  });
  const bajaEquipoMut = useMutation({
    mutationFn: ({ id, motivo }) => darDeBajaEquipo(id, motivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipos'] }),
  });

  async function handleEmpezar(m) {
    await updateMantMut.mutateAsync({ id: m.id, data: { estado: 'EN PROGRESO', fecha_inicio: new Date().toISOString() } });
    if (m?.equipo?.id) {
      await updateEquipoMut.mutateAsync({ id: m.equipo.id, data: { estado: 'REPARACION' } });
    }
  }

  async function handleCancelar(m) {
    if (m.estado !== 'PROGRAMADO') return;
    await updateMantMut.mutateAsync({ id: m.id, data: { estado: 'CANCELADO' } });
  }

  const [completarModal, setCompletarModal] = useState({ open: false, mant: null, decision: 'ACTIVO', motivo: '' });

  function handleCompletar(m) {
    setCompletarModal({ open: true, mant: m, decision: 'ACTIVO', motivo: '' });
  }

  async function confirmarCompletar() {
    const m = completarModal.mant;
    if (!m) return;
    try {
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
    } catch (err) {
      // noop; visible en consola
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMut.mutateAsync({
        equipo_id: Number(form.equipoId),
        fecha_programada: form.fecha,
        tipo: form.tipo === 'PREVENTIVO' ? 'Preventivo' : 'Correctivo',
        descripcion: form.descripcion,
      });
      setOpen(false);
      setForm({ equipoId: '', fecha: '', tipo: 'PREVENTIVO', descripcion: '' });
    } catch (err) {
      // errores visibles en red/consola
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Mantenimientos</h1>
        <button onClick={() => setOpen(true)} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">+ Programar</button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
          <option value="">Equipo (todos)</option>
          {(equipos || []).map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
        </select>
        <button onClick={() => setPage(1)} className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">Filtrar</button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm">
        {isLoading ? (
          <div className="p-6 text-center text-slate-500">Cargando…</div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600">{error.message}</div>
        ) : (
          <table className="min-w-full table-auto border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                {['ID','Equipo','Tipo','Estado','Fecha','Descripción','Acciones'].map(h => (
                  <th key={h} className="sticky top-0 z-10 border-b border-slate-200 px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((m, idx) => (
                <tr key={String(m.id)} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{m.id}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{m?.equipo?.codigoInterno || '-'}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{m.tipo}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top">
                    <span style={{
                      background: m.estado === 'COMPLETO' ? '#dcfce7' :
                                  m.estado === 'EN PROGRESO' ? '#dbeafe' :
                                  m.estado === 'PROGRAMADO' ? '#fef3c7' :
                                  '#fee2e2',
                      color: m.estado === 'COMPLETO' ? '#166534' :
                             m.estado === 'EN PROGRESO' ? '#1e40af' :
                             m.estado === 'PROGRAMADO' ? '#92400e' :
                             '#991b1b',
                      borderRadius: '0.25rem',
                      padding: '0.125rem 0.5rem',
                      fontSize: '0.75rem',
                    }}>
                      {m.estado}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{m.fecha_programada ? new Date(m.fecha_programada).toLocaleDateString() : '-'}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{m.descripcion || '-'}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">
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
                      <span className="text-slate-500 text-xs">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Programar mantenimiento</h3>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Equipo *</span>
                <select required value={form.equipoId} onChange={(e) => setForm(f => ({ ...f, equipoId: e.target.value }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm">
                  <option value="">Seleccionar…</option>
                  {(equipos || []).map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Fecha *</span>
                <input type="date" required value={form.fecha} onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 shadow-sm" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Tipo</span>
                <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm">
                  <option value="PREVENTIVO">PREVENTIVO</option>
                  <option value="CORRECTIVO">CORRECTIVO</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Descripción</span>
                <textarea required rows={3} value={form.descripcion} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} className="resize-y rounded-lg border border-slate-300 px-3 py-2 shadow-sm" />
              </label>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">Cancelar</button>
                <button type="submit" disabled={createMut.isPending} className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {createMut.isPending ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal completar: decidir estado del equipo */}
      {completarModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setCompletarModal({ open: false, mant: null, decision: 'ACTIVO', motivo: '' })}>
          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1rem', width: '90%', maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Completar mantenimiento #{completarModal.mant?.id}</h3>
            <p style={{ color: '#6b7280', marginTop: 0 }}>Elegí qué hacer con el equipo luego de completar:</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                onClick={() => setCompletarModal(s => ({ ...s, decision: 'ACTIVO' }))}
                style={{
                  background: completarModal.decision === 'ACTIVO' ? '#dcfce7' : '#f3f4f6',
                  border: '1px solid ' + (completarModal.decision === 'ACTIVO' ? '#bbf7d0' : '#d1d5db'),
                  color: completarModal.decision === 'ACTIVO' ? '#166534' : '#111827',
                  padding: '0.5rem 0.75rem', borderRadius: 8, cursor: 'pointer'
                }}
              >
                Dejar ACTIVO
              </button>
              <button
                onClick={() => setCompletarModal(s => ({ ...s, decision: 'BAJA' }))}
                style={{
                  background: completarModal.decision === 'BAJA' ? '#fff7ed' : '#f3f4f6',
                  border: '1px solid ' + (completarModal.decision === 'BAJA' ? '#fed7aa' : '#d1d5db'),
                  color: completarModal.decision === 'BAJA' ? '#9a3412' : '#111827',
                  padding: '0.5rem 0.75rem', borderRadius: 8, cursor: 'pointer'
                }}
              >
                Dar de BAJA
              </button>
            </div>

            {completarModal.decision === 'BAJA' && (
              <label style={{ display: 'grid', gap: 6, fontSize: 14, marginTop: 12 }}>
                <span>Motivo de baja</span>
                <input
                  value={completarModal.motivo}
                  onChange={(e) => setCompletarModal(s => ({ ...s, motivo: e.target.value }))}
                  placeholder="Ej: falla irreparable, obsolescencia, robo…"
                  style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px' }}
                />
              </label>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setCompletarModal({ open: false, mant: null, decision: 'ACTIVO', motivo: '' })}
                style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}
              >
                Cancelar
              </button>
              <button
                disabled={updateMantMut.isPending || updateEquipoMut.isPending || bajaEquipoMut.isPending || (completarModal.decision === 'BAJA' && !completarModal.motivo.trim())}
                onClick={confirmarCompletar}
                style={{
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: 6,
                  padding: '6px 10px',
                  opacity: (updateMantMut.isPending || updateEquipoMut.isPending || bajaEquipoMut.isPending || (completarModal.decision === 'BAJA' && !completarModal.motivo.trim())) ? 0.6 : 1,
                  cursor: 'pointer'
                }}
              >
                {updateMantMut.isPending || updateEquipoMut.isPending || bajaEquipoMut.isPending ? 'Aplicando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
