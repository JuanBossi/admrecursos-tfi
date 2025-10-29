import { useState } from 'react';
import { useTecnicosList, useTecnicoCreate, useTecnicoUpdate, useTecnicoDelete } from '../../core/hooks/useTecnicos';

export default function TecnicosListPage() {
  const [filtros, setFiltros] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    contacto: '',
    tipoContrato: 'INTERNO'
  });

  // Hooks para datos
  const { data: tecnicosData, isLoading, error } = useTecnicosList(filtros);
  const createMutation = useTecnicoCreate();
  const updateMutation = useTecnicoUpdate();
  const deleteMutation = useTecnicoDelete();

  const tecnicos = tecnicosData?.items || [];
  const total = tecnicosData?.total || 0;
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
        nombre: '',
        apellido: '',
        dni: '',
        contacto: '',
        tipoContrato: 'INTERNO'
      });
    } catch (error) {
      console.error('Error al guardar técnico:', error);
    }
  };

  const handleEdit = (tecnico) => {
    setEditando(tecnico);
    setFormulario({
      nombre: tecnico.nombre,
      apellido: tecnico.apellido,
      dni: tecnico.dni,
      contacto: tecnico.contacto || '',
      tipoContrato: tecnico.tipoContrato
    });
    setMostrarModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este técnico?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al eliminar técnico:', error);
      }
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
          <p>Cargando técnicos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>Error al cargar los técnicos: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con título y botón de agregar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Técnicos</h1>
        <button
          onClick={() => {
            setEditando(null);
            setFormulario({
              nombre: '',
              apellido: '',
              dni: '',
              contacto: '',
              tipoContrato: 'INTERNO'
            });
            setMostrarModal(true);
          }}
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
          + Agregar Técnico
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
              placeholder="Nombre, apellido, DNI..."
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

      {/* Tabla de técnicos */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
            Técnicos ({total})
          </h3>
        </div>

        {tecnicos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>No se encontraron técnicos con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th>Nombre Completo</th>
                    <th>DNI</th>
                    <th>Contacto</th>
                    <th>Tipo de Contrato</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tecnicos.map(tecnico => (
                    <tr key={tecnico.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '500' }}>{tecnico.nombre} {tecnico.apellido}</div>
                        </div>
                      </td>
                      <td>{tecnico.dni}</td>
                      <td>{tecnico.contacto || '-'}</td>
                      <td>
                        <span className={`badge ${
                          tecnico.tipoContrato === 'INTERNO' ? 'badge-info' : 'badge-warning'
                        }`} style={{
                          background: tecnico.tipoContrato === 'INTERNO' ? '#dbeafe' : '#fef3c7',
                          color: tecnico.tipoContrato === 'INTERNO' ? '#1e40af' : '#92400e'
                        }}>
                          {tecnico.tipoContrato}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(tecnico)}
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
                            onClick={() => handleDelete(tecnico.id)}
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

      {/* Modal para agregar/editar técnico */}
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editando ? 'Editar Técnico' : 'Agregar Nuevo Técnico'}
              </h2>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setEditando(null);
                }}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
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
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formulario.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    required
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
                    DNI *
                  </label>
                  <input
                    type="text"
                    value={formulario.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value)}
                    required
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
                    Contacto
                  </label>
                  <input
                    type="email"
                    value={formulario.contacto}
                    onChange={(e) => handleInputChange('contacto', e.target.value)}
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
                    Tipo de Contrato
                  </label>
                  <select
                    value={formulario.tipoContrato}
                    onChange={(e) => handleInputChange('tipoContrato', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="INTERNO">Interno</option>
                    <option value="EXTERNO">Externo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    setEditando(null);
                  }}
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: (createMutation.isPending || updateMutation.isPending) ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    borderRadius: '0.375rem',
                    cursor: (createMutation.isPending || updateMutation.isPending) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
