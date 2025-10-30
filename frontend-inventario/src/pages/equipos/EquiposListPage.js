import { useState } from 'react';
import { useEquiposList, useEquipoCreate, useEquipoUpdate, useEquipoBaja, useAreas, useEmpleados, useProveedores } from '../../core/hooks/useEquipos';

export default function EquiposListPage() {
  const [filtros, setFiltros] = useState({
    search: '',
    areaId: '',
    estado: '',
    page: 1,
    limit: 10
  });
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formError, setFormError] = useState('');
  const [mostrarPerifs, setMostrarPerifs] = useState({ open: false, equipo: null });
  const [formulario, setFormulario] = useState({
    codigoInterno: '',
    tipo: 'PC',
    proveedorId: '',
    areaId: '',
    empleadoAsignadoId: '',
    estado: 'ACTIVO',
    fechaCompra: '',
    garantia: ''
  });

  // Hooks para datos
  const { data: equiposData, isLoading, error } = useEquiposList(filtros);
  const { data: areasData } = useAreas();
  const { data: empleadosData } = useEmpleados();
  const { data: proveedoresData } = useProveedores();
  const createMutation = useEquipoCreate();
  const updateMutation = useEquipoUpdate();
  const bajaMutation = useEquipoBaja();
  const [bajaModal, setBajaModal] = useState({ open: false, equipo: null, motivo: '' });

  const equipos = equiposData?.items || [];
  const total = equiposData?.total || 0;
  const totalPages = Math.ceil(total / filtros.limit);

  // Manejo de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: 1 // Reset a página 1 cuando cambian filtros
    }));
  };

  // Manejo de formulario
  const handleInputChange = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateMutation.mutateAsync({ id: editando.id, data: formulario });
      } else {
        await createMutation.mutateAsync(formulario);
      }
      setMostrarModal(false);
      setEditando(null);
      setFormulario({
        codigoInterno: '',
        tipo: 'PC',
        proveedorId: '',
        areaId: '',
        empleadoAsignadoId: '',
        estado: 'ACTIVO',
        fechaCompra: '',
        garantia: ''
      });
      setFormError('');
    } catch (error) {
      let msg = 'Error al guardar equipo';
      try {
        // Algunos errores vienen con response.text como JSON string
        const parsed = JSON.parse(error.message);
        if (parsed?.message) msg = parsed.message;
      } catch (_) {
        if (error?.message) msg = String(error.message);
      }
      setFormError(msg);
    }
  };

  const handlePaginacion = (nuevaPagina) => {
    setFiltros(prev => ({
      ...prev,
      page: nuevaPagina
    }));
  };

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando equipos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>Error al cargar los equipos: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con título y botón de agregar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Equipos</h1>
        <button
          onClick={() => { setEditando(null); setMostrarModal(true); }}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          + Agregar Equipo
        </button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Filtros</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Buscar
            </label>
            <input
              type="text"
              value={filtros.search}
              onChange={(e) => handleFiltroChange('search', e.target.value)}
              placeholder="Nombre, modelo, serie..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Área
            </label>
            <select
              value={filtros.areaId}
              onChange={(e) => handleFiltroChange('areaId', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Todas las áreas</option>
              {areasData?.items?.map(area => (
                <option key={area.id} value={area.id}>{area.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="REPARACION">En Reparación</option>
              <option value="BAJA">De Baja</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Mostrar por página
            </label>
            <select
              value={filtros.limit}
              onChange={(e) => handleFiltroChange('limit', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de equipos */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
            Equipos ({total})
          </h3>
        </div>

        {equipos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>No se encontraron equipos con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th>Código Interno</th>
                    <th>Tipo</th>
                    <th>Código</th>
                    <th>Área</th>
                    <th>Asignado a</th>
                    <th>Estado</th>
                    <th>Fecha Compra</th>
                    <th>Garantía</th>
                  <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map(equipo => (
                    <tr key={equipo.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '500' }}>{equipo.codigoInterno}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {equipo.tipo}
                          </div>
                        </div>
                      </td>
                      <td>{equipo.tipo || '-'}</td>
                      <td>{equipo.codigoInterno || '-'}</td>
                      <td>{equipo.area?.nombre || '-'}</td>
                      <td>{equipo.empleadoAsignado ? `${equipo.empleadoAsignado.nombre} ${equipo.empleadoAsignado.apellido}` : '-'}</td>
                      <td>
                        <span className={`badge ${
                          equipo.estado === 'ACTIVO' ? 'badge-success' :
                          equipo.estado === 'INACTIVO' ? 'badge-warning' :
                          equipo.estado === 'REPARACION' ? 'badge-info' :
                          'badge-danger'
                        }`} style={{
                          background: equipo.estado === 'ACTIVO' ? '#dcfce7' :
                                     equipo.estado === 'INACTIVO' ? '#fef3c7' :
                                     equipo.estado === 'REPARACION' ? '#dbeafe' :
                                     '#fee2e2',
                          color: equipo.estado === 'ACTIVO' ? '#166534' :
                                 equipo.estado === 'INACTIVO' ? '#92400e' :
                                 equipo.estado === 'REPARACION' ? '#1e40af' :
                                 '#991b1b'
                        }}>
                          {equipo.estado}
                        </span>
                        {equipo.estado === 'BAJA' && equipo.motivoBaja && (
                          <div style={{ marginTop: 4, fontSize: '0.75rem', color: '#991b1b' }}>
                            Motivo: {equipo.motivoBaja}
                          </div>
                        )}
                      </td>
                      <td>{equipo.fechaCompra ? new Date(equipo.fechaCompra).toLocaleDateString() : '-'}</td>
                      <td>{equipo.garantia ? new Date(equipo.garantia).toLocaleDateString() : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            style={{
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                            onClick={() => {
                              setEditando(equipo);
                              setFormulario({
                                codigoInterno: equipo.codigoInterno || '',
                                tipo: equipo.tipo || 'PC',
                                proveedorId: equipo.proveedor?.id || '',
                                areaId: equipo.area?.id || '',
                                empleadoAsignadoId: equipo.empleadoAsignado?.id || '',
                                estado: equipo.estado || 'ACTIVO',
                                fechaCompra: equipo.fechaCompra || '',
                                garantia: equipo.garantia || '',
                              });
                              setMostrarModal(true);
                            }}
                          >
                            Editar
                          </button>
                          {equipo.estado !== 'BAJA' && (
                          <button
                            onClick={() => setBajaModal({ open: true, equipo, motivo: '' })}
                            style={{
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                              color: '#9a3412',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Dar de baja
                          </button>
                          )}
                          <button
                            onClick={() => setMostrarPerifs({ open: true, equipo })}
                            style={{
                              background: '#eef2ff',
                              border: '1px solid #c7d2fe',
                              color: '#3730a3',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Ver periféricos
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => handlePaginacion(filtros.page - 1)}
                  disabled={filtros.page === 1}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    background: filtros.page === 1 ? '#f9fafb' : 'white',
                    cursor: filtros.page === 1 ? 'not-allowed' : 'pointer',
                    borderRadius: '0.25rem'
                  }}
                >
                  Anterior
                </button>
                
                <span style={{ padding: '0 1rem' }}>
                  Página {filtros.page} de {totalPages}
                </span>
                
                <button
                  onClick={() => handlePaginacion(filtros.page + 1)}
                  disabled={filtros.page === totalPages}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    background: filtros.page === totalPages ? '#f9fafb' : 'white',
                    cursor: filtros.page === totalPages ? 'not-allowed' : 'pointer',
                    borderRadius: '0.25rem'
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para agregar/editar equipo */}
      {mostrarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{editando ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}</h2>
              <button
                onClick={() => setMostrarModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {formError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '8px 10px', borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
                  {formError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Código Interno *
                  </label>
                  <input
                    type="text"
                    value={formulario.codigoInterno}
                    onChange={(e) => handleInputChange('codigoInterno', e.target.value)}
                    disabled={!!editando}
                    readOnly={!!editando}
                    required
                    placeholder="Ej: EQ-0001"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Tipo *
                  </label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="PC">PC</option>
                    <option value="NOTEBOOK">Notebook</option>
                    <option value="SERVIDOR">Servidor</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Área
                  </label>
                  <select
                    value={formulario.areaId}
                    onChange={(e) => handleInputChange('areaId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Seleccionar área</option>
                    {areasData?.items?.map(area => (
                      <option key={area.id} value={area.id}>{area.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Asignado a
                  </label>
                  <select
                    value={formulario.empleadoAsignadoId}
                    onChange={(e) => handleInputChange('empleadoAsignadoId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Sin asignar</option>
                    {empleadosData?.items?.map(empleado => (
                      <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                    ))}
                  </select>
                </div>

                {!editando && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Proveedor
                    </label>
                    <select
                      value={formulario.proveedorId}
                      onChange={(e) => handleInputChange('proveedorId', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Seleccionar proveedor</option>
                      {proveedoresData?.items?.map(proveedor => (
                        <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                

                {!editando && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Fecha de Compra
                    </label>
                    <input
                      type="date"
                      value={formulario.fechaCompra}
                      onChange={(e) => handleInputChange('fechaCompra', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Fecha de Vencimiento de Garantía
                  </label>
                  <input
                    type="date"
                    value={formulario.garantia}
                    onChange={(e) => handleInputChange('garantia', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: createMutation.isPending ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    borderRadius: '0.375rem',
                    cursor: createMutation.isPending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal periféricos por equipo */}
      {mostrarPerifs.open && (
        <PerifericosDeEquipoModal
          equipo={mostrarPerifs.equipo}
          onClose={() => setMostrarPerifs({ open: false, equipo: null })}
        />
      )}

      {/* Modal de baja */}
      {bajaModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setBajaModal({ open: false, equipo: null, motivo: '' })}>
          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1rem', width: '90%', maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Dar de baja equipo {bajaModal.equipo?.codigoInterno}</h3>
            <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
              <span>Motivo de baja</span>
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

function PerifericosDeEquipoModal({ equipo, onClose }) {
  const [page, setPage] = useState(1);
  const { usePerifericosList } = require('../../core/hooks/usePerifericos');
  const { data, isLoading, error } = usePerifericosList({ page, limit: 10, equipoId: equipo?.id });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1rem', width: '90%', maxWidth: 800, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Periféricos de {equipo?.codigoInterno}</h3>
          <button onClick={onClose} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, width: 32, height: 32 }}>✕</button>
        </div>
        {isLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#b91c1c' }}>{error.message}</div>
        ) : (
          <table className="table">
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th>ID</th>
                <th>Modelo</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.modelo || '-'}</td>
                  <td>{p?.tipo?.nombre || '-'}</td>
                  <td>{p?.marca?.nombre || '-'}</td>
                  <td>{p.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button disabled={(data?.page || 1) === 1} onClick={() => setPage(p => p - 1)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Anterior</button>
          <span style={{ color: '#6b7280' }}>Página {data?.page || 1}</span>
          <button disabled={(data?.page || 1) * (data?.limit || 10) >= (data?.total || 0)} onClick={() => setPage(p => p + 1)} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px' }}>Siguiente</button>
        </div>
      </div>
    </div>
  );
}
