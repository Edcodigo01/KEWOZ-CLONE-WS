/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'authentication',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  MAINTENANCE = 'maintenance',
  UNKNOWN = 'unknown',
}

/**
 * Standard error response from API
 */
export interface ApiErrorResponse {
  message: string;
  code?: string | number;
  status?: number;
  details?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
  errorId?: string;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public override readonly name: string;
  public readonly code: string | number;
  public readonly status: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: string;
  public readonly details: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly originalError: Error | undefined;

  constructor(
    message: string,
    {
      name = 'AppError',
      code = 'APP_ERROR',
      status = 500,
      category = ErrorCategory.UNKNOWN,
      severity = ErrorSeverity.MEDIUM,
      details = {},
      isOperational = true,
      originalError,
    }: {
      name?: string;
      code?: string | number;
      status?: number;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      details?: Record<string, unknown>;
      isOperational?: boolean;
      originalError?: Error;
    } = {}
  ) {
    super(message);
    
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.name = name;
    this.code = code;
    this.status = status;
    this.category = category;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    this.details = details;
    this.isOperational = isOperational;
    this.originalError = originalError;
    
    // Capture stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Convert error to plain object for serialization
   */
  toJSON(): ApiErrorResponse {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
  
  /**
   * Create AppError from any error object
   */
  static fromError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new AppError(error.message, {
        name: error.name,
        originalError: error,
        isOperational: false,
      });
    }
    
    return new AppError(String(error), {
      isOperational: false,
    });
  }
}

/**
 * Common error types for easier error creation
 */
export const Errors = {
  // Client errors (4xx)
  BadRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError(message, {
      name: 'BadRequestError',
      code: 'BAD_REQUEST',
      status: 400,
      category: ErrorCategory.CLIENT,
      severity: ErrorSeverity.LOW,
      details: details || {},
    }),
    
  Unauthorized: (message = 'Unauthorized', details?: Record<string, unknown>) =>
    new AppError(message, {
      name: 'UnauthorizedError',
      code: 'UNAUTHORIZED',
      status: 401,
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.HIGH,
      details: details || {},
    }),
    
  Forbidden: (message = 'Forbidden', details?: Record<string, unknown>) =>
    new AppError(message, {
      name: 'ForbiddenError',
      code: 'FORBIDDEN',
      status: 403,
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.HIGH,
      details: details || {},
    }),
    
  NotFound: (message = 'Resource not found', details?: Record<string, unknown> | undefined) =>
    new AppError(message, {
      name: 'NotFoundError',
      code: 'NOT_FOUND',
      status: 404,
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.LOW,
      details:details ||{},
    }),
    
  // Server errors (5xx)
  InternalServerError: (message = 'Internal server error', details?: Record<string, unknown> | undefined) =>
    new AppError(message, {
      name: 'InternalServerError',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      category: ErrorCategory.SERVER,
      severity: ErrorSeverity.CRITICAL,
      details: details || {},
    }),
    
  ServiceUnavailable: (message = 'Service unavailable', details?: Record<string, unknown> | undefined) =>
    new AppError(message, {
      name: 'ServiceUnavailableError',
      code: 'SERVICE_UNAVAILABLE',
      status: 503,
      category: ErrorCategory.MAINTENANCE,
      severity: ErrorSeverity.HIGH,
      details: details || {},
    }),
    
  // Network errors
  NetworkError: (message = 'Network error', details?: Record<string, unknown>) =>
    new AppError(message, {
      name: 'NetworkError',
      code: 'NETWORK_ERROR',
      status: 0,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      isOperational: false,
      details: details || {},
    }),
    
  TimeoutError: (message = 'Request timed out', details?: Record<string, unknown>) =>
    new AppError(message, {
      name: 'TimeoutError',
      code: 'TIMEOUT',
      status: 408,
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      details: details || {},
    }),
    
  // Validation errors
  ValidationError: (message = 'Validation failed', details?: Record<string, unknown>) =>
    new AppError(message, {
      name: 'ValidationError',
      code: 'VALIDATION_FAILED',
      status: 422,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      details: details || {},
    }),
};

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is an API error response
 */
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiErrorResponse).message === 'string'
  );
}

/**
 * Type guard to check if an error is a standard Error
 */
export function isStandardError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!isStandardError(error)) return false;
  
  return (
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && error.message.includes('Failed to fetch')
  );
}

/**
 * Type guard to check if an error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (!isStandardError(error)) return false;
  
  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    error.message.includes('timeout') ||
    error.message.includes('timed out') ||
    error.message.includes('exceeded')
  );
}

/**
 * Type guard to check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!isStandardError(error)) return false;
  
  return (
    error.name === 'UnauthorizedError' ||
    error.name === 'ForbiddenError' ||
    (isAppError(error) && 
      (error.category === ErrorCategory.AUTH || 
       error.category === ErrorCategory.PERMISSION))
  );
}
