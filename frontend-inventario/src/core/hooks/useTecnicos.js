import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTecnicos,
  createTecnico,
  updateTecnico,
  deleteTecnico,
} from '../api/tecnicos.api';

export function useTecnicosList(q = {}) {
  return useQuery({
    queryKey: ['tecnicos', q],
    queryFn: () => fetchTecnicos(q),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}

export function useTecnicoCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTecnico,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tecnicos'] });
    },
  });
}

export function useTecnicoUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTecnico(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tecnicos'] });
    },
  });
}

export function useTecnicoDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTecnico,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tecnicos'] });
    },
  });
}
