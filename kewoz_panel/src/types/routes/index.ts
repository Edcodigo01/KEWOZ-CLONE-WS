import { ReactNode } from 'react';
import { UserRole } from '../auth';

/**
 * Route path constants
 */
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Auth routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_PERMISSIONS: '/admin/permissions',
  
  // Error routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/403',
  SERVER_ERROR: '/500',
  
  // App routes
  APP: '/app',
  APP_HOME: '/app/home',
  APP_PROJECTS: '/app/projects',
  APP_TASKS: '/app/tasks',
  APP_CALENDAR: '/app/calendar',
  APP_REPORTS: '/app/reports',
  
  // Docs
  DOCS: '/docs',
  DOCS_GETTING_STARTED: '/docs/getting-started',
  DOCS_COMPONENTS: '/docs/components',
  DOCS_API: '/docs/api',
  
  // Other
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  PRICING: '/pricing',
  FEATURES: '/features',
  BLOG: '/blog',
  BLOG_POST: '/blog/[slug]',
} as const;

/**
 * Route path parameters
 */
export type RouteParams = {
  [ROUTES.BLOG_POST]: { slug: string };
  // Add more route params as needed
};

/**
 * Route configuration
 */
export interface RouteConfig {
  /**
   * Route path
   */
  path: string;
  
  /**
   * Whether the route is exact
   * @default true
   */
  exact?: boolean;
  
  /**
   * Route component
   */
  component: React.ComponentType<any>;
  
  /**
   * Route metadata
   */
  meta?: {
    /**
     * Route title
     */
    title?: string;
    
    /**
     * Route description
     */
    description?: string;
    
    /**
     * Route icon
     */
    icon?: ReactNode;
    
    /**
     * Whether the route is hidden from navigation
     * @default false
     */
    hidden?: boolean;
    
    /**
     * Required roles to access the route
     * If empty, the route is public
     */
    roles?: UserRole[];
    
    /**
     * Required permissions to access the route
     * If empty, only role-based access is checked
     */
    permissions?: string[];
    
    /**
     * Whether the route requires authentication
     * @default false
     */
    auth?: boolean;
    
    /**
     * Whether the route is only accessible when not authenticated
     * @default false
     */
    guestOnly?: boolean;
    
    /**
     * Layout component to wrap the route
     */
    layout?: React.ComponentType<{ children: ReactNode }>;
    
    /**
     * Custom route props
     */
    [key: string]: unknown;
  };
}

/**
 * Navigation item
 */
export interface NavItem {
  /**
   * Navigation title
   */
  title: string;
  
  /**
   * Navigation path
   */
  path: string;
  
  /**
   * Navigation icon
   */
  icon?: ReactNode;
  
  /**
   * Nested navigation items
   */
  children?: NavItem[];
  
  /**
   * Whether the navigation item is expanded
   */
  expanded?: boolean;
  
  /**
   * Required roles to see this navigation item
   */
  roles?: UserRole[];
  
  /**
   * Required permissions to see this navigation item
   */
  permissions?: string[];
  
  /**
   * Whether the navigation item is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the navigation item is hidden
   * @default false
   */
  hidden?: boolean;
  
  /**
   * Custom navigation item props
   */
  [key: string]: unknown;
}

/**
 * Protected route props
 */
export interface ProtectedRouteProps {
  /**
   * Child routes
   */
  children: ReactNode;
  
  /**
   * Required roles to access the route
   */
  roles?: UserRole[];
  
  /**
   * Required permissions to access the route
   */
  permissions?: string[];
  
  /**
   * Whether the route requires authentication
   * @default true
   */
  auth?: boolean;
  
  /**
   * Whether the route is only accessible when not authenticated
   * @default false
   */
  guestOnly?: boolean;
  
  /**
   * Fallback component to render when access is denied
   */
  fallback?: ReactNode;
  
  /**
   * Redirect path when access is denied
   * Takes precedence over fallback
   */
  redirectTo?: string;
}

/**
 * Route match
 */
export interface RouteMatch<T = Record<string, string>> {
  /**
   * Matched path
   */
  path: string;
  
  /**
   * Matched URL
   */
  url: string;
  
  /**
   * Matched parameters
   */
  params: T;
  
  /**
   * Whether the match is exact
   */
  isExact: boolean;
}

/**
 * Router history
 */
export interface RouterHistory {
  /**
   * Current location
   */
  location: Location;
  
  /**
   * Navigate to a new location
   */
  push: (path: string, state?: any) => void;
  
  /**
   * Replace current location
   */
  replace: (path: string, state?: any) => void;
  
  /**
   * Go back in history
   */
  goBack: () => void;
  
  /**
   * Go forward in history
   */
  goForward: () => void;
  
  /**
   * Listen to location changes
   */
  listen: (listener: (location: Location) => void) => () => void;
}

/**
 * Location object
 */
export interface Location {
  /**
   * Path name
   */
  pathname: string;
  
  /**
   * Search query
   */
  search: string;
  
  /**
   * Hash
   */
  hash: string;
  
  /**
   * State
   */
  state: any;
  
  /**
   * Key
   */
  key?: string;
}
