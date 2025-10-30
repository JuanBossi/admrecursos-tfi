import { API_URL } from '../../config/env.js';

const BASE_URL = API_URL;

export async function fetchMantenimientos(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const url = `${BASE_URL}/mantenimientos?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const response = await res.json();
  if (response.ok && response.data) return response.data;
  throw new Error('Respuesta del servidor no válida');
}

export async function createMantenimiento(payload) {
  const res = await fetch(`${BASE_URL}/mantenimientos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  if (response.ok && response.data) return response.data;
  throw new Error('Error al crear el mantenimiento');
}


