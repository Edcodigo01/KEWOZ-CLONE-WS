import { API_CONFIG } from '@/config/api';
import {type TokenPair } from '@/types/auth';

// Storage keys
const ACCESS_TOKEN_KEY = API_CONFIG.AUTH.TOKEN_KEY;
const REFRESH_TOKEN_KEY = API_CONFIG.AUTH.REFRESH_TOKEN_KEY;
const TOKEN_EXPIRY_KEY = `${ACCESS_TOKEN_KEY}_expiry`;

/**
 * Token manager for handling authentication tokens
 */
class TokenManager {
    private refreshPromise: Promise<string | null> | null = null;
    private refreshSubscribers: Array<(token: string) => void> = [];

    /**
     * Get access token from storage
     */
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    /**
     * Get refresh token from storage
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    /**
     * Get token expiry time
     */
    getTokenExpiry(): number | null {
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        return expiry ? parseInt(expiry, 10) : null;
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(): boolean {
        const expiry = this.getTokenExpiry();
        if (!expiry) return true;

        // Add 10 second buffer to account for network latency
        return Date.now() >= expiry - 10000;
    }

    /**
     * Set authentication tokens
     */
    setTokens(token: any ): void {
        // Calculate expiry time (default to 1 hour if not provided)
        const expiresIn = token.expiresIn || 3600;
        const expiryTime = Date.now() + expiresIn * 1000;

        localStorage.setItem(ACCESS_TOKEN_KEY, token);

       

        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }

    /**
     * Clear all authentication tokens
     */
    clearTokens(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getAccessToken() && !this.isTokenExpired();
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(): Promise<string | null> {
        // If refresh is already in progress, return the same promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            this.refreshPromise = new Promise(async (resolve, reject) => {
                try {
                    // In a real app, you would make an API call to refresh the token
                    // const response = await authService.refreshToken({ refreshToken });
                    // this.setTokens(response);
                    // 
                    // // Notify all subscribers
                    // this.notifySubscribers(response.accessToken);
                    // 
                    // resolve(response.accessToken);

                    // For now, we'll just resolve with the current token
                    const token = this.getAccessToken();
                    resolve(token);
                } catch (error) {
                    this.clearTokens();
                    reject(error);
                } finally {
                    this.refreshPromise = null;
                }
            });

            return await this.refreshPromise;
        } catch (error) {
            this.refreshPromise = null;
            throw error;
        }
    }

    /**
     * Subscribe to token refresh events
     */
    subscribeToRefresh(callback: (token: string) => void): () => void {
        this.refreshSubscribers.push(callback);

        // Return unsubscribe function
        return () => {
            this.refreshSubscribers = this.refreshSubscribers.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all subscribers of a new token
     */
    // private notifySubscribers(token: string): void {
    //     this.refreshSubscribers.forEach(callback => callback(token));
    // }
}

// Export a singleton instance
export const tokenManager = new TokenManager();

// Export token management functions
export const getAuthHeader = (): Record<string, string> => {
    const token = tokenManager.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const isAuthenticated = (): boolean => tokenManager.isAuthenticated();
export const getAccessToken = (): string | null => tokenManager.getAccessToken();
export const getRefreshToken = (): string | null => tokenManager.getRefreshToken();
export const setTokens = (tokens: TokenPair): void => tokenManager.setTokens(tokens);
export const clearTokens = (): void => tokenManager.clearTokens();
export const refreshAccessToken = (): Promise<string | null> => tokenManager.refreshAccessToken();
