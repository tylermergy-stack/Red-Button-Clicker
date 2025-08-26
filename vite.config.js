import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Red-Button-Clicker/',   // <-- MUST match your repo name exactly
})
