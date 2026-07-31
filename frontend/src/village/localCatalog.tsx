/**
 * 로컬 카탈로그 어댑터 — **개발용 페이지 전용** (/gallery, /premium, /thumbnails, /inspect).
 *
 * 실서비스 경로(/village)는 보유 건물을 서버에서 받으므로 이 모듈을 import 하지 않는다.
 * 전체 카탈로그(기본 15종 + 프리미엄 241종)를 묶는 곳이 여기뿐이라, 이 파일을 건드리는
 * 페이지만 무거운 카탈로그 청크를 지고 간다.
 */
import { BUILDING_CONFIGS } from './catalog'
import { PREMIUM_CONFIGS } from './premium'
import { StageParts } from './buildings'
import type { BuildingConfig, Part, Stage, ThemeKey } from './partTypes'

/** 기본 15종 + 프리미엄 테마 건물 병합 카탈로그. */
export const ALL_CONFIGS: Record<string, BuildingConfig> = { ...BUILDING_CONFIGS, ...PREMIUM_CONFIGS }

/** 로컬에 config 가 있는 모든 건물 key. */
export type AnyBuildingKey = keyof typeof BUILDING_CONFIGS | keyof typeof PREMIUM_CONFIGS

export function localParts(k: string): Part[] | null {
  return ALL_CONFIGS[k]?.parts ?? null
}

export function localLabel(k: string): string {
  return ALL_CONFIGS[k]?.label ?? k
}

/** key 로 그리는 편의 래퍼. 서버 주도 경로에서는 StageParts 를 직접 쓴다. */
export function StageBuilding({ k, stage, theme }: { k: string; stage: Stage; theme: ThemeKey }) {
  return <StageParts parts={localParts(k)} stage={stage} theme={theme} />
}
