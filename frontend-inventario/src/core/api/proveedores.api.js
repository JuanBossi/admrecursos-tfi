import { API_URL } from '../../config/env.js';
import { authHeaders } from './client';

const BASE_URL = API_URL;

export async function fetchProveedores(q = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const res = await fetch(`${BASE_URL}/proveedores?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok && json?.data) return json.data; // { items, total, page, limit }
  return json;
}

export async function createProveedor(payload) {
  const res = await fetch(`${BASE_URL}/proveedores`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok) return json.data;
  return json;
}

export async function updateProveedor(id, payload) {
  const res = await fetch(`${BASE_URL}/proveedores/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok) return json.data;
  return json;
}

export async function deleteProveedor(id) {
  const res = await fetch(`${BASE_URL}/proveedores/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  if (json?.ok) return json.data;
  return json;
}
