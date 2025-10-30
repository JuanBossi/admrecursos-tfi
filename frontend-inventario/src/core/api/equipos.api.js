import { API_URL } from '../../config/env.js';

const BASE_URL = API_URL;

export async function fetchEquipos(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  
  const url = `${BASE_URL}/equipos?${params.toString()}`;
  console.log('Fetching equipos from:', url);
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await res.text();
    console.error('Non-JSON response:', responseText);
    throw new Error('El servidor devolvió una respuesta no válida (no es JSON)');
  }
  
  const response = await res.json();
  
  // El backend devuelve { ok: true, data: { items, total, page, limit } }
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Respuesta del servidor no válida');
}

export async function createEquipo(payload) {
  const body = {
    ...payload,
    proveedorId: payload.proveedorId || undefined,
    areaId: payload.areaId || undefined,
    empleadoAsignadoId: payload.empleadoAsignadoId || undefined,
    estado: payload.estado || undefined,
    fechaCompra: payload.fechaCompra || undefined,
    garantia: payload.garantia || undefined,
  };
  const res = await fetch(`${BASE_URL}/equipos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Error al crear el equipo');
}

export async function updateEquipo(id, payload) {
  const body = {
    ...payload,
    proveedorId: payload.proveedorId !== '' ? payload.proveedorId : undefined,
    areaId: payload.areaId !== '' ? payload.areaId : undefined,
    empleadoAsignadoId: payload.empleadoAsignadoId !== '' ? payload.empleadoAsignadoId : undefined,
    estado: payload.estado || undefined,
    fechaCompra: payload.fechaCompra || undefined,
    garantia: payload.garantia || undefined,
  };
  const res = await fetch(`${BASE_URL}/equipos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  if (response.ok && response.data) return response.data;
  throw new Error('Error al actualizar el equipo');
}

export async function deleteEquipo(id) {
  const res = await fetch(`${BASE_URL}/equipos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  if (response.ok) return response.data;
  throw new Error('Error al eliminar el equipo');
}

export async function darDeBajaEquipo(id, motivo) {
  const res = await fetch(`${BASE_URL}/equipos/${id}/baja`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo }),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  if (response.ok && response.data) return response.data;
  throw new Error('Error al dar de baja el equipo');
}

// Auxiliares para selects (ajustá endpoints y mapeos si hace falta)
export async function fetchAreas() {
  const res = await fetch(`${BASE_URL}/areas?page=1&limit=200`);
  if (!res.ok) throw new Error('No se pudieron cargar las áreas');
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Respuesta del servidor no válida');
}

export async function fetchEmpleados() {
  const res = await fetch(`${BASE_URL}/empleados?page=1&limit=200`);
  if (!res.ok) throw new Error('No se pudieron cargar los empleados');
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Respuesta del servidor no válida');
}

export async function fetchProveedores() {
  const res = await fetch(`${BASE_URL}/proveedores?page=1&limit=200`);
  if (!res.ok) throw new Error('No se pudieron cargar los proveedores');
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Respuesta del servidor no válida');
}

// ...otros exports arriba

export async function fetchGarantias({ dias = 30 } = {}) {
  const res = await fetch(`/equipos/alertas/garantia?dias=${encodeURIComponent(dias)}`);
  if (!res.ok) throw new Error('No se pudieron cargar las alertas de garantía');
  return res.json(); // { total, vencidas: { total, items }, proximas: { total, items }, rango: {...} }
}

