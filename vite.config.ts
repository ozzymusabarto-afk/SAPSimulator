import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/SAPSimulator/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) return 'vendor';
          if (id.includes('/js/core/auth/') || id.includes('/js/components/auth/')) return 'auth';
          if (id.includes('/js/components/transactions/trainingView') || id.includes('/js/components/transactions/myJourneyView') || id.includes('/js/core/engine/competencyEngine')) return 'training';
          if (id.includes('/js/components/transactions/')) return 'transactions';
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
