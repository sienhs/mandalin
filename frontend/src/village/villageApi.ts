import { apiFetch } from '../api'
import type { Part } from './partTypes'

/**
 * /village 서버 연동.
 *
 * 건물 모델링(parts)과 보유 목록의 정본은 서버다. 프론트는 전체 카탈로그를 들고 있지
 * 않으므로 여기서 받은 것만 배치할 수 있다.
 */

export const TERRAINS = ['CITY_ROAD', 'DIRT_ROAD', 'GRASS_PATH', 'WATER_WAY'] as const
export type Terrain = (typeof TERRAINS)[number]

/** 지형 선택 UI 문구. 순수 표시용이라 서버가 아니라 여기서 관리한다. */
export const TERRAIN_META: Record<Terrain, { label: string; desc: string }> = {
  CITY_ROAD: { label: '포장 도시', desc: '아스팔트 도로와 인도, 횡단보도가 깔린 도심' },
  DIRT_ROAD: { label: '거친 비포장', desc: '마른 흙과 바퀴자국, 자갈이 굴러다니는 변두리' },
  GRASS_PATH: { label: '푸른 초원', desc: '잔디밭 사이로 다져진 흙길과 야생화' },
  WATER_WAY: { label: '물 길', desc: '수로 위 섬들을 목재 다리로 잇는 마을' },
}

export type BuildingType = 'NORMAL' | 'LANDMARK'

export interface OwnedBuilding {
  itemId: number
  itemKey: string
  name: string
  theme: string
  type: BuildingType
  thumbnailUrl: string | null
  size: { width: number; depth: number; height: number }
  parts: Part[]
}

export interface VillageData {
  /** 고른 적 없으면 서버 기본값이 내려온다 — null 이 아니다. */
  terrain: Terrain
  buildings: OwnedBuilding[]
}

export function fetchMyVillage(): Promise<VillageData> {
  return apiFetch<VillageData>('/api/v1/village/me')
}

/** 지형 변경. 횟수 제한 없이 몇 번이든 바꿀 수 있다. */
export function changeTerrain(terrain: Terrain): Promise<Terrain> {
  return apiFetch<Terrain>('/api/v1/village/terrain', {
    method: 'PUT',
    body: JSON.stringify({ terrain }),
  })
}
