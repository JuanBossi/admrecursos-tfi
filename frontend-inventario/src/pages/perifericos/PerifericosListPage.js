import { useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  usePerifericosList,
  usePerifericoCreate,
  usePerifericoUpdate,
  usePerifericoDelete,
  useTiposPeriferico,
  useMarcas,
  useEquiposForSelect,
} from '../../core/hooks/usePerifericos';
import { exportToCSV, exportToPrintablePDF } from '../../utils/export';

export default function PerifericosListPage() {
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.some(r => r?.nombre === 'Administrador');
  const isTecnico = !!user?.roles?.some(r => r?.nombre === 'Tecnico');
  const canAdd = isAdmin || isTecnico;
  const canManage = canAdd; // Empleado solo lectura
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  // Estado filtrado eliminado del listado
  const [tipoId, setTipoId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const { data, isLoading, error } = usePerifericosList({ page, limit, search, tipoId: tipoId || undefined, marcaId: marcaId || undefined, equipoId: equipoId || undefined });
  const { data: tipos } = useTiposPeriferico();
  const { data: marcas } = useMarcas();
  const { data: equipos } = useEquiposForSelect();
  const deleteMutation = usePerifericoDelete();

  const items = data?.items || [];
  const total = data?.total || 0;
  const pageSize = data?.limit || limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function formatEspecificaciones(raw) {
    if (!raw) return '-';
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        const label = (k) => String(k).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return Object.entries(obj)
          .map(([k, v]) => `${label(k)}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
          .join(' · ');
      }
    } catch (_) {}
    return String(raw);
  }

  const handleEdit = (periferico) => { setEditando(periferico); setOpen(true); };
  const handleDelete = async (periferico) => {
    const nombre = periferico?.modelo || periferico?.tipo?.nombre || 'periferico';
    if (window.confirm(`Eliminar ${nombre}? Esta acción no se puede deshacer.`)) {
      try { await deleteMutation.mutateAsync(periferico.id); } catch (err) { console.error('Error al eliminar periferico:', err); }
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Gestion de Perifericos</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = [
                { key: 'id', label: 'ID' },
                { key: 'modelo', label: 'Modelo' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'marca', label: 'Marca' },
                { key: 'equipo', label: 'Equipo' },
                { key: 'especificaciones', label: 'Especificaciones' },
              ];
              const rows = (items || []).map(p => ({
                id: p?.id ?? '',
                modelo: p?.modelo || '',
                tipo: p?.tipo?.nombre || '',
                marca: p?.marca?.nombre || '',
                equipo: p?.equipo?.codigoInterno || '',
                especificaciones: (() => {
                  const raw = p?.especificaciones;
                  try {
                    if (!raw) return '';
                    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                      const label = (k) => String(k).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                      return Object.entries(obj).map(([k, v]) => `${label(k)}: ${Array.isArray(v) ? v.join(', ') : String(v)}`).join(' | ');
                    }
                  } catch(_){}
                  return String(raw || '');
                })(),
              }));
              exportToCSV('perifericos', headers, rows);
            }}
            style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: '0.375rem', padding: '6px 10px', cursor: 'pointer' }}
          >Exportar Excel</button>
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = [
                { key: 'id', label: 'ID' },
                { key: 'modelo', label: 'Modelo' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'marca', label: 'Marca' },
                { key: 'equipo', label: 'Equipo' },
                { key: 'especificaciones', label: 'Especificaciones' },
              ];
              const rows = (items || []).map(p => ({
                id: p?.id ?? '',
                modelo: p?.modelo || '',
                tipo: p?.tipo?.nombre || '',
                marca: p?.marca?.nombre || '',
                equipo: p?.equipo?.codigoInterno || '',
                especificaciones: (() => {
                  const raw = p?.especificaciones;
                  try {
                    if (!raw) return '';
                    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                      const label = (k) => String(k).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                      return Object.entries(obj).map(([k, v]) => `${label(k)}: ${Array.isArray(v) ? v.join(', ') : String(v)}`).join(' | ');
                    }
                  } catch(_){}
                  return String(raw || '');
                })(),
              }));
              exportToPrintablePDF('Listado de Periféricos', headers, rows);
            }}
          >Exportar PDF</button>
          {canAdd && (
            <button onClick={() => { setEditando(null); setOpen(true); }} className="btn btn-primary">+ Agregar periferico</button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Filtros</h3>
        <div className="filters-grid">
          <div>
            <label className="form-label">Buscar</label>
            <input placeholder="Modelo, marca..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" />
          </div>
          <div>
            <label className="form-label">Tipo</label>
            <select value={tipoId} onChange={(e) => setTipoId(e.target.value)} className="select">
              <option value="">Todos</option>
              {(tipos || []).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Marca</label>
            <select value={marcaId} onChange={(e) => setMarcaId(e.target.value)} className="select">
              <option value="">Todas</option>
              {(marcas || []).map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Equipo</label>
            <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} className="select">
              <option value="">Todos</option>
              {(equipos || []).map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Mostrar por página</label>
            <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} className="select">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: '0.5rem', padding: '0.5rem' }}>
        {isLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#b91c1c' }}>{error.message}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No se encontraron perifericos</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Modelo</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Equipo</th>
                  <th>Especificaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, idx) => (
                  <tr key={p.id} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td>{p.id}</td>
                    <td>{p.modelo || '-'}</td>
                    <td><span style={{ background: '#f1f5f9', color: '#334155', borderRadius: '0.25rem', padding: '0.125rem 0.5rem', fontSize: '0.75rem' }}>{p?.tipo?.nombre || '-'}</span></td>
                    <td>{p?.marca?.nombre || '-'}</td>
                    <td>{p?.equipo?.codigoInterno || '-'}</td>
                    <td><div style={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatEspecificaciones(p.especificaciones)}</div></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {canManage && (
                          <button onClick={() => handleEdit(p)} className="btn btn-neutral btn-sm">Editar</button>
                        )}
                        {canManage && !p.equipo && (
                          <button onClick={() => handleEdit(p)} className="btn btn-info-soft btn-sm">Asignar</button>
                        )}
                        {canManage && (
                          <button onClick={() => handleDelete(p)} className="btn btn-danger-soft btn-sm">Eliminar</button>
                        )}
                      </div>
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
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={(data?.page || 1) === 1} className="btn btn-outline">Anterior</button>
          <span className="page-info">Página {data?.page || 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(data?.page || 1) * (data?.limit || pageSize) >= (data?.total || total)} className="btn btn-outline">Siguiente</button>
        </div>
      )}

      {open && (
        <PerifericoModal
          onClose={() => { setOpen(false); setEditando(null); }}
          periferico={editando}
          tipos={tipos || []}
          marcas={marcas || []}
          equipos={equipos || []}
        />
      )}
    </div>
  );
}

function PerifericoModal({ onClose, periferico, tipos, marcas, equipos }) {
  const createMut = usePerifericoCreate();
  const updateMut = usePerifericoUpdate();
  const [form, setForm] = useState({
    tipoId: periferico?.tipo?.id || '',
    equipoId: periferico?.equipo?.id || '',
    marcaId: periferico?.marca?.id || '',
    modelo: periferico?.modelo || '',
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
        especificaciones: form.especificaciones || undefined,
      };
      if (periferico) await updateMut.mutateAsync({ id: periferico.id, data: payload });
      else await createMut.mutateAsync(payload);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || `No se pudo ${periferico ? 'actualizar' : 'crear'} el periferico`;
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.25rem', width: '90%', maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{periferico ? 'Editar periferico' : 'Nuevo periferico'}</h3>
          <button type="button" onClick={onClose} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, width: 32, height: 32 }}>×</button>
        </div>
        {error && <div style={{ marginBottom: 12, border: '1px solid #fecaca', background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}>{error}</div>}
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Tipo *</span>
            <select name="tipoId" value={form.tipoId} onChange={onChange} required style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="">Seleccionar…</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Marca</span>
            <select name="marcaId" value={form.marcaId} onChange={onChange} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="">(opcional)</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Equipo</span>
            <select name="equipoId" value={form.equipoId} onChange={onChange} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="">(sin asignar)</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.codigoInterno}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Modelo</span>
            <input name="modelo" value={form.modelo} onChange={onChange} placeholder="Ej: Kingston Fury 16GB" style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
          </label>
          
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Especificaciones (texto)</span>
            <textarea name="especificaciones" rows={4} value={form.especificaciones} onChange={onChange} placeholder="Ej: DDR4 3200MHz 16GB CL16" style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', resize: 'vertical' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn btn-primary">{(createMut.isPending || updateMut.isPending) ? 'Guardando…' : (periferico ? 'Actualizar' : 'Guardar')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
