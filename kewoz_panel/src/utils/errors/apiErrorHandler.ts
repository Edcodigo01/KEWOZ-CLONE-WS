import { AppError, ErrorCategory, ErrorSeverity, isApiErrorResponse, isNetworkError, isTimeoutError } from './errorTypes';
import { getErrorDetails, normalizeError } from './errorUtils';

type ApiErrorHandlerOptions = {
  /**
   * Whether to automatically log errors
   * @default true
   */
  autoLog?: boolean;
  
  /**
   * Custom logger function
   */
  logger?: (error: unknown, context?: Record<string, unknown>) => void;
  
  /**
   * Whether to show error toasts for certain errors
   * @default true
   */
  showToasts?: boolean;
  
  /**
   * Callback when session expires
   */
  onSessionExpired?: () => Promise<void> | void;
  
  /**
   * Callback when rate limited
   */
  onRateLimited?: (retryAfter?: number) => Promise<void> | void;
};

/**
 * Handles API errors and converts them to standardized AppError instances
 */
export class ApiErrorHandler {
  private options: Required<ApiErrorHandlerOptions>;
  
  constructor(options: ApiErrorHandlerOptions = {}) {
    this.options = {
      autoLog: true,
      showToasts: true,
      logger: console.error,
      onSessionExpired: () => {},
      onRateLimited: () => {},
      ...options,
    };
  }
  
  /**
   * Handle a fetch response by checking for errors
   */
  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      this.handleError(error, { status: response.status });
      throw error;
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType) {
      return undefined as unknown as T;
    }
    
    // Parse JSON response
    if (contentType.includes('application/json')) {
      return response.json();
    }
    
    // Handle other response types
    return response.text() as unknown as T;
  }
  
  /**
   * Parse an error response into a standardized error
   */
  private async parseErrorResponse(response: Response): Promise<AppError> {
    try {
      const contentType = response.headers.get('content-type');
      let errorData: unknown;
      
      if (contentType?.includes('application/json')) {
        errorData = await response.json().catch(() => ({}));
      } else {
        errorData = await response.text().catch(() => ({}));
      }
      
      return this.createErrorFromResponse(response.status, errorData);
    } catch (parseError) {
      return new AppError('Failed to parse error response', {
        code: 'PARSE_ERROR',
        status: response.status,
        category: ErrorCategory.SERVER,
        severity: ErrorSeverity.HIGH,
        details: { originalStatus: response.status },
      });
    }
  }
  
  /**
   * Create an AppError from an HTTP response
   */
  private createErrorFromResponse(status: number, data: unknown): AppError {
    const errorInfo = isApiErrorResponse(data) ? data : { message: String(data) };
    
    switch (status) {
      case 400:
        return new AppError(errorInfo.message || 'Bad Request', {
          code: errorInfo.code || 'BAD_REQUEST',
          status,
          category: ErrorCategory.CLIENT,
          severity: ErrorSeverity.LOW,
          details: errorInfo.details || {},
        });
        
      case 401:
        return new AppError(errorInfo.message || 'Unauthorized', {
          code: errorInfo.code || 'UNAUTHORIZED',
          status,
          category: ErrorCategory.AUTH,
          severity: ErrorSeverity.HIGH,
          details: errorInfo.details || {},
        });
        
      case 403:
        return new AppError(errorInfo.message || 'Forbidden', {
          code: errorInfo.code || 'FORBIDDEN',
          status,
          category: ErrorCategory.PERMISSION,
          severity: ErrorSeverity.HIGH,
          details: errorInfo.details || {},
        });
        
      case 404:
        return new AppError(errorInfo.message || 'Not Found', {
          code: errorInfo.code || 'NOT_FOUND',
          status,
          category: ErrorCategory.NOT_FOUND,
          severity: ErrorSeverity.LOW,
          details: errorInfo.details || {},
        });
        
      case 408:
        return new AppError(errorInfo.message || 'Request Timeout', {
          code: errorInfo.code || 'TIMEOUT',
          status,
          category: ErrorCategory.TIMEOUT,
          severity: ErrorSeverity.MEDIUM,
          details: errorInfo.details || {},
        });
        
      // case 429:
      //   const retryAfter = parseInt(
      //     errorInfo.details?['retryAfter']?.toString()
      //     // 10
      //   );
        
      //   return new AppError(errorInfo.message || 'Too Many Requests', {
      //     code: errorInfo.code || 'RATE_LIMITED',
      //     status,
      //     category: ErrorCategory.RATE_LIMIT,
      //     severity: ErrorSeverity.MEDIUM,
      //     details: { ...errorInfo.details, retryAfter },
      //   });
        
      case 500:
        return new AppError(errorInfo.message || 'Internal Server Error', {
          code: errorInfo.code || 'INTERNAL_SERVER_ERROR',
          status,
          category: ErrorCategory.SERVER,
          severity: ErrorSeverity.CRITICAL,
          details: errorInfo.details || {},
        });
        
      case 503:
        return new AppError(errorInfo.message || 'Service Unavailable', {
          code: errorInfo.code || 'SERVICE_UNAVAILABLE',
          status,
          category: ErrorCategory.MAINTENANCE,
          severity: ErrorSeverity.HIGH,
          details: errorInfo.details || {},
        });
        
      default:
        return new AppError(errorInfo.message || `HTTP Error ${status}`, {
          code: errorInfo.code || `HTTP_${status}`,
          status,
          category: ErrorCategory.SERVER,
          severity: status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
          details: errorInfo.details ||{},
        });
    }
  }
  
  /**
   * Handle any error that occurs during API calls
   */
  handleError(error: unknown, context: Record<string, unknown> = {}): AppError {
    const normalizedError = normalizeError(error);
    
    // Log the error if auto-logging is enabled
    if (this.options.autoLog) {
      this.options.logger(normalizedError, {
        ...context,
        ...getErrorDetails(normalizedError),
      });
    }
    
    // Handle specific error types
    if (isNetworkError(normalizedError)) {
      this.handleNetworkError(normalizedError);
    } else if (isTimeoutError(normalizedError)) {
      this.handleTimeoutError(normalizedError);
    } else {
      switch (normalizedError.category) {
        case ErrorCategory.AUTH:
          this.handleAuthError(normalizedError);
          break;
          
        case ErrorCategory.RATE_LIMIT:
          this.handleRateLimitError(normalizedError);
          break;
          
        case ErrorCategory.MAINTENANCE:
          this.handleMaintenanceError(normalizedError);
          break;
          
        default:
          this.handleGenericError(normalizedError);
          break;
      }
    }
    
    return normalizedError;
  }
  
  /**
   * Handle network errors (offline, CORS, etc.)
   */
  private handleNetworkError(error: AppError): void {
    if (this.options.showToasts) {
      // Show offline notification or retry prompt
      console.warn('Network error:', error.message);
    }
  }
  
  /**
   * Handle timeout errors
   */
  private handleTimeoutError(error: AppError): void {
    if (this.options.showToasts) {
      console.warn('Request timed out:', error.message);
    }
  }
  
  /**
   * Handle authentication errors (401, 403)
   */
  private handleAuthError(error: AppError): void {
    // Call session expired handler for 401 errors
    if (error.status === 401) {
      this.options.onSessionExpired?.();
    }
    
    if (this.options.showToasts) {
      console.warn('Auth error:', error.message);
    }
  }
  
  /**
   * Handle rate limit errors (429)
   */
  private handleRateLimitError(error: AppError): void {
    const retryAfter = typeof error.details["retryAfter"] === 'number' 
      ? error.details["retryAfter"] 
      : undefined;
      
    this.options.onRateLimited?.(retryAfter);
    
    if (this.options.showToasts) {
      const message = retryAfter 
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : 'Too many requests. Please try again later.';
      
      console.warn('Rate limited:', message);
    }
  }
  
  /**
   * Handle maintenance mode errors (503)
   */
  private handleMaintenanceError(error: AppError): void {
    if (this.options.showToasts) {
      console.warn('Service unavailable:', error.message);
    }
  }
  
  /**
   * Handle all other errors
   */
  private handleGenericError(error: AppError): void {
    if (this.options.showToasts) {
      console.error('An error occurred:', error.message);
    }
  }
}

// Default export with default options
export default new ApiErrorHandler();

// Helper function to handle API errors with a single function call
export function handleApiError(
  error: unknown, 
  context: Record<string, unknown> = {},
  options?: ApiErrorHandlerOptions
): AppError {
  const handler = options ? new ApiErrorHandler(options) : defaultApiErrorHandler;
  return handler.handleError(error, context);
}

// Default instance
export const defaultApiErrorHandler = new ApiErrorHandler();
