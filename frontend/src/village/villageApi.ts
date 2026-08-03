import { apiFetch } from '../api'
import type { Part } from './partTypes'

/**
 * /village 서버 연동.
 *
 * 건물 모델링(parts)과 보유 목록의 정본은 서버다. 프론트는 전체 카탈로그를 들고 있지
 * 않으므로 여기서 받은 것만 배치할 수 있다.
 *
 * <p><b>경로가 시트별이다.</b> 예전에는 `/api/v1/village/me` 를 불렀는데 서버에 그런 경로가
 * 없어서 마을 화면이 404 로 죽었다 — 지형을 시트마다 따로 고를 수 있게 바뀌면서
 * `/village/sheets/{sheetId}` 로 옮겨졌는데 프론트가 따라가지 못한 자리다.
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
  /**
   * 인벤토리 아이디(`user_building.id`).
   *
   * 건물 배치 API 가 받는 값이다. 카탈로그 아이디(`itemId`)와 다르다 —
   * 참조하는 테이블이 달라 값이 겹치지 않는다.
   */
  invenId: number
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

/** 시트 한 장의 마을(지형 + 배치 가능한 보유 건물). */
export function fetchMyVillage(sheetId: number): Promise<VillageData> {
  return apiFetch<VillageData>(`/api/v1/village/sheets/${sheetId}`)
}

/** 지형 변경. 횟수 제한 없이 몇 번이든 바꿀 수 있다. */
export function changeTerrain(sheetId: number, terrain: Terrain): Promise<Terrain> {
  return apiFetch<Terrain>(`/api/v1/village/sheets/${sheetId}/terrain`, {
    method: 'PUT',
    body: JSON.stringify({ terrain }),
  })
}

/* ─────────────────────────  건물 배치  ───────────────────────── */

/**
 * 마을 타일 한 칸.
 *
 * 격자 좌표(`domainPosition`·`itemPosition`, 1~9)와 만다라트 번호
 * (`domainIndex`·`subjectPosition`, 0~7)가 함께 온다. 서버가 둘을 이어 주므로
 * 프론트에서 변환 규칙을 다시 구현하지 않는다 — 어긋나면 엉뚱한 칸이 자란다.
 */
export interface ItemSpot {
  domainPosition: number
  itemPosition: number
  domainIndex: number | null
  subjectPosition: number | null
  subjectId: number | null
  subjectTitle: string | null
  progress: number | null
  invenId: number | null
  itemId: number | null
  itemKey: string | null
  name: string | null
  theme: string | null
  type: BuildingType | null
  thumbnailUrl: string | null
  size: { width: number; depth: number; height: number } | null
  dir: '0' | '90' | '180' | '270'
  landmarkSlot: boolean
}

export interface VillageLayout {
  sheetId: number
  terrain: Terrain
  achievementRate: number
  spots: ItemSpot[]
}

/** 타일 73칸(중앙 랜드마크 1 + 8구역 × 9칸)의 배치. */
export function fetchVillageLayout(sheetId: number): Promise<VillageLayout> {
  return apiFetch<VillageLayout>(`/api/v1/village/sheets/${sheetId}/spots`)
}

/**
 * 타일 한 칸에 건물을 놓거나(invenId) 기본 스킨으로 되돌린다(null).
 *
 * 중앙 구역(domainPosition=5)에는 LANDMARK 만, 나머지 칸에는 NORMAL 만 놓을 수 있다.
 * 같은 건물이 다른 칸에 이미 서 있으면 그 칸은 서버가 비운다.
 */
export function placeBuilding(
  sheetId: number,
  domainPosition: number,
  itemPosition: number,
  invenId: number | null,
  dir: '0' | '90' | '180' | '270' = '0',
): Promise<ItemSpot> {
  return apiFetch<ItemSpot>(
    `/api/v1/village/sheets/${sheetId}/spots/${domainPosition}/${itemPosition}`,
    { method: 'PATCH', body: JSON.stringify({ invenId, dir }) },
  )
}
