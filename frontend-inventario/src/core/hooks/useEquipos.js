import { useQuery } from '@tanstack/react-query';
import { fetchEquipos } from '../api/equipos.api';

export function useEquiposList(q = {}) {
  return useQuery({
    queryKey: ['equipos', q],
    queryFn: () => fetchEquipos(q),
    staleTime: 60_000,
  });
}
