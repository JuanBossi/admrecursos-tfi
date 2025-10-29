import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAlertas,
  createAlerta,
  updateAlerta,
  deleteAlerta,
} from '../api/alertas.api';

export function useAlertasList(q = {}) {
  return useQuery({
    queryKey: ['alertas', q],
    queryFn: () => fetchAlertas(q),
    staleTime: 30_000, // 30 segundos para alertas (más frecuente)
    keepPreviousData: true,
  });
}

export function useAlertaCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAlerta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}

export function useAlertaUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateAlerta(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}

export function useAlertaDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAlerta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}