import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onSessionExpired, reissueAccessToken } from '../api'
import { clearAccessToken, setAccessToken as storeAccessToken } from '../auth/session'
import {
  AuthContext,
  type AuthContextValue,
  type LoginData,
  type UserProfile,
} from './auth'

/**
 * 세션리스 인증: 클라이언트는 아무것도 저장하지 않는다(sessionStorage/localStorage 미사용).
 * 로그인 상태의 유일한 근거는 서버가 내려준 httpOnly 리프레시 쿠키뿐이라, 앱이 처음 뜰 때마다
 * `/api/auth/reissue`를 호출해 "아직 유효한 쿠키가 있는지" 서버에 물어 accessToken만 복원한다.
 * user(이름/프로필사진 등)는 액세스 토큰과 달리 쿠키에서 바로 복원할 방법이 없어서(서버에
 * "내 정보 조회" 엔드포인트가 아직 없음) 새로고침 시엔 로그인 전까지 비어 있을 수 있다.
 *
 * 토큰의 실제 보관소는 `auth/session` 모듈이다. apiFetch 가 Authorization 헤더를 붙일 때
 * 거기서 읽으므로, 여기 state 와 반드시 같이 움직여야 한다 — 갈라지면 헤더가 안 붙는다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isRestoringSession, setIsRestoringSession] = useState(true)

  const clearSession = useCallback(() => {
    clearAccessToken()
    setUser(null)
    setAccessToken(null)
  }, [])

  const setSession = useCallback((data: LoginData) => {
    const profile: UserProfile = {
      id: data.id,
      kakaoId: data.kakaoId,
      name: data.name,
      uuid: data.uuid,
      point: data.point,
      profileImageUrl: data.profileImageUrl,
      createdAt: data.createdAt,
      deletedAt: data.deletedAt,
    }

    storeAccessToken(data.accessToken)
    setUser(profile)
    setAccessToken(data.accessToken)
  }, [])

  // 부팅 복원. reissueAccessToken 이 성공 시 session 모듈에도 토큰을 넣어준다.
  useEffect(() => {
    reissueAccessToken()
      .then(setAccessToken)
      .finally(() => setIsRestoringSession(false))
  }, [])

  // 도중에 세션이 끊기면(재발급까지 실패) 화면이 스스로 알아채야 한다.
  useEffect(() => onSessionExpired(clearSession), [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      // user는 새로고침 직후엔 비어 있을 수 있으므로 인증 여부는 accessToken만으로 판단.
      isAuthenticated: Boolean(accessToken),
      isRestoringSession,
      setSession,
      clearSession,
    }),
    [user, accessToken, isRestoringSession, setSession, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
