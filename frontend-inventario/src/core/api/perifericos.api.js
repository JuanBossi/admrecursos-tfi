import { API_URL } from '../../config/env.js';
import { authHeaders } from './client';

const BASE_URL = API_URL;

export async function fetchPerifericos(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  
  const url = `${BASE_URL}/perifericos?${params.toString()}`;
  console.log('Fetching perifericos from:', url);
  
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

export async function createPeriferico(payload) {
  const res = await fetch(`${BASE_URL}/perifericos`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Error al crear el periférico');
}

export async function updatePeriferico(id, payload) {
  console.log('Updating periferico with payload:', payload);
  
  const res = await fetch(`${BASE_URL}/perifericos/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data;
  }
  
  throw new Error('Error al actualizar el periférico');
}

export async function deletePeriferico(id) {
  const res = await fetch(`${BASE_URL}/perifericos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  
  const response = await res.json();
  if (response.ok) {
    return response.data;
  }
  
  throw new Error('Error al eliminar el periférico');
}

// Auxiliares para selects
export async function fetchTiposPeriferico(params = {}) {
  const res = await fetch(`${BASE_URL}/tipos-periferico?page=1&limit=200`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron cargar los tipos de periféricos');
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data.items || [];
  }
  
  throw new Error('Respuesta del servidor no válida');
}

export async function fetchMarcas(params = {}) {
  const res = await fetch(`${BASE_URL}/marcas?page=1&limit=200`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron cargar las marcas');
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data.items || [];
  }
  
  throw new Error('Respuesta del servidor no válida');
}

export async function fetchEquipos(params = {}) {
  const res = await fetch(`${BASE_URL}/equipos?page=1&limit=200`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron cargar los equipos');
  
  const response = await res.json();
  if (response.ok && response.data) {
    return response.data.items || [];
  }
  
  throw new Error('Respuesta del servidor no válida');
}
