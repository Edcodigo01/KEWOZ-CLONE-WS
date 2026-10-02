/**
 * Application-wide constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.example.com',
  VERSION: 'v1',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_EXPIRY_KEY: 'token_expiry',
  },
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  NOT_FOUND: '/404',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common Messages
export const MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred',
  NETWORK_ERROR: 'Network error. Please check your connection',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference',
  USER: 'user_data',
} as const;

// Environment
export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
} as const;
