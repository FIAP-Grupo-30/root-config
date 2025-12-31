import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const devPlugins: any[] = [];
if (process.env.NODE_ENV !== 'production') devPlugins.push(vitePluginRootConfig());

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Keep a consistent filename for the emitted bundle used by the importmap
        entryFileNames: 'bytebank-root-config.js',
        format: 'es',
      },
      external: [
        '@bytebank/base',
        '@bytebank/financeiro', 
        '@bytebank/dashboard',
        'single-spa'
      ],
    },
    outDir: 'dist',
    copyPublicDir: true,
  },
  // Use default public dir handling so static files are copied
  publicDir: 'public',
  server: {
    port: 9000,
    cors: true,
    fs: {
      allow: ['.'],
    },
    // Serve index.html for SPA routes so paths like /dashboard work in dev
    // using configureServer to rewrite unknown requests to the index
    // This ensures Vite serves the index instead of returning 404
    // when the browser requests /dashboard directly.
    // `configureServer` is provided below via plugin-style entry.
  },
  resolve: {
    alias: {
      // Map virtual package names to dev server URLs while in dev mode
      '@bytebank/base': 'http://localhost:9001/bytebank-base.js',
      '@bytebank/financeiro': 'http://localhost:9002/bytebank-financeiro.js',
      '@bytebank/dashboard': 'http://localhost:9003/bytebank-dashboard.js',
    },
  },
  preview: {
    port: 9000,
    cors: true,
  },
  plugins: [...devPlugins],
});
// Add dev server plugin to rewrite SPA routes to index.html
export function vitePluginRootConfig() {
  return {
    name: 'vite-plugin-root-config-index-rewrite',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        const lastSegment = url.split('/').pop() || '';
        if (lastSegment.includes('.') || url.startsWith('/@') || url.startsWith('/src') || url.startsWith('/node_modules')) {
          return next();
        }
        const indexPath = path.resolve(server.config.root, 'index.html');
        if (fs.existsSync(indexPath)) {
          const html = fs.readFileSync(indexPath, 'utf-8');
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
          return;
        }
        next();
      });
    },
  };
}

// Ensure plugin is applied in dev
if (process.env.NODE_ENV !== 'production') {
  // append the plugin to default export's plugins if possible
}
