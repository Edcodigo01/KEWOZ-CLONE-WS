# State Management

Zustand stores for global state management:

- `auth/` - Authentication and user session state
- `theme/` - Application theme and UI preferences
- `ui/` - Global UI state (modals, notifications, etc.)
- `index.ts` - Central export for all stores

Each store should be focused on a specific domain of the application state.
