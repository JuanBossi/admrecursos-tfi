import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { useEquiposList, useEquipoCreate, useEquipoUpdate, useEquipoBaja, useAreas, useEmpleados, useProveedores } from '../../core/hooks/useEquipos';
import { useMantenimientosList } from '../../core/hooks/useMantenimientos';
import { usePerifericosList } from '../../core/hooks/usePerifericos';
import { exportToCSV, exportToPrintablePDF, formatDate } from '../../utils/export';

export default function EquiposListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.some(r => r?.nombre === 'Administrador');
  const isTecnico = !!user?.roles?.some(r => r?.nombre === 'Tecnico');
  const canAdd = isAdmin || isTecnico;
  const canManage = canAdd;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [areaId, setAreaId] = useState('');
  const [estado, setEstado] = useState('');
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrarPerifs, setMostrarPerifs] = useState({ open: false, equipo: null });
  const [mostrarMantenimientos, setMostrarMantenimientos] = useState({ open: false, equipo: null });
  const [bajaModal, setBajaModal] = useState({ open: false, equipo: null, motivo: '' });

  const { data, isLoading, error } = useEquiposList({ page, limit, search, areaId: areaId || undefined, estado: estado || undefined });
  const { data: areasData } = useAreas();
  const { data: empleadosData } = useEmpleados();
  const { data: proveedoresData } = useProveedores();
  const createMutation = useEquipoCreate();
  const updateMutation = useEquipoUpdate();
  const bajaMutation = useEquipoBaja();

  const items = data?.items || [];
  const total = data?.total || 0;
  const pageSize = data?.limit || limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleEdit = (equipo) => {
    setEditando(equipo);
    setOpen(true);
  };

  const handleDelete = async (equipo) => {
    if (equipo.estado === 'BAJA' || equipo.estado === 'REPARACION') {
      alert('No se puede dar de baja un equipo que ya está de baja o en reparación');
      return;
    }
    setBajaModal({ open: true, equipo, motivo: '' });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Gestión de Equipos</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = [
                { key: 'codigoInterno', label: 'Código Interno' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'area', label: 'Área' },
                { key: 'proveedor', label: 'Proveedor' },
                { key: 'asignado', label: 'Asignado a' },
                { key: 'estado', label: 'Estado' },
                { key: 'fechaCompra', label: 'Fecha Compra' },
                { key: 'garantia', label: 'Garantía' },
              ];
              const rows = (items || []).map(e => ({
                codigoInterno: e?.codigoInterno || '',
                tipo: e?.tipo || '',
                area: e?.area?.nombre || '',
                proveedor: e?.proveedor?.razonSocial || e?.proveedor?.nombre || e?.proveedor?.cuit || '',
                asignado: e?.empleadoAsignado ? `${e.empleadoAsignado.nombre || ''} ${e.empleadoAsignado.apellido || ''}`.trim() : '',
                estado: e?.estado || '',
                fechaCompra: formatDate(e?.fechaCompra),
                garantia: formatDate(e?.garantia),
              }));
              exportToCSV('equipos', headers, rows);
            }}
            style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: '0.375rem', padding: '6px 10px', cursor: 'pointer' }}
          >Exportar Excel</button>
          <button
            className="btn btn-outline"
            onClick={() => {
              const headers = [
                { key: 'codigoInterno', label: 'Código Interno' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'area', label: 'Área' },
                { key: 'proveedor', label: 'Proveedor' },
                { key: 'asignado', label: 'Asignado a' },
                { key: 'estado', label: 'Estado' },
                { key: 'fechaCompra', label: 'Fecha Compra' },
                { key: 'garantia', label: 'Garantía' },
              ];
              const rows = (items || []).map(e => ({
                codigoInterno: e?.codigoInterno || '',
                tipo: e?.tipo || '',
                area: e?.area?.nombre || '',
                proveedor: e?.proveedor?.razonSocial || e?.proveedor?.nombre || e?.proveedor?.cuit || '',
                asignado: e?.empleadoAsignado ? `${e.empleadoAsignado.nombre || ''} ${e.empleadoAsignado.apellido || ''}`.trim() : '',
                estado: e?.estado || '',
                fechaCompra: formatDate(e?.fechaCompra),
                garantia: formatDate(e?.garantia),
              }));
              exportToPrintablePDF('Listado de Equipos', headers, rows);
            }}
          >Exportar PDF</button>
          {canAdd && (
            <button onClick={() => { setEditando(null); setOpen(true); }} className="btn btn-primary">+ Agregar Equipo</button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Filtros</h3>
        <div className="filters-grid">
          <div>
            <label className="form-label">Buscar</label>
            <input placeholder="Código, tipo..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" />
          </div>
          <div>
            <label className="form-label">Área</label>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="select">
              <option value="">Todas</option>
              {(areasData?.items || []).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="select">
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="REPARACION">En Reparación</option>
              <option value="BAJA">De Baja</option>
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
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No se encontraron equipos</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Código Interno</th>
                  <th>Tipo</th>
                  <th>Área</th>
                  <th>Proveedor</th>
                  <th>Asignado a</th>
                  <th>Estado</th>
                  <th>Fecha Compra</th>
                  <th>Garantía</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e, idx) => (
                  <tr key={e.id} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td><span style={{ fontWeight: '600' }}>{e.codigoInterno || '-'}</span></td>
                    <td>{e.tipo || '-'}</td>
                    <td>{e?.area?.nombre || '-'}</td>
                    <td>{e?.proveedor?.razonSocial || e?.proveedor?.nombre || e?.proveedor?.cuit || '-'}</td>
                    <td>{e?.empleadoAsignado ? `${e.empleadoAsignado.nombre || ''} ${e.empleadoAsignado.apellido || ''}`.trim() : '-'}</td>
                    <td>
                      <span style={{
                        background: e.estado === 'ACTIVO' ? '#dcfce7' :
                                   e.estado === 'REPARACION' ? '#dbeafe' :
                                   '#fee2e2',
                        color: e.estado === 'ACTIVO' ? '#166534' :
                               e.estado === 'REPARACION' ? '#1e40af' :
                               '#991b1b',
                        borderRadius: '0.25rem',
                        padding: '0.125rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>{e.estado || '-'}</span>
                      {e.estado === 'BAJA' && e.motivoBaja && (
                        <div style={{ marginTop: 4, fontSize: '0.75rem', color: '#991b1b' }}>
                          Motivo: {e.motivoBaja}
                        </div>
                      )}
                    </td>
                    <td>{e.fechaCompra ? new Date(e.fechaCompra).toLocaleDateString() : '-'}</td>
                    <td>{e.garantia ? new Date(e.garantia).toLocaleDateString() : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {canManage && (
                          <button onClick={() => handleEdit(e)} className="btn btn-neutral btn-sm">Editar</button>
                        )}
                        {canManage && (
                          <button onClick={() => navigate(`/equipos/${e.id}/historial`)} className="btn btn-cyan-soft btn-sm">Historial</button>
                        )}
                        <button onClick={() => setMostrarPerifs({ open: true, equipo: e })} className="btn btn-info-soft btn-sm">Periféricos</button>
                        <button onClick={() => setMostrarMantenimientos({ open: true, equipo: e })} className="btn btn-success-soft btn-sm">Mantenimientos</button>
                        {canManage && e.estado !== 'BAJA' && e.estado !== 'REPARACION' && (
                          <button onClick={() => handleDelete(e)} className="btn btn-danger-soft btn-sm">Dar de baja</button>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={(data?.page || 1) === 1} className="btn btn-outline">Anterior</button>
          <span className="page-info">Página {data?.page || 1} de {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(data?.page || 1) * (data?.limit || pageSize) >= (data?.total || total)} className="btn btn-outline">Siguiente</button>
        </div>
      )}

      {/* Modal agregar/editar */}
      {open && (
        <EquipoModal
          onClose={() => { setOpen(false); setEditando(null); }}
          equipo={editando}
          areas={areasData?.items || []}
          empleados={empleadosData?.items || []}
          proveedores={proveedoresData?.items || []}
        />
      )}

      {/* Modal periféricos */}
      {mostrarPerifs.open && (
        <PerifericosModal
          equipo={mostrarPerifs.equipo}
          onClose={() => setMostrarPerifs({ open: false, equipo: null })}
        />
      )}

      {/* Modal mantenimientos */}
      {mostrarMantenimientos.open && (
        <MantenimientosModal
          equipo={mostrarMantenimientos.equipo}
          onClose={() => setMostrarMantenimientos({ open: false, equipo: null })}
        />
      )}

      {/* Modal dar de baja */}
      {bajaModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setBajaModal({ open: false, equipo: null, motivo: '' })}>
          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1rem', width: '90%', maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Dar de baja equipo {bajaModal.equipo?.codigoInterno}</h3>
            <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
              <span>Motivo de baja *</span>
              <input value={bajaModal.motivo} onChange={(e) => setBajaModal(m => ({ ...m, motivo: e.target.value }))} placeholder="Ej: obsolescencia, falla irreparable, robo…" style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px' }} />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setBajaModal({ open: false, equipo: null, motivo: '' })} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Cancelar</button>
              <button
                disabled={bajaMutation.isPending || !bajaModal.motivo.trim()}
                onClick={async () => {
                  try {
                    await bajaMutation.mutateAsync({ id: bajaModal.equipo.id, motivo: bajaModal.motivo.trim() });
                    setBajaModal({ open: false, equipo: null, motivo: '' });
                  } catch (err) {
                    console.error('Error al dar de baja:', err);
                    alert('Error al dar de baja el equipo');
                  }
                }}
                style={{ border: 'none', background: '#f97316', color: 'white', borderRadius: 6, padding: '6px 10px', opacity: (bajaMutation.isPending || !bajaModal.motivo.trim()) ? 0.6 : 1 }}
              >
                {bajaMutation.isPending ? 'Bajando…' : 'Confirmar baja'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EquipoModal({ onClose, equipo, areas, empleados, proveedores }) {
  const createMut = useEquipoCreate();
  const updateMut = useEquipoUpdate();
  const [form, setForm] = useState({
    codigoInterno: equipo?.codigoInterno || '',
    tipo: equipo?.tipo || 'PC',
    proveedorId: equipo?.proveedor?.id || '',
    areaId: equipo?.area?.id || '',
    empleadoAsignadoId: equipo?.empleadoAsignado?.id || '',
    estado: equipo?.estado || 'ACTIVO',
    fechaCompra: equipo?.fechaCompra ? new Date(equipo.fechaCompra).toISOString().split('T')[0] : '',
    garantia: equipo?.garantia ? new Date(equipo.garantia).toISOString().split('T')[0] : '',
  });
  const [error, setError] = useState('');

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.codigoInterno.trim()) { setError('El código interno es obligatorio'); return; }
    try {
      const payload = {
        codigoInterno: form.codigoInterno.trim(),
        tipo: form.tipo,
        proveedorId: form.proveedorId ? String(form.proveedorId) : undefined,
        areaId: form.areaId ? String(form.areaId) : undefined,
        empleadoAsignadoId: form.empleadoAsignadoId ? String(form.empleadoAsignadoId) : undefined,
        estado: form.estado,
        fechaCompra: form.fechaCompra || undefined,
        garantia: form.garantia || undefined,
      };
      if (equipo) await updateMut.mutateAsync({ id: equipo.id, data: payload });
      else await createMut.mutateAsync(payload);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || `No se pudo ${equipo ? 'actualizar' : 'crear'} el equipo`;
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.25rem', width: '90%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{equipo ? 'Editar equipo' : 'Nuevo equipo'}</h3>
          <button type="button" onClick={onClose} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, width: 32, height: 32 }}>×</button>
        </div>
        {error && <div style={{ marginBottom: 12, border: '1px solid #fecaca', background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}>{error}</div>}
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Código Interno *</span>
            <input name="codigoInterno" value={form.codigoInterno} onChange={onChange} disabled={!!equipo} required placeholder="Ej: EQ-0001" style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Tipo *</span>
            <select name="tipo" value={form.tipo} onChange={onChange} required style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="PC">PC</option>
              <option value="NOTEBOOK">Notebook</option>
              <option value="SERVIDOR">Servidor</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Área</span>
            <select name="areaId" value={form.areaId} onChange={onChange} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="">(sin asignar)</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Proveedor</span>
            <select name="proveedorId" value={form.proveedorId} onChange={onChange} disabled={!!equipo} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="">(sin asignar)</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial || p.nombre || p.cuit}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Asignado a</span>
            <select name="empleadoAsignadoId" value={form.empleadoAsignadoId} onChange={onChange} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="">(sin asignar)</option>
              {empleados.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellido}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Estado</span>
            <select name="estado" value={form.estado} onChange={onChange} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value="ACTIVO">Activo</option>
              <option value="REPARACION">En Reparación</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </label>
          {!equipo && (
            <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
              <span>Fecha de Compra</span>
              <input type="date" name="fechaCompra" value={form.fechaCompra} onChange={onChange} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
            </label>
          )}
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>Fecha de Vencimiento de Garantía</span>
            <input type="date" name="garantia" value={form.garantia} onChange={onChange} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn btn-primary">{(createMut.isPending || updateMut.isPending) ? 'Guardando…' : (equipo ? 'Actualizar' : 'Guardar')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PerifericosModal({ equipo, onClose }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePerifericosList({ page, limit: 10, equipoId: equipo?.id });

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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1rem', width: '90%', maxWidth: 800, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Periféricos de {equipo?.codigoInterno}</h3>
          <button onClick={onClose} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, width: 32, height: 32 }}>×</button>
        </div>
        {isLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#b91c1c' }}>{error.message}</div>
        ) : (data?.items || []).length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Este equipo no tiene periféricos asignados</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th>ID</th>
                  <th>Modelo</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Especificaciones</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.modelo || '-'}</td>
                    <td>{p?.tipo?.nombre || '-'}</td>
                    <td>{p?.marca?.nombre || '-'}</td>
                    <td><div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatEspecificaciones(p.especificaciones)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.total || 0) > 10 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button disabled={(data?.page || 1) === 1} onClick={() => setPage(p => p - 1)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Anterior</button>
                <span style={{ color: '#6b7280', padding: '0 8px', display: 'flex', alignItems: 'center' }}>Página {data?.page || 1}</span>
                <button disabled={(data?.page || 1) * (data?.limit || 10) >= (data?.total || 0)} onClick={() => setPage(p => p + 1)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Siguiente</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MantenimientosModal({ equipo, onClose }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMantenimientosList({ page, limit: 10, equipoId: equipo?.id });

  const formatEstado = (estado) => {
    const estados = {
      'PROGRAMADO': { bg: '#fef3c7', color: '#92400e', label: 'Programado' },
      'EN PROGRESO': { bg: '#dbeafe', color: '#1e40af', label: 'En Progreso' },
      'COMPLETO': { bg: '#dcfce7', color: '#166534', label: 'Completo' },
      'CANCELADO': { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' },
    };
    const est = estados[estado] || { bg: '#f3f4f6', color: '#374151', label: estado };
    return (
      <span style={{
        background: est.bg,
        color: est.color,
        borderRadius: '0.25rem',
        padding: '0.125rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>{est.label}</span>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1rem', width: '90%', maxWidth: 900, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Mantenimientos de {equipo?.codigoInterno}</h3>
          <button onClick={onClose} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, width: 32, height: 32 }}>×</button>
        </div>
        {isLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#b91c1c' }}>{error.message}</div>
        ) : (data?.items || []).length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Este equipo no tiene mantenimientos registrados</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha Programada</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Técnico</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.tipo || '-'}</td>
                    <td>{formatEstado(m.estado)}</td>
                    <td>{m.fecha_programada ? new Date(m.fecha_programada).toLocaleDateString() : '-'}</td>
                    <td>{m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString() : '-'}</td>
                    <td>{m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString() : '-'}</td>
                    <td>{m?.tecnico ? `${m.tecnico.nombre || ''} ${m.tecnico.apellido || ''}`.trim() : '-'}</td>
                    <td><div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.descripcion || '-'}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.total || 0) > 10 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button disabled={(data?.page || 1) === 1} onClick={() => setPage(p => p - 1)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Anterior</button>
                <span style={{ color: '#6b7280', padding: '0 8px', display: 'flex', alignItems: 'center' }}>Página {data?.page || 1}</span>
                <button disabled={(data?.page || 1) * (data?.limit || 10) >= (data?.total || 0)} onClick={() => setPage(p => p + 1)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Siguiente</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

