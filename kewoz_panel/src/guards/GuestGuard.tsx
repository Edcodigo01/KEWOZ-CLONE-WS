import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestGuard({ 
  children, 
  redirectTo = '/dashboard' 
}: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth status
  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  // If user is authenticated, redirect to the specified route (default: /dashboard)
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // If user is not authenticated, render the guest content
  return <>{children}</>;
}

// Helper component for guest-only routes
export function GuestRoute({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
