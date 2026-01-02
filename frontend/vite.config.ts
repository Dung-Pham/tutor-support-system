/**
 * File: vite.config.ts
 * Mục đích: Cấu hình Vite build tool với tối ưu performance
 * Vai trò:
 *   - Setup Vite plugins và build options
 *   - Cấu hình path alias (@/ -> ./src/)
 *   - Setup dev server và proxy
 *   - Code splitting để giảm bundle size
 * Lưu ý:
 *   - React plugin cần cho JSX/TSX support
 *   - Path alias @ phải match với tsconfig.json
 *   - Proxy API requests đến backend ở development
 *   - Manual chunks để tách vendor code và lazy-loaded modules
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @ -> src/
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'], // Pre-bundle pdfjs-dist
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // Fix Sass legacy JS API deprecation warning
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy /api requests đến backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Tối ưu code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries (130 KB) - Cache lâu dài
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // State management (80 KB) - Cache lâu dài
          'vendor-state': ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],

          // UI Components - Radix UI (200 KB) - Cache lâu dài
          'vendor-ui': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-navigation-menu',
          ],

          // Rich text editor (150 KB) - Lazy load khi cần
          editor: [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
          ],

          // Emoji picker (100 KB) - Lazy load khi cần
          emoji: ['@emoji-mart/react', '@emoji-mart/data'],

          // Utilities (50 KB) - Cache lâu dài
          'vendor-utils': [
            'axios',
            'class-variance-authority',
            'clsx',
            'dompurify',
            'lucide-react',
          ],
        },
      },
    },
    // Cảnh báo nếu chunk lớn hơn 500 KB
    chunkSizeWarningLimit: 500,

    // Tối ưu minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log trong production
        drop_debugger: true,
      },
    },
  },
});
