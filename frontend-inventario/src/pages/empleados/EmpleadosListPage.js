import { useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchAreas } from '../../core/api/equipos.api.js';
import { useEmpleadosList, useEmpleadoCreate, useEmpleadoUpdate, useEmpleadoDelete } from '../../core/hooks/useEmpleados';

export default function EmpleadosListPage() {
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.some(r => r?.nombre === 'Administrador');

  const [filtros, setFiltros] = useState({ search: '', page: 1, limit: 10, areaId: '' });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', contacto: '', areaId: '' });

  const { data, isLoading, error } = useEmpleadosList(filtros);
  const createMut = useEmpleadoCreate();
  const updateMut = useEmpleadoUpdate();
  const deleteMut = useEmpleadoDelete();

  const { data: areasData } = useQuery({ queryKey: ['areas-for-select'], queryFn: fetchAreas, staleTime: 60_000 });
  const areas = areasData?.items || areasData?.data?.items || areasData?.data || areasData || [];

  if (!isAdmin) {
    return (
      <div className="card">
        <p style={{ margin: 0, color: '#991b1b' }}>Acceso restringido: solo administradores pueden ver los empleados.</p>
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / (filtros.limit || 10)));

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      dni: form.dni,
      contacto: form.contacto,
      areaId: form.areaId || undefined,
    };
    if (editando) await updateMut.mutateAsync({ id: editando.id, data: payload });
    else await createMut.mutateAsync(payload);
    setMostrarModal(false);
    setEditando(null);
    setForm({ nombre: '', apellido: '', dni: '', contacto: '', areaId: '' });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Gestión de Empleados</h1>
        <button onClick={() => { setEditando(null); setForm({ nombre: '', apellido: '', dni: '', contacto: '', areaId: '' }); setMostrarModal(true); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>+ Agregar</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Buscar</label>
            <input value={filtros.search} onChange={(e) => setFiltros(s => ({ ...s, search: e.target.value, page: 1 }))} placeholder="Nombre, apellido o DNI" style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Área</label>
            <select value={filtros.areaId}
                    onChange={(e) => setFiltros(s => ({ ...s, areaId: e.target.value, page: 1 }))}
                    style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', background: 'white' }}>
              <option value="">Todas</option>
              {Array.isArray(areas) && areas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre || a.descripcion || `Área ${a.id}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Mostrar</label>
            <select value={filtros.limit} onChange={(e) => setFiltros(s => ({ ...s, limit: parseInt(e.target.value), page: 1 }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <p>Cargando empleados...</p>
        ) : error ? (
          <p style={{ color: '#dc2626' }}>Error: {String(error?.message || error)}</p>
        ) : items.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Sin resultados</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>DNI</th>
                  <th>Contacto</th>
                  <th>Área</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.nombre}</td>
                    <td>{emp.apellido}</td>
                    <td>{emp.dni}</td>
                    <td>{emp.contacto || '-'}</td>
                    <td>{emp.area?.nombre || emp.area?.descripcion || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditando(emp); setForm({ nombre: emp.nombre, apellido: emp.apellido, dni: emp.dni, contacto: emp.contacto || '', areaId: emp.area?.id || '' }); setMostrarModal(true); }} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Editar</button>
                        <button onClick={async () => { if (window.confirm('¿Eliminar empleado?')) await deleteMut.mutateAsync(emp.id); }} style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <button onClick={() => setFiltros(s => ({ ...s, page: Math.max(1, s.page - 1) }))} disabled={filtros.page === 1} style={{ padding: '0.5rem', border: '1px solid #d1d5db', background: filtros.page === 1 ? '#f9fafb' : 'white', borderRadius: 4 }}>Anterior</button>
          <span style={{ color: '#6b7280' }}>Página {filtros.page} de {totalPages}</span>
          <button onClick={() => setFiltros(s => ({ ...s, page: Math.min(totalPages, s.page + 1) }))} disabled={filtros.page === totalPages} style={{ padding: '0.5rem', border: '1px solid #d1d5db', background: filtros.page === totalPages ? '#f9fafb' : 'white', borderRadius: 4 }}>Siguiente</button>
        </div>
      )}

      {mostrarModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setMostrarModal(false)}>
          <div style={{ background: 'white', padding: 16, borderRadius: 8, width: '90%', maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editando ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Nombre *</span>
                <input required value={form.nombre} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Apellido *</span>
                <input required value={form.apellido} onChange={(e) => setForm(f => ({ ...f, apellido: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>DNI *</span>
                <input required value={form.dni} onChange={(e) => setForm(f => ({ ...f, dni: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Email de contacto *</span>
                <input type="email" required value={form.contacto} onChange={(e) => setForm(f => ({ ...f, contacto: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Área</span>
                <select value={form.areaId} onChange={(e) => setForm(f => ({ ...f, areaId: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', background: 'white' }}>
                  <option value="">Sin área</option>
                  {Array.isArray(areas) && areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre || a.descripcion || `Área ${a.id}`}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Cancelar</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} style={{ border: 'none', background: '#3b82f6', color: 'white', borderRadius: 6, padding: '6px 10px' }}>{(createMut.isPending || updateMut.isPending) ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
