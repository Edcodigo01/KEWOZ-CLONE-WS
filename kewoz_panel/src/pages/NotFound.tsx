import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl mb-6 text-yellow-500">
          <AlertTriangle className="h-16 w-16 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold">404 - Página no encontrada</h1>

        <p className="text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>

        <div className="flex justify-center gap-3 mt-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Volver
          </Button>

          <Button
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
