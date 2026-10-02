# Theme System

This project uses a modern, accessible theming system built with CSS variables and React context.

## Key Files

- `globals.css` - Global styles, CSS variables, and theme configurations
- `themes/colors.ts` - TypeScript color definitions and utilities
- `store/theme/themeStore.ts` - Zustand store for theme state management
- `providers/ThemeProvider.tsx` - Theme context provider
- `hooks/common/useTheme.ts` - Custom hook for theme manipulation
- `components/theme/ThemeToggle.tsx` - Theme toggle component

## Features

- 🌓 Light/Dark/System theme modes
- 🎨 Comprehensive color system with semantic naming
- 🚀 Performant CSS variables for theming
- 💾 Persists theme preference in localStorage
- 🔄 Automatic system theme detection
- 🎭 Smooth transitions between themes

## Usage

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from '@/providers/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Use the useTheme hook in components

```tsx
import { useTheme } from '@/hooks/common/useTheme';

function YourComponent() {
  const { 
    theme, 
    isDark, 
    toggleTheme, 
    setTheme 
  } = useTheme();
  
  return (
    <div className="bg-surface text-foreground">
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### 3. Use theme variables in your CSS

```css
.your-component {
  background-color: rgb(var(--color-bg));
  color: rgb(var(--color-text));
  border: 1px solid rgb(var(--color-border));
}
```

## Available Theme Variables

### Background Colors

- `--color-bg` - Main background
- `--color-bg-elevated` - Elevated background (cards, modals)
- `--color-surface` - Surface colors
- `--color-surface-elevated` - Elevated surface

### Text Colors

- `--color-text` - Primary text
- `--color-text-muted` - Muted/disabled text
- `--color-text-subtle` - Subtle text

### Semantic Colors

- `--color-primary` - Primary brand color
- `--color-secondary` - Secondary brand color
- `--color-success` - Success state
- `--color-warning` - Warning state
- `--color-error` - Error state
- `--color-info` - Informational state

## Adding Custom Themes

1. Add your theme colors to `themes/colors.ts`
2. Update the theme store in `store/theme/themeStore.ts`
3. Add CSS variables for your theme in `globals.css`

## Best Practices

- Use semantic color variables instead of hardcoded values
- Keep component styles co-located when possible
- Use the theme variables for consistent theming
- Test your components in both light and dark modes
