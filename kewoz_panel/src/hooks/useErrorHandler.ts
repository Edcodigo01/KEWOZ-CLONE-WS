import { useCallback, useRef, useMemo } from 'react';
import { AppError, ErrorSeverity, ErrorCategory, isAppError } from '../utils/errors/errorTypes';
import { getErrorDetails, normalizeError } from '../utils/errors/errorUtils';
import { useToast } from '../components/ui/Toast';

type ErrorHandlerOptions = {
  /** Show error toast notification */
  showToast?: boolean;
  
  /** Log error to console */
  logError?: boolean;
  
  /** Custom error message */
  message?: string;
  
  /** Custom error title */
  title?: string;
  
  /** Custom error severity */
  severity?: ErrorSeverity;
  
  /** Callback when error occurs */
  onError?: (error: unknown) => void;
};

/**
 * Hook for handling errors in a consistent way
 */
export function useErrorHandler() {
  const { toast } = useToast();
  const errorCountRef = useRef(0);
  
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      showToast = true,
      logError = true,
      message,
      title,
      severity,
      onError,
    } = options;
    
    // Normalize the error
    const normalizedError = normalizeError(error);
    const errorDetails = getErrorDetails(normalizedError);
    
    // Call the onError callback if provided
    if (onError) {
      onError(normalizedError);
    }
    
    // Log the error
    if (logError) {
      console.error('Error caught by useErrorHandler:', {
        error: normalizedError,
        ...errorDetails,
      });
    }
    
    // Show toast notification if enabled
    if (showToast) {
      const toastTitle = title || errorDetails.title;
      const toastMessage = message || errorDetails.message;
      const toastVariant = severity || errorDetails.severity;
      
      toast({
        title: toastTitle,
        description: toastMessage,
        variant: toastVariant === 'error' ? 'destructive' : 'default',
      });
    }
    
    // Track error count (useful for rate limiting)
    errorCountRef.current += 1;
    
    // Return the normalized error for further processing
    return normalizedError;
  }, [toast]);
  
  // Create a memoized handler with default options
  const createErrorHandler = useCallback((defaultOptions: ErrorHandlerOptions = {}) => {
    return (error: unknown, overrideOptions: ErrorHandlerOptions = {}) => {
      return handleError(error, { ...defaultOptions, ...overrideOptions });
    };
  }, [handleError]);
  
  // Reset the error count
  const resetErrorCount = useCallback(() => {
    errorCountRef.current = 0;
  }, []);
  
  return {
    handleError,
    createErrorHandler,
    errorCount: errorCountRef.current,
    resetErrorCount,
  };
}

/**
 * Hook for handling API errors specifically
 */
export function useApiErrorHandler() {
  const { handleError } = useErrorHandler();
  
  const handleApiError = useCallback((error: unknown, context: string = 'API request failed') => {
    const normalizedError = handleError(error, {
      title: context,
      severity: 'error',
      showToast: true,
      logError: true,
    });
    
    // You can add API-specific error handling here
    return normalizedError;
  }, [handleError]);
  
  return {
    handleApiError,
  };
}

/**
 * Hook for handling form validation errors
 */
export function useFormErrorHandler() {
  const { handleError } = useErrorHandler();
  
  const handleFormError = useCallback((error: unknown, fieldName?: string) => {
    const normalizedError = handleError(error, {
      title: fieldName ? `Validation error for ${fieldName}` : 'Form validation failed',
      severity: 'warning',
      showToast: true,
      logError: false, // Form errors are usually expected and handled by the form
    });
    
    return normalizedError;
  }, [handleError]);
  
  return {
    handleFormError,
  };
}
