import * as React from 'react';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  fallback?: (props: { 
    error: Error; 
    resetErrorBoundary: () => void;
  }) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
  showResetButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare context: unknown;
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true,
      error,
    };
  }

  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public override render(): React.ReactNode {
    const { error, hasError } = this.state;
    const { fallback, children, showResetButton } = this.props;

    if (!hasError || !error) {
      return children;
    }

    if (fallback) {
      return fallback({
        error,
        resetErrorBoundary: this.handleReset,
      });
    }

    return (
      <div className="p-6 text-center">
        <div className="bg-card rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded text-left">
              <details>
                <summary className="cursor-pointer font-medium">
                  {error.name}: {error.message}
                </summary>
                <pre className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded text-xs overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}
          
          <div className="flex justify-center gap-3 mt-6">
            {showResetButton !== false && (
              <Button onClick={this.handleReset}>
                Try again
              </Button>
            )}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <ErrorBoundary {...(errorBoundaryProps || {})}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
