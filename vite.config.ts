import {defineConfig, Plugin} from 'vite';
import react from '@vitejs/plugin-react-swc';
import laravel from 'laravel-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import replace from '@rollup/plugin-replace';
import {resolve} from 'path';  // 🔴 GANTI:  path → {resolve}

// override laravel plugin base option (from absolute to relative to html base tag)
function basePath(): Plugin {
  return {
    name: 'test',
    enforce: 'post',
    config: () => {
      return {
        base: '',
      };
    },
  };
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    hmr: {
      host: '0.0.0.0',
    },
  },
  base: '',
  resolve: {
    preserveSymlinks: true,
    alias:    {
      '@common':    resolve(__dirname, 'common/foundation/resources/client'),  // 🔴 GANTI: path.  resolve → resolve
      '@ui':  resolve(__dirname, 'common/foundation/resources/client/ui/library'),
      '@app': resolve(__dirname, 'resources/client'),
    },
  },
  build: {
    // 🟢 Disable sourcemap di production untuk mengurangi bundle size ~20-30%
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      external: ['puppeteer'],
      output: {
        // 🟢 Code splitting yang lebih baik untuk lazy loading
        manualChunks: {
          'vendor-core': [
            'react',
            'react-dom',
            'react-router',
          ],
          'vendor-query': [
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
          ],
          'vendor-ui': [
            '@floating-ui/react-dom',
            'framer-motion',
            'clsx',
          ],
          'vendor-form': [
            'react-hook-form',
            'react-colorful',
            'react-textarea-autosize',
          ],
          'vendor-video': [
            'dashjs',
            'hls.js',
            'get-video-id',
          ],
          'vendor-editor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            'highlight.js',
            'lowlight',
          ],
          'vendor-charts': [
            'chart.js',
          ],
        },
      },
    },
    // 🟢 Minify untuk production
    minify: 'terser',
    terserOptions: {
      compress:   {
        drop_console: true,
        drop_debugger:   true,
      },
    },
    // 🟢 Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // 🟢 Report compressed size
    reportCompressedSize: true,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    laravel({
      input: ['resources/client/main.tsx'],
      refresh: false,
    }),
    basePath(),
    replace({
      preventAssignment: true,
      __SENTRY_DEBUG__: false,
      "import { URL } from 'url'": false,
    }),
  ],
});