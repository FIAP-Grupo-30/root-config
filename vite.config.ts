import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/bytebank-root-config.ts',
      output: {
        format: 'system',
        entryFileNames: 'bytebank-root-config.js',
      },
      external: ['single-spa'],
    },
    outDir: 'dist',
    lib: {
      entry: 'src/bytebank-root-config.ts',
      name: 'bytebank-root-config',
      formats: ['system'],
      fileName: () => 'bytebank-root-config.js',
    },
  },
  server: {
    port: 9000,
    cors: true,
  },
  preview: {
    port: 9000,
    cors: true,
  },
});
