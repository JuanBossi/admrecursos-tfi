import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProveedores, createProveedor, deleteProveedor, updateProveedor } from '../api/proveedores.api.js';

export function useProveedoresList(q = {}) {
  return useQuery({
    queryKey: ['proveedores', q],
    queryFn: () => fetchProveedores(q),
    keepPreviousData: true,
    staleTime: 60_000,
  });
}

export function useProveedorCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useProveedorDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProveedor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useProveedorUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProveedor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}
