import { API_URL } from '../../config/env.js';

const BASE_URL = API_URL;

export async function fetchAlertas(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  
  const url = `${BASE_URL}/alertas?${params.toString()}`;
  console.log('Fetching alertas from:', url);
  
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

export async function createAlerta(payload) {
  const res = await fetch(`${BASE_URL}/alertas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Error al crear la alerta');
}

export async function updateAlerta(id, payload) {
  const res = await fetch(`${BASE_URL}/alertas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Error al actualizar la alerta');
}

export async function deleteAlerta(id) {
  const res = await fetch(`${BASE_URL}/alertas/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok) {
    return response.data;
  }
  
  throw new Error('Error al eliminar la alerta');
}
