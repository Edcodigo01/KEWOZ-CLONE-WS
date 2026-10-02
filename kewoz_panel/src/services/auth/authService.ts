import { API_CONFIG } from '@/config/api';
import { BaseApiService } from '@/services/api/baseApi';
import type { AdminLogin, LoginCredentials, RegisterData, TokenPair } from '@/types/auth';

export class AuthService extends BaseApiService {
  constructor() {
    super('admin');
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AdminLogin> {
    try {
      const response = await this.post<AdminLogin>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Store tokens
      this.setAuthTokens(response.data.token);

      return response;
    } catch (error) {
      this.clearAuthTokens();
      throw this.transformError(error);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<{ user: UserProfile; tokens: TokenPair }> {
    try {
      const response = await this.post<{ user: UserProfile; tokens: TokenPair }>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // Store tokens
      this.setAuthTokens(response.tokens);

      return response;
    } catch (error) {
      this.clearAuthTokens();
      throw this.transformError(error);
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if token exists
      const refreshToken = localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenPair> {
    const refreshToken = localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const tokens = await this.post<TokenPair>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      this.setAuthTokens(tokens);
      return tokens;
    } catch (error) {
      this.clearAuthTokens();
      throw this.transformError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<AdminLogin> {
    return this.put<AdminLogin>(API_CONFIG.ENDPOINTS.ADMIN.PROFILE);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  }

  /**
   * Store authentication tokens
   */
  private setAuthTokens(tokens: string): void {
    localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, tokens);

  }

  /**
   * Clear authentication tokens
   */
  private clearAuthTokens(): void {
    localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  }
}

// Export a singleton instance
export const authService = new AuthService();
