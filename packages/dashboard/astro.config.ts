// [astro.imports.1]
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// [astro.output.1]
// [astro.react.1]
// [astro.export.1]
export default defineConfig({
  // [astro.output.1]
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '4321'),
  },

  // [astro.react.1]
  integrations: [
    react(),
  ],

  // [astro.env.1]
  vite: {
    // [astro.vite.1]
    resolve: {
      alias: {
        '@profiler': path.resolve(__dirname, '../profiler/src'),
      },
    },
    define: {
      'import.meta.env.PUBLIC_PROFILER_WS_URL': JSON.stringify(
        process.env.PUBLIC_PROFILER_WS_URL || 'ws://localhost:7700'
      ),
      'import.meta.env.PUBLIC_PROFILER_HTTP_URL': JSON.stringify(
        process.env.PUBLIC_PROFILER_HTTP_URL || 'http://localhost:7701'
      ),
    },
    // [astro.build.1]
    build: {
      sourcemap: true,
      outDir: './dist',
    },
  },

  // [astro.typescript.1]
  typescript: {
    strict: true,
  },
});
