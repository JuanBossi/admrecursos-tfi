import { api } from './client';

// ¡OJO! No importes tipos desde ../types/*.js en JS.
// Si querés autocompletado, podés usar JSDoc (ver ejemplo al final).

export async function fetchEquipos(q = {}) {
  const res = await api.get('/equipos', { params: q });
  return res.data.data; // { items, total, page, limit }
}

export async function fetchGarantias(dias = 30) {
  const res = await api.get('/equipos/alertas/garantia', { params: { dias } });
  return res.data.data; // { total, vencidas, proximas, rango }
}

/**
 * Ejemplo de JSDoc por si querés autocompletado:
 * 
 * // @ts-check
 * /** @typedef {import('../types/equipos').Equipo} Equipo *\/
 * /** @typedef {import('../types/common').Paginated<Equipo>} PaginatedEquipos *\/
 */
