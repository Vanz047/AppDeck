import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite serve em :5173 por padrão; `server.host` expõe na rede local para
// o celular/`tablet` conseguir abrir `http://<ip-do-pc>:5173`.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  // O agente fica em `agent/dist` quando buildado, mas em dev usamos `tsx`
  // direto do `.ts`. A web só consome `shared` (tipos + `validateMessage`).
})
