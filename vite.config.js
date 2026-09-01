import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base — the dist/ build works on any static host or subpath
  // (GitHub Pages, Netlify, S3, or even opened from the file system).
  base: './',
  server: {
    port: 5173,
    open: false,
  },
});
