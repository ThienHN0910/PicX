import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:7162',
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: "localhost",
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        console.log(`Proxying ${req.url} to ${options.target}${req.url}`);
                    });
                    proxy.on('error', (err, req, res) => {
                        console.error(`Proxy error: ${err.message}`);
                    });
                },
            },
        },
    },
});