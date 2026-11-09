import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite serve em :5173 por padrão; `server.host` expõe na rede local para
// o celular/`tablet` conseguir abrir `http://<ip-do-pc>:5173`.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  // O agente fica em `agent/dist` quando buildado, mas em dev usamos `tsx`
  // direto do `.ts`. A web só consome `shared` (tipos + `validateMessage`).
})
