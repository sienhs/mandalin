import { createContext, useContext } from 'react'
import type { OAuthExchangeResponse } from '../api'

/**
 * ERD `user` 테이블의 프론트 모델.
 * DB의 snake_case 컬럼명은 프론트 관례에 맞춰 camelCase로 표현한다.
 */
export type UserProfile = {
  id: number
  kakaoId: string
  name: string
  uuid: string
  point: number
  profileImageUrl: string | null
  createdAt: string
  deletedAt: string | null
}

export type LoginData = OAuthExchangeResponse['data']

export type AuthContextValue = {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  isRestoringSession: boolean
  setSession: (data: LoginData) => void
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
