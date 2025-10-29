import { useState } from 'react';
import { useEquiposList, useEquipoCreate, useAreas, useEmpleados, useProveedores } from '../../core/hooks/useEquipos';

export default function EquiposListPage() {
  const [filtros, setFiltros] = useState({
    search: '',
    areaId: '',
    estado: '',
    page: 1,
    limit: 10
  });
  
  const [mostrarModal, setMostrarModal] = useState(false);
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
      await createMutation.mutateAsync(formulario);
      setMostrarModal(false);
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
    } catch (error) {
      console.error('Error al crear equipo:', error);
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
          onClick={() => setMostrarModal(true)}
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
              <option value="INACTIVO">Inactivo</option>
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
                          >
                            Editar
                          </button>
                          <button
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              color: '#991b1b',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
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
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Agregar Nuevo Equipo</h2>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Código Interno *
                  </label>
                  <input
                    type="text"
                    value={formulario.codigoInterno}
                    onChange={(e) => handleInputChange('codigoInterno', e.target.value)}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Estado
                  </label>
                  <select
                    value={formulario.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="REPARACION">En Reparación</option>
                    <option value="BAJA">De Baja</option>
                  </select>
                </div>

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
    </div>
  );
}
