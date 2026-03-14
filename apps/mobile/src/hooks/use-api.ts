import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

// Generic query hook
export function useApiQuery<T>(
  key: string[],
  path: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await apiGet<T>(path);
      return res.data;
    },
    ...options,
  });
}

// Generic mutation hooks
export function useApiPost<TData, TBody = unknown>(
  path: string,
  options?: UseMutationOptions<TData, Error, TBody>
) {
  return useMutation<TData, Error, TBody>({
    mutationFn: async (body: TBody) => {
      const res = await apiPost<TData>(path, body);
      return res.data;
    },
    ...options,
  });
}

export function useApiPut<TData, TBody = unknown>(
  path: string,
  options?: UseMutationOptions<TData, Error, TBody>
) {
  return useMutation<TData, Error, TBody>({
    mutationFn: async (body: TBody) => {
      const res = await apiPut<TData>(path, body);
      return res.data;
    },
    ...options,
  });
}

export function useApiDelete<TData, TBody = void>(
  path: string,
  options?: UseMutationOptions<TData, Error, TBody>
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TBody>({
    mutationFn: async (body: TBody) => {
      const res = await apiDelete<TData>(path, body || undefined);
      return res.data;
    },
    ...options,
  });
}
