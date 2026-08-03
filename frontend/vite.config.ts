import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * 백엔드로 가는 요청은 개발 서버가 중계한다.
 *
 * <p>브라우저는 항상 같은 출처(localhost:5173)로 요청하므로 CORS 프리플라이트가 아예
 * 발생하지 않는다. 배포 백엔드의 CORS 허용 목록에는 vercel 도메인만 있어서, 프록시가
 * 없으면 로컬에서 그쪽에 붙을 수 없다.
 *
 * <p>리프레시 토큰이 httpOnly 쿠키라 도메인을 localhost 로 바꿔야 브라우저가 저장한다.
 * https 서버가 내려준 Secure 플래그도 개발 중에는 떼어 준다 — 안 그러면 http 에서
 * 쿠키가 저장되지 않아 새로고침마다 로그인이 풀린다.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_TARGET || 'http://localhost:8080'

  const proxy: ProxyOptions = {
    target,
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: 'localhost',
    cookiePathRewrite: '/',
    configure: (proxyServer) => {
      proxyServer.on('proxyRes', (proxyRes) => {
        const setCookie = proxyRes.headers['set-cookie']
        if (Array.isArray(setCookie)) {
          proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
            cookie.replace(/;\s*Secure/gi, '').replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
          )
        }
      })
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': proxy,
        // 카카오 로그인 시작·콜백도 같은 출처로 태운다.
        '/oauth2': proxy,
        '/login/oauth2': proxy,
      },
    },
  }
})
