import { defineConfig } from 'vite';

// base relativa: o build (dist/) funciona em qualquer subpasta, inclusive atrás do Cloudflare Access.
export default defineConfig({
  base: './',
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 900 },
});
