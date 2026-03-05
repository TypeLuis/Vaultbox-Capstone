import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loads .env, .env.local, .env.[mode], etc.
  const env = loadEnv(mode, process.cwd(), '') // '' loads ALL keys, not only VITE_

  const port = env.VITE_PORT || '3040'

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    server: {
      host: true,
      proxy: {
        '/api': {
          target: `http://localhost:${port}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})