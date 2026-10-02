// Core auth hooks
export { useAuth } from '@/providers/AuthProvider';

// Permission hooks
export * from './usePermissions';

// Re-export specific permission hooks for convenience
export {
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useRole,
  useAnyRole,
  useIsOwner,
  useIsAdminOrOwner,
} from './usePermissions';
