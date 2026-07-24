/**
 * 데이터 드리븐 건물 카탈로그.
 * 건물 = 부품(Part) 배열. 새 건물 추가 = 여기 config 하나 추가(코드 X).
 * 색은 팔레트 key 문자열('wallCream') 또는 '#hex' → 순수 데이터라 직렬화 가능,
 * 백엔드 카탈로그(가격·해금조건)와 같은 key로 매칭.
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

function cottage(label: string, wall: string): BuildingConfig {
  const w = 0.4, d = 0.34, h = 0.72
  return {
    label,
    group: 'village',
    parts: [
      { k: 'plinth', w, d, color: 'path' },
      { k: 'box', w, h, d, y: PL, color: wall, rough: 0.85, windows: { from: 0.12, to: 0.9, color: 'glassWarm', glow: 0.28 } },
      { k: 'panel', w: 0.064, h: 0.23, pos: [-0.072, PL + h * 0.16, d / 2 + 0.006], color: 'wood' },
      { k: 'roof', type: 'pyramid', w, d, y: PL + h, height: 0.26, color: 'roof' },
      { k: 'box', w: 0.07, h: 0.22, d: 0.07, x: 0.112, z: -0.068, y: PL + h + 0.1, color: 'wallTerracotta', detail: true },
    ],
  }
}

export const BUILDING_CONFIGS = {
  // ── 마을풍 ──
  cottage_cream: cottage('타운하우스 (크림)', 'wallCream'),
  cottage_terracotta: cottage('타운하우스 (테라코타)', 'wallTerracotta'),
  cottage_blue: cottage('타운하우스 (블루)', 'wallBlue'),
  clocktower: {
    label: '시계탑', group: 'village',
    parts: [
      { k: 'plinth', w: 0.26, color: 'concrete' },
      { k: 'box', w: 0.26, h: 1.15, y: PL, color: 'wallBlue', rough: 0.8, windows: { from: 0.15, to: 0.6, color: 'glassWarm', glow: 0.3 } },
      { k: 'clock', w: 0.26, y: PL + 1.15 * 0.82, color: 'wallCream' },
      { k: 'roof', type: 'pyramid', w: 0.26, y: PL + 1.15, height: 0.3, color: 'roofDark' },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 1.15 + 0.3, color: 'accent', detail: true, emissive: true },
    ],
  },
  windmill: {
    label: '풍차', group: 'village',
    parts: [
      { k: 'plinth', w: 0.3, color: 'path' },
      { k: 'cyl', rt: 0.165, rb: 0.216, h: 0.95, y: PL, color: 'wallCream' },
      { k: 'cyl', rt: 0.198, rb: 0.198, h: 0.03, y: PL + 0.95 * 0.62, color: 'wood', detail: true },
      { k: 'panel', w: 0.06, h: 0.08, pos: [0, PL + 0.95 * 0.55, 0.168], color: 'glassWarm', glow: 0.3 },
      { k: 'roof', type: 'cone', w: 0.3, y: PL + 0.95, height: 0.2, color: 'roofDark' },
      { k: 'blades', y: PL + 0.95 * 0.92 },
    ],
  },
  tree: {
    label: '나무', group: 'village',
    parts: [{ k: 'tree' }],
  },

  // ── 도시풍 ──
  hospital: {
    label: '병원', group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.34, color: 'concrete' },
      { k: 'box', w: 0.4, h: 1.35, d: 0.34, y: PL, color: 'hospitalWhite', rough: 0.5, metal: 0.1, windows: { from: 0.12, to: 0.9, color: 'glass', glow: 0.22 } },
      { k: 'box', w: 0.2, h: 0.44, d: 0.306, x: 0.248, y: PL, color: 'hospitalWhite', rough: 0.5 },
      { k: 'box', w: 0.2, h: 0.03, d: 0.16, y: PL + 0.16, z: 0.25, color: 'beaconRed', detail: true },
      { k: 'cross', y: PL + 1.35 * 0.7, z: 0.176, color: 'beaconRed', s: 0.6 },
      { k: 'parapet', w: 0.4, d: 0.34, y: PL + 1.35, color: 'hospitalWhite' },
      { k: 'rooftopUnits', w: 0.4, y: PL + 1.35 },
      { k: 'cross', y: PL + 1.35 + 0.14, color: 'beaconRed' },
    ],
  },
  office: {
    label: '오피스 타워', group: 'city',
    parts: [
      { k: 'plinth', w: 0.34, color: 'roofDark' },
      { k: 'box', w: 0.34, h: 1.558, y: PL, color: 'officeBody', rough: 0.25, metal: 0.55, windows: { from: 0.12, to: 0.9, color: 'glass', glow: 0.4 } },
      { k: 'box', w: 0.2448, h: 0.342, y: PL + 1.558, color: 'concrete', rough: 0.25, metal: 0.55, windows: { from: 0.12, to: 0.9, color: 'glass', glow: 0.4 } },
      { k: 'parapet', w: 0.2448, y: PL + 1.9, color: 'roofDark' },
      { k: 'rooftopUnits', w: 0.2448, y: PL + 1.9 },
      { k: 'antenna', y: PL + 1.9, h: 0.4 },
    ],
  },
  apartment: {
    label: '아파트', group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.32, color: 'concrete' },
      { k: 'box', w: 0.4, h: 1.55, d: 0.32, y: PL, color: 'wallCream', rough: 0.7, metal: 0.05, windows: { from: 0.12, to: 0.9, color: 'glassWarm', glow: 0.26 } },
      { k: 'balconies', w: 0.4, d: 0.32, y0: PL + 1.55 * 0.16, y1: PL + 1.55 * 0.88, floors: 7, color: 'concrete' },
      { k: 'parapet', w: 0.4, d: 0.32, y: PL + 1.55, color: 'wallCream' },
      { k: 'rooftopUnits', w: 0.4, y: PL + 1.55 },
    ],
  },
  cornerstore: {
    label: '편의점', group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, color: 'concrete' },
      { k: 'box', w: 0.4, h: 0.78, y: PL, color: 'wallCream', rough: 0.6, windows: { from: 0.55, to: 0.9, color: 'glassWarm', glow: 0.28 } },
      { k: 'storefront', w: 0.4, faceH: 0.39, awning: 'accent', sign: 'wallBlue' },
      { k: 'parapet', w: 0.4, y: PL + 0.78, color: 'wallCream' },
    ],
  },
  cafe: {
    label: '카페', group: 'city',
    parts: [
      { k: 'plinth', w: 0.34, color: 'path' },
      { k: 'box', w: 0.34, h: 0.62, y: PL, color: 'wallTerracotta', rough: 0.75, windows: { from: 0.58, to: 0.9, color: 'glassWarm', glow: 0.28 } },
      { k: 'storefront', w: 0.34, faceH: 0.322, awning: 'bush', sign: 'wallCream' },
      { k: 'parapet', w: 0.34, y: PL + 0.62, color: 'wallTerracotta' },
      { k: 'parasol', pos: [0.095, PL + 0.62, 0.095], color: 'accent' },
    ],
  },
  mart: {
    label: '마트', group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.4, color: 'concrete' },
      { k: 'box', w: 0.46, h: 0.82, d: 0.4, y: PL, color: 'concrete', rough: 0.6, windows: { from: 0.6, to: 0.9, color: 'glass', glow: 0.3 } },
      { k: 'storefront', w: 0.46, d: 0.4, faceH: 0.426, awning: 'accent', sign: 'accent' },
      { k: 'parapet', w: 0.46, d: 0.4, y: PL + 0.82, color: 'concrete' },
      { k: 'rooftopUnits', w: 0.46, y: PL + 0.82 },
    ],
  },
  pharmacy: {
    label: '약국', group: 'city',
    parts: [
      { k: 'plinth', w: 0.32, color: 'concrete' },
      { k: 'box', w: 0.32, h: 1.0, y: PL, color: 'wallCream', rough: 0.7, windows: { from: 0.12, to: 0.9, color: 'glassWarm', glow: 0.26 } },
      { k: 'panel', w: 0.256, h: 0.28, pos: [0, PL + 0.18, 0.166], color: 'glass', glow: 0.28 },
      { k: 'parapet', w: 0.32, y: PL + 1.0, color: 'wallCream' },
      { k: 'cross', y: PL + 0.82, z: 0.166, color: 'bush', s: 0.6 },
    ],
  },
  civic: {
    label: '관공서 (돔)', group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.34, color: 'concrete' },
      { k: 'box', w: 0.4, h: 1.05, d: 0.34, y: PL, color: 'wallCream', rough: 0.7, windows: { from: 0.12, to: 0.9, color: 'glassWarm', glow: 0.24 } },
      { k: 'columns', w: 0.4, d: 0.34, y: PL, h: 1.05 * 0.44, count: 4, color: 'stoneLight' },
      { k: 'cyl', rt: 0.136, rb: 0.136, h: 0.12, y: PL + 1.05, color: 'wallCream' },
      { k: 'roof', type: 'dome', w: 0.4, y: PL + 1.05 + 0.12, color: 'glassWarm' },
    ],
  },
  skyscraper: {
    label: '마천루', group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, color: 'roofDark' },
      { k: 'box', w: 0.66, h: 0.95, y: PL, color: 'skyBody', rough: 0.2, metal: 0.6, windows: { from: 0.1, to: 0.95, color: 'glass', glow: 0.42 } },
      { k: 'box', w: 0.693, h: 0.04, y: PL + 0.95, color: 'wallCream' },
      { k: 'box', w: 0.52, h: 0.85, y: PL + 0.95, color: 'skyBody', rough: 0.2, metal: 0.6, windows: { from: 0.1, to: 0.95, color: 'glass', glow: 0.42 } },
      { k: 'box', w: 0.546, h: 0.04, y: PL + 1.8, color: 'wallCream' },
      { k: 'box', w: 0.4, h: 0.7, y: PL + 1.8, color: 'skyBody', rough: 0.2, metal: 0.6, windows: { from: 0.1, to: 0.95, color: 'glass', glow: 0.42 } },
      { k: 'box', w: 0.42, h: 0.04, y: PL + 2.5, color: 'wallCream' },
      { k: 'box', w: 0.28, h: 0.42, y: PL + 2.5, color: 'roofDark', rough: 0.4, metal: 0.5 },
      { k: 'antenna', y: PL + 2.5 + 0.42, h: 0.5 },
    ],
  },
} satisfies Record<string, BuildingConfig>

export type BuildingKey = keyof typeof BUILDING_CONFIGS

export const CITY_SLOT_KEYS: BuildingKey[] = [
  'hospital', 'office', 'apartment', 'cornerstore', 'cafe', 'mart', 'pharmacy', 'civic',
]
export const VILLAGE_SLOT_KEYS: BuildingKey[] = [
  'cottage_cream', 'clocktower', 'windmill', 'cottage_terracotta', 'cottage_blue', 'cottage_cream', 'clocktower', 'windmill',
]

// ── 3단계 + 테마 ──

export type Stage = 1 | 2 | 3

export type ThemeKey = 'warm' | 'terracotta' | 'cool' | 'stone' | 'forest'
export const THEMES: Record<ThemeKey, { label: string; color: string }> = {
  warm: { label: '웜 크림', color: 'wallCream' },
  terracotta: { label: '테라코타', color: 'wallTerracotta' },
  cool: { label: '쿨 블루', color: 'wallBlue' },
  stone: { label: '스톤', color: 'concrete' },
  forest: { label: '포레스트', color: 'bush' },
}

/** UI 드롭다운용: [key, label, group] 목록. */
export const BUILDING_LIST: { key: BuildingKey; label: string; group: 'village' | 'city' }[] = (
  Object.keys(BUILDING_CONFIGS) as BuildingKey[]
).map((key) => ({ key, label: BUILDING_CONFIGS[key].label, group: BUILDING_CONFIGS[key].group }))
