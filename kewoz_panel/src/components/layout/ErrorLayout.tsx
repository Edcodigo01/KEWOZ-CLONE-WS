// import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '../ui';
import { Link } from 'react-router';
// import Link from 'next/link';

interface ErrorLayoutProps {
  error: Error;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorLayout({ 
  error, 
  onRetry,
  showHomeButton = true 
}: ErrorLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl mb-6 text-destructive">
          <AlertCircle className="h-16 w-16 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold">
          Algo salió mal
        </h1>

        <p className="text-muted-foreground">
          {error.message || 'Ocurrió un error inesperado'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}

          {showHomeButton && (
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-sm text-muted-foreground cursor-pointer">
              Detalles del error
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
              {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
