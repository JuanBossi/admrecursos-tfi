import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchEquipos,
  createEquipo,
  fetchAreas,
  fetchEmpleados,
  fetchProveedores,
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
