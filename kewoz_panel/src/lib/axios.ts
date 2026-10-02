import axios, { AxiosError, type AxiosInstance, type  AxiosRequestConfig, type AxiosResponse, type  InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';
import { handleApiError } from '@/config/api';
import { useAuthStore } from '@/store/auth/authStore';

// Create a custom Axios instance with default config
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    // timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    // Only enable credentials if we're not in development or if explicitly needed
    // withCredentials: import.meta.env.PROD,
  });

  // Request interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Add auth token if it exists
      const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracking
      // config.headers['X-Request-ID'] = crypto.randomUUID();

      // Add timestamp to prevent caching
      if (config.method?.toLowerCase() === 'get') {
        config.params = {
          ...config.params,
          // _t: Date.now(),
        };
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Handle successful responses
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Handle 401 Unauthorized errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Attempt to refresh the token
          const newToken = await refreshAuthToken();
          
          // Update the authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log the user out
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }
      
      // Handle other errors
      return Promise.reject(handleApiError(error));
    }
  );

  return instance;
};

// Token refresh function
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const refreshAuthToken = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  const refreshToken = localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    const error = new Error('No refresh token available');
    processQueue(error, null);
    throw error;
  }

  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken }
    );
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Update tokens in storage
    localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, accessToken);
    if (newRefreshToken) {
      localStorage.setItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY, newRefreshToken);
    }
    
    processQueue(null, accessToken);
    return accessToken;
  } catch (error) {
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Create API client instance
export const apiClient = createAxiosInstance(API_CONFIG.BASE_URL);

// Export common HTTP methods with type safety
export const http = {
  get: <T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R> => 
    apiClient.get<T, R>(url, config),
    
  post: <T = any, R = T, D = any>(
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig
  ): Promise<R> => 
    apiClient.post<T, R, D>(url, data, config),
    
  put: <T = any, R = T, D = any>(
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig
  ): Promise<R> => 
    apiClient.put<T, R, D>(url, data, config),
    
  patch: <T = any, R = T, D = any>(
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig
  ): Promise<R> => 
    apiClient.patch<T, R, D>(url, data, config),
    
  delete: <T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R> => 
    apiClient.delete<T, R>(url, config),
    
  request: <T = any, R = T>(config: AxiosRequestConfig): Promise<R> => 
    apiClient.request<T, R>(config),
};

// Export types
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError };

// Export the axios instance for direct use if needed
export default apiClient;
