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
      // Three.js vendor chunk is large but cached separately
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split Three.js into its own chunk for better caching
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
            // Split React into its own chunk
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
