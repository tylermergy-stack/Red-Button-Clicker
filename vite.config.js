import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you publish to GitHub Pages at https://<user>.github.io/<repo>/,
// set base to '/<repo>/'.
const repoName = process.env.REPO_NAME || ''

export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : '/',
})
