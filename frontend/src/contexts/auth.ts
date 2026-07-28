import { createContext, useContext } from 'react'
import type { OAuthExchangeResponse, UserProfileData } from '../api'

/**
 * 로그인한 사용자.
 * 서버 응답(UserProfileData)과 같은 모양이라 별도로 다시 정의하지 않는다 —
 * 두 벌로 두면 서버가 필드를 바꿔도 프론트 타입은 조용히 맞는 척한다.
 */
export type UserProfile = UserProfileData

export type LoginData = OAuthExchangeResponse['data']

export type AuthContextValue = {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  isRestoringSession: boolean
  setSession: (data: LoginData) => void
  /** 로컬 세션만 해제. 서버 폐기까지 하려면 logout 을 쓴다. */
  clearSession: () => void
  /** 서버에 이 기기 세션 폐기를 요청하고 로컬 세션도 비운다. */
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
