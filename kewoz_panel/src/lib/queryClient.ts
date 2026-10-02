import { QueryClient, QueryFunction, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_CONFIG } from '@/config/api';
import { ApiError } from '@/config/api';

/**
 * Default query function that will be used for all queries
 */
const defaultQueryFn: QueryFunction<unknown, QueryKey> = async ({ queryKey }) => {
  const [url, params] = queryKey as [string, Record<string, unknown>];
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY) && {
          Authorization: `Bearer ${localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY)}`,
        }),
      },
      ...(params && { body: JSON.stringify(params) }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'An error occurred');
    }
    
    return response.json();
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

/**
 * Create a new QueryClient with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: API_CONFIG.STALE_TIME,
      cacheTime: API_CONFIG.CACHE_TIME,
      retry: (failureCount, error) => {
        // Don't retry for 4xx errors except 401 and 403
        if (
          error instanceof Error &&
          'statusCode' in error &&
          typeof error.statusCode === 'number' &&
          error.statusCode >= 400 &&
          error.statusCode < 500 &&
          error.statusCode !== 401 &&
          error.statusCode !== 403
        ) {
          return false;
        }
        
        // Retry up to max retries
        return failureCount < API_CONFIG.MAX_RETRIES;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retryOnMount: true,
      keepPreviousData: true,
      suspense: process.env.NODE_ENV !== 'production',
      useErrorBoundary: (error: any) => {
        // Only use error boundary for server errors and auth errors
        return (
          error?.statusCode >= 500 ||
          error?.statusCode === 401 ||
          error?.statusCode === 403
        );
      },
      onError: (error: unknown) => {
        // Global error handler for queries
        if (error instanceof Error) {
          const apiError = error as unknown as ApiError;
          toast.error(apiError.message || 'An error occurred');
        }
      },
    },
    mutations: {
      onError: (error: unknown) => {
        // Global error handler for mutations
        if (error instanceof Error) {
          const apiError = error as unknown as ApiError;
          toast.error(apiError.message || 'An error occurred');
        }
      },
      retry: (failureCount, error: any) => {
        // Don't retry mutations by default
        return false;
      },
    },
  },
});

/**
 * Query keys factory
 * Provides type-safe query keys
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    user: (id: string) => ['users', id] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  // Add more query keys as needed
} as const;

/**
 * Helper to invalidate queries by key
 */
export const invalidateQueries = (queryKey: QueryKey) => {
  return queryClient.invalidateQueries(queryKey);
};

/**
 * Helper to prefetch a query
 */
export const prefetchQuery = <T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: Parameters<typeof queryClient.prefetchQuery>[2]
) => {
  return queryClient.prefetchQuery(queryKey, queryFn, options);
};

/**
 * Helper to set query data
 */
export const setQueryData = <T>(
  queryKey: QueryKey,
  updater: T | ((oldData: T | undefined) => T | undefined)
) => {
  return queryClient.setQueryData(queryKey, updater);
};

// Export React Query hooks for convenience
export * from '@tanstack/react-query';

// Export the query client as default
export default queryClient;
