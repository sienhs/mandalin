import { clearAccessToken, getAccessToken, hasAccessToken, setAccessToken } from './auth/session'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** 백엔드 공통 응답 래퍼(ApiResponse<T>). */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * 카카오 OAuth 교환 응답. 사용자 정보는 ERD `user` 컬럼을 camelCase로 변환한 형태.
 *
 * ⚠️ 현재 서버 LoginResponse 는 accessToken/userId/name/uuid 만 내려준다.
 * 나머지 필드(point·profileImageUrl 등)는 서버가 따라올 때까지 undefined 다.
 */
export type OAuthExchangeResponse = {
  success: boolean
  message: string
  data: {
    accessToken: string
    id: number
    /** oauth_identities 에서 오므로 연결 정보가 없으면 null. */
    kakaoId: string | null
    name: string
    uuid: string
    point: number
    profileImageUrl: string | null
    createdAt: string
    deletedAt: string | null
  }
}

export type LoginData = OAuthExchangeResponse['data']

/** 인증 엔드포인트 자신은 401 재발급 재시도 대상에서 뺀다 — 무한 루프가 된다. */
const AUTH_PREFIX = '/api/auth/'

function send(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers)
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  // 리프레시 토큰이 httpOnly 쿠키라 크로스 도메인에서도 쿠키를 실어 보내야 한다.
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
}

async function unwrap<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || body?.success === false) {
    throw new ApiError(response.status, body?.message ?? `Request failed (${response.status})`)
  }
  return body?.data as T
}

const sessionExpiredListeners = new Set<() => void>()

/**
 * 로그인이 끊겼을 때(재발급까지 실패) 호출된다. 구독 해제 함수를 돌려준다.
 *
 * 세션 만료는 아무 API 호출에서나 튀어나오는데, 그때마다 화면이 스스로 알아채게 하려면
 * 이런 통로가 필요하다. AuthProvider 가 구독해 세션을 비운다.
 */
export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener)
  return () => {
    sessionExpiredListeners.delete(listener)
  }
}

let reissueInFlight: Promise<string | null> | null = null

/** 토큰을 들고 있다가 잃은 경우에만 "만료"다. 로그인한 적 없는 방문자의 첫 시도는 그냥 실패다. */
function failReissue(hadToken: boolean): null {
  clearAccessToken()
  if (hadToken) sessionExpiredListeners.forEach((listener) => listener())
  return null
}

async function runReissue(): Promise<string | null> {
  const hadToken = hasAccessToken()
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
      method: 'POST',
      credentials: 'include',
    })
    const body = (await response.json().catch(() => null)) as ApiEnvelope<string> | null

    if (!response.ok || !body?.success || !body.data) {
      return failReissue(hadToken)
    }
    setAccessToken(body.data)
    return body.data
  } catch {
    // 네트워크 장애와 로그아웃을 구분할 수 없다. 토큰을 버리고 호출부가 401로 처리하게 둔다.
    return failReissue(hadToken)
  }
}

/**
 * httpOnly 리프레시 쿠키로 액세스 토큰을 다시 받는다. 실패하면 null(=로그인 필요).
 *
 * 여러 요청이 동시에 401을 맞아도 재발급은 한 번만 나간다 — 진행 중인 Promise 를 공유한다.
 * 그러지 않으면 리프레시 토큰 회전을 붙였을 때 서로의 토큰을 무효화한다.
 */
export function reissueAccessToken(): Promise<string | null> {
  if (!reissueInFlight) {
    reissueInFlight = runReissue().finally(() => {
      reissueInFlight = null
    })
  }
  return reissueInFlight
}

/**
 * 인증 헤더를 붙이고 ApiResponse 래퍼를 벗겨 data 만 돌려주는 fetch.
 * 실패 시 서버가 준 message 를 담은 {@link ApiError} 를 던진다.
 *
 * 액세스 토큰은 30분짜리라, 만료된 것뿐인 경우 재발급 후 한 번 재시도한다.
 * 재발급까지 실패하면 그대로 401 이 올라간다.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await send(path, init)

  if (response.status === 401 && !path.startsWith(AUTH_PREFIX)) {
    const renewed = await reissueAccessToken()
    if (renewed) response = await send(path, init)
  }
  return unwrap<T>(response)
}

/** 1회용 인가 코드를 토큰·프로필로 교환한다. 래퍼를 벗긴 data 를 돌려준다. */
export function exchangeOAuthCode(code: string): Promise<LoginData> {
  return apiFetch<LoginData>('/api/auth/oauth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

/** 로그인한 사용자 프로필. 재발급만으로는 "누구인지"를 알 수 없어 새로고침 후 이걸로 되찾는다. */
export type UserProfileData = Omit<LoginData, 'accessToken'>

export function fetchMyProfile(): Promise<UserProfileData> {
  return apiFetch<UserProfileData>('/api/v1/users/me')
}

/**
 * 로그아웃. 서버가 이 기기의 리프레시 토큰을 폐기하고 쿠키를 지운다.
 * 인증이 필요 없어 액세스 토큰이 만료된 뒤에도 호출된다.
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch<void>('/api/auth/logout', { method: 'POST' })
  } finally {
    clearAccessToken()
  }
}
