import type { ApiEnvelope } from './types'

/**
 * 백엔드 주소.
 *
 * <p>비워 두면 같은 출처로 나가고(`/api/...`) Vite 프록시가 실제 백엔드로 넘긴다 —
 * 개발 중에는 이쪽이다. 배포 백엔드의 CORS 허용 목록에 localhost 가 없어서
 * 로컬에서 직접 호출은 막히기 때문이다.
 *
 * <p><b>배포에서는 반드시 값이 있어야 한다.</b> 프론트는 Vercel, 백엔드는 EC2 로 출처가
 * 다르고 Vercel 에는 백엔드로 넘기는 rewrite 가 없다(vercel.json 은 SPA 폴백뿐). 빈 값이면
 * `/api/...` 도 `/oauth2/authorization/kakao` 도 index.html 이 돌아와, 카카오 로그인 버튼이
 * 404 화면으로 떨어진다.
 */
export const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/* ─────────────────────────  액세스 토큰  ───────────────────────── */

/**
 * 원래 프론트는 토큰을 메모리에만 뒀다(XSS 방어). 여기서는 개발 편의를 위해
 * sessionStorage 도 함께 쓴다 — 새로고침마다 재발급을 기다리지 않고,
 * 배포 프론트에서 복사해 온 토큰으로도 바로 붙을 수 있어야 하기 때문이다.
 * 운영 코드로 옮길 때는 이 저장소를 떼고 메모리만 남기면 된다.
 */
const TOKEN_KEY = 'mandarin.dev.accessToken'

/**
 * 사용자가 직접 로그아웃했다는 표시.
 *
 * <p>액세스 토큰을 비우는 것만으로는 로그아웃이 끝나지 않는다. 부팅할 때마다 리프레시
 * 쿠키로 세션을 되살리려 하기 때문에(`store.tsx` 의 세션 복원), 쿠키가 한 박자 늦게
 * 지워지거나 서버 요청이 실패하면 새로 고치는 순간 다시 로그인된 화면이 뜬다.
 * 그래서 "되살리지 말라"는 뜻을 이 탭에 남겨 둔다.
 *
 * <p>탭 단위(sessionStorage)로 둔다 — 다른 탭에서 쓰던 세션까지 끌어내리지 않는다.
 */
const LOGGED_OUT_KEY = 'mandarin.loggedOut'

let accessToken: string | null =
  typeof window === 'undefined' ? null : window.sessionStorage.getItem(TOKEN_KEY)

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
  window.sessionStorage.setItem(TOKEN_KEY, token)
  // 토큰이 새로 들어왔다 = 다시 로그인했다. 표시를 남겨 두면 다음 부팅에서 게스트가 된다.
  window.sessionStorage.removeItem(LOGGED_OUT_KEY)
}

export function markLoggedOut(): void {
  window.sessionStorage.setItem(LOGGED_OUT_KEY, '1')
}

export function clearLoggedOut(): void {
  window.sessionStorage.removeItem(LOGGED_OUT_KEY)
}

export function wasLoggedOut(): boolean {
  return window.sessionStorage.getItem(LOGGED_OUT_KEY) === '1'
}

export function clearAccessToken(): void {
  accessToken = null
  window.sessionStorage.removeItem(TOKEN_KEY)
}

export function hasAccessToken(): boolean {
  return accessToken !== null
}

/* ─────────────────────────  세션 만료 통지  ───────────────────────── */

const sessionExpiredListeners = new Set<() => void>()

/** 재발급까지 실패해 로그인이 끊겼을 때 불린다. 구독 해제 함수를 돌려준다. */
export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener)
  return () => sessionExpiredListeners.delete(listener)
}

/* ─────────────────────────  요청  ───────────────────────── */

const AUTH_PREFIX = '/api/auth/'

function send(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  // 리프레시 토큰이 httpOnly 쿠키다.
  return fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' })
}

async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T

  const text = await response.text()
  let body: ApiEnvelope<T> | null = null
  try {
    body = text ? (JSON.parse(text) as ApiEnvelope<T>) : null
  } catch {
    // 프록시가 붙지 않았거나 백엔드가 죽으면 HTML 에러 페이지가 온다.
    throw new ApiError(
      response.status,
      response.ok
        ? '서버 응답을 이해하지 못했습니다. 백엔드 주소(VITE_API_BASE_URL·VITE_API_TARGET)를 확인해 주세요.'
        : `요청이 실패했습니다 (${response.status})`,
    )
  }

  if (!response.ok || body?.success === false) {
    throw new ApiError(response.status, body?.message ?? `요청이 실패했습니다 (${response.status})`)
  }
  return body?.data as T
}

let reissueInFlight: Promise<string | null> | null = null

function failReissue(hadToken: boolean): null {
  clearAccessToken()
  if (hadToken) sessionExpiredListeners.forEach((l) => l())
  return null
}

async function runReissue(): Promise<string | null> {
  const hadToken = hasAccessToken()
  try {
    const response = await fetch(`${BASE}/api/auth/reissue`, {
      method: 'POST',
      credentials: 'include',
    })
    const body = (await response.json().catch(() => null)) as ApiEnvelope<string> | null

    if (!response.ok || !body?.success || !body.data) return failReissue(hadToken)
    setAccessToken(body.data)
    return body.data
  } catch {
    return failReissue(hadToken)
  }
}

/**
 * httpOnly 리프레시 쿠키로 액세스 토큰을 다시 받는다.
 * 여러 요청이 동시에 401 을 맞아도 재발급은 한 번만 나간다.
 */
export function reissueAccessToken(): Promise<string | null> {
  if (!reissueInFlight) {
    reissueInFlight = runReissue().finally(() => {
      reissueInFlight = null
    })
  }
  return reissueInFlight
}

/** 인증 헤더를 붙이고 ApiResponse 래퍼를 벗겨 data 만 돌려준다. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await send(path, init)
  } catch {
    throw new ApiError(0, '서버에 연결하지 못했습니다. 백엔드가 떠 있는지 확인해 주세요.')
  }

  if (response.status === 401 && !path.startsWith(AUTH_PREFIX)) {
    const renewed = await reissueAccessToken()
    if (renewed) response = await send(path, init)
  }
  return unwrap<T>(response)
}
