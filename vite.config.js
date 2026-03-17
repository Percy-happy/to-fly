import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/index.html',
        'physics-builder': 'src/pages/physics-builder.html',
        'static-showcase': 'src/pages/static-showcase.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})