import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from '../api/empleados.api.js';

export function useEmpleadosList(q = {}) {
  return useQuery({
    queryKey: ['empleados', q],
    queryFn: () => fetchEmpleados(q),
    keepPreviousData: true,
    staleTime: 60_000,
  });
}

export function useEmpleadoCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmpleado,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empleados'] }),
  });
}

export function useEmpleadoUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEmpleado(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empleados'] }),
  });
}

export function useEmpleadoDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEmpleado,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empleados'] }),
  });
}

