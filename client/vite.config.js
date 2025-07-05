import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Proxy API requests to the backend server
    },
  },
});
// This configuration sets up Vite to use React and proxies API requests to the backend server running on port 5000.