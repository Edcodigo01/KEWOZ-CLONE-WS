import { UserRole, UserPermissions } from '@/types/auth';

// Role hierarchy (lower index = higher privilege)
const ROLE_HIERARCHY: UserRole[] = [
  'superadmin',
  'admin',
  'manager',
  'editor',
  'user',
  'guest'
];

// Default permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  superadmin: { canManageAll: true },
  admin: { canManageUsers: true, canManageContent: true },
  manager: { canManageContent: true, canDelete: true },
  editor: { canCreate: true, canUpdate: true, canRead: true },
  user: { canRead: true },
  guest: {}
};

/** Check if user has a specific permission */
export function hasPermission(
  userRole: UserRole | undefined,
  permission: keyof UserPermissions,
  userPermissions: UserPermissions = {}
): boolean {
  if (!userRole) return false;
  
  // Check explicit permission override
  if (userPermissions[permission] !== undefined) {
    return userPermissions[permission] === true;
  }
  
  // Check role-based permission
  const rolePermission = ROLE_PERMISSIONS[userRole]?.[permission];
  if (rolePermission !== undefined) return rolePermission === true;
  
  // Superadmin has all permissions
  if (userRole === 'superadmin') return true;
  
  return false;
}

/** Check if user has any of the required permissions */
export function hasAnyPermission(
  userRole: UserRole | undefined,
  permissions: (keyof UserPermissions)[],
  userPermissions: UserPermissions = {}
): boolean {
  return permissions.some(p => hasPermission(userRole, p, userPermissions));
}

/** Check if user has all required permissions */
export function hasAllPermissions(
  userRole: UserRole | undefined,
  permissions: (keyof UserPermissions)[],
  userPermissions: UserPermissions = {}
): boolean {
  return permissions.every(p => hasPermission(userRole, p, userPermissions));
}

/** Check if user has minimum required role */
export function hasMinRole(requiredRole: UserRole, userRole?: UserRole): boolean {
  if (!userRole) return false;
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  return userLevel <= requiredLevel;
}

/** Get all permissions for a role */
export function getPermissionsForRole(role: UserRole): UserPermissions {
  return { ...ROLE_PERMISSIONS[role] };
}

/** Check resource access with ownership */
export function hasResourceAccess(
  userRole: UserRole | undefined,
  resourceOwnerId: string,
  currentUserId?: string,
  requiredPermission?: keyof UserPermissions
): boolean {
  if (!userRole) return false;
  if (userRole === 'superadmin') return true;
  if (currentUserId && resourceOwnerId === currentUserId) return true;
  if (requiredPermission) return hasPermission(userRole, requiredPermission);
  return hasMinRole('admin', userRole);
}
