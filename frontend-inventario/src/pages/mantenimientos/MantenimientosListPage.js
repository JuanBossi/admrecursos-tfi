import { useState } from 'react';
import { useMantenimientosList, useMantenimientoCreate } from '../../core/hooks/useMantenimientos';
import { useEquiposForSelect } from '../../core/hooks/usePerifericos';

export default function MantenimientosListPage() {
  const [page, setPage] = useState(1);
  const [equipoId, setEquipoId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ equipoId: '', fecha: '', tipo: 'PREVENTIVO', descripcion: '' });
  const { data, isLoading, error } = useMantenimientosList({ page, limit: 10, equipoId: equipoId || undefined });
  const { data: equipos } = useEquiposForSelect();
  const createMut = useMantenimientoCreate();

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
                {['ID','Equipo','Tipo','Fecha','Descripción'].map(h => (
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
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{m.fecha_programada ? new Date(m.fecha_programada).toLocaleDateString() : '-'}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{m.descripcion || '-'}</td>
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
    </div>
  );
}

