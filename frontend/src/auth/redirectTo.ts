/**
 * 로그인 후 돌아갈 경로 보관.
 *
 * 카카오 로그인은 브라우저를 외부 도메인으로 보냈다가 데려오기 때문에 React state 도,
 * react-router 의 location.state 도 살아남지 못한다. 같은 탭·같은 오리진에서 유지되는
 * sessionStorage 에 잠깐 맡겨둔다. 경로 문자열이라 토큰 같은 보안 부담도 없다.
 */

const KEY = 'mandarin.redirectTo'

/** 열려던 경로를 기억한다. 로그인 관련 경로는 되돌아갈 곳이 아니라 무시한다. */
export function rememberIntendedPath(path: string): void {
  if (!path.startsWith('/') || path.startsWith('/login') || path.startsWith('/oauth')) {
    return
  }
  try {
    sessionStorage.setItem(KEY, path)
  } catch {
    /* 저장 못 하면 기본 경로로 보내면 된다 */
  }
}

/** 기억해둔 경로를 꺼내면서 지운다. 한 번 쓰고 버리는 값이다. */
export function consumeIntendedPath(): string | null {
  try {
    const path = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    // 외부에서 값이 조작돼도 오픈 리다이렉트가 되지 않도록 내부 절대경로만 허용한다.
    return path && path.startsWith('/') && !path.startsWith('//') ? path : null
  } catch {
    return null
  }
}
