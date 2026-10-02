import { useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasMinRole,
  hasResourceAccess,
} from '@/utils/auth/permissions';
import { UserRole } from '@/types/auth';

/**
 * Hook for checking user permissions and roles
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Check if the current user has a specific permission
   */
  const can = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission, user.permissions);
    },
    [user]
  );

  /**
   * Check if the user has any of the specified permissions
   */
  const canAny = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return hasAnyPermission(user.role, permissions, user.permissions);
    },
    [user]
  );

  /**
   * Check if the user has all of the specified permissions
   */
  const canAll = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return hasAllPermissions(user.role, permissions, user.permissions);
    },
    [user]
  );

  /**
   * Check if the user has a role with minimum required level
   */
  const hasRole = useCallback(
    (minRole: UserRole): boolean => {
      if (!user) return false;
      return hasMinRole(minRole, user.role);
    },
    [user]
  );

  /**
   * Check if the user has a specific role
   */
  const hasExactRole = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  /**
   * Check if the user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  /**
   * Check if the user has access to a specific resource
   * based on ownership or permissions
   */
  const canAccessResource = useCallback(
    (resourceOwnerId: string, requiredPermission?: string): boolean => {
      if (!user) return false;
      return hasResourceAccess(
        user.role,
        resourceOwnerId,
        user.id,
        requiredPermission
      );
    },
    [user]
  );

  /**
   * Check if the current user is the owner of a resource
   */
  const isOwner = useCallback(
    (resourceOwnerId: string): boolean => {
      if (!user) return false;
      return user.id === resourceOwnerId;
    },
    [user]
  );

  /**
   * Check if the current user is an admin or owner of a resource
   */
  const isAdminOrOwner = useCallback(
    (resourceOwnerId: string): boolean => {
      if (!user) return false;
      return hasMinRole('admin', user.role) || user.id === resourceOwnerId;
    },
    [user]
  );

  return {
    // Core permission checks
    can,
    canAny,
    canAll,
    
    // Role checks
    hasRole,
    hasExactRole,
    hasAnyRole,
    
    // Resource access checks
    canAccessResource,
    isOwner,
    isAdminOrOwner,
    
    // Current user info
    currentUser: user,
    currentRole: user?.role,
    currentPermissions: user?.permissions || {},
  };
}

/**
 * Hook for checking a specific permission
 */
export function usePermission(permission: string): boolean {
  const { can } = usePermissions();
  return can(permission);
}

/**
 * Hook for checking if user has any of the specified permissions
 */
export function useAnyPermission(permissions: string[]): boolean {
  const { canAny } = usePermissions();
  return canAny(permissions);
}

/**
 * Hook for checking if user has all of the specified permissions
 */
export function useAllPermissions(permissions: string[]): boolean {
  const { canAll } = usePermissions();
  return canAll(permissions);
}

/**
 * Hook for checking if user has a specific role
 */
export function useRole(role: UserRole): boolean {
  const { hasExactRole } = usePermissions();
  return hasExactRole(role);
}

/**
 * Hook for checking if user has any of the specified roles
 */
export function useAnyRole(roles: UserRole[]): boolean {
  const { hasAnyRole } = usePermissions();
  return hasAnyRole(roles);
}

/**
 * Hook for checking resource ownership
 */
export function useIsOwner(resourceOwnerId: string): boolean {
  const { isOwner } = usePermissions();
  return isOwner(resourceOwnerId);
}

/**
 * Hook for checking admin status or ownership
 */
export function useIsAdminOrOwner(resourceOwnerId: string): boolean {
  const { isAdminOrOwner } = usePermissions();
  return isAdminOrOwner(resourceOwnerId);
}
