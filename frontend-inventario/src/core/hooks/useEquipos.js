import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchEquipos,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  darDeBajaEquipo,
  fetchAreas,
  fetchEmpleados,
  fetchProveedores,
  fetchGarantiasPorVencer
} from '../api/equipos.api';

export function useEquiposList(q = {}) {
  return useQuery({
    queryKey: ['equipos', q],
    queryFn: () => fetchEquipos(q),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}

export function useEquipoCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEquipo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

export function useEquipoUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEquipo(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

export function useEquipoDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEquipo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

export function useEquipoBaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }) => darDeBajaEquipo(id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
}

// Auxiliares para selects
export function useAreas() {
  return useQuery({
    queryKey: ['areas', { page: 1, limit: 200 }],
    queryFn: fetchAreas,
    staleTime: 10 * 60_000,
  });
}

export function useEmpleados() {
  return useQuery({
    queryKey: ['empleados', { page: 1, limit: 200 }],
    queryFn: fetchEmpleados,
    staleTime: 10 * 60_000,
  });
}

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores', { page: 1, limit: 200 }],
    queryFn: fetchProveedores,
    staleTime: 10 * 60_000,
  });
}

function daysUntil(iso) {
  if (!iso) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const raw = new Date(iso);
  const due = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

export function useGarantiasPorVencer({ dias = 30 } = {}) {
  const q = useQuery({
    // cambiamos la key para forzar refetch limpio
    queryKey: ['garantias-por-vencer-v4', dias],
    queryFn: () => fetchGarantiasPorVencer({ dias }),
    staleTime: 30_000,
  });

  const data = useMemo(() => {
    const arr = Array.isArray(q.data) ? q.data : [];

    return arr
      .map((row) => {
        const venceElRaw = row.venceEl ?? row.garantia ?? null;

        const venceEl =
          venceElRaw instanceof Date
            ? venceElRaw.toISOString().slice(0, 10)
            : (typeof venceElRaw === 'string' || typeof venceElRaw === 'number'
                ? String(venceElRaw)
                : null);

        const diasRestantes =
          Number.isFinite(row.diasRestantes)
            ? row.diasRestantes
            : (venceEl ? daysUntil(venceEl) : null);

        return {
          id: row.id ?? row.equipoId ?? row.codigo ?? String(Math.random()),
          // tu back aliasea codigo_interno AS nombre
          nombre: row.nombre ?? row.equipo ?? row.codigo ?? 'Equipo',
          venceEl,
          diasRestantes: diasRestantes ?? 9999,
        };
      })
      .sort((a, b) => (a.diasRestantes ?? 9999) - (b.diasRestantes ?? 9999));
  }, [q.data]);

  return { ...q, data, dias };
}