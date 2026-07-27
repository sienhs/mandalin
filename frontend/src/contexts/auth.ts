import { createContext, useContext } from 'react'
import type { OAuthExchangeResponse } from '../api'

export type UserProfile = {
  userId: number
  name: string
  email: string
  profileImageUrl?: string
  points?: number
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
