/**
 * 로컬 카탈로그 어댑터 — **개발용 페이지 전용** (/gallery, /premium, /thumbnails, /inspect).
 *
 * 실서비스 경로(/village)는 보유 건물을 서버에서 받으므로 이 모듈을 import 하지 않는다.
 * 전체 카탈로그(기본 15종 + 프리미엄 241종)를 묶는 곳이 여기뿐이라, 이 파일을 건드리는
 * 페이지만 무거운 카탈로그 청크를 지고 간다.
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
