// Re-export all types from submodules
export * from './common';
export * from './auth';
export * from './api';
export * from './theme';
export * from './routes';

// Global type declarations
declare global {
  /**
   * Window interface extensions
   */
  interface Window {
    // Add any global window properties here
    __APP_CONFIG__: {
      // App configuration injected at build time
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
      APP_VERSION: string;
      BUILD_TIMESTAMP: string;
      // Add other environment variables as needed
    };
    
    // Google Analytics
    gtag?: (...args: any[]) => void;
    
    // Any other global variables
    [key: string]: any;
  }
  
  /**
   * Process interface extensions
   */
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      REACT_APP_API_URL: string;
      REACT_APP_NAME: string;
      REACT_APP_VERSION: string;
      // Add other environment variables as needed
    }
  }
}

// This file is a module
export {};
