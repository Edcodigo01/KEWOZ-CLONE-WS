import React, { Component, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

type RetryBoundaryProps = {
  /** Content to render when there's no error */
  children: ReactNode;
  
  /** Fallback UI to show when there's an error */
  fallback?: (error: Error, retry: () => void) => ReactNode;
  
  /** Callback when an error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /** Maximum number of retry attempts */
  maxRetries?: number;
  
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  
  /** Whether to reset the error state when the children change */
  resetOnChange?: boolean;
};

type RetryBoundaryState = {
  error: Error | null;
  retryCount: number;
  retryInProgress: boolean;
  lastRetryTime: number | null;
};

/**
 * A component that catches errors in its children and provides a way to retry
 * the failed operation with exponential backoff.
 */
export class RetryBoundary extends Component<RetryBoundaryProps, RetryBoundaryState> {
  static defaultProps = {
    maxRetries: 3,
    retryDelay: 1000,
    resetOnChange: true,
  };

  state: RetryBoundaryState = {
    error: null,
    retryCount: 0,
    retryInProgress: false,
    lastRetryTime: null,
  };

  private retryTimeout: NodeJS.Timeout | null = null;
  private lastChildren: ReactNode = null;

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: RetryBoundaryProps) {
    const { children, resetOnChange } = this.props;
    
    // Reset error state when children change and resetOnChange is true
    if (resetOnChange && children !== prevProps.children && children !== this.lastChildren) {
      this.resetErrorState();
    }
    
    this.lastChildren = children;
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  resetErrorState = () => {
    this.setState({
      error: null,
      retryCount: 0,
      retryInProgress: false,
      lastRetryTime: null,
    });
  };

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;
    
    if (retryCount >= maxRetries) {
      return;
    }
    
    this.setState({
      retryInProgress: true,
      lastRetryTime: Date.now(),
    });
    
    // Calculate delay with exponential backoff
    const delay = Math.min(retryDelay * Math.pow(2, retryCount), 30000); // Cap at 30s
    
    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      this.setState(
        (prevState) => ({
          error: null,
          retryCount: prevState.retryCount + 1,
          retryInProgress: false,
        }),
        () => {
          // After state is updated, force a re-render to retry rendering children
          this.forceUpdate();
        }
      );
    }, delay);
  };

  render() {
    const { children, fallback } = this.props;
    const { error, retryCount, retryInProgress, lastRetryTime } = this.state;
    const { maxRetries = 3 } = this.props;
    
    // If there's no error, render children
    if (!error) {
      return children;
    }
    
    // If we're retrying, show a loading state
    if (retryInProgress) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <LoadingSpinner size="lg" label="Retrying..." />
          {lastRetryTime && (
            <p className="mt-2 text-sm text-gray-500">
              Attempt {retryCount + 1} of {maxRetries}
            </p>
          )}
        </div>
      );
    }
    
    // If we've exceeded max retries, show error
    if (retryCount >= maxRetries) {
      return (
        <ErrorMessage
          title="Operation failed"
          message="We couldn't complete the operation. Please try again later."
          severity="error"
          actions={
            <Button onClick={this.handleRetry} variant="outline">
              Try Again
            </Button>
          }
        />
      );
    }
    
    // If a custom fallback is provided, use it
    if (fallback) {
      return fallback(error, this.handleRetry);
    }
    
    // Default error UI
    return (
      <ErrorMessage
        title="Something went wrong"
        message={error.message || 'An unexpected error occurred'}
        severity="error"
        actions={
          <Button onClick={this.handleRetry} variant="default">
            Retry
          </Button>
        }
      />
    );
  }
}

/**
 * Higher-order component that wraps a component with a RetryBoundary
 */
export function withRetry<P extends object>(
  Component: React.ComponentType<P>,
  retryBoundaryProps?: Omit<RetryBoundaryProps, 'children'>
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <RetryBoundary {...retryBoundaryProps}>
      <Component {...props} />
    </RetryBoundary>
  );
  
  Wrapped.displayName = `withRetry(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}

/**
 * Hook that provides retry functionality
 */
export function useRetry(
  onRetry: () => void,
  options: { maxRetries?: number; initialRetryCount?: number } = {}
) {
  const { maxRetries = 3, initialRetryCount = 0 } = options;
  const [retryCount, setRetryCount] = React.useState(initialRetryCount);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const retryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const retry = React.useCallback(() => {
    if (retryCount >= maxRetries) {
      return;
    }
    
    setIsRetrying(true);
    
    // Calculate delay with exponential backoff (1s, 2s, 4s, etc.)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    
    retryTimeoutRef.current = setTimeout(() => {
      onRetry();
      setRetryCount((prev) => prev + 1);
      setIsRetrying(false);
    }, delay);
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [retryCount, maxRetries, onRetry]);
  
  const reset = React.useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);
  
  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    hasExceededMaxRetries: retryCount >= maxRetries,
  };
}
