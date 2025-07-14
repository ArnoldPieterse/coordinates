import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Include specific polyfills and exclude problematic ones
      include: ['buffer', 'process', 'util', 'events'],
      exclude: ['stream-browserify', 'fetch-blob', 'node-fetch']
    }),
  ],
  root: '.',
  base: '', // Use relative paths for S3 deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      // input: {
      //   main: './src/main.jsx'
      // },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          game: ['cannon-es']
        }
      },
      external: [
        'node-fetch',
        'stream-browserify',
        'fetch-blob',
        'node:http',
        'node:https',
        'node:stream',
        'node:fs',
        'node:path',
        'node:net',
        'node:url',
        'node:zlib',
        'worker_threads'
      ]
    }
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline';"
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', 'cannon-es'],
    exclude: [
      'stream-browserify', 
      'fetch-blob',
      'node-fetch',
      'src/llm-integration.js',
      'src/ai-agent-system.js',
      'server.js',
      'server-simple.js'
    ]
  },
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      'stream-browserify': false,
      'fetch-blob': false,
      'node-fetch': false
    }
  }
}); 