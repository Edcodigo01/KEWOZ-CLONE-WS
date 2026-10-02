import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemeMode } from '@/types/theme';

interface AppSettings {
  // Theme settings
  theme: ThemeMode;
  
  // Language and localization
  language: string;
  timezone: string;
  
  // Notification preferences
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    marketing: boolean;
  };
  
  // Privacy settings
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
    personalizedAds: boolean;
  };
  
  // Feature flags (can be controlled remotely)
  features: Record<string, boolean>;
  
  // UI preferences
  ui: {
    denseMode: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  
  // Last active timestamp
  lastActive: number | null;
}

interface AppState extends AppSettings {
  // App status
  isInitialized: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  
  // App actions
  initialize: () => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  updateNotificationSettings: (settings: Partial<AppSettings['notifications']>) => void;
  updatePrivacySettings: (settings: Partial<AppSettings['privacy']>) => void;
  setFeatureFlag: (feature: string, enabled: boolean) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  checkForUpdates: () => Promise<boolean>;
  updateLastActive: () => void;
  resetSettings: () => void;
}

const APP_STORAGE_KEY = 'app-settings';

// Default app settings
const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    inApp: true,
    marketing: false,
  },
  privacy: {
    analytics: true,
    crashReporting: true,
    personalizedAds: false,
  },
  features: {
    darkMode: true,
    notifications: true,
    analytics: true,
    experimental: false,
  },
  ui: {
    denseMode: false,
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
  lastActive: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      isInitialized: false,
      isOnline: true,
      isUpdateAvailable: false,

      // Initialize app
      initialize: async () => {
        if (get().isInitialized) return;
        
        try {
          // Check for service worker updates
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            registration.update().catch(console.error);
          }
          
          // Update last active time
          get().updateLastActive();
          
          set({ isInitialized: true });
        } catch (error) {
          console.error('Failed to initialize app:', error);
          set({ isInitialized: true }); // Still mark as initialized to prevent repeated errors
        }
      },
      
      // Theme management
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      
      // Language and localization
      setLanguage: (language) => {
        // Update document language attribute
        document.documentElement.lang = language;
        set({ language });
      },
      
      setTimezone: (timezone) => set({ timezone }),
      
      // Notification settings
      updateNotificationSettings: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
      
      // Privacy settings
      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),
      
      // Feature flags
      setFeatureFlag: (feature, enabled) =>
        set((state) => ({
          features: { ...state.features, [feature]: enabled },
        })),
      
      // Online status
      setOnlineStatus: (isOnline) => {
        const { isOnline: wasOnline } = get();
        
        // Only update if status changed
        if (isOnline !== wasOnline) {
          set({ isOnline });
          
          // Show toast when coming back online
          if (isOnline) {
            // Using a small timeout to ensure the UI store is available
            setTimeout(() => {
              const { showToast } = (window as any).uiStore?.getState?.() || {};
              if (showToast) {
                showToast('You are back online', 'success');
              }
            }, 100);
          }
        }
      },
      
      // Check for app updates
      checkForUpdates: async () => {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const update = await registration.update();
            
            if (update) {
              set({ isUpdateAvailable: true });
              return true;
            }
          } catch (error) {
            console.error('Failed to check for updates:', error);
          }
        }
        return false;
      },
      
      // Update last active timestamp
      updateLastActive: () => set({ lastActive: Date.now() }),
      
      // Reset to default settings
      resetSettings: () => {
        // Keep the current language and timezone
        const { language, timezone } = get();
        set({
          ...defaultSettings,
          language,
          timezone,
        });
      },
    }),
    {
      name: APP_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        timezone: state.timezone,
        notifications: state.notifications,
        privacy: state.privacy,
        features: state.features,
        ui: state.ui,
        lastActive: state.lastActive,
      }),
      // Handle version migrations if needed
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...defaultSettings,
            ...persistedState,
            // Add any migration logic here
          };
        }
        return persistedState as AppState;
      },
    }
  )
);

// Initialize app store when the module loads
const initializeAppStore = () => {
  const { initialize, setOnlineStatus } = useAppStore.getState();
  
  // Set up online/offline detection
  const handleOnline = () => setOnlineStatus(true);
  const handleOffline = () => setOnlineStatus(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Set initial online status
  setOnlineStatus(navigator.onLine);
  
  // Initialize app
  initialize().catch(console.error);
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Run initialization
initializeAppStore();

// Export store hook
export default useAppStore;

// Helper hooks
export const useFeatureFlag = (feature: string) => {
  return useAppStore((state) => state.features[feature] ?? false);
};

export const useThemeMode = () => {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  
  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
};

export const useNotifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  const updateNotificationSettings = useAppStore((state) => state.updateNotificationSettings);
  
  return {
    ...notifications,
    update: updateNotificationSettings,
  };
};

export const usePrivacy = () => {
  const privacy = useAppStore((state) => state.privacy);
  const updatePrivacySettings = useAppStore((state) => state.updatePrivacySettings);
  
  return {
    ...privacy,
    update: updatePrivacySettings,
  };
};
