import { useQuery } from '@tanstack/react-query';
import { fetchEstadisticas } from '../api/estadisticas.api';

export function useEstadisticas() {
  return useQuery({
    queryKey: ['estadisticas'],
    queryFn: fetchEstadisticas,
    staleTime: 5 * 60_000, // 5 minutos
    refetchInterval: 5 * 60_000, // Refetch cada 5 minutos
  });
}
