import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Red-Button-Clicker/',   // <- this must match your repo name, case-sensitive
})
