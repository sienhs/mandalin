/**
 * 로컬 카탈로그 어댑터 — 전체 카탈로그(기본 15종 + 프리미엄 241종 + 랜드마크 13종)를 묶는
 * 유일한 곳.
 *
 * ⚠️ **개발용 페이지 전용이 아니다.** 원래 의도는 그랬고 위 줄에도 그렇게 적혀 있었지만,
 * 실서비스 경로가 이미 둘이나 이 모듈을 본다.
 *
 *   `pages/VillagePage`     `withParts` 가 서버의 `parts` 를 버리고 여기 것을 붙인다
 *   `village/VillagePreview`  같은 이유. 그리고 이쪽이 `pages/HomePage` 에서 정적 import 된다
 *
 * <p>그 결과 카탈로그와 three.js 가 <b>lazy 청크가 아니라 메인 청크</b>에 들어간다(측정: index
 * 약 1.66MB, VillagePage 청크 약 19KB). 랜딩만 보러 온 방문자도 전부 내려받는다.
 *
 * <p>의도된 대가이긴 하다 — 덕분에 목업 모드에서도 마을이 그려진다(백엔드가 없으면 `parts` 를
 * 받을 길이 없다). 되돌리려면 목업·로컬 카탈로그 경로를 동적 import 로 떼어내야 하고, 그건
 * `data/gateway`·`data/store` 까지 걸치는 별건이다.
 *
 * <p>미보유 건물을 세울 수 있게 되는 위험은 없다 — 마을은 서버가 준 보유 목록에서만 key 를
 * 꺼낸다(`ownedCatalog.partsOf`). 남은 대가는 번들 크기뿐이다.
 */
import { BUILDING_CONFIGS } from './catalog'
import { PREMIUM_CONFIGS } from './premium'
import { LANDMARK_CONFIGS } from './landmarks'
import { LandmarkParts, StageParts } from './buildings'
import type { BuildingConfig, LandmarkStage, Part, Stage, ThemeKey } from './partTypes'

/** 기본 15종 + 프리미엄 테마 건물 + 랜드마크 병합 카탈로그. */
export const ALL_CONFIGS: Record<string, BuildingConfig> = {
  ...BUILDING_CONFIGS,
  ...PREMIUM_CONFIGS,
  ...LANDMARK_CONFIGS,
}

/** 로컬에 config 가 있는 모든 건물 key. */
export type AnyBuildingKey =
  | keyof typeof BUILDING_CONFIGS
  | keyof typeof PREMIUM_CONFIGS
  | keyof typeof LANDMARK_CONFIGS

/** 랜드마크(3×3·8단계)인지. 단계 규칙이 달라 렌더러를 갈아타야 한다. */
export function isLandmarkKey(k: string): boolean {
  return ALL_CONFIGS[k]?.group === 'landmark'
}

export function localParts(k: string): Part[] | null {
  return ALL_CONFIGS[k]?.parts ?? null
}

export function localLabel(k: string): string {
  return ALL_CONFIGS[k]?.label ?? k
}

/**
 * key 로 그리는 편의 래퍼. 서버 주도 경로에서는 StageParts 를 직접 쓴다.
 *
 * 랜드마크는 8단계라 stage 를 그대로 넘기면 3 에서 잘린다. 검수 페이지가 한 화면에서
 * 일반 건물과 랜드마크를 섞어 보므로, 여기서 종류를 보고 렌더러를 고른다.
 */
export function StageBuilding({
  k, stage, theme, landmarkStage = 8,
}: { k: string; stage: Stage; theme: ThemeKey; landmarkStage?: LandmarkStage }) {
  if (isLandmarkKey(k)) return <LandmarkParts parts={localParts(k)} stage={landmarkStage} />
  return <StageParts parts={localParts(k)} stage={stage} theme={theme} />
}
