import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './useSession'
import { rememberIntendedPath } from './redirectTo'

/**
 * 로그인이 필요한 라우트를 감싸는 레이아웃 라우트.
 *
 * 세션 복원(AuthProvider)이 끝나기 전에는 판단할 수 없으므로 잠깐 기다린다.
 * 공개 페이지는 이 컴포넌트를 거치지 않아 복원을 기다리지 않는다.
 */
export function RequireAuth() {
  const { status } = useSession()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'system-ui, sans-serif', color: '#5a6b76', fontSize: 14,
        }}
      >
        로그인 확인 중…
      </div>
    )
  }

  if (status === 'anonymous') {
    // 로그인 후 여기로 되돌아온다. 같은 값을 여러 번 써도 무해하다.
    rememberIntendedPath(location.pathname + location.search)
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
