import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // allows for access outside the container - from the server 
    proxy: {
      '/api': {
        target: 'http://localhost:3101', // frontend in container interacts via localhost to backend 3101
        changeOrigin: true,
      },
    },
  },
});