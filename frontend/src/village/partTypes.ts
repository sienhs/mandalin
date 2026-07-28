/**
 * 건물 부품(Part) 타입과 렌더 상수 — **모델링 데이터가 없는 순수 스키마 모듈**.
 *
 * 실제 건물 config(BUILDING_CONFIGS / PREMIUM_CONFIGS)는 여기 두지 않는다.
 * /village 는 보유 건물의 parts 를 서버에서 받아 그리므로 카탈로그가 번들에 실리면 안 되고,
 * 렌더러(buildings.tsx)는 이 모듈만 import 해서 카탈로그와의 연결을 끊는다.
 *
 * 좌표계: ref 단위. y는 부품 "바닥" 기준(중심 아님). PL=주춧돌 높이.
 * 부품 kind 중 detail 계열은 3단계(완성)에서만 렌더, 2단계(형태)에선 생략.
 */

export const PL = 0.07

export type Vec3 = [number, number, number]

export interface WinSpec {
  from: number // 박스 높이 대비 시작 비율
  to: number
  color: string
  glow?: number
}

export type Part =
  | { k: 'plinth'; w: number; d?: number; color: string }
  | { k: 'box'; w: number; h: number; d?: number; y?: number; x?: number; z?: number; color: string; rough?: number; metal?: number; windows?: WinSpec; detail?: boolean; emissive?: boolean }
  | { k: 'cyl'; rt: number; rb: number; h: number; y?: number; color: string; seg?: number; detail?: boolean }
  | { k: 'roof'; type: 'pyramid' | 'cone' | 'dome' | 'round'; w: number; d?: number; y: number; height?: number; color: string }
  | { k: 'parapet'; w: number; d?: number; y: number; color: string }
  | { k: 'panel'; w: number; h: number; pos: Vec3; rotY?: number; color: string; glow?: number }
  | { k: 'rooftopUnits'; w: number; y: number }
  | { k: 'cross'; y: number; z?: number; color: string; s?: number }
  | { k: 'antenna'; y: number; h?: number }
  | { k: 'storefront'; w: number; d?: number; faceH: number; awning: string; sign: string }
  | { k: 'columns'; w: number; d?: number; y: number; h: number; count?: number; color: string }
  | { k: 'balconies'; w: number; d?: number; y0: number; y1: number; floors: number; color: string }
  | { k: 'parasol'; pos: Vec3; color: string }
  | { k: 'blades'; y: number }
  | { k: 'clock'; w: number; y: number; color: string }
  | { k: 'tree' }

export type PartKind = Part['k']

/** 2단계(형태)에서 생략하는 디테일 부품 종류. */
export const DETAIL_KINDS: ReadonlySet<PartKind> = new Set<PartKind>([
  'panel', 'rooftopUnits', 'cross', 'antenna', 'storefront', 'columns', 'balconies', 'parasol', 'blades', 'clock',
])

export interface BuildingConfig {
  label: string
  group: 'village' | 'city'
  parts: Part[]
}

/** 표시 단계. 1=일관화 shell, 2=형태, 3=완성. */
export type Stage = 1 | 2 | 3

/** 1단계 shell 의 일관화 색 테마. */
export type ThemeKey = 'warm' | 'terracotta' | 'cool' | 'stone' | 'forest'

export const THEMES: Record<ThemeKey, { label: string; color: string }> = {
  warm: { label: '웜 크림', color: 'wallCream' },
  terracotta: { label: '테라코타', color: 'wallTerracotta' },
  cool: { label: '쿨 블루', color: 'wallBlue' },
  stone: { label: '스톤', color: 'concrete' },
  forest: { label: '포레스트', color: 'bush' },
}
