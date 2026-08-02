import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      /*
       * AI 코치의 LiveKit 토큰 발급.
       *
       * **백엔드(Spring) 없이 ai_livekit 만 띄워 확인하려고 둔 우회로다.**
       * `ai_livekit/scripts/dev_server.py` 가 8000 포트에서 `/api/token` 을 내주는데,
       * 브라우저에서 바로 부르면 출처가 달라 CORS 에 막힌다. dev 서버가 대신 물어다 주면
       * 프론트는 같은 출처의 `/api/token` 만 알면 된다.
       *
       * Spring 이 이 엔드포인트를 맡게 되면 target 만 바꾸면 된다.
       */
      '/api/token': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
