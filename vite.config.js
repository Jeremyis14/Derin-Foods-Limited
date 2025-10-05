import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://derin-foods-limited.onrender.com',
        changeOrigin: true,
        secure: true
      },
      '/uploads': {
        target: 'https://derin-foods-limited.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
