import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 1995,
    proxy: {
      '/api': {
        target: 'http://localhost:1995',
        changeOrigin: true
      },
      '/content': {
        target: 'http://localhost:1995',
        changeOrigin: true
      }
    }
  }
})