import { HTTP_STATUS } from '../constants';
import { storage } from '../storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  auth?: boolean;
  contentType?: string;
};

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      headers = {},
      params,
      body,
      auth = true,
      contentType = 'application/json',
    } = options;

    try {
      // Add auth token if needed
      const authHeader: Record<string, string> = {};
      if (auth) {
        const token = storage.get<string>('auth_token');
        if (token) {
          authHeader['Authorization'] = `Bearer ${token}`;
        }
      }

      // Build URL with query params
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(`${key}[]`, String(v)));
            } else {
              url.searchParams.append(key, String(value));
            }
          }
        });
      }

      // Prepare request config
      const config: RequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...authHeader,
          'Content-Type': contentType,
          ...headers,
        },
        credentials: 'include',
      };

      // Add body for non-GET/HEAD requests
      if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
        config.body = contentType === 'application/json' 
          ? JSON.stringify(body) 
          : body;
      }

      // Make the request
      const response = await fetch(url.toString(), config);
      
      // Handle response
      const responseData = await this.handleResponse<T>(response);
      
      if (!response.ok) {
        return {
          data: null,
          error: responseData?.message || 'An error occurred',
          status: response.status,
        };
      }

      return {
        data: responseData as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  private async handleResponse<T>(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new Error('Invalid JSON response');
      }
    } else if (contentType?.includes('text/')) {
      return await response.text();
    } else if (response.status === 204) {
      return null;
    } else {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  }

  // HTTP Methods
  public async get<T>(
    endpoint: string, 
    options: Omit<RequestOptions, 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options);
  }

  public async post<T>(
    endpoint: string, 
    body?: any, 
    options: Omit<RequestOptions, 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  public async put<T>(
    endpoint: string, 
    body?: any, 
    options: Omit<RequestOptions, 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  public async patch<T>(
    endpoint: string, 
    body?: any, 
    options: Omit<RequestOptions, 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  public async delete<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }

  // File Upload
  public async upload<T>(
    endpoint: string,
    file: File,
    fieldName = 'file',
    additionalData: Record<string, any> = {},
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Append additional data to formData
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve) => {
      xhr.open('POST', `${this.baseUrl}${endpoint}`, true);
      
      // Set auth header
      const token = storage.get<string>('auth_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // Progress handler
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
      }
      
      xhr.onload = async () => {
        let data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch (error) {
          data = xhr.responseText;
        }
        
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            data: data as T,
            error: null,
            status: xhr.status,
          });
        } else {
          resolve({
            data: null,
            error: data?.message || 'Upload failed',
            status: xhr.status,
          });
        }
      };
      
      xhr.onerror = () => {
        resolve({
          data: null,
          error: 'Network error during upload',
          status: 0,
        });
      };
      
      xhr.send(formData);
    });
  }
}

// Create API client instance
export const api = new ApiClient(process.env.REACT_APP_API_URL || '/api');

// API Response Helpers
export const isApiError = <T>(
  response: ApiResponse<T>
): response is { error: string; data: null; status: number } => {
  return response.error !== null || response.data === null;
};

export const isApiSuccess = <T>(
  response: ApiResponse<T>
): response is { data: T; error: null; status: number } => {
  return response.error === null && response.data !== null;
};

// Example usage:
/*
// GET request
const { data, error } = await api.get<User>('/users/me');

// POST request
const { data, error } = await api.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// File upload
const { data, error } = await api.upload<{ url: string }>(
  '/upload', 
  file, 
  'avatar',
  { userId: '123' },
  (progress) => console.log(`Upload progress: ${progress}%`)
);
*/
