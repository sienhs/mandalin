import { useContext } from 'react'
import { SessionContext, type Session } from './sessionContext'

/** AuthProvider 안에서만 쓸 수 있다. 밖에서 부르면 조용히 비로그인처럼 보이는 게 더 위험해 던진다. */
export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) {
    throw new Error('useSession must be used within <AuthProvider>')
  }
  return session
}
