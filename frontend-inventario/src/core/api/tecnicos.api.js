import { API_URL } from '../../config/env.js';
import { authHeaders } from './client';

const BASE_URL = API_URL;

export async function fetchTecnicos(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  
  const url = `${BASE_URL}/tecnicos?${params.toString()}`;
  console.log('Fetching tecnicos from:', url);
  
  const res = await fetch(url, { headers: authHeaders() });
  
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

export async function createTecnico(payload) {
  const res = await fetch(`${BASE_URL}/tecnicos`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Error al crear el técnico');
}

export async function updateTecnico(id, payload) {
  const res = await fetch(`${BASE_URL}/tecnicos/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Error al actualizar el técnico');
}

export async function deleteTecnico(id) {
  const res = await fetch(`${BASE_URL}/tecnicos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok) {
    return response.data;
  }
  
  throw new Error('Error al eliminar el técnico');
}
