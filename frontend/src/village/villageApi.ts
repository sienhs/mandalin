import { apiFetch } from '../api'
import type { Part } from './partTypes'

/**
 * /village 서버 연동.
 *
 * 건물 모델링(parts)과 보유 목록의 정본은 서버다. 프론트는 전체 카탈로그를 들고 있지
 * 않으므로 여기서 받은 것만 배치할 수 있다.
 */

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
  buildings: OwnedBuilding[]
}

export function fetchMyVillage(): Promise<VillageData> {
  return apiFetch<VillageData>('/api/v1/village/me')
}
