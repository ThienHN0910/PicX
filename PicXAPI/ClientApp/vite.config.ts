import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7162',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost", // Ghi đè domain cookie để client nhận được
      },
    },
  },
});
