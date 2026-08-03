/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 백엔드 주소. **비워 두면 같은 출처로 나가 Vite 프록시를 탄다** — 로컬은 이쪽이다.
   * 배포(Vercel)는 백엔드와 출처가 달라 반드시 값이 있어야 한다.
   */
  readonly VITE_API_BASE_URL?: string
  /** 개발 서버 프록시가 실제로 붙을 백엔드. vite.config.ts 만 읽는다. */
  readonly VITE_API_TARGET?: string
  /** 'mock' 이면 서버 없이 목업 데이터로 돈다. 기본값 'api'. */
  readonly VITE_DATA_MODE?: string
  /** 개발용 액세스 토큰 주입. 넣어 두면 로그인 없이 붙는다. */
  readonly VITE_DEV_ACCESS_TOKEN?: string
  /** 건물 썸네일 위치. 보통 설정할 필요가 없다(기본값이 코드에 있다). */
  readonly VITE_THUMBNAIL_BASE_URL?: string
}
