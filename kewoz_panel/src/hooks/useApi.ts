import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { http, apiClient } from '@/lib/axios';
import { queryKeys } from '@/lib/queryClient';
import { ApiError } from '@/config/api';

// Generic API response type
type ApiResponse<T> = T;

// Custom query options with default error handling
type UseApiQueryOptions<TData, TError = ApiError> = Omit<
  UseQueryOptions<ApiResponse<TData>, TError>,
  'queryKey' | 'queryFn'
> & {
  queryKey: QueryKey;
  url: string;
  config?: AxiosRequestConfig;
};

// Custom mutation options with default error handling
type UseApiMutationOptions<TData, TVariables, TError = ApiError> = Omit<
  UseMutationOptions<ApiResponse<TData>, TError, TVariables>,
  'mutationFn'
> & {
  url: string;
  method?: 'post' | 'put' | 'patch' | 'delete';
  config?: AxiosRequestConfig;
  invalidateQueries?: QueryKey | QueryKey[];
};

/**
 * Custom hook for making GET requests with React Query
 */
export function useApiQuery<TData = any, TError = ApiError>({
  queryKey,
  url,
  config,
  ...options
}: UseApiQueryOptions<TData, TError>) {
  return useQuery<ApiResponse<TData>, TError>(
    queryKey,
    async () => {
      const response = await http.get<TData>(url, config);
      return response;
    },
    {
      // Default options
      retry: 2,
      refetchOnWindowFocus: false,
      ...options,
    }
  );
}

/**
 * Custom hook for making POST/PUT/PATCH/DELETE requests with React Query
 */
export function useApiMutation<TData = any, TVariables = any, TError = ApiError>({
  url,
  method = 'post',
  config,
  invalidateQueries,
  onSuccess,
  onError,
  ...options
}: UseApiMutationOptions<TData, TVariables, TError>) {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<TData>, TError, TVariables>(
    async (data) => {
      switch (method.toLowerCase()) {
        case 'put':
          return http.put<TData>(url, data, config);
        case 'patch':
          return http.patch<TData>(url, data, config);
        case 'delete':
          return http.delete<TData>(url, { ...config, data });
        case 'post':
        default:
          return http.post<TData>(url, data, config);
      }
    },
    {
      onSuccess: (data, variables, context) => {
        // Invalidate queries if specified
        if (invalidateQueries) {
          const queries = Array.isArray(invalidateQueries) 
            ? invalidateQueries 
            : [invalidateQueries];
          
          queries.forEach((queryKey) => {
            queryClient.invalidateQueries(queryKey);
          });
        }
        
        // Call custom onSuccess if provided
        if (onSuccess) {
          onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        console.error('API Mutation Error:', error);
        
        // Call custom onError if provided
        if (onError) {
          onError(error, variables, context);
        }
      },
      ...options,
    }
  );
}

/**
 * Hook for paginated queries
 */
export function usePaginatedQuery<TData = any, TError = ApiError>(
  queryKey: QueryKey,
  url: string,
  params: Record<string, any> = {},
  options: Omit<UseApiQueryOptions<TData[], TError>, 'queryKey' | 'url'> = {}
) {
  const { page = 1, pageSize = 10, ...restParams } = params;
  
  return useApiQuery<TData[], TError>({
    queryKey: [...queryKey, { page, pageSize, ...restParams }],
    url: `${url}?${new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...restParams,
    })}`,
    ...options,
  });
}

/**
 * Hook for infinite queries (load more)
 */
export function useInfiniteQuery<TData = any, TError = ApiError>(
  queryKey: QueryKey,
  url: string,
  params: Record<string, any> = {},
  options: Omit<UseApiQueryOptions<TData[], TError>, 'queryKey' | 'url'> = {}
) {
  const { page = 1, pageSize = 10, ...restParams } = params;
  
  return useInfiniteQuery<ApiResponse<{ data: TData[]; nextPage?: number }>, TError>(
    [...queryKey, { ...restParams }],
    async ({ pageParam = page }) => {
      const response = await http.get(url, {
        params: {
          page: pageParam,
          pageSize,
          ...restParams,
        },
      });
      return response;
    },
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticMutation<TData, TVariables, TContext = unknown>({
  queryKey,
  mutationFn,
  onMutate,
  ...options
}: {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate: (variables: TVariables) => Promise<TContext> | TContext;
} & Omit<
  UseMutationOptions<TData, Error, TVariables, TContext>,
  'mutationFn' | 'onMutate'
>) {
  const queryClient = useQueryClient();
  
  return useMutation(mutationFn, {
    // When mutate is called:
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKey);

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache with the new value
      const context = await onMutate(variables);

      // Return a context object with the snapshotted value
      return { previousData, ...context };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      if (options.onError) {
        options.onError(error, variables, context as any);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
      
      if (options.onSettled) {
        options.onSettled(undefined, undefined, undefined as any);
      }
    },
    ...options,
  });
}

// Re-export useful types and utilities
export { useQuery, useMutation, useQueryClient, useInfiniteQuery as useReactQueryInfiniteQuery } from '@tanstack/react-query';
export type { QueryKey, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
