import { useQuery } from '@tanstack/react-query';
import { fetchHistorialByEquipo } from '../api/historial.api';

export function useHistorialPorEquipo(equipoId) {
  return useQuery({
    queryKey: ['historial-equipo', equipoId],
    queryFn: () => fetchHistorialByEquipo(equipoId),
    enabled: !!equipoId,
    staleTime: 30_000,
  });
}

