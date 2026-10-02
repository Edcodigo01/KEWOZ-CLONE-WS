/**
 * Theme mode types
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme palette colors
 */
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * Theme colors
 */
export interface ThemeColors {
  // Primary colors
  primary: ColorPalette;
  secondary: ColorPalette;
  
  // Neutral colors
  neutral: ColorPalette;
  
  // Semantic colors
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverted: string;
  };
  
  // Border colors
  border: {
    light: string;
    default: string;
    dark: string;
  };
  
  // Additional colors
  overlay: string;
  shadow: string;
  backdrop: string;
  
  // Custom colors
  [key: string]: unknown;
}

/**
 * Theme typography
 */
export interface Typography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
    [key: string]: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    [key: string]: string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
    [key: string]: number | string;
  };
  lineHeight: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
    [key: string]: string;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
    [key: string]: string;
  };
}

/**
 * Theme spacing
 */
export interface Spacing {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
  [key: string]: string;
}

/**
 * Theme breakpoints
 */
export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  [key: string]: string;
}

/**
 * Theme shadows
 */
export interface Shadows {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
  [key: string]: string;
}

/**
 * Theme border radius
 */
export interface BorderRadius {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
  [key: string]: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /**
   * Theme name
   */
  name: string;
  
  /**
   * Theme description
   */
  description?: string;
  
  /**
   * Color palette
   */
  colors: ThemeColors;
  
  /**
   * Typography settings
   */
  typography: Typography;
  
  /**
   * Spacing scale
   */
  spacing: Spacing;
  
  /**
   * Breakpoints
   */
  breakpoints: Breakpoints;
  
  /**
   * Box shadows
   */
  shadows: Shadows;
  
  /**
   * Border radius
   */
  borderRadius: BorderRadius;
  
  /**
   * Z-index scale
   */
  zIndex: {
    hide: number;
    auto: string;
    base: number;
    dropdown: number;
    sticky: number;
    banner: number;
    overlay: number;
    modal: number;
    popover: number;
    skipLink: number;
    toast: number;
    tooltip: number;
    [key: string]: number | string;
  };
  
  /**
   * Animation durations
   */
  transition: {
    duration: {
      fastest: string;
      faster: string;
      fast: string;
      normal: string;
      slow: string;
      slower: string;
      slowest: string;
      [key: string]: string;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
      sharp: string;
      [key: string]: string;
    };
  };
  
  /**
   * Custom theme extensions
   */
  [key: string]: unknown;
}

/**
 * Theme context type
 */
export interface ThemeContextType {
  /**
   * Current theme mode
   */
  mode: ThemeMode;
  
  /**
   * System theme preference
   */
  systemTheme: 'light' | 'dark' | null;
  
  /**
   * Whether the current theme is dark
   */
  isDark: boolean;
  
  /**
   * Set the theme mode
   */
  setTheme: (mode: ThemeMode) => void;
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme: () => void;
  
  /**
   * Theme configuration
   */
  theme: ThemeConfig;
}

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  /**
   * Default theme mode
   * @default 'system'
   */
  defaultTheme?: ThemeMode;
  
  /**
   * Storage key for persisting theme preference
   * @default 'theme-preference'
   */
  storageKey?: string;
  
  /**
   * Whether to enable system color scheme detection
   * @default true
   */
  enableSystem?: boolean;
  
  /**
   * Whether to disable transitions on theme change
   * @default false
   */
  disableTransitionOnChange?: boolean;
  
  /**
   * Custom theme configurations
   */
  themes?: Record<string, ThemeConfig>;
  
  /**
   * Children components
   */
  children: React.ReactNode;
}

/**
 * Theme hook return type
 */
export interface UseThemeReturn extends Omit<ThemeContextType, 'theme'> {
  /**
   * Current theme colors
   */
  colors: ThemeColors;
  
  /**
   * Current theme typography
   */
  typography: Typography;
  
  /**
   * Current theme spacing
   */
  spacing: Spacing;
  
  /**
   * Current theme breakpoints
   */
  breakpoints: Breakpoints;
  
  /**
   * Current theme shadows
   */
  shadows: Shadows;
  
  /**
   * Current theme border radius
   */
  borderRadius: BorderRadius;
  
  /**
   * Get a theme token value
   */
  token: <T extends keyof ThemeConfig>(path: string, defaultValue?: any) => T;
}
