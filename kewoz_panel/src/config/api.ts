// API configuration constants
export const API_CONFIG = {
  // Base URL for all API requests - uses Vite environment variables
  // In development, use the full URL; in production, use relative URLs
  BASE_URL: import.meta.env["VITE_API_URL"],

  // API version
  VERSION: "v1",

  // Default request timeout in milliseconds
  TIMEOUT: 30000, // 30 seconds

  // Default number of retries for failed requests
  MAX_RETRIES: 2,

  // Default cache time in milliseconds (5 minutes)
  CACHE_TIME: 5 * 60 * 1000,

  // Default stale time in milliseconds (0 = always stale)
  STALE_TIME: 0,

  // Default pagination settings
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  // Authentication
  AUTH: {
    TOKEN_KEY: "auth_token",
    REFRESH_TOKEN_KEY: "refresh_token",
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before token expiry
  },

  // Endpoints
  ENDPOINTS: {
    USERS: {
      LIST: "/admin/users",
    },
    AUTH: {
      LOGIN: "/login",
      REGISTER: "/auth/register",
      REFRESH: "/auth/refresh",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password",
      VERIFY_EMAIL: "/auth/verify-email",
    },
    ADMIN: {
      BASE: "/users",
      PROFILE: "/",
      PREFERENCES: "/users/preferences",
    },
    CONFIG: {
      BASE: "/config",
      GET_CONFIGURATION: "/",
    },
    // Add more endpoints as needed
  },
} as const;

// Helper to build API URL
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading/trailing slashes for consistency
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, "");
  return `${API_CONFIG.BASE_URL}/api/${cleanEndpoint}`;
};

// Default query function for React Query
export const defaultQueryFn = async ({ queryKey }: { queryKey: any[] }) => {
  const [url, params] = queryKey;
  const response = await fetch(buildApiUrl(url), {
    headers: {
      "Content-Type": "application/json",
      // Add auth header if token exists
      ...(localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY) && {
        Authorization: `Bearer ${localStorage.getItem(
          API_CONFIG.AUTH.TOKEN_KEY
        )}`,
      }),
    },
    ...(params && { body: JSON.stringify(params) }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "An error occurred");
  }

  return response.json();
};

// Default mutation function for React Query
export const defaultMutationFn = async ({
  url,
  data,
}: {
  url: string;
  data: any;
}) => {
  const response = await fetch(buildApiUrl(url), {
    method: "POST", // or 'PUT', 'PATCH', etc.
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY) && {
        Authorization: `Bearer ${localStorage.getItem(
          API_CONFIG.AUTH.TOKEN_KEY
        )}`,
      }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "An error occurred");
  }

  return response.json();
};

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Common error response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, string[]>;
}

// Helper to handle API errors
export const handleApiError = (error: any): never => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    throw {
      message: data?.message || "An error occurred",
      statusCode: status,
      error: data?.error,
      details: data?.details,
    } as ApiError;
  } else if (error.request) {
    // The request was made but no response was received
    throw {
      message: "No response received from server",
      statusCode: 0,
      error: "Network Error",
    } as ApiError;
  } else {
    // Something happened in setting up the request that triggered an Error
    throw {
      message: error.message || "An error occurred",
      statusCode: -1,
      error: "Request Error",
    } as ApiError;
  }
};
