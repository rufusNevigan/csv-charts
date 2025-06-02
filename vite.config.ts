/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { gzipSync } from 'zlib';

// Bundle size limit in bytes (250 KB gzipped)
const BUNDLE_SIZE_LIMIT = 250 * 1024;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add bundle analyzer in production builds
    mode === 'production' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
        },
      },
      plugins: [
        // Custom plugin to check bundle size
        {
          name: 'bundle-size-check',
          generateBundle(_, bundle) {
            if (mode === 'production') {
              // Calculate total gzipped size of all chunks
              let totalGzipSize = 0;

              Object.values(bundle).forEach((chunk) => {
                if (chunk.type === 'chunk' && chunk.code) {
                  totalGzipSize += gzipSync(chunk.code).length;
                }
              });

              if (totalGzipSize > BUNDLE_SIZE_LIMIT) {
                this.error(
                  `Bundle size (${Math.round(totalGzipSize / 1024)} KB gzipped) exceeds limit of ${Math.round(BUNDLE_SIZE_LIMIT / 1024)} KB`,
                );
              }

              /* eslint-disable no-console */
              console.log(`✅ Bundle size: ${Math.round(totalGzipSize / 1024)} KB gzipped (limit: ${Math.round(BUNDLE_SIZE_LIMIT / 1024)} KB)`);
              /* eslint-enable no-console */
            }
          },
        },
      ],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
}));
