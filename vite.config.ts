import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/bse': {
        target: 'https://api.bseindia.com',
        changeOrigin: true,
        configure: (proxy, _options) => {
          const proxyServer = proxy as any;
          proxyServer.on('error', (err: any, _req: any, _res: any) => {
            console.log('🔴 proxy error', err);
          });
          proxyServer.on('proxyReq', (_proxyReq: any, req: any, _res: any) => {
            console.log('📤 Sending Request to BSE API:', req.method, req.url);
          });
          proxyServer.on('proxyRes', (_proxyRes: any, _req: any, res: any) => {
            console.log('📥 BSE Response:', res.statusCode, res.headers?.location || 'no redirect');

            // Add CORS headers for responses from proxied servers
            if (typeof res.setHeader === 'function') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
              res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
          });
        },
      },
      '/ann': {
        target: 'https://www.bseindia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ann/, '/corporates/ann.html'),
      },
      '/pdf': {
        target: 'https://www.bseindia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf/, '/xml-data/corpfiling/AttachLive'),
      },
    },
  },
})
