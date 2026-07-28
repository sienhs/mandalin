import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { reissueAccessToken } from '../api'
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
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isRestoringSession, setIsRestoringSession] = useState(true)

  const clearSession = useCallback(() => {
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

    setUser(profile)
    setAccessToken(data.accessToken)
  }, [])

  useEffect(() => {
    reissueAccessToken()
      .then(setAccessToken)
      .catch(() => setAccessToken(null))
      .finally(() => setIsRestoringSession(false))
  }, [])

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
