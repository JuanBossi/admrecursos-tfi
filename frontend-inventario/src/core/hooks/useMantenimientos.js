import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMantenimientos, createMantenimiento, fetchMantenimientosProximos } from '../api/mantenimientos.api';

export function useMantenimientosList(q = {}) {
  return useQuery({
    queryKey: ['mantenimientos', q],
    queryFn: () => fetchMantenimientos(q),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}

export function useMantenimientoCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMantenimiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mantenimientos'] });
    },
  });
}

function toArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (Array.isArray(x.items)) return x.items;
  if (Array.isArray(x.data)) return x.data;
  if (Array.isArray(x.rows)) return x.rows;
  if (Array.isArray(x.result)) return x.result;
  if (typeof x === 'object') return Object.values(x);
  return [];
}

export function useMantenimientosProximos({ dias = 30 } = {}) {
  const q = useQuery({
    queryKey: ['mantenimientos-proximos', dias],
    queryFn: () => fetchMantenimientosProximos({ dias }),
    staleTime: 30_000,
  });

  const data = useMemo(() => {
    const arr = toArray(q.data);
    return arr
      .map((row) => ({
        id: row.id ?? row.mantenimientoId ?? String(Math.random()),
        equipo: row.equipo ?? row.equipoNombre ?? row.dispositivo ?? 'Equipo',
        equipoId: row.equipoId ?? row.dispositivoId ?? null,
        fecha: row.fecha ?? row.fechaProgramada ?? row.programado_para ?? row.programada,
        tecnico: row.tecnico ?? row.asignadoA ?? row.responsable ?? null,
        detalle: row.detalle ?? row.descripcion ?? '',
      }))
      .sort((a, b) => new Date(a.fecha ?? 0) - new Date(b.fecha ?? 0));
  }, [q.data]);

  return { ...q, data };
}