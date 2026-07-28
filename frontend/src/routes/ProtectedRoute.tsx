import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { rememberIntendedPath } from '../auth/redirectTo'
import { useAuth } from '../contexts/auth'

/**
 * 인증 복원이 끝날 때까지 기다린 뒤 로그인 사용자만 하위 라우트에 접근시킨다.
 *
 * 되돌아갈 경로는 location.state 가 아니라 sessionStorage 에 맡긴다. 카카오 로그인은
 * 브라우저를 외부 도메인으로 보냈다가 데려오는데, 그 왕복에서 SPA 의 state 는 통째로
 * 소멸하기 때문이다. 실제 복귀는 OAuthCallbackPage 가 처리한다.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isRestoringSession } = useAuth()
  const location = useLocation()

  if (isRestoringSession) {
    return (
      <div
        className="fixed inset-0 grid place-items-center bg-page text-sm font-bold text-slate-500"
        role="status"
        aria-live="polite"
      >
        로그인 상태를 확인하고 있어요.
      </div>
    )
  }

  if (!isAuthenticated) {
    // 렌더 중 호출이지만 같은 값을 여러 번 써도 무해하다.
    rememberIntendedPath(location.pathname + location.search)
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
