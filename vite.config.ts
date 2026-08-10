import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SITE_BASE is the deploy path. GitHub Pages project sites serve from
// /<repo>/; a custom domain at the root uses '/'.
const base = process.env.SITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: { emptyOutDir: true },
})
