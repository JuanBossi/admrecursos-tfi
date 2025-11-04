import { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAlertasList, useAlertaCreate, useAlertaUpdate, useAlertaDelete } from '../../core/hooks/useAlertas';
import { useEquiposList } from '../../core/hooks/useEquipos';

export default function AlertasListPage() {
  const { user } = useAuth();
  const isEmpleado = !!user?.roles?.some(r => r?.nombre === 'Empleado');
  const isTecnico = !!user?.roles?.some(r => r?.nombre === 'Tecnico');
  const isAdmin = !!user?.roles?.some(r => r?.nombre === 'Administrador');
  const canCreate = isEmpleado || isTecnico || isAdmin;
  const isTecnicoOrAdmin = isTecnico || isAdmin;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    mensaje: '',
    equipoId: ''
  });
  const [formError, setFormError] = useState('');

  // Hooks para datos
  const { data: alertasData, isLoading, error } = useAlertasList({ search, page, limit });
  const { data: equiposData } = useEquiposList({ limit: 200 });
  const createMutation = useAlertaCreate();
  const updateMutation = useAlertaUpdate();
  const deleteMutation = useAlertaDelete();

  const alertas = alertasData?.items || [];
  const equipos = equiposData?.items || [];
  const total = alertasData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 2000); // Espera 500ms después de que el usuario deje de escribir

    return () => clearTimeout(timer);
  }, [searchInput]);

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
      setFormError('');
      if (!formulario.mensaje || !formulario.mensaje.trim()) {
        setFormError('El mensaje es obligatorio.');
        return;
      }
      if (editando) {
        await updateMutation.mutateAsync({ id: editando.id, data: formulario });
      } else {
        await createMutation.mutateAsync({
          mensaje: formulario.mensaje.trim(),
          equipoId: formulario.equipoId ? String(formulario.equipoId) : undefined,
        });
      }
      setMostrarModal(false);
      setEditando(null);
      setFormulario({
        mensaje: '',
        equipoId: ''
      });
    } catch (error) {
      let msg = 'No se pudo guardar la alerta';
      try {
        const parsed = JSON.parse(error.message);
        msg = parsed?.message || msg;
      } catch (_) {
        if (error?.message) msg = String(error.message);
      }
      setFormError(Array.isArray(msg) ? msg.join('\n') : msg);
    }
  };

  const handleEdit = (alerta) => {
    setEditando(alerta);
    setFormulario({
      mensaje: alerta.mensaje,
      equipoId: alerta.equipo?.id || ''
    });
    setMostrarModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta alerta?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error al eliminar alerta:', error);
      }
    }
  };

  const handlePaginacion = (nuevaPagina) => {
    setPage(nuevaPagina);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando alertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>Error al cargar las alertas: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con título y botón de agregar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Alertas</h1>
        {canCreate && (
        <button
          onClick={() => {
            setEditando(null);
            setFormulario({
              mensaje: '',
              equipoId: ''
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
          + Agregar Alerta
        </button>
        )}
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Mensaje, equipo..."
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
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
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

      {/* Tabla de alertas */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
            Alertas ({total})
          </h3>
        </div>

        {alertas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>No se encontraron alertas con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th>Mensaje</th>
                    <th>Equipo</th>
                    <th>Fecha de Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map(alerta => (
                    <tr key={alerta.id}>
                      <td>
                        <div style={{ fontWeight: '500' }}>{alerta.mensaje}</div>
                      </td>
                      <td>
                        {alerta.equipo ? (
                          <div>
                            <div style={{ fontWeight: '500' }}>{alerta.equipo.codigoInterno}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {alerta.equipo.tipo}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280' }}>Sin equipo</span>
                        )}
                      </td>
                      <td>{new Date(alerta.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {isTecnicoOrAdmin && (
                          <button
                            onClick={() => handleEdit(alerta)}
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
                          )}
                          {isTecnicoOrAdmin && (
                          <button
                            onClick={() => handleDelete(alerta.id)}
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
                          )}
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
                  onClick={() => handlePaginacion(page - 1)}
                  disabled={page === 1}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    background: page === 1 ? '#f9fafb' : 'white',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    borderRadius: '0.25rem'
                  }}
                >
                  Anterior
                </button>
                
                <span style={{ padding: '0 1rem' }}>
                  Página {page} de {totalPages}
                </span>
                
                <button
                  onClick={() => handlePaginacion(page + 1)}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    background: page === totalPages ? '#f9fafb' : 'white',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
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

      {/* Modal para agregar/editar alerta */}
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
                {editando ? 'Editar Alerta' : 'Agregar Nueva Alerta'}
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
              {formError && (
                <div style={{ whiteSpace: 'pre-wrap', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '0.5rem', padding: '8px 12px', fontSize: 14, marginBottom: 8 }}>
                  {formError}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Mensaje *
                  </label>
                  <textarea
                    value={formulario.mensaje}
                    onChange={(e) => handleInputChange('mensaje', e.target.value)}
                    required
                    rows={3}
                    placeholder="Descripción de la alerta..."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Equipo
                  </label>
                  <select
                    value={formulario.equipoId}
                    onChange={(e) => handleInputChange('equipoId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Sin equipo específico</option>
                    {equipos.map(equipo => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.codigoInterno} - {equipo.tipo}
                      </option>
                    ))}
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