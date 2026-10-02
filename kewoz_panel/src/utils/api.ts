import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { type TokenPair } from '@/types/auth';
import { API_CONFIG } from '@/config/api';

declare module 'axios' {
  interface AxiosInstance {
    setAuthHeader: (token: string) => void;
    clearAuthHeader: () => void;
  }
}

/**
 * Create a new Axios instance with default configuration
 */
// Create the axios instance with proper typing
const api: AxiosInstance = Object.assign(
  axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    // withCredentials: true,
    // timeout: API_CONFIG.TIMEOUT,
  }),
  {
    setAuthHeader: (token: string) => {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    clearAuthHeader: () => {
      delete api.defaults.headers.common['Authorization'];
    },
  }
);


// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get tokens from localStorage or your preferred storage
    const authData = localStorage.getItem('auth-storage');
    const tokens = authData ? JSON.parse(authData).state?.tokens : null;
    
    // Add auth token to request if available
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Handle 401 Unauthorized errors (token expired, invalid, etc.)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const authData = localStorage.getItem('auth-storage');
        const tokens = authData ? JSON.parse(authData).state?.tokens : null;
        
        if (tokens?.refreshToken) {
          const response = await axios.post<TokenPair>(
            `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
            { refreshToken: tokens.refreshToken }
          );
          
          const { accessToken, refreshToken } = response.data;
          
          // Update tokens in storage
          if (authData) {
            const authState = JSON.parse(authData);
            authState.state.tokens = { accessToken, refreshToken };
            localStorage.setItem('auth-storage', JSON.stringify(authState));
          }
          
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, clear auth and redirect to login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    return typeof message === 'string' ? message : 'An unknown error occurred';
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

export default api;
