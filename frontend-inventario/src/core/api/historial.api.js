import { API_URL } from '../../config/env';
import { authHeaders } from './client';

const BASE_URL = API_URL;

export async function fetchHistorialByEquipo(equipoId) {
  if (!equipoId) throw new Error('equipoId requerido');
  const res = await fetch(`${BASE_URL}/historial-cambios/equipo/${encodeURIComponent(equipoId)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());

  try {
    const payload = await res.json();
    if (payload?.ok && payload?.data) return payload.data;
    if (Array.isArray(payload)) return payload;
    return payload;
  } catch (_) {
    throw new Error('Respuesta inválida del servidor');
  }
}

