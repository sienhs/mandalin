/**
 * 랜드마크 카탈로그 — **모델링 원본** (3×3 거대 건물, 8단계 성장).
 *
 * 일반 건물(catalog.ts / premium/*)과 분리한 이유:
 *  - 부지가 3×3(ref 3.0)이라 좌표 스케일이 완전히 다르다.
 *  - 단계가 3단계가 아니라 8단계이고, 부품마다 `st`(등장 단계 1~8)를 달아 공사가 진행되듯
 *    자란다. `s` 가 아니다 — `cross` 부품이 이미 `s`(십자 크기)를 쓰고 있어 뜻이 겹친다.
 *  - 배치 자리도 다르다. 마을 정중앙 블록(만다라트 중심 목표) 하나뿐이다.
 *
 * ⚠️ **여기를 고쳐도 화면과 DB 는 자동으로 안 맞는다.** 백엔드는 `buildings.json` 스냅샷을
 * `building_item` 에 적재하고, 프론트는 (지금은) 서버가 준 `parts` 를 쓰지 않고 이 모듈을
 * 다시 붙인다. 그래서 모델을 만졌으면 **`npm run export:catalog` 로 시드를 다시 뽑아 함께
 * 커밋**해야 두 쪽이 같은 건물을 말한다.
 *
 * ⚠️ 원래는 "`/village` 에서 import 하지 않는다"가 규칙이었지만 지금은 지켜지지 않는다 —
 * `localCatalog` 를 통해 실서비스 경로가 이 카탈로그를 번들에 싣는다. 그 대가와 되돌리는
 * 방법은 `localCatalog.tsx` 머리주석에 적어 두었다. 미보유 랜드마크를 세울 수 있게 되는
 * 위험은 없다 — 마을은 서버가 준 보유 목록에서만 key 를 꺼낸다(`ownedCatalog.partsOf`).
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

/*
 * 랜드마크에는 가격 상수가 없다.
 *
 * 포인트로 사는 물건이 아니라 **만다라트 완성 보상**으로 해금한다. 상점 목록에서도 빠진다
 * (ShopService.findAll 이 type=LANDMARK 를 걸러낸다). 시드의 price 는 0 으로 나가는데,
 * 그건 "무료"가 아니라 "상점 재화가 아님"의 표시다.
 *
 * 보상 지급이 붙기 전까지는 /test 의 "랜드마크 전부 획득"(POST /api/v1/demo/buildings/landmarks)
 * 이 그 자리를 대신한다.
 */

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
