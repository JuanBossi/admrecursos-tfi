import { API_URL } from '../../config/env.js';
import { authHeaders } from './client';

const BASE_URL = API_URL;

export async function fetchEmpleados(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const res = await fetch(`${BASE_URL}/empleados?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok && json?.data) return json.data;
  return json;
}

export async function createEmpleado(payload) {
  const body = {
    nombre: payload.nombre,
    apellido: payload.apellido,
    dni: payload.dni,
    contacto: payload.contacto,
    areaId: payload.areaId || undefined,
  };
  const res = await fetch(`${BASE_URL}/empleados`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok) return json.data;
  return json;
}

export async function updateEmpleado(id, payload) {
  const res = await fetch(`${BASE_URL}/empleados/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok) return json.data;
  return json;
}

export async function deleteEmpleado(id) {
  const res = await fetch(`${BASE_URL}/empleados/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok) return json.data;
  return json;
}

