/**
 * API Response Types
 */

// Base API response structure
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  statusCode: number;
  timestamp?: string;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// API error response
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, string[]>;
  isApiError: boolean;
}

// Request options for API calls
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
  timeout?: number;
  [key: string]: any;
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  responseType?:
    | "json"
    | "blob"
    | "arraybuffer"
    | "document"
    | "text"
    | "stream";
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxContentLength?: number;
  maxBodyLength?: number;
  validateStatus?: (status: number) => boolean;
}

// Query parameters for list endpoints
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  [key: string]: any;
}

// File upload options
export interface FileUploadOptions {
  file: File;
  fieldName?: string;
  fileName?: string;
  mimeType?: string;
  metadata?: Record<string, any>;
  onUploadProgress?: (progress: number) => void;
}

// API event types
export type ApiEvent =
  | "request"
  | "response"
  | "error"
  | "authError"
  | "networkError"
  | "timeout";

// API event listener
export type ApiEventListener = (event: {
  type: ApiEvent;
  data?: any;
  error?: Error;
  timestamp: number;
}) => void;

// Request/Response interceptors
export interface RequestInterceptor {
  onFulfilled?: (config: any) => any;
  onRejected?: (error: any) => any;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: any) => any;
  onRejected?: (error: any) => any;
}

// API client interface
export interface IApiClient {
  get<T = any>(url: string, config?: RequestOptions): Promise<T>;
  post<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T>;
  put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T>;
  delete<T = any>(url: string, config?: RequestOptions): Promise<T>;
  request<T = any>(config: RequestOptions): Promise<T>;
  setBaseURL(baseURL: string): void;
  setHeader(key: string, value: string): void;
  removeHeader(key: string): void;
  addRequestInterceptor(interceptor: RequestInterceptor): number;
  removeRequestInterceptor(id: number): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): number;
  removeResponseInterceptor(id: number): void;
  uploadFile<T = any>(
    url: string,
    options: FileUploadOptions,
    config?: RequestOptions
  ): Promise<T>;
  downloadFile(url: string, config?: RequestOptions): Promise<Blob>;
  on(event: ApiEvent, listener: ApiEventListener): () => void;
  off(event: ApiEvent, listener: ApiEventListener): void;
  createCancelToken(): { token: string; cancel: (message?: string) => void };
}

// Cache configuration for API requests
export interface CacheConfig {
  enabled?: boolean;
  ttl?: number; // Time to live in milliseconds
  key?: string;
  storage?: "memory" | "local" | "session";
  maxSize?: number;
  clearOnError?: boolean;
  clearOnLogout?: boolean;
}

// Retry configuration for failed requests
export interface RetryConfig {
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number | ((retryCount: number) => number);
  retryOn?: (error: any) => boolean;
}

// Base query configuration
export interface BaseQueryConfig {
  cache?: CacheConfig | boolean;
  retry?: RetryConfig | boolean | number;
  refetchOnMount?: boolean | "always";
  refetchOnWindowFocus?: boolean | "always";
  refetchOnReconnect?: boolean | "always";
  refetchInterval?: number | false | ((data: any) => number | false);
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onSettled?: (data: any, error: any) => void;
  select?: (data: any) => any;
  suspense?: boolean;
  keepPreviousData?: boolean;
  notifyOnChangeProps?: string[] | "all";
  meta?: Record<string, any>;
}

// Query configuration
export interface QueryConfig<TVariables = any>
  extends Omit<BaseQueryConfig, "retry"> {
  variables?: TVariables;
  queryKey?: any[];
  queryFn?: (context: any) => Promise<any>;
  initialData?: any | (() => any);
  placeholderData?: any | (() => any);
  retryDelay?: number | ((retryCount: number) => number);
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  useErrorBoundary?: boolean | ((error: any) => boolean);
  refetchIntervalInBackground?: boolean;
}

// Mutation configuration
export interface MutationConfig<TVariables = any, TContext = any> {
  mutationFn: (variables: TVariables) => Promise<any>;
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: any, variables: TVariables, context: TContext) => void;
  onError?: (error: any, variables: TVariables, context: TContext) => void;
  onSettled?: (
    data: any,
    error: any,
    variables: TVariables,
    context: TContext
  ) => void;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  retryDelay?: number | ((retryCount: number) => number);
  useErrorBoundary?: boolean | ((error: any) => boolean);
  meta?: Record<string, any>;
}
