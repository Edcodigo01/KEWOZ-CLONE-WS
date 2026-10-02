import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { withLogger } from './middleware/logger';
import { withPersistence } from './middleware/persistence';
import { useAuthStore, type AuthState } from './auth/authStore';
import { useUIStore, type UIState } from './ui/uiStore';
import { useAppStore, type AppState } from './app/appStore';

// Re-export all store hooks
export { useAuthStore, useUIStore, useAppStore };

// Combined store state type
export interface RootState extends AuthState, UIState, AppState {}

// Create a root store that combines all stores
export const useRootStore = create<RootState>()(
  // Apply middleware in order
  withLogger<RootState>({
    logLevel: 'debug',
    collapsed: true,
    filter: (action) => !action.startsWith('_'),
  })(
    withPersistence<RootState>({
      key: 'root-storage',
      version: 1,
      partialize: (state) => {
        // Only persist specific parts of the state
        const { 
          // Exclude UI state from persistence
          modals,
          toasts,
          loading,
          sidebar,
          // Exclude auth state that shouldn't be persisted
          error: _, 
          isLoading: __,
          isAuthenticated: ___,
          // Exclude app state that shouldn't be persisted
          isInitialized: ____,
          isOnline: _____
        } = state;
        
        return state;
      },
      migrate: (persistedState, version) => {
        // Handle migrations between versions
        if (version === 0) {
          // Migration logic from v0 to v1
          return { ...persistedState } as RootState;
        }
        return persistedState as RootState;
      },
    })(
      // Wrap with devtools in development
      process.env.NODE_ENV === 'development' 
        ? devtools(
            (set, get, api) => ({
              ...useAuthStore(set, get, api),
              ...useUIStore(set, get, api),
              ...useAppStore(set, get, api),
            }),
            { name: 'RootStore' }
          )
        : (set, get, api) => ({
            ...useAuthStore(set, get, api),
            ...useUIStore(set, get, api),
            ...useAppStore(set, get, api),
          })
    )
  )
);

// Export a hook to use the root store
export const useStore = <T>(
  selector: (state: RootState) => T,
  equals?: (a: T, b: T) => boolean
) => useRootStore(selector, equals);

// Export store utilities
export * from './middleware';

// Initialize the store when the module loads
const initializeStore = () => {
  // Make stores available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).stores = {
      auth: useAuthStore.getState(),
      ui: useUIStore.getState(),
      app: useAppStore.getState(),
      root: useRootStore.getState(),
    };
  }
  
  // Initialize auth store
  useAuthStore.getState().initialize?.();
  
  // Initialize app store
  useAppStore.getState().initialize?.();
};

// Run initialization
initializeStore();

// Export types
export type { AuthState, UIState, AppState };
