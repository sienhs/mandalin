/**
 * 랜드마크 카탈로그 — **모델링 원본** (3×3 거대 건물, 8단계 성장).
 *
 * 일반 건물(catalog.ts / premium/*)과 분리한 이유:
 *  - 부지가 3×3(ref 3.0)이라 좌표 스케일이 완전히 다르다.
 *  - 단계가 3단계가 아니라 8단계이고, 부품마다 `s`(등장 단계)를 달아 공사가 진행되듯 자란다.
 *  - 배치 자리도 다르다. 마을 정중앙 블록(만다라트 중심 목표) 하나뿐이다.
 *
 * ⚠️ 이 모듈도 `/village` 에서 import 하면 안 된다. 마을은 서버가 내려준 보유 건물의
 * parts 만 그린다 — 카탈로그가 번들에 실리면 미보유 랜드마크까지 세울 수 있게 된다.
 * 개발용 페이지(/premium, /inspect, /thumbnails)와 시드 덤프 스크립트만 여기를 본다.
 *
 * 건물을 추가·수정했으면 `npm run export:catalog` 로 백엔드 시드를 다시 뽑을 것.
 */
import type { BuildingConfig } from '../partTypes'
import { STADIUM_LANDMARKS } from './stadium'
import { CIVIC_LANDMARKS } from './civic'
import { PALACE_LANDMARKS } from './palace'
import { TOWER_LANDMARKS } from './tower'

export const LANDMARK_CONFIGS = {
  ...STADIUM_LANDMARKS,
  ...CIVIC_LANDMARKS,
  ...PALACE_LANDMARKS,
  ...TOWER_LANDMARKS,
} satisfies Record<string, BuildingConfig>

export type LandmarkKey = keyof typeof LANDMARK_CONFIGS

export const LANDMARK_KEYS = Object.keys(LANDMARK_CONFIGS) as LandmarkKey[]

/** building_item.theme 값. 상점·피커의 그룹 키가 된다. */
export const LANDMARK_THEME = 'LANDMARK'

/**
 * 기본 지급 랜드마크.
 *
 * 마을은 보유한 건물만 그릴 수 있어서, 랜드마크를 하나도 안 가진 유저는 정중앙이 영구히
 * 공사 부지로 남는다. 그래서 한 종은 가입 시 무료로 준다.
 */
export const LANDMARK_DEFAULT_KEY: LandmarkKey = 'lm_civic_plaza'

/** 기본 지급분을 뺀 나머지 랜드마크 가격(포인트). 일반 프리미엄(300)보다 비싸다. */
export const LANDMARK_PRICE = 1500

/** UI 목록용: [key, label]. */
export const LANDMARK_LIST: { key: LandmarkKey; label: string }[] = LANDMARK_KEYS.map((key) => ({
  key,
  label: LANDMARK_CONFIGS[key].label,
}))

/** 개발용 뷰어(/premium, /inspect) 그룹핑 메타. */
export const LANDMARK_VIEWER_THEME = {
  id: 'landmark',
  label: '🗺 랜드마크 (3×3 · 8단계)',
  keys: LANDMARK_KEYS as string[],
}
