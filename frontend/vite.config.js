import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set the default frontend port here
    hmr: {
      // Let Vite connect to the forwarded Codespaces URL for hot reload
      clientPort: 443,
      protocol: 'wss'
    },
    proxy: {
      '/api': {
        target: 'https://curly-bassoon-5g64q4wrgrvvc4w9q-5000.app.github.dev',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://curly-bassoon-5g64q4wrgrvvc4w9q-5000.app.github.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
