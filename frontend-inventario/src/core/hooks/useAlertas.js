import { useQuery } from '@tanstack/react-query';
import { fetchGarantias } from '../api/equipos.api';

export function useGarantias(dias = 30) {
  return useQuery({
    queryKey: ['garantias', dias],
    queryFn: () => fetchGarantias(dias),
    staleTime: 60_000,
  });
}
