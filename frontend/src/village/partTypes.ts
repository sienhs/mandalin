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

/**
 * 부품 모양 정의. 실제 사용 타입은 아래 `Part`(= 단계 태그가 붙은 형태)다.
 * 여기 직접 쓰지 말고 항상 `Part` 를 쓴다.
 */
type PartShape =
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
  // ── 랜드마크(3×3) 전용 부품 ──
  // 일반 건물도 쓸 수 있지만, 거대 매스의 실루엣(타원 경기장·오각 청사·아치·철탑)을
  // box 적층으로 흉내내면 덩어리로 뭉쳐서 안 읽힌다.
  /** 정n각 기둥. hollow(0~1)를 주면 가운데가 뚫린 n각 링(펜타곤·중정형 청사). */
  | { k: 'polyPrism'; sides: number; r: number; h: number; y?: number; x?: number; z?: number; rot?: number; hollow?: number; color: string; rough?: number; metal?: number }
  /** 가운데가 뚫린 원/타원 링. sx·sz 로 타원(경기장 외벽·콜로세움 아케이드 벽). */
  | { k: 'ring'; ro: number; ri: number; h: number; y?: number; sx?: number; sz?: number; seg?: number; color: string }
  /** 안쪽으로 기울어진 관중석 경사면(경기장 보울). */
  | { k: 'bowl'; ro: number; ri: number; h: number; y?: number; sx?: number; sz?: number; seg?: number; color: string }
  /** 아치 개구부(기둥 2개 + 반원 상부). 개선문·아케이드·철탑 기단. */
  | { k: 'arch'; w: number; h: number; d: number; thick: number; x?: number; z?: number; y?: number; rotY?: number; seg?: number; color: string }
  /** 격자 철탑. 네 모서리 기둥이 taper 비율로 좁아지며 층마다 수평재가 들어간다. */
  | { k: 'lattice'; w: number; h: number; y?: number; taper?: number; rungs?: number; color: string }
  /** 조가비 지붕(구면 sector). 오페라하우스 쉘. */
  | { k: 'shell'; w: number; h: number; d: number; pos: Vec3; rotY?: number; color: string }
  /** 경기장 조명탑. */
  | { k: 'floodlight'; pos: Vec3; h: number; color?: string }
  /** 수반·반사 못·광장 물바닥. */
  | { k: 'pool'; w: number; d?: number; x?: number; z?: number; y?: number; color?: string }

/**
 * 부품에 `st`(등장 단계)를 붙인 실제 타입.
 *
 * 일반 건물(3단계)은 `st` 를 쓰지 않는다 — 단계별 표현이 stage 규칙(shell/형태/완성)으로
 * 이미 정해져 있다. **랜드마크(8단계)만** 부품마다 `st: 1~8` 을 달아 공사가 진행되듯 쌓인다.
 * 분배 조건부로 감싸야 `p.k` 판별(discriminated union narrowing)이 유지된다.
 *
 * 이름이 `s` 가 아닌 이유: `cross` 부품이 이미 `s`(십자 크기)를 쓰고 있어서 뜻이 겹친다.
 */
type WithStage<T> = T extends unknown ? T & { st?: number } : never

export type Part = WithStage<PartShape>

export type PartKind = PartShape['k']

/** 2단계(형태)에서 생략하는 디테일 부품 종류. */
export const DETAIL_KINDS: ReadonlySet<PartKind> = new Set<PartKind>([
  'panel', 'rooftopUnits', 'cross', 'antenna', 'storefront', 'columns', 'balconies', 'parasol', 'blades', 'clock',
  'floodlight', 'pool',
])

export interface BuildingConfig {
  label: string
  group: 'village' | 'city' | 'landmark'
  parts: Part[]
}

/** 표시 단계. 1=일관화 shell, 2=형태, 3=완성. */
export type Stage = 1 | 2 | 3

/**
 * 랜드마크 표시 단계. 0=공사 부지, 1~8=성장.
 *
 * 일반 건물의 `Stage`(1~3)와 섞지 않는다 — 갤러리·썸네일·칸 단계 선택 UI 가 전부 1~3 을
 * 전제로 쓰여 있어서, 그 타입을 넓히면 관계없는 화면이 8단계를 표시하려 든다.
 */
export type LandmarkStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** 랜드마크 단계 라벨. 12.5% 구간마다 한 단계씩 오른다. */
export const LANDMARK_STAGE_LABELS: Record<LandmarkStage, string> = {
  0: '공사 부지',
  1: '기단·터파기',
  2: '하부 매스',
  3: '골조·기둥',
  4: '주요 매스',
  5: '상부 매스',
  6: '외장·지붕',
  7: '디테일·광장',
  8: '완성',
}

/**
 * 랜드마크 ref 기준 한 변. 3×3 칸(월드 7.8)에 꽉 차되 블록 경계(8.6)를 넘지 않는
 * 월드 7.2 를 목표로 한다 → 7.2 / BUILD_SCALE(2.4) = 3.0.
 * 랜드마크 config 는 이 값을 넘지 않게 작성한다(넘으면 옆 블록 길 위로 삐져나온다).
 */
export const LANDMARK_REF = 3.0

/** 1단계 shell 의 일관화 색 테마. */
export type ThemeKey = 'warm' | 'terracotta' | 'cool' | 'stone' | 'forest'

export const THEMES: Record<ThemeKey, { label: string; color: string }> = {
  warm: { label: '웜 크림', color: 'wallCream' },
  terracotta: { label: '테라코타', color: 'wallTerracotta' },
  cool: { label: '쿨 블루', color: 'wallBlue' },
  stone: { label: '스톤', color: 'concrete' },
  forest: { label: '포레스트', color: 'bush' },
}
