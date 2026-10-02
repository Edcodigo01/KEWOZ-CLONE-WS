import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { hasMinRole, hasAnyPermission, hasAllPermissions } from '@/utils/auth/permissions';
import { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: ReactNode;
  /**
   * Minimum required role (hierarchical check)
   * Example: 'admin' allows admin and superadmin
   */
  minRole?: UserRole;
  /**
   * Array of roles that are allowed (exact match)
   * If both minRole and roles are provided, checks both conditions
   */
  roles?: UserRole[];
  /**
   * Any of these permissions are required
   */
  anyPermissions?: string[];
  /**
   * All of these permissions are required
   */
  allPermissions?: string[];
  /**
   * Redirect path when access is denied
   */
  redirectTo?: string;
  /**
   * Custom unauthorized component to render
   */
  unauthorizedComponent?: ReactNode;
  /**
   * Whether to show a loading state while checking permissions
   */
  showLoading?: boolean;
}

export function RoleGuard({
  children,
  minRole,
  roles = [],
  anyPermissions = [],
  allPermissions = [],
  redirectTo = '/unauthorized',
  unauthorizedComponent,
  showLoading = true,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state if enabled and still loading
  if (isLoading && showLoading) {
    return <LoadingOverlay visible />;
  }

  // If no user is available, redirect to login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  let hasAccess = true;

  // Check role hierarchy if minRole is specified
  if (minRole) {
    hasAccess = hasAccess && hasMinRole(minRole, user.role);
  }

  // Check exact roles if specified
  if (roles.length > 0) {
    hasAccess = hasAccess && roles.includes(user.role);
  }

  // Check any permissions if specified
  if (anyPermissions.length > 0) {
    hasAccess =
      hasAccess &&
      hasAnyPermission(user.role, anyPermissions, user.permissions);
  }

  // Check all permissions if specified
  if (allPermissions.length > 0) {
    hasAccess =
      hasAccess &&
      hasAllPermissions(user.role, allPermissions, user.permissions);
  }

  // If access is denied
  if (!hasAccess) {
    // If a custom unauthorized component is provided, render it
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }
    
    // Otherwise redirect to the specified path
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}

// Helper component for role-protected routes
type RoleRouteProps = Omit<RoleGuardProps, 'children'> & {
  element: ReactNode;
};

export function RoleRoute({ element, ...props }: RoleRouteProps) {
  return <RoleGuard {...props}>{element}</RoleGuard>;
}
