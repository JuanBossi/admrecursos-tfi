import { useState } from 'react';
import {
  usePerifericosList,
  usePerifericoCreate,
  usePerifericoUpdate,
  usePerifericoDelete,
  useTiposPeriferico,
  useMarcas,
  useEquiposForSelect,
} from '../../core/hooks/usePerifericos';

function estadoBadgeClasses(estado) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  switch ((estado || '').toUpperCase()) {
    case 'ACTIVO': return `${base} bg-emerald-100 text-emerald-700`;
    case 'REPARACION': return `${base} bg-amber-100 text-amber-700`;
    case 'BAJA': return `${base} bg-rose-100 text-rose-700`;
    default: return `${base} bg-slate-100 text-slate-700`;
  }
}
const badgeNeutral = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700';

export default function PerifericosListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const { data, isLoading, error } = usePerifericosList({
    page, limit: 10, search,
    estado: estado || undefined,
    tipoId: tipoId || undefined,
    marcaId: marcaId || undefined,
    equipoId: equipoId || undefined,
  });
  const { data: tipos } = useTiposPeriferico();
  const { data: marcas } = useMarcas();
  const { data: equipos } = useEquiposForSelect();
  const deleteMutation = usePerifericoDelete();

  const handleEdit = (periferico) => {
    setEditando(periferico);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este periférico?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al eliminar periférico:', error);
      }
    }
  };

  const handleAsignarEquipo = (periferico) => {
    setEditando(periferico);
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Periféricos</h1>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          + Agregar periférico
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Buscar por modelo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
          />
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
          >
            <option value="">Estado (todos)</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="REPARACION">REPARACION</option>
            <option value="BAJA">BAJA</option>
          </select>
          <select
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
          >
            <option value="">Tipo (todos)</option>
            {(tipos || []).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <select
            value={marcaId}
            onChange={(e) => setMarcaId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
          >
            <option value="">Marca (todas)</option>
            {(marcas || []).map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          <select
            value={equipoId}
            onChange={(e) => setEquipoId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
          >
            <option value="">Equipo (todos)</option>
            {(equipos || []).map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
          </select>
          <button
            onClick={() => setPage(1)}
            className="ml-1 inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm">
        {isLoading ? (
          <div className="p-6 text-center text-slate-500">Cargando…</div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600">{error.message}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600">
                    {['ID','Modelo','Tipo','Marca','Estado','Equipo','Especificaciones','Acciones'].map(h => (
                      <th key={h} className="sticky top-0 z-10 border-b border-slate-200 px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.items || []).map((p, idx) => (
                    <tr key={String(p.id)} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{p.id}</td>
                      <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-800">{p.modelo || '-'}</td>
                      <td className="border-b border-slate-100 px-4 py-3 align-top">
                        <span className={badgeNeutral}>{p?.tipo?.nombre || '-'}</span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{p?.marca?.nombre || '-'}</td>
                      <td className="border-b border-slate-100 px-4 py-3 align-top">
                        <span className={estadoBadgeClasses(p.estado)}>{p.estado || '-'}</span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{p?.equipo?.codigoInterno || '-'}</td>
                      <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">
                        <div className="max-w-[26rem] truncate">{p.especificaciones || '-'}</div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3 align-top">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          {!p.equipo && (
                            <button
                              onClick={() => handleAsignarEquipo(p)}
                              className="inline-flex items-center rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-100"
                            >
                              Asignar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="inline-flex items-center rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 shadow-sm hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                disabled={(data?.page || 1) === 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600">Página {data?.page || 1}</span>
              <button
                disabled={(data?.page || 1) * (data?.limit || 10) >= (data?.total || 0)}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>

      {open && (
        <PerifericoModal
          onClose={() => {
            setOpen(false);
            setEditando(null);
          }}
          periferico={editando}
          tipos={tipos || []}
          marcas={marcas || []}
          equipos={equipos || []}
        />
      )}
    </div>
  );
}

/** Modal */
function PerifericoModal({ onClose, periferico, tipos, marcas, equipos }) {
  const createMut = usePerifericoCreate();
  const updateMut = usePerifericoUpdate();
  const [form, setForm] = useState({
    tipoId: periferico?.tipo?.id || '',
    equipoId: periferico?.equipo?.id || '',
    marcaId: periferico?.marca?.id || '',
    modelo: periferico?.modelo || '',
    estado: periferico?.estado || 'ACTIVO',
    especificaciones: periferico?.especificaciones || '',
  });
  const [error, setError] = useState('');

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.tipoId) { setError('El tipo es obligatorio'); return; }
    try {
      const payload = {
        tipoId: String(form.tipoId),
        equipoId: form.equipoId ? String(form.equipoId) : undefined,
        marcaId: form.marcaId ? String(form.marcaId) : undefined,
        modelo: form.modelo || undefined,
        estado: form.estado || 'ACTIVO',
        especificaciones: form.especificaciones || undefined,
      };

      if (periferico) {
        await updateMut.mutateAsync({ id: periferico.id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || `No se pudo ${periferico ? 'actualizar' : 'crear'} el periférico`;
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            {periferico ? 'Editar periférico' : 'Nuevo periférico'}
          </h3>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50" aria-label="Cerrar">✕</button>
        </div>

        {error && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Tipo *</span>
            <select name="tipoId" value={form.tipoId} onChange={onChange} required className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30">
              <option value="">Seleccionar…</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Marca</span>
            <select name="marcaId" value={form.marcaId} onChange={onChange} className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30">
              <option value="">(opcional)</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Equipo</span>
            <select name="equipoId" value={form.equipoId} onChange={onChange} className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30">
              <option value="">(sin asignar)</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Modelo</span>
            <input name="modelo" value={form.modelo} onChange={onChange} placeholder="Ej: Kingston Fury 16GB" className="rounded-lg border border-slate-300 px-3 py-2 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30" />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Estado</span>
            <select name="estado" value={form.estado} onChange={onChange} className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30">
              <option value="ACTIVO">ACTIVO</option>
              <option value="REPARACION">REPARACION</option>
              <option value="BAJA">BAJA</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Especificaciones (texto)</span>
            <textarea name="especificaciones" rows={4} value={form.especificaciones} onChange={onChange} placeholder="Ej: DDR4 3200MHz 16GB CL16" className="resize-y rounded-lg border border-slate-300 px-3 py-2 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30" />
          </label>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {(createMut.isPending || updateMut.isPending) ? 'Guardando…' : (periferico ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
