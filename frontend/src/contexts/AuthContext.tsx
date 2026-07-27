import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { reissueAccessToken } from '../api'
import {
  AuthContext,
  type AuthContextValue,
  type LoginData,
  type UserProfile,
} from './auth'

const USER_SESSION_KEY = 'mandarin:user'

function readStoredUser(): UserProfile | null {
  try {
    const storedUser = sessionStorage.getItem(USER_SESSION_KEY)
    return storedUser ? (JSON.parse(storedUser) as UserProfile) : null
  } catch {
    sessionStorage.removeItem(USER_SESSION_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(readStoredUser)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isRestoringSession, setIsRestoringSession] = useState(Boolean(user))
  const shouldRestoreSession = useRef(Boolean(user))

  const clearSession = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    sessionStorage.removeItem(USER_SESSION_KEY)
  }, [])

  const setSession = useCallback((data: LoginData) => {
    const profile: UserProfile = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      profileImageUrl: data.profileImageUrl,
      points: data.points,
    }

    setUser(profile)
    setAccessToken(data.accessToken)
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile))
  }, [])

  useEffect(() => {
    if (!shouldRestoreSession.current) {
      setIsRestoringSession(false)
      return
    }

    reissueAccessToken()
      .then(setAccessToken)
      .catch(clearSession)
      .finally(() => setIsRestoringSession(false))
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isRestoringSession,
      setSession,
      clearSession,
    }),
    [user, accessToken, isRestoringSession, setSession, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
