import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMantenimientos, createMantenimiento } from '../api/mantenimientos.api';

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
