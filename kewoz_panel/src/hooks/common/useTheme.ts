import { useThemeStore } from '@/store/theme/themeStore';
import type { ThemeMode } from '@/styles/themes/colors';

export function useTheme() {
  const { theme, systemTheme, setTheme, toggleTheme } = useThemeStore();

  // Get the current effective theme (resolves 'system' to the actual theme)
  const currentTheme = theme === 'light' ? 'light'  : theme;

  // Check if the current theme is dark
  const isDark = currentTheme === 'dark';

  // Set a specific theme
  const setCurrentTheme = (newTheme: ThemeMode | 'light') => {
    setTheme(newTheme);
  };

  // Toggle between light and dark themes
  const toggleCurrentTheme = () => {
    toggleTheme();
  };

  // Get a color value from the theme
  const getColor = (colorPath: string) => {
    try {
      // This function will be used with CSS variables in the actual implementation
      return `var(--color-${colorPath})`;
    } catch (error) {
      console.warn(`Color not found: ${colorPath}`);
      return 'inherit';
    }
  };

  return {
    // Current theme information
    theme,
    systemTheme,
    currentTheme,
    isDark,
    
    // Theme manipulation
    setTheme: setCurrentTheme,
    toggleTheme: toggleCurrentTheme,
    
    // Utilities
    getColor,
  };
}

// Type for the useTheme hook return value
export type UseThemeReturn = ReturnType<typeof useTheme>;
