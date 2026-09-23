import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client'],
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // Express owns the HTTP server in middleware mode, so it cannot handle
      // Vite's HMR WebSocket upgrade. Keep HMR disabled to avoid a client
      // connecting to a socket that this server does not expose.
      hmr: false,
      // File watching is unnecessary when HMR is disabled and can restart the
      // middleware server while the preview is still connecting.
      watch: null,
    },
  };
});
