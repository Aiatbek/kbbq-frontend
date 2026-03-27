import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom so React components can render in a DOM-like environment
    environment: 'jsdom',
    // Run this setup file before every test — imports jest-dom matchers
    setupFiles: './src/__tests__/setup.js',
    globals: true,
  },
})
