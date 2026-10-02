import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ErrorLayout } from '@/components/layout/ErrorLayout';
import App from '@/App';
import '../src/styles/index.css'
import '../src/styles/colors.css'
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProjectConfigProvider } from '@/providers/ProjectConfigProvider';
import { ModalProvider } from '@/providers/ModalProvider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Error fallback component
type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <ErrorLayout
    error={error}
    onRetry={resetErrorBoundary}
  />
);

const container = document.getElementById('root')!;
let root = (container as any)._reactRoot ?? null;

if (!root) {
  root = createRoot(container);
  (container as any)._reactRoot = root;
}

// Render the app
root.render(
  // <StrictMode>
  <BrowserRouter >
   {/* <BrowserRouter basename="/admin">  */}
    <ToastProvider>
      <ErrorBoundary
        fallback={ErrorFallback}
        onError={(error) => {
          // Log errors to your error tracking service
          console.error('Error caught by boundary:', error);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProjectConfigProvider>
              <ModalProvider>
                <App />
              </ModalProvider>
            </ProjectConfigProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ToastProvider>

  </BrowserRouter>

  // </StrictMode>
);
