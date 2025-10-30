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

export async function fetchMantenimientosProximos({ dias = 30 } = {}) {
  // Intento 1: endpoint dedicado /mantenimientos/proximos?dias=...
  try {
    const url1 = `${BASE_URL}/mantenimientos/proximos?dias=${encodeURIComponent(dias)}`;
    const res1 = await fetch(url1);
    if (res1.ok) {
      const json1 = await res1.json();
      if (json1?.data) return json1.data;
    }
  } catch (_) {}

  // Intento 2: usar el listado general con params comunes
  const params = new URLSearchParams();
  params.set('estado', 'PROGRAMADO');
  params.set('dias', String(dias));          // si tu API usa "dias"
  params.set('hastaDias', String(dias));     // o "hastaDias" (quedará duplicado si tu backend ignora uno)
  const url2 = `${BASE_URL}/mantenimientos?${params.toString()}`;

  const res2 = await fetch(url2);
  if (!res2.ok) throw new Error(`Error ${res2.status}: ${res2.statusText}`);
  const json2 = await res2.json();
  if (json2?.ok && json2?.data) return json2.data;

  throw new Error('Respuesta del servidor no válida para mantenimientos próximos');
}
