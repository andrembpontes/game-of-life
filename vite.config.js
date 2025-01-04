import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/game-of-life/',
  worker: {
    format: 'es',
    plugins: []
  }
})
