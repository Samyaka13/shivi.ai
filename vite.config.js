import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.SOME_KEY': JSON.stringify(env.SOME_KEY)
    },
    server:{
      proxy: {
        '/v1': 'http://localhost:8000',
        // '/api': 'http://localhost:8000', // Adjust this to match your backend URL
      },
    },
    plugins: [
      react(),
      tailwindcss()
],
}
})