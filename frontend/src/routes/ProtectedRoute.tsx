import { Outlet } from 'react-router-dom'

/**
 * 인증 복원이 끝날 때까지 기다린 뒤 로그인 사용자만 하위 라우트에 접근시킨다.
 * 비로그인 사용자는 원래 접근하려던 경로를 state에 담아 로그인 화면으로 이동한다.
 */
export default function ProtectedRoute() {
  /*
   * TODO: 개발 중 화면 확인을 위해 인증 검사를 임시로 생략한다.
   * 운영 반영 전 아래 로직과 Navigate/useLocation/useAuth import를 복구해야 한다.
   *
   * const { isAuthenticated, isRestoringSession } = useAuth()
   * const location = useLocation()
   *
   * if (isRestoringSession) {
   *   return (
   *     <div
   *       className="fixed inset-0 grid place-items-center bg-page text-sm font-bold text-slate-500"
   *       role="status"
   *       aria-live="polite"
   *     >
   *       로그인 상태를 확인하고 있어요.
   *     </div>
   *   )
   * }
   *
   * if (!isAuthenticated) {
   *   return <Navigate to="/login" replace state={{ from: location }} />
   * }
   */

  return <Outlet />
}
