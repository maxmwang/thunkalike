import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true,
      }
    }
  }
})
