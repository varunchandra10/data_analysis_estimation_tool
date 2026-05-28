import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),    
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://data-analysis-estimation-tool.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/reports': {
        target: 'https://data-analysis-estimation-tool.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
