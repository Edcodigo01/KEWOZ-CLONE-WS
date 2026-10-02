import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function AuthGuard({ 
  children, 
  redirectTo = '/login',
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If we're still loading auth state, show a loading indicator
  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect to home/dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If we get here, the user is authenticated and we can render the protected content
  return <>{children}</>;
}

// Helper component for protected routes
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
