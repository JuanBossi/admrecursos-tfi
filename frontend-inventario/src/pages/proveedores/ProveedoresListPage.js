import { useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useProveedoresList, useProveedorCreate, useProveedorDelete, useProveedorUpdate } from '../../core/hooks/useProveedores';

export default function ProveedoresListPage() {
  const { user } = useAuth();
  const isAdmin = !!user?.roles?.some(r => r?.nombre === 'Administrador');
  const isTecnico = !!user?.roles?.some(r => r?.nombre === 'Tecnico');

  const [filtros, setFiltros] = useState({ search: '', page: 1, limit: 10 });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ razonSocial: '', cuit: '', contacto: '', email: '', telefono: '', direccion: '' });
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useProveedoresList(filtros);
  const createMut = useProveedorCreate();
  const updateMut = useProveedorUpdate();
  const deleteMut = useProveedorDelete();

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / (filtros.limit || 10)));

  function normalizarCuit(cuit) {
    if (!cuit) return '';
    return String(cuit).replace(/[^0-9]/g, '');
  }


  function validarFormulario(values) {
    const errores = [];
    if (!values.razonSocial?.trim()) errores.push('La Razón Social es obligatoria.');
    const cuitDigits = normalizarCuit(values.cuit);
    if (!cuitDigits) errores.push('El CUIT es obligatorio.');
    else if (cuitDigits.length !== 11) errores.push('CUIT inválido. Debe tener 11 dígitos.');
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) errores.push('Email inválido.');
    if (values.telefono && values.telefono.replace(/\D/g, '').length < 6) errores.push('Teléfono demasiado corto.');
    return errores;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const errores = validarFormulario(form);
    if (errores.length > 0) {
      setFormError(errores.join('\n'));
      return;
    }
    if (editando) {
      try {
        await updateMut.mutateAsync({ id: editando.id, data: form });
      } catch (err) {
        const apiMsg = err?.response?.data?.message;
        setFormError(Array.isArray(apiMsg) ? apiMsg.join('\n') : (apiMsg || 'No se pudo actualizar el proveedor'));
        return;
      }
    } else {
      try {
        await createMut.mutateAsync(form);
      } catch (err) {
        const apiMsg = err?.response?.data?.message;
        setFormError(Array.isArray(apiMsg) ? apiMsg.join('\n') : (apiMsg || 'No se pudo crear el proveedor'));
        return;
      }
    }
    setMostrarModal(false);
    setEditando(null);
    setForm({ razonSocial: '', cuit: '', contacto: '', email: '', telefono: '', direccion: '' });
  }

  if (!isAdmin && !isTecnico) {
    return (
      <div className="card">
        <p style={{ margin: 0, color: '#991b1b' }}>Acceso restringido: solo técnicos y administradores pueden ver proveedores.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Proveedores</h1>
        {isAdmin && (
          <button onClick={() => { setEditando(null); setForm({ razonSocial: '', cuit: '', contacto: '', email: '', telefono: '', direccion: '' }); setMostrarModal(true); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>+ Agregar</button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Buscar</label>
            <input value={filtros.search} onChange={(e) => setFiltros(s => ({ ...s, search: e.target.value, page: 1 }))} placeholder="Razón social, CUIT, contacto" style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
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
          <p>Cargando proveedores...</p>
        ) : error ? (
          <p style={{ color: '#dc2626' }}>Error: {String(error?.message || error)}</p>
        ) : items.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Sin resultados</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th>Razón Social</th>
                  <th>CUIT</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id}>
                    <td>{p.razonSocial}</td>
                    <td>{p.cuit}</td>
                    <td>{p.contacto || '-'}</td>
                    <td>{p.email || '-'}</td>
                    <td>{p.telefono || '-'}</td>
                    <td>{p.direccion || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {isAdmin && (
                          <>
                            <button onClick={() => { setEditando(p); setForm({ razonSocial: p.razonSocial || '', cuit: p.cuit || '', contacto: p.contacto || '', email: p.email || '', telefono: p.telefono || '', direccion: p.direccion || '' }); setMostrarModal(true); }} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Editar</button>
                            <button onClick={async () => { if (window.confirm('¿Eliminar proveedor?')) await deleteMut.mutateAsync(p.id); }} style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Eliminar</button>
                          </>
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
            <h3 style={{ marginTop: 0 }}>{editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
              {formError && (
                <div style={{ whiteSpace: 'pre-wrap', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}>
                  {formError}
                </div>
              )}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Razón Social *</span>
                <input required value={form.razonSocial} onChange={(e) => setForm(f => ({ ...f, razonSocial: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>CUIT *</span>
                <input required placeholder="20-12345678-3" value={form.cuit} onChange={(e) => setForm(f => ({ ...f, cuit: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} disabled={!!editando} readOnly={!!editando} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Contacto</span>
                <input value={form.contacto} onChange={(e) => setForm(f => ({ ...f, contacto: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Email</span>
                <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Teléfono</span>
                <input value={form.telefono} onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Dirección</span>
                <input value={form.direccion} onChange={(e) => setForm(f => ({ ...f, direccion: e.target.value }))} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
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
