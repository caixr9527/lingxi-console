import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: ['jsoneditor'], // 明确声明为外部依赖
      output: {
        globals: {
          jsoneditor: 'JSONEditor', // 指定全局变量名
        },
      },
    },
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
