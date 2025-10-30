import { API_URL } from '../../config/env.js';
import { authHeaders } from './client';

const BASE_URL = API_URL;

export async function fetchMantenimientos(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const url = `${BASE_URL}/mantenimientos?${params.toString()}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  // Backend envuelve como { ok: true, data: { items, total, page, limit } }
  const response = await res.json();
  if (response?.ok) return response.data;
  throw new Error('Respuesta del servidor no válida');
}

export async function createMantenimiento(payload) {
  // Alinear nombres de campos con CreateMantenimientoDto
  const body = {
    equipo_id: payload.equipo_id ?? Number(payload.equipoId),
    tipo: payload.tipo, // 'Preventivo' | 'Correctivo'
    descripcion: payload.descripcion,
    fecha_programada: payload.fecha_programada ?? payload.fecha,
    ...(payload.tecnico_id != null ? { tecnico_id: payload.tecnico_id } : {}),
    ...(payload.created_by != null ? { created_by: payload.created_by } : {}),
  };

  const res = await fetch(`${BASE_URL}/mantenimientos`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  if (response.ok && response.data) return response.data;
  throw new Error('Error al crear el mantenimiento');
}

export async function updateMantenimiento(id, payload) {
  const body = {
    ...payload,
  };
  const res = await fetch(`${BASE_URL}/mantenimientos/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  if (response.ok && response.data) return response.data;
  throw new Error('Error al actualizar el mantenimiento');
}

export async function fetchMantenimientosProximos({ dias = 30 } = {}) {
  const url = `${BASE_URL}/mantenimientos/proximos?dias=${encodeURIComponent(dias)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json?.ok && Array.isArray(json.data)) return json.data;
  throw new Error('Respuesta del servidor no válida para mantenimientos próximos');
}
