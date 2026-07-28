import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onSessionExpired, reissueAccessToken, type LoginResult } from '../api'
import { clearAccessToken, setAccessToken } from './session'
import { SessionContext, type SessionStatus, type SessionUser } from './sessionContext'

/**
 * 로그인 세션 복원과 전역 상태.
 *
 * 액세스 토큰은 메모리에만 있어서 새로고침하면 사라진다. 마운트 시 httpOnly 리프레시
 * 쿠키로 한 번 재발급을 시도해 로그인 상태를 되살린다.
 *
 * 복원은 **화면을 막지 않는다.** 랜딩·로그인 같은 공개 페이지는 곧바로 그려지고,
 * 로그인이 필요한 화면만 status 가 정해질 때까지 기다린다(보호 라우트 담당).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    let alive = true
    reissueAccessToken()
      .then((token) => {
        if (alive) setStatus(token ? 'authenticated' : 'anonymous')
      })
    return () => {
      alive = false
    }
  }, [])

  // 세션이 도중에 끊기면(재발급 실패) 화면이 스스로 알아채야 한다.
  useEffect(() => onSessionExpired(() => {
    setUser(null)
    setStatus('anonymous')
  }), [])

  const signIn = useCallback((result: LoginResult) => {
    setAccessToken(result.accessToken)
    setUser({ userId: result.userId, name: result.name, uuid: result.uuid })
    setStatus('authenticated')
  }, [])

  const signOut = useCallback(() => {
    clearAccessToken()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
