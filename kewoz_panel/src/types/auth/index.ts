import { ApiResponse, ErrorResponse } from '../common';

/**
 * User role types
 */
export type UserRole = 'admin' | 'user' | 'editor' | 'viewer';

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  [key: string]: unknown; // Allow for additional preferences
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  [key: string]: unknown; // Allow for additional fields
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * JWT token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: UserProfile | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ErrorResponse | null;
  lastChecked: number | null;
}

/**
 * Authentication API responses
 */
export type LoginResponse = ApiResponse<{
  user: UserProfile;
  tokens: TokenPair;
}>;

export type RegisterResponse = LoginResponse;

export type RefreshTokenResponse = ApiResponse<{
  tokens: TokenPair;
}>;

export type ForgotPasswordResponse = ApiResponse<{
  message: string;
  resetToken?: string;
}>;

/**
 * Permission types
 */
export type Permission = string; // e.g., 'users:read', 'users:write'

export type PermissionSet = {
  [key: string]: boolean | PermissionSet;
};

/**
 * Auth error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  REFRESH_TOKEN_INVALID = 'AUTH_REFRESH_TOKEN_INVALID',
  PASSWORD_TOO_WEAK = 'AUTH_PASSWORD_TOO_WEAK',
  EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  RATE_LIMIT_EXCEEDED = 'AUTH_RATE_LIMIT_EXCEEDED',
}

/**
 * Auth context type
 */
export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ErrorResponse | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  resetPassword: (data: PasswordResetConfirm) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => void;
}
