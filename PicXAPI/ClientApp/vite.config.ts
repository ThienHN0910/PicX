import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    },
    server: {
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
