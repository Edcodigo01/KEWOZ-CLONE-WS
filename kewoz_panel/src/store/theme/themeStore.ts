import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemeMode } from '@/styles/themes/colors';

type SystemTheme = 'light' | 'dark';

const THEME_MODES = ['light', 'dark'] as const;

// Helper to get system theme
const getSystemTheme = (): SystemTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

type ThemeState = {
  theme: ThemeMode | 'system';
  systemTheme: SystemTheme;
  resolvedTheme: ThemeMode;
};

type ThemeActions = {
  setTheme: (theme: ThemeMode | 'system') => void;
  toggleTheme: () => void;
  setSystemTheme: (theme: SystemTheme) => void;
};

const THEME_STORAGE_KEY = 'theme-preference';

const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      theme: 'light',
      systemTheme: getSystemTheme(),
      resolvedTheme: 'light',
      
      setTheme: (theme) => {
        if (theme === 'system' || THEME_MODES.includes(theme as any)) {
          const resolvedTheme = theme === 'system' ? get().systemTheme : theme;
          set({ 
            theme,
            resolvedTheme
          });
          
          // Update document class
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(resolvedTheme);
          root.setAttribute('data-theme', resolvedTheme);
        }
      },
      
      toggleTheme: () => {
        const { theme, systemTheme } = get();
        let newTheme: ThemeMode | 'system';
        
        if (theme === 'system') {
          newTheme = systemTheme === 'dark' ? 'light' : 'dark';
        } else {
          newTheme = theme === 'dark' ? 'light' : 'dark';
        }
        
        get().setTheme(newTheme);
      },
      
      setSystemTheme: (systemTheme) => {
        const { theme } = get();
        const resolvedTheme = theme === 'system' ? systemTheme : theme as ThemeMode;
        
        set({ 
          systemTheme,
          resolvedTheme
        });
        
        // Update document class
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
        root.setAttribute('data-theme', resolvedTheme);
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        // Don't persist system theme or resolved theme
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Set initial system theme
          const systemTheme = getSystemTheme();
          state.systemTheme = systemTheme;
          
          // Resolve the theme
          const resolvedTheme = state.theme === 'system' ? systemTheme : state.theme as ThemeMode;
          state.resolvedTheme = resolvedTheme;
          
          // Apply theme to document
          if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(resolvedTheme);
            root.setAttribute('data-theme', resolvedTheme);
          }
        }
      },
    }
  )
);

// Initialize system theme listener
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    useThemeStore.getState().setSystemTheme(e.matches ? 'dark' : 'light');
  };
  
  // Set initial system theme if not set yet
  const currentSystemTheme = getSystemTheme();
  if (useThemeStore.getState().systemTheme !== currentSystemTheme) {
    useThemeStore.getState().setSystemTheme(currentSystemTheme);
  }
  
  // Listen for system theme changes
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  });
}

export { useThemeStore };
