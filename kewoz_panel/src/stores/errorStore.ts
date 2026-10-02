import { create } from 'zustand';
import { AppError, ErrorSeverity, ErrorCategory } from '../utils/errors/errorTypes';
import { getErrorDetails } from '../utils/errors/errorUtils';
import React, { JSX } from 'react';
type ErrorState = {
  // Current active errors
  errors: AppError[];
  
  // Dismissed error IDs
  dismissedErrorIds: Set<string>;
  
  // Add an error to the store
  addError: (error: unknown, options?: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    context?: Record<string, unknown>;
    autoDismiss?: boolean | number; // true for default timeout, number for custom timeout in ms
  }) => string; // Returns error ID
  
  // Dismiss an error by ID
  dismissError: (errorId: string) => void;
  
  // Dismiss all errors
  dismissAll: () => void;
  
  // Clear all errors (including dismissed)
  clearAll: () => void;
  
  // Get active errors (not dismissed)
  getActiveErrors: () => AppError[];
  
  // Get errors by category
  getErrorsByCategory: (category: ErrorCategory) => AppError[];
  
  // Get errors by severity
  getErrorsBySeverity: (severity: ErrorSeverity) => AppError[];
};

// Default auto-dismiss timeouts (in ms)
const AUTO_DISMISS_TIMEOUTS: Record<ErrorSeverity, number> = {
  error: 10000,    // 10 seconds
  warning: 8000,   // 8 seconds
  info: 5000,      // 5 seconds
  success: 3000,   // 3 seconds
};

// Create the error store
const useErrorStore = create<ErrorState>((set, get) => {
  // Track timeouts for auto-dismiss
  const timeouts = new Map<string, NodeJS.Timeout>();
  
  // Clear all timeouts on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    });
  }
  
  return {
    errors: [],
    dismissedErrorIds: new Set(),
    
    addError: (error, options = {}) => {
      const normalizedError = getErrorDetails(error, {
        severity: options.severity,
        category: options.category,
        context: options.context,
      });
      
      // Generate a unique ID for this error
      const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the error object
      const errorWithId: AppError = {
        ...normalizedError,
        id: errorId,
        timestamp: new Date(),
      };
      
      // Add to store
      set((state) => ({
        errors: [...state.errors, errorWithId],
      }));
      
      // Set up auto-dismiss if needed
      const shouldAutoDismiss = options.autoDismiss !== false;
      if (shouldAutoDismiss) {
        const dismissTime = typeof options.autoDismiss === 'number' 
          ? options.autoDismiss 
          : AUTO_DISMISS_TIMEOUTS[normalizedError.severity];
        
        const timeoutId = setTimeout(() => {
          get().dismissError(errorId);
          timeouts.delete(errorId);
        }, dismissTime);
        
        timeouts.set(errorId, timeoutId);
      }
      
      return errorId;
    },
    
    dismissError: (errorId) => {
      // Clear any pending timeout
      if (timeouts.has(errorId)) {
        clearTimeout(timeouts.get(errorId));
        timeouts.delete(errorId);
      }
      
      set((state) => ({
        dismissedErrorIds: new Set(state.dismissedErrorIds).add(errorId),
      }));
    },
    
    dismissAll: () => {
      // Clear all timeouts
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      
      set((state) => {
        const allErrorIds = new Set(state.errors.map((err) => err.id));
        return {
          dismissedErrorIds: new Set([...state.dismissedErrorIds, ...allErrorIds]),
        };
      });
    },
    
    clearAll: () => {
      // Clear all timeouts
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      
      set({
        errors: [],
        dismissedErrorIds: new Set(),
      });
    },
    
    getActiveErrors: () => {
      const { errors, dismissedErrorIds } = get();
      return errors.filter((err) => !dismissedErrorIds.has(err.id));
    },
    
    getErrorsByCategory: (category) => {
      const { getActiveErrors } = get();
      return getActiveErrors().filter((err) => err.category === category);
    },
    
    getErrorsBySeverity: (severity) => {
      const { getActiveErrors } = get();
      return getActiveErrors().filter((err) => err.severity === severity);
    },
  };
});

export default useErrorStore;

// Hook to use the error store with a selector
// Example: const errors = useErrorStore(store => store.getActiveErrors());
// Or: const { addError } = useErrorStore();
// Or: const addError = useErrorStore(store => store.addError);

// Higher-order component to handle errors and add them to the store
export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    context?: string;
    onError?: (error: unknown) => void;
  } = {}
): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => {
    const addError = useErrorStore((state) => state.addError);
    
    const handleError = (error: unknown) => {
      // Add to error store
      const errorId = addError(error, {
        context: { component: Component.displayName || Component.name, ...options.context },
      });
      
      // Call custom error handler if provided
      if (options.onError) {
        options.onError(error);
      }
      
      return errorId;
    };
    
    try {
      return React.createElement(Component, { ...props, onError: handleError });
    } catch (error) {
      handleError(error);
      return null;
    }
  };
  
  Wrapped.displayName = `withErrorHandling(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
};

// Error boundary that adds errors to the store
export class ErrorBoundaryWithStore extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    context?: Record<string, unknown>;
  },
  { hasError: boolean; error: Error | null }
> {
  override state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Add error to store
    useErrorStore.getState().addError(error, {
      context: {
        ...this.props.context,
        componentStack: errorInfo.componentStack,
      },
    });
  }
  
  override render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', null, 'Something went wrong. Please try again.');
    }
    
    return this.props.children;
  }
}
