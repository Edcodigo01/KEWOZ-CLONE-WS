import { AppError, isAppError, isNetworkError, isTimeoutError, isAuthError, ErrorSeverity, ErrorCategory, isStandardError } from './errorTypes';
import type { ApiErrorResponse } from './errorTypes';

// Clean error stack traces for production
export function cleanErrorStack(error: Error): Error {
  if (process.env.NODE_ENV === 'production') {
    const cleanedError = new Error(error.message);
    cleanedError.name = error.name;
    if (error.stack) {
      const stackLines = error.stack.split('\n');
      if (stackLines.length > 1) {
        cleanedError.stack = [stackLines[0], ...stackLines.slice(1).map(cleanStackLine)].join('\n');
      }
    }
    return cleanedError;
  }
  return error;
}

// Clean stack trace line
function cleanStackLine(line: string): string {
  return line
    .replace(/\s+at\s+.*\(.*\)/g, '')
    .replace(/\s+at\s+.*:\d+:\d+/g, '')
    .trim();
}

// Get user-friendly error message
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (!error) return fallback;
  if (isStandardError(error)) return error.message || fallback;
  if (typeof error === 'string') return error || fallback;
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    if (apiError.message) return apiError.message;
  }
  return String(error);
}

// Get error title based on error type
export function getErrorTitle(error: unknown): string {
  if (isNetworkError(error)) return 'Connection Error';
  if (isTimeoutError(error)) return 'Request Timeout';
  if (isAuthError(error)) return 'Authentication Error';
  if (isAppError(error)) {
    switch (error.category) {
      case ErrorCategory.VALIDATION: return 'Validation Error';
      case ErrorCategory.NOT_FOUND: return 'Not Found';
      case ErrorCategory.SERVER: return 'Server Error';
      case ErrorCategory.MAINTENANCE: return 'Maintenance in Progress';
      default: return 'Error';
    }
  }
  return 'Something Went Wrong';
}

// Get HTTP status code from error
export function getErrorStatus(error: unknown): number {
  if (isAppError(error)) return error.status;
  if (isNetworkError(error)) return 0;
  if (isTimeoutError(error)) return 408;
  if (isAuthError(error)) return 401;
  return 500;
}

// Get error severity
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (isAppError(error)) return error.severity;
  if (isNetworkError(error) || isTimeoutError(error)) return ErrorSeverity.HIGH;
  return ErrorSeverity.MEDIUM;
}

// Get error category
export function getErrorCategory(error: unknown): ErrorCategory {
  if (isAppError(error)) return error.category;
  if (isNetworkError(error)) return ErrorCategory.NETWORK;
  if (isTimeoutError(error)) return ErrorCategory.TIMEOUT;
  if (isAuthError(error)) return ErrorCategory.AUTH;
  return ErrorCategory.UNKNOWN;
}

// Normalize any error to AppError
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error;
  
  if (isStandardError(error)) {
    if (isNetworkError(error)) {
      return new AppError(error.message, {
        name: 'NetworkError',
        code: 'NETWORK_ERROR',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        isOperational: false,
        originalError: error,
      });
    }
    
    if (isTimeoutError(error)) {
      return new AppError(error.message, {
        name: 'TimeoutError',
        code: 'TIMEOUT',
        status: 408,
        category: ErrorCategory.TIMEOUT,
        severity: ErrorSeverity.MEDIUM,
        isOperational: true,
        originalError: error,
      });
    }
    
    return new AppError(error.message, {
      name: error.name,
      originalError: error,
      isOperational: false,
    });
  }
  
  return new AppError(String(error), { isOperational: false });
}

// Get error details for logging
export function getErrorDetails(error: unknown): Record<string, unknown> {
  if (!isStandardError(error)) return { originalError: error };
  
  const details: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };
  
  if (isAppError(error)) {
    Object.assign(details, {
      code: error.code,
      status: error.status,
      category: error.category,
      severity: error.severity,
      isOperational: error.isOperational,
      timestamp: error.timestamp,
      ...(Object.keys(error.details).length > 0 && { details: error.details }),
      ...(error.originalError && { originalError: getErrorDetails(error.originalError) })
    });
  }
  
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    details['stack'] = error.stack;
  }
  
  return details;
}

// Check if error should be shown to user
export function shouldShowErrorToUser(error: unknown): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  if (isAppError(error) && !error.isOperational) return false;
  return true;
}
