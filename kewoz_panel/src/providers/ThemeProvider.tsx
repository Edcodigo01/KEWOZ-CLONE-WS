'use client';

import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/store/theme/themeStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, systemTheme, setSystemTheme } = useThemeStore();

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial system theme if needed
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [setSystemTheme]);

  // Apply theme on initial load and when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Set the theme attribute and class
    if (currentTheme) {
      root.classList.add(currentTheme);
      root.setAttribute('data-theme', currentTheme);
    }
  }, [theme, systemTheme]);

  return <>{children}</>;
}
