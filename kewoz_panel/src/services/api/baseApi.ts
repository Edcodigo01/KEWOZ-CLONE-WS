import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_CONFIG } from "@/config/api";
import { handleApiError } from "@/config/api";
import { http, apiClient } from "@/lib/axios";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export abstract class BaseApiService {
  protected baseUrl: string;
  protected http: typeof http;
  protected apiClient: AxiosInstance;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.http = http;
    this.apiClient = apiClient;
  }

  /**
   * Make an HTTP request
   */
  protected async request<T = any, R = T, D = any>(
    config: AxiosRequestConfig<D> & { method: HttpMethod }
  ): Promise<R> {
    try {
      const response = await this.apiClient.request<T, AxiosResponse<R>, D>({
        ...config,
        url: this.getFullUrl(config.url || ""),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(handleApiError(error as AxiosError));
    }
  }

  /**
   * GET request
   */
  protected async get<T = any, R = T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.request<T, R>({ ...config, method: "get", url });
  }

  /**
   * POST request
   */
  protected async post<T = any, R = T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.request<T, R, D>({ ...config, method: "post", url, data });
  }

  /**
   * PUT request
   */
  protected async put<T = any, R = T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.request<T, R, D>({ ...config, method: "put", url, data });
  }

  /**
   * PATCH request
   */
  protected async patch<T = any, R = T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.request<T, R, D>({ ...config, method: "patch", url, data });
  }

  /**
   * DELETE request
   */
  protected async delete<T = any, R = T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.request<T, R>({ ...config, method: "delete", url });
  }

  /**
   * Get full URL for the endpoint
   */
  protected getFullUrl(endpoint: string): string {
    // Remove leading/trailing slashes for consistency
    const cleanBase = this.baseUrl.replace(/^\/+|\/+$/g, "");
    const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, "");
    // Avoid protocol-relative URLs like //users/find-user
    if (!cleanBase) return `/${cleanEndpoint}`;
    return `/${cleanBase}/${cleanEndpoint}`;
  }

  /**
   * Create query parameters string from object
   */
  protected createQueryParams(params?: Record<string, any>): string {
    if (!params) return "";

    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            queryParams.append(key, String(item));
          });
        } else if (value instanceof Date) {
          queryParams.append(key, value.toISOString());
        } else if (typeof value === "object") {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Handle pagination parameters
   */
  protected getPaginationParams(
    page: number = 1,
    pageSize: number = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ) {
    return {
      page: Math.max(1, page),
      pageSize: Math.min(
        Math.max(1, pageSize),
        API_CONFIG.PAGINATION.MAX_PAGE_SIZE
      ),
    };
  }

  /**
   * Transform response data
   */
  protected transformResponse<T>(response: any): T {
    // Implement common response transformation logic here
    return response as T;
  }

  /**
   * Transform error
   */
  protected transformError(error: any): never {
    throw handleApiError(error);
  }
}
