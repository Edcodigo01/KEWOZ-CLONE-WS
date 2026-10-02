import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  UserProfile,
  LoginCredentials,
  RegisterData,
  TokenPair,
  AdminLogin,
} from "../../types/auth";
import { isTokenExpired, decodeToken } from "@/lib/auth";
import api from "@/utils/api";

export interface AuthState {
  // Auth state
  admin: AdminLogin["data"] | null;
  token: AdminLogin["data"]["token"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  // register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  // refreshToken: () => Promise<boolean>;
  fetchUserProfile: () => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => void;
  resetError: () => void;

  // Token management
  setTokens: (token: string) => void;
  clearAuth: () => void;
}

const AUTH_STORAGE_KEY = "auth-storage";
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// Initialize auth state
const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Login user with credentials
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/admin/login", credentials);
          const { data } = response.data;

          // Set auth state
          set({
            admin: data,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set auth header for subsequent requests
          api.setAuthHeader(data.token);

          // Schedule token refresh before it expires
          scheduleTokenRefresh(data.token);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            admin: null,
            token: null,
          });
          throw new Error(errorMessage);
        }
      },

      // Register new user

      // Logout user
      logout: () => {
        // Clear auth state
        get().clearAuth();

        // Clear auth header
        api.clearAuthHeader();

        // Clear any scheduled token refresh
        if (window.tokenRefreshTimeout) {
          clearTimeout(window.tokenRefreshTimeout);
        }
      },

      // Refresh access token

      // Update user profile
      updateUser: (userData) => {
        set((state) => ({
          admin: { ...state.admin, ...userData },
        }));
      },

      // Reset error state
      resetError: () => set({ error: null }),

      // Set tokens (for external auth)
      setTokens: (token: string) => {
        if (!token) {
          get().clearAuth();
          return;
        }

        set({});
        api.setAuthHeader(token);

        // If we have tokens but no user, try to get user info
        if (!get().admin && token) {
          get().fetchUserProfile();
        }

        // Schedule token refresh
        scheduleTokenRefresh(token);
      },

      // Clear auth state
      clearAuth: () => {
        set(initialState);
      },

      // Fetch user profile
      fetchUserProfile: async () => {
        try {
          const response = await api.put("/admin/");
          set({ admin: response.data });
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          throw error;
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tokens: state.token,
        admin: state.admin,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Rehydrate auth state
        const { token } = state;

        if (token) {
          // Set auth header
          api.setAuthHeader(token);

          // Check if token is expired
          if (isTokenExpired(tokens)) {
            // Try to refresh token if refresh token exists
            if (token) {
              state.refreshToken().catch(() => {
                // If refresh fails, clear auth
                state.clearAuth();
              });
            } else {
              // No refresh token, clear auth
              state.clearAuth();
            }
          } else {
            // Token is valid, schedule refresh
            scheduleTokenRefresh(token);

            // Fetch fresh user data
            state.fetchUserProfile().catch(console.error);
          }
        }
      },
    }
  )
);

// Schedule token refresh before it expires
function scheduleTokenRefresh(tokens: TokenPair) {
  if (!tokens?.accessToken) return;

  // Clear any existing timeout
  if (window.tokenRefreshTimeout) {
    clearTimeout(window.tokenRefreshTimeout);
  }

  // Get token expiration time
  const decodedToken = decodeToken(tokens.accessToken);
  if (!decodedToken?.exp) return;

  // Calculate time until expiration (in ms)
  const expiresIn = decodedToken.exp * 1000 - Date.now();

  // Don't schedule if token is already expired
  if (expiresIn <= 0) return;

  // Schedule refresh 5 minutes before expiration
  const refreshTime = Math.max(expiresIn - TOKEN_REFRESH_THRESHOLD, 0);

  window.tokenRefreshTimeout = setTimeout(() => {
    useAuthStore.getState().refreshToken().catch(console.error);
  }, refreshTime);
}

// Extend Window interface
declare global {
  interface Window {
    tokenRefreshTimeout?: NodeJS.Timeout;
  }
}

// Initialize auth state when store is created
const initializeAuth = () => {
  const { token } = useAuthStore.getState();

  if (token) {
    // Set auth header
    api.setAuthHeader(token);

    // Schedule token refresh if needed
    // if (!isTokenExpired(tokens.accessToken)) {
    //   scheduleTokenRefresh(tokens);
    // }
  }
};

// Run initialization
initializeAuth();

// Export store hook
export default useAuthStore;
