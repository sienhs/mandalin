import { useCallback, useEffect, useState } from 'react'

/**
 * 3D 마을 뒤에 까는 배경 사진.
 *
 * <p><b>왜 3D 하늘이 아니라 사진 한 장인가.</b> 받은 그림 10장은 전부 <b>가운데가 비어 있는
 * 와이드 일러스트</b>다 — 빈 자리에 마을 섬이 앉도록 그려져 있다. 하늘 구체에 텍스처로
 * 감으면 그 빈 자리가 카메라를 따라 돌아, 시점을 돌릴 때마다 엉뚱한 곳이 뚫려 보인다.
 * 캔버스 <b>뒤에</b> 깐 한 장은 늘 같은 자리에 있으므로 구도가 흐트러지지 않는다.
 *
 * <p>덤으로 GPU 에 3천만 픽셀짜리 텍스처를 올리지 않는다. 디코딩도 캐시도 브라우저가
 * `<img>` 로 알아서 한다.
 *
 * <p><b>기본은 사진 없음</b>({@link NO_BACKDROP})이다. 그때는 예전 그대로 `SkyBackdrop` 의
 * 옅은 그라디언트 하늘이 보인다 — 고른 사람만 사진을 본다.
 */

/** 사진을 쓰지 않는 상태. 기본값이다. */
export const NO_BACKDROP = 'none'

export interface Backdrop {
  key: string
  label: string
  /**
   * 사진 가장자리의 평균색.
   *
   * <p>사진이 아직 도착하지 않은 동안 캔버스 뒤에 깔린다. 흰 판이 번쩍였다가 어두운
   * 사진으로 바뀌는 것보다, 처음부터 그 사진의 색으로 차 있는 편이 덜 튄다. 원본
   * 가장자리를 16×8 로 줄여 평균 낸 값이라 눈대중으로 고른 색이 아니다.
   */
  tint: string
}

/**
 * 고를 수 있는 배경.
 *
 * <p>밝은 것부터 어두운 것 순이다 — 고르는 화면에서 썸네일이 한눈에 훑어지도록.
 *
 * <p>파일은 `public/backgrounds/` 에 `{key}.webp`(폭 2048)와 `{key}-thumb.webp`(폭 384)
 * 두 벌씩 있다. 원본 PNG 는 장당 5~12MB(합 78MB)였는데 webp 로 옮겨 열 장 합쳐 1.5MB 다.
 * 배경을 추가할 때도 같은 규격으로 넣는다 — 원본을 그대로 두면 배경 한 장이 앱 전체보다
 * 무거워진다.
 */
export const BACKDROPS = [
  // 벚나무 숲과 연못. 둘레가 온통 풀과 흙이다.
  { key: 'sakura', label: '벚꽃', tint: '#e1d1db' },
  // 사막·나일강. 마른 모래와 바퀴자국.
  { key: 'egypt', label: '이집트', tint: '#caa588' },
  // 빈 자리를 순환 도로가 감싸고 그 밖이 도심과 한강이다.
  { key: 'seoul', label: '서울', tint: '#9fa69f' },
  // 계단식 논과 대숲. 물이 많지만 눈에 닿는 것은 초록이다.
  { key: 'tropical', label: '열대 리조트', tint: '#928475' },
  // 놋쇠 톱니와 배관, 굴뚝의 공업 도시.
  { key: 'steampunk', label: '스팀펑크', tint: '#997a6a' },
  // 칼데라 바다. 빈 자리 자체가 물이다.
  { key: 'santorini', label: '산토리니', tint: '#7c8d9f' },
  // 광산 계곡. 맨흙과 자갈, 철길.
  { key: 'western', label: '서부', tint: '#7f624d' },
  // 눈과 유빙, 피오르. 물길의 창백한 파랑이 눈밭과 붙는다.
  { key: 'nordic', label: '노르딕', tint: '#5c7497' },
  // 미래 도시와 항만.
  { key: 'sf', label: 'SF 도시', tint: '#53668d' },
  // 네온 야경. 빈 자리를 도로 격자가 지난다.
  { key: 'cyberpunk', label: '사이버펑크', tint: '#292147' },
] as const satisfies readonly Backdrop[]

/** 사진 하나를 가리키는 값. */
export type BackdropId = (typeof BACKDROPS)[number]['key']
/** 화면이 들고 다니는 값. 사진 하나이거나 '사진 없음'이다. */
export type BackdropKey = typeof NO_BACKDROP | BackdropId

export function isBackdropId(value: string): value is BackdropId {
  return BACKDROPS.some((b) => b.key === value)
}

/**
 * 배경 정보. '사진 없음'이면 null — 부르는 쪽이 그때 기본 하늘을 그린다.
 *
 * <p>돌려주는 타입이 `Backdrop` 이 아니라 목록의 원소 타입이다. `Backdrop.key` 는
 * `string` 이라, 그걸로 받으면 찾아 놓고도 {@link backdropImage} 에 넘기지 못한다.
 */
export function findBackdrop(key: BackdropKey): (typeof BACKDROPS)[number] | null {
  return BACKDROPS.find((b) => b.key === key) ?? null
}

export function backdropImage(key: BackdropId): string {
  return `/backgrounds/${key}.webp`
}

export function backdropThumb(key: BackdropId): string {
  return `/backgrounds/${key}-thumb.webp`
}

/**
 * 고른 배경을 기억하는 자리.
 *
 * <p><b>시트마다 따로 둔다.</b> 지형이 그렇기 때문이다(`/village/sheets/{id}/terrain`).
 * 마을 하나하나가 다른 환경을 갖는데 배경만 전역이면, 시트를 옮길 때 지형은 바뀌는데
 * 배경만 남아 서로 어긋난다.
 *
 * <p><b>서버가 아니라 localStorage 다.</b> 배경을 담을 필드가 서버에 없고 이번 작업은
 * 프론트에 한정한다. 그래서 기기를 옮기면 따라오지 않는다 — 나중에 서버에 필드가 생기면
 * 이 훅 안쪽만 바꾸면 되도록 읽기·쓰기를 여기 한 곳에 모아 뒀다.
 */
const STORAGE_PREFIX = 'mandarin.village.backdrop:'

export function useBackdrop(sheetId: number | null): [BackdropKey, (next: BackdropKey) => void] {
  const [key, setKey] = useState<BackdropKey>(NO_BACKDROP)

  /*
    시트가 정해진 뒤에 읽는다. 그 전 한 프레임은 기본(사진 없음)으로 그려지는데, 캔버스도
    아직 스켈레톤이라 보이는 것이 없다.
  */
  useEffect(() => {
    if (sheetId == null) return
    try {
      const saved = window.localStorage.getItem(STORAGE_PREFIX + sheetId)
      // 저장분이 낡아 지금 목록에 없는 key 면 기본으로 물러난다.
      setKey(saved && isBackdropId(saved) ? saved : NO_BACKDROP)
    } catch {
      setKey(NO_BACKDROP)
    }
  }, [sheetId])

  const choose = useCallback(
    (next: BackdropKey) => {
      setKey(next)
      if (sheetId == null) return
      try {
        if (next === NO_BACKDROP) window.localStorage.removeItem(STORAGE_PREFIX + sheetId)
        else window.localStorage.setItem(STORAGE_PREFIX + sheetId, next)
      } catch {
        // 사파리 비공개 모드 등. 이번 세션에는 적용되고 다음 방문에 안 남을 뿐이다.
      }
    },
    [sheetId],
  )

  return [key, choose]
}
