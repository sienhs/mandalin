/**
 * 액세스 토큰 보관소 — **메모리 전용**.
 *
 * localStorage 에 두지 않는다. XSS 가 한 번 터지면 저장소의 토큰은 그대로 털리는데,
 * 리프레시 토큰이 이미 httpOnly 쿠키로 서버에 있으므로 새로고침 후에는
 * `POST /api/auth/reissue` 로 다시 받아오면 된다(api.ts 의 reissueAccessToken).
 *
 * 그래서 이 모듈은 탭이 살아있는 동안의 캐시일 뿐이고, 사라져도 로그인은 끊기지 않는다.
 */

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}

/**
 * 이 탭이 지금 당장 쓸 수 있는 토큰을 들고 있는지.
 *
 * ⚠️ "로그인 여부"가 아니다. 새로고침 직후에는 항상 false 지만 리프레시 쿠키가 살아 있으면
 * 여전히 로그인 상태다. 로그인 여부 판단은 재발급을 시도해 봐야 알 수 있다.
 */
export function hasAccessToken(): boolean {
  return accessToken !== null
}
