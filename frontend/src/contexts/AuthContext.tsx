import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  fetchMyProfile,
  logout as requestLogout,
  onSessionExpired,
  reissueAccessToken,
} from '../api'
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
 * `/api/auth/reissue`로 "아직 유효한 쿠키가 있는지" 물어 accessToken 을 복원하고,
 * 이어서 `/api/users/me` 로 사용자 정보를 되찾는다.
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
    const { accessToken: token, ...profile } = data

    storeAccessToken(token)
    setUser(profile)
    setAccessToken(token)
  }, [])

  const logout = useCallback(async () => {
    try {
      await requestLogout()
    } finally {
      // 서버 요청이 실패해도 이 기기에서는 반드시 로그아웃된 상태로 만든다.
      clearSession()
    }
  }, [clearSession])

  // 부팅 복원: 토큰 → 프로필 순. reissueAccessToken 이 session 모듈에도 토큰을 넣어준다.
  useEffect(() => {
    let alive = true

    reissueAccessToken()
      .then(async (token) => {
        if (!alive || !token) return
        setAccessToken(token)
        // 프로필 조회가 실패해도 로그인 자체는 유효하다. 이름·포인트만 비어 있게 둔다.
        const profile = await fetchMyProfile().catch(() => null)
        if (alive && profile) setUser(profile)
      })
      .finally(() => {
        if (alive) setIsRestoringSession(false)
      })

    return () => {
      alive = false
    }
  }, [])

  // 도중에 세션이 끊기면(재발급까지 실패) 화면이 스스로 알아채야 한다.
  useEffect(() => onSessionExpired(clearSession), [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      // 프로필 조회가 실패하면 user 가 빌 수 있으므로 인증 여부는 accessToken 만으로 판단.
      isAuthenticated: Boolean(accessToken),
      isRestoringSession,
      setSession,
      clearSession,
      logout,
    }),
    [user, accessToken, isRestoringSession, setSession, clearSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
