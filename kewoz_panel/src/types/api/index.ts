import { AxiosRequestHeaders, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse, ErrorResponse } from '../common';

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/**
 * Query parameters for API requests
 */
export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/**
 * Request configuration
 */
export interface RequestConfig<T = unknown> {
  url: string;
  method?: HttpMethod;
  data?: T;
  params?: QueryParams;
  headers?: AxiosRequestHeaders;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'document' | 'text' | 'stream';
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
  signal?: AbortSignal;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: AxiosRequestHeaders;
  withCredentials?: boolean;
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'document' | 'text' | 'stream';
  maxContentLength?: number;
  maxBodyLength?: number;
  validateStatus?: (status: number) => boolean;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
}

/**
 * API response type
 * @template T - Type of the response data
 */
export interface ApiSuccessResponse<T> extends AxiosResponse<ApiResponse<T>> {}

/**
 * API error type
 */
export interface ApiError extends AxiosError<ErrorResponse> {}

/**
 * API endpoint configuration
 */
export interface EndpointConfig<T = unknown, R = unknown> {
  url: string | ((params: T) => string);
  method: HttpMethod;
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'document' | 'text' | 'stream';
  headers?: AxiosRequestHeaders | ((params: T) => AxiosRequestHeaders);
  transformRequest?: (data: T) => unknown;
  transformResponse?: (response: R) => R;
  validateStatus?: (status: number) => boolean;
  timeout?: number;
  withCredentials?: boolean;
}

/**
 * API endpoint map
 */
export type EndpointMap = Record<string, EndpointConfig>;

/**
 * API hooks
 */
export interface ApiHooks<T = unknown> {
  onRequest?: (config: RequestConfig<T>) => RequestConfig<T> | Promise<RequestConfig<T>>;
  onResponse?: (response: AxiosResponse<ApiResponse<T>>) => AxiosResponse<ApiResponse<T>> | Promise<AxiosResponse<ApiResponse<T>>>;
  onError?: (error: ApiError) => Promise<never>;
  onSuccess?: (response: AxiosResponse<ApiResponse<T>>) => void;
}

/**
 * API client interface
 */
export interface IApiClient {
  request: <T = unknown, R = ApiResponse<T>>(config: RequestConfig) => Promise<R>;
  get: <T = unknown>(url: string, params?: QueryParams, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>) => Promise<ApiResponse<T>>;
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, 'url' | 'method' | 'data'>
  ) => Promise<ApiResponse<T>>;
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, 'url' | 'method' | 'data'>
  ) => Promise<ApiResponse<T>>;
  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, 'url' | 'method' | 'data'>
  ) => Promise<ApiResponse<T>>;
  delete: <T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ) => Promise<ApiResponse<T>>;
  setBaseURL: (baseURL: string) => void;
  setHeader: (key: string, value: string) => void;
  removeHeader: (key: string) => void;
  addRequestInterceptor: (onFulfilled?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>, onRejected?: (error: unknown) => unknown) => number;
  removeRequestInterceptor: (id: number) => void;
  addResponseInterceptor: (
    onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: unknown) => unknown
  ) => number;
  removeResponseInterceptor: (id: number) => void;
}

/**
 * API error codes
 */
export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
