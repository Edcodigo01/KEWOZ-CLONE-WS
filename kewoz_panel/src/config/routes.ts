import type { ReactNode } from "react";

export const ROUTES = {
  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  SETTINGS: "/settings",
  CMS: "/cms-pages",
  // Public routes
  HOME: "/",
  ABOUT: "/about",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  // Dashboard routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  USERS: {
    LIST: "/users/user-list",
    COUNTRY_WISE: "/users/countrywise-user-list",
    BLOCKED_USERS: "/users/block-list",
  },
  GROUP: {
    LIST: "/groups/group-list",
    // COUNTRY_WISE: "/users/countrywise-user-list",
    // BLOCKED_USERS: "/users/block-list",
  },
  CALLS: {
    AUDIO_CALL_LIST: "/calls/audio-call-list",
    VIDEO_CALL_LIST: "/calls/video-call-list",
  },
  NOTIFICATIONS: {
    LIST: "/notifications/notification-list",
  },
  MASS_MESSAGES: {
    LIST: "/notifications/mass-messages",
    SEND: "/notifications/mass-messages/send",
  },
  AVATARS: {
    LIST: "/avatar/avatar-list",
    ADD: "/avatar/add-avatar",
  },
  REPORTS: {
    USERS: "/reports-list/users",
    REPORTTYPES: "/reports-list/report-types",
    GROUPS: "/reports-list/groups",
  },
  // Admin routes
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    ROLES: "/admin/roles",
    SETTINGS: "/admin/settings",
  },
  LANGUAGE: {
    LIST: "/language/language-list",
    TRANSLATED_WORD_LIST: "/language/translated-words/:id"
  },

  // Error pages
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/unauthorized",
  ERROR: "/error",
} as const;

type RoutePath = (typeof ROUTES)[keyof typeof ROUTES] extends string
  ? (typeof ROUTES)[keyof typeof ROUTES]
  : {
      [K in keyof typeof ROUTES]: (typeof ROUTES)[K] extends string
        ? (typeof ROUTES)[K]
        : (typeof ROUTES)[K][keyof (typeof ROUTES)[K]];
    }[keyof typeof ROUTES];

interface RouteMeta {
  title: string;
  description?: string;
  roles?: string[];
  permissions?: string[];
  layout?: "auth" | "dashboard" | "public";
  isPublic?: boolean;
  hideFromMenu?: boolean;
  icon?: ReactNode;
  breadcrumb?: string | ((params: any) => string);
}

export const ROUTE_CONFIG: Partial<Record<RoutePath, RouteMeta>> = {
  // Auth routes
  [ROUTES.LOGIN]: {
    title: "Iniciar sesión",
    layout: "auth",
    isPublic: true,
    hideFromMenu: true,
  },
  [ROUTES.REGISTER]: {
    title: "Crear una cuenta",
    layout: "auth",
    isPublic: true,
    hideFromMenu: true,
  },
  [ROUTES.FORGOT_PASSWORD]: {
    title: "Restablecer contraseña",
    layout: "auth",
    isPublic: true,
    hideFromMenu: true,
  },
  [ROUTES.RESET_PASSWORD]: {
    title: "Establecer nueva contraseña",
    layout: "auth",
    isPublic: true,
    hideFromMenu: true,
  },
  [ROUTES.VERIFY_EMAIL]: {
    title: "Verificar correo",
    layout: "auth",
    isPublic: true,
    hideFromMenu: true,
  },

  // Public routes
  [ROUTES.HOME]: {
    title: "Inicio",
    layout: "public",
    isPublic: true,
  },
  [ROUTES.ABOUT]: {
    title: "Acerca de",
    layout: "public",
    isPublic: true,
  },
  [ROUTES.PRIVACY]: {
    title: "Política de Privacidad",
    layout: "public",
    isPublic: true,
  },
  [ROUTES.TERMS]: {
    title: "Términos del Servicio",
    layout: "public",
    isPublic: true,
  },

  // Dashboard routes
  [ROUTES.DASHBOARD]: {
    title: "Panel",
    layout: "dashboard",
    icon: "grid",
  },
  [ROUTES.PROFILE]: {
    title: "Mi Perfil",
    layout: "dashboard",
    icon: "user",
  },
  [ROUTES.SETTINGS]: {
    title: "Ajustes",
    layout: "dashboard",
    icon: "settings",
  },

  // Admin routes
  [ROUTES.ADMIN.DASHBOARD]: {
    title: "Panel de Administración",
    layout: "dashboard",
    roles: ["admin", "superadmin"],
    icon: "shield",
  },
  [ROUTES.ADMIN.USERS]: {
    title: "Gestión de Usuarios",
    layout: "dashboard",
    roles: ["admin", "superadmin"],
    permissions: ["manage_users"],
    icon: "users",
  },
  [ROUTES.ADMIN.ROLES]: {
    title: "Gestión de Roles",
    layout: "dashboard",
    roles: ["superadmin"],
    permissions: ["manage_roles"],
    icon: "key",
  },
  [ROUTES.ADMIN.SETTINGS]: {
    title: "Configuración del Sistema",
    layout: "dashboard",
    roles: ["superadmin"],
    permissions: ["manage_settings"],
    icon: "settings",
  },

  // Error pages
  [ROUTES.NOT_FOUND]: {
    title: "Página no encontrada",
    layout: "public",
    isPublic: true,
    hideFromMenu: true,
  },
  [ROUTES.UNAUTHORIZED]: {
    title: "No autorizado",
    layout: "public",
    isPublic: true,
    hideFromMenu: true,
  },
  [ROUTES.ERROR]: {
    title: "Error",
    layout: "public",
    isPublic: true,
    hideFromMenu: true,
  },
} as const;

// Navigation menu items
export const NAVIGATION = {
  main: [
    { path: ROUTES.HOME, title: "Inicio" },
    { path: ROUTES.ABOUT, title: "Acerca de" },
  ],
  dashboard: [
    { path: ROUTES.DASHBOARD, title: "Panel" },
    { path: ROUTES.PROFILE, title: "Perfil" },
    {
      title: "Administración",
      icon: "shield",
      roles: ["admin", "superadmin"],
      children: [
        { path: ROUTES.ADMIN.DASHBOARD, title: "Panel" },
        { path: ROUTES.ADMIN.USERS, title: "Usuarios" },
        { path: ROUTES.ADMIN.ROLES, title: "Roles" },
        { path: ROUTES.ADMIN.SETTINGS, title: "Ajustes" },
      ],
    },
  ],
  footer: [
    { path: ROUTES.ABOUT, title: "Acerca de" },
    { path: ROUTES.PRIVACY, title: "Política de Privacidad" },
    { path: ROUTES.TERMS, title: "Términos del Servicio" },
  ],
} as const;

// Helper functions
export const getRouteConfig = (path: string): RouteMeta | undefined => {
  // Handle nested routes (e.g., admin routes)
  if (path.startsWith("/admin/")) {
    const adminPath = path.replace(/^\/admin/, "");
    const adminRoute = `ADMIN.${adminPath
      .replace(/^\//, "")
      .toUpperCase()}` as keyof typeof ROUTES.ADMIN;

    if (adminRoute in ROUTES.ADMIN) {
      const fullPath = ROUTES.ADMIN[adminRoute as keyof typeof ROUTES.ADMIN];
      return ROUTE_CONFIG[fullPath as keyof typeof ROUTE_CONFIG];
    }
  }

  return ROUTE_CONFIG[path as keyof typeof ROUTE_CONFIG];
};

export const getPageTitle = (path: string): string => {
  const config = getRouteConfig(path);
  return config?.title || "Página no encontrada";
};

export const isPublicRoute = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config?.isPublic || false;
};

export const getLayoutType = (
  path: string
): "auth" | "dashboard" | "public" => {
  const config = getRouteConfig(path);
  return config?.layout || "public";
};
