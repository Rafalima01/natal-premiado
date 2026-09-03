import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // '/src' é resolvido a partir da raiz do projeto pelo Vite — evita
    // depender de @types/node só para montar o alias.
    alias: { '@': '/src' },
  },
})
