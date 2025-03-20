import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import type { Connect } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      port: 3000,
      clientPort: 3000
    },
    proxy: {
      '/api': {
        target: 'https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Health check endpoint for any remaining client ping requests
      '^/$': {
        target: 'http://localhost:3000/public/index.html',
        rewrite: () => '/public/index.html',
      }
    },
    // Simple middleware to respond to ping requests at the root endpoint
    middlewares: [
      (req: Connect.IncomingMessage, res: any, next: Connect.NextFunction) => {
        if (req.url === '/') {
          // Handle bare root requests for any health checks
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(fs.readFileSync(path.resolve(__dirname, 'public/index.html'), 'utf-8'));
          return;
        }
        next();
      }
    ]
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
