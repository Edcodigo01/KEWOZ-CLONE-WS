/**
 * User profile information
 */


export interface AdminLogin {
    status:  boolean;
    data:    Data;
    message: string;
    toast:   boolean;
}
export interface UserRole{
    role: string;
    id:   number;
}

export interface Data {
    admin_id:           number;
    email:              string;
    full_name:          string;
    first_name:         string;
    last_name:          string;
    profile_pic:        string;
    country:            string;
    country_short_name: string;
    token:              string;
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
  firstName?: string;
  lastName?: string;
  [key: string]: any; // For additional fields
}

/**
 * Token pair (access and refresh tokens)
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number; // in seconds
}

/**
 * Standardized error codes for authentication
 */
export enum AuthErrorCode {
  // Authentication errors (100-199)
  INVALID_CREDENTIALS = 'AUTH_100',
  ACCOUNT_LOCKED = 'AUTH_101',
  ACCOUNT_DISABLED = 'AUTH_102',
  ACCOUNT_EXPIRED = 'AUTH_103',
  CREDENTIALS_EXPIRED = 'AUTH_104',
  SESSION_EXPIRED = 'AUTH_105',
  
  // Token errors (200-299)
  INVALID_TOKEN = 'TOKEN_200',
  EXPIRED_TOKEN = 'TOKEN_201',
  MISSING_TOKEN = 'TOKEN_202',
  TOKEN_MISMATCH = 'TOKEN_203',
  
  // Registration errors (300-399)
  EMAIL_EXISTS = 'REG_300',
  USERNAME_EXISTS = 'REG_301',
  WEAK_PASSWORD = 'REG_302',
  INVALID_EMAIL = 'REG_303',
  
  // Permission errors (400-499)
  PERMISSION_DENIED = 'PERM_400',
  INSUFFICIENT_PERMISSIONS = 'PERM_401',
  
  // Validation errors (500-599)
  VALIDATION_ERROR = 'VAL_500',
  
  // Server/Unknown errors (900-999)
  INTERNAL_ERROR = 'SYS_900',
  SERVICE_UNAVAILABLE = 'SYS_901',
  UNKNOWN_ERROR = 'SYS_999',
}

/**
 * Standardized API error response
 */
export interface ApiError {
  code: AuthErrorCode | string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

/**
 * Auth state in the store
 */
export interface AuthState {
  user: UserProfile | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity?: number;
}

/**
 * Auth store actions
 */
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<AdminLogin['data']>) => void;
  resetError: () => void;
  setTokens: (tokens: TokenPair) => void;
  clearAuth: () => void;
  fetchUserProfile: () => Promise<void>;
}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;
