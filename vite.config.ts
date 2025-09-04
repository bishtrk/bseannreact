import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
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
