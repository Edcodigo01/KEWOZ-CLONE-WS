import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import compression from 'vite-plugin-compression';

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress' }),
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3047',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-charts': ['apexcharts', 'react-apexcharts', 'recharts', 'react-google-charts'],
          'vendor-icons': ['lucide-react', 'react-icons'],
          'vendor-ui': ['@headlessui/react', 'react-select', 'react-hook-form', 'zod', 'zustand'],
        },
      },
    },
  },
}));
