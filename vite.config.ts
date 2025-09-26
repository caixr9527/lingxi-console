import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCommonjs({
      include: ['jsoneditor'],
    }),
  ],
  build: {
    commonjsOptions: {
      include: [/jsoneditor/, /node_modules/],
    },
  },
  optimizeDeps: {
    include: ['jsoneditor'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  //   server: {
  //     proxy: {
  //       '/api': {
  //         target: 'http://127.0.0.1:5000',
  //         changeOrigin: true,
  //         rewrite(path) {
  //           return path.replace(/^\/api/, '')
  //         },
  //       },
  //     },
  //   },
})
