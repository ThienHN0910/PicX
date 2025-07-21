import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    base: '/',
    server: {
        proxy: {
            '/api': {
                target: 'https://picxapi.onrender.com',
                changeOrigin: true,
                secure: true,
            },
        },
    },
});