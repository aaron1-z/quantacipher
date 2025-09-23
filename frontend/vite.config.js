import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Change to your desired port if needed
  },
  define: {
    'process.env': {}
  }
});