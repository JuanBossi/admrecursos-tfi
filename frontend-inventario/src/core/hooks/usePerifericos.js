import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPerifericos,
  createPeriferico,
  updatePeriferico,
  deletePeriferico,
  fetchTiposPeriferico,
  fetchMarcas,
  fetchEquipos,
} from '../api/perifericos.api';

export function usePerifericosList(q = {}) {
  return useQuery({
    queryKey: ['perifericos', q],
    queryFn: () => fetchPerifericos(q),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}

export function usePerifericoCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPeriferico,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perifericos'] });
    },
  });
}

export function usePerifericoUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updatePeriferico(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perifericos'] });
    },
  });
}

export function usePerifericoDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePeriferico,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perifericos'] });
    },
  });
}

// Auxiliares
export function useTiposPeriferico() {
  return useQuery({
    queryKey: ['tipos-periferico'],
    queryFn: () => fetchTiposPeriferico({ page: 1, limit: 100 }),
    staleTime: 10 * 60_000,
  });
}
export function useMarcas() {
  return useQuery({
    queryKey: ['marcas'],
    queryFn: () => fetchMarcas({ page: 1, limit: 200 }),
    staleTime: 10 * 60_000,
  });
}
export function useEquiposForSelect() {
  return useQuery({
    queryKey: ['equipos', 'for-select'],
    queryFn: () => fetchEquipos({ page: 1, limit: 200 }),
    staleTime: 60_000,
  });
}
