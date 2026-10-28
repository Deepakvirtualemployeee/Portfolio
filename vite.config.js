import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {'/api': 'http://localhost:3001'},
    watch: {
      // Browser profiles contain locked SQLite files on Windows.
      ignored: ['**/.browser-check*/**', '**/.npm-cache/**', '**/data/**'],
    },
  },
});
