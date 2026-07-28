import { createContext } from 'react'
import type { LoginResult } from '../api'

/**
 * 로그인 세션 상태.
 *
 * - `loading`: 리프레시 쿠키로 복원을 시도하는 중. 아직 로그인 여부를 모른다.
 * - `authenticated`: 액세스 토큰을 확보했다.
 * - `anonymous`: 복원 실패 또는 로그아웃.
 */
export type SessionStatus = 'loading' | 'authenticated' | 'anonymous'

/**
 * 로그인한 사용자.
 *
 * ⚠️ **로그인 직후에만 채워진다.** 새로고침 후에는 리프레시 쿠키로 토큰만 되찾을 뿐이라
 * `authenticated` 인데도 null 이다 — 사용자 정보를 주는 조회 API 가 아직 없기 때문이다.
 * 그 API 가 생기면 복원 직후 한 번 불러 채우면 된다.
 */
export interface SessionUser {
  userId: number
  name: string
  uuid: string
}

export interface Session {
  status: SessionStatus
  user: SessionUser | null
  /** 소셜 로그인 교환 결과로 세션을 연다. */
  signIn: (result: LoginResult) => void
  /** 로컬 세션만 해제한다. 서버 로그아웃(리프레시 토큰 폐기)은 별도. */
  signOut: () => void
}

export const SessionContext = createContext<Session | null>(null)
