import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    base: process.env.GITHUB_ACTIONS ? '/yun-wu-portfolio/' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Three.js only loads with the lazy ProjectFlow route, so that chunk is large
      chunkSizeWarningLimit: 1200,
      // No manualChunks: forcing a 'three-vendor' chunk pulled React's shared
      // runtime (jsx-runtime, scheduler) into it, so the 1MB Three.js bundle was
      // statically imported and modulepreloaded on every page, including the home
      // page. Rollup's default splitting keeps Three.js with the lazy route.
    },
  };
});
