import { API_URL } from '../../config/env.js';

const BASE_URL = API_URL;

export async function fetchEstadisticas() {
  try {
    // Obtener estadísticas de equipos
    const equiposRes = await fetch(`${BASE_URL}/equipos?limit=1000`);
    const equiposData = await equiposRes.json();
    const equipos = equiposData.ok ? equiposData.data.items : [];

    // Obtener estadísticas de alertas
    const alertasRes = await fetch(`${BASE_URL}/alertas?limit=1000`);
    const alertasData = await alertasRes.json();
    const alertas = alertasData.ok ? alertasData.data.items : [];

    // Obtener estadísticas de mantenimientos
    const mantenimientosRes = await fetch(`${BASE_URL}/mantenimientos?limit=1000`);
    const mantenimientosData = await mantenimientosRes.json();
    const mantenimientos = mantenimientosData.ok ? mantenimientosData.data.items : [];

    // Obtener estadísticas de técnicos
    const tecnicosRes = await fetch(`${BASE_URL}/tecnicos?limit=1000`);
    const tecnicosData = await tecnicosRes.json();
    const tecnicos = tecnicosData.ok ? tecnicosData.data.items : [];

    // Obtener estadísticas de usuarios con roles
    const usuariosRes = await fetch(`${BASE_URL}/usuarios?limit=1000`);
    const usuariosData = await usuariosRes.json();
    const usuarios = usuariosData.ok ? usuariosData.data.items : [];

    // Calcular estadísticas
    const estadisticas = {
      equipos: {
        total: equipos.length,
        activos: equipos.filter(e => e.estado === 'ACTIVO').length,
        enReparacion: equipos.filter(e => e.estado === 'REPARACION').length,
        deBaja: equipos.filter(e => e.estado === 'BAJA').length,
        porTipo: {
          PC: equipos.filter(e => e.tipo === 'PC').length,
          NOTEBOOK: equipos.filter(e => e.tipo === 'NOTEBOOK').length,
          SERVIDOR: equipos.filter(e => e.tipo === 'SERVIDOR').length,
        }
      },
      alertas: {
        total: alertas.length,
        recientes: alertas.filter(a => {
          const fecha = new Date(a.createdAt);
          const hace7Dias = new Date();
          hace7Dias.setDate(hace7Dias.getDate() - 7);
          return fecha >= hace7Dias;
        }).length
      },
      mantenimientos: {
        total: mantenimientos.length,
        programados: mantenimientos.filter(m => m.estado === 'PROGRAMADO').length,
        enProgreso: mantenimientos.filter(m => m.estado === 'EN PROGRESO').length,
        completos: mantenimientos.filter(m => m.estado === 'COMPLETO').length,
        cancelados: mantenimientos.filter(m => m.estado === 'CANCELADO').length,
      },
      tecnicos: {
        total: tecnicos.length,
        internos: tecnicos.filter(t => t.tipoContrato === 'INTERNO').length,
        externos: tecnicos.filter(t => t.tipoContrato === 'EXTERNO').length,
      },
      usuarios: {
        total: usuarios.length,
        activos: usuarios.filter(u => u.activo === 1).length,
        inactivos: usuarios.filter(u => u.activo === 0).length,
        porRol: {
          administrador: usuarios.filter(u => u.roles && u.roles.some(r => r.nombre === 'Administrador')).length,
          tecnico: usuarios.filter(u => u.roles && u.roles.some(r => r.nombre === 'Tecnico')).length,
          consulta: usuarios.filter(u => u.roles && u.roles.some(r => r.nombre === 'Consulta')).length,
        }
      }
    };

    return estadisticas;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw new Error('No se pudieron cargar las estadísticas');
  }
}
