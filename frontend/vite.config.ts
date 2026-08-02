import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// LiveKit 토큰은 Spring 이 발급하고 API_BASE_URL 로 직접 나간다 — 프록시가 필요 없다.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
