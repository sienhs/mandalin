import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { pilasters, ribs, cornice } from './_detail'

/**
 * T2 사이버펑크 (cyber) — 극단적 유니크 매스 · 고밀도 네온 디테일 · min height ~1.2
 * 팔레트: 베이스 #0E0B1A·#141026, 콘크리트 #2A2A33, 네온핑크 #FF2E88, 시안 #22E0FF, 그린 #39FF8B, 유리 #1B2A4A.
 *
 * 매스 아키타입 배정(겹침 방지):
 *  megacorp=3세트백 메가타워 / skybridge=트윈+2브리지 / antenna_spire=니들 /
 *  reactor=드럼+돔 / holo=풀파사드 빌보드 슬랩 / media=4스크린 큐브타워 /
 *  hive=발코니 슬랩 / penthouse=캔틸레버(역삼각) / surveillance=폴+스캐너헤드 /
 *  slum=카오틱 적층 / arena=와이드 돔드럼 / datacenter=무창 큐브블록 /
 *  capsule=돌출 포드그리드 / arcade=와이드 2단 아케이드 / nightclub=저층+옥상 사인파일런 /
 *  pawn=L매스 코너 / clinic=포디움+십자타워 / noodle=슬렌더 포드스택 /
 *  vending=갠트리 프레임 / shrine=네온 토리이 게이트
 */

const BASE1 = '#141026'
const BASE2 = '#0E0B1A'
const CONC = '#2A2A33'
const STEEL = '#3A3A46'
const PINK = '#FF2E88'
const CYAN = '#22E0FF'
const GREEN = '#39FF8B'
const GLASS = '#1B2A4A'
const PURP = '#2A1B4A'
const AMBER = '#FFB020'

// 네온 스트립(발광 얇은 box) 헬퍼
const neon = (w: number, d: number, y: number, color: string, x = 0, z = 0) =>
  ({ k: 'box', w, h: 0.02, d, x, z, y, color, emissive: true } as const)

export const CYBER = {
  // 1. 3세트백 메가타워
  cyber_megacorp: {
    label: '메가코프 본사',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.62, color: BASE2 },
      { k: 'box', w: 0.68, h: 0.12, d: 0.62, y: PL, color: STEEL },
      { k: 'box', w: 0.66, h: 1.0, d: 0.6, y: PL + 0.12, color: BASE1, rough: 0.4, metal: 0.6, windows: { from: 0.1, to: 0.95, color: CYAN, glow: 0.6 } },
      ...ribs(0.66, 0.6, 1.0, PL + 0.12, 7, GLASS, 0.02),
      neon(0.7, 0.64, PL + 0.62, CYAN),
      { k: 'box', w: 0.68, h: 0.05, d: 0.62, y: PL + 1.12, color: STEEL },
      { k: 'box', w: 0.5, h: 0.9, d: 0.46, y: PL + 1.17, color: BASE1, rough: 0.4, metal: 0.6, windows: { from: 0.1, to: 0.95, color: CYAN, glow: 0.6 } },
      neon(0.52, 0.48, PL + 1.6, PINK),
      { k: 'box', w: 0.52, h: 0.05, d: 0.48, y: PL + 2.07, color: STEEL },
      { k: 'box', w: 0.34, h: 0.85, d: 0.32, y: PL + 2.12, color: BASE1, rough: 0.4, metal: 0.6, windows: { from: 0.1, to: 0.95, color: PINK, glow: 0.6 } },
      { k: 'parapet', w: 0.34, d: 0.32, y: PL + 2.97, color: BASE2 },
      { k: 'antenna', y: PL + 2.97, h: 0.5 },
      { k: 'panel', w: 0.28, h: 0.28, pos: [0, PL + 2.6, 0.16 + 0.008], color: PINK, glow: 0.85 },
      { k: 'panel', w: 0.03, h: 0.95, pos: [-0.33, PL + 0.6, 0.3 + 0.006], color: CYAN, glow: 0.8 },
      { k: 'panel', w: 0.03, h: 0.95, pos: [0.33, PL + 0.6, 0.3 + 0.006], color: PINK, glow: 0.8 },
      { k: 'storefront', w: 0.66, d: 0.6, faceH: 0.32, awning: PURP, sign: CYAN },
    ],
  },

  // 2. 트윈 + 2 스카이브리지
  cyber_skybridge_towers: {
    label: '스카이브리지 트윈타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.7, d: 0.42, color: BASE2 },
      { k: 'box', w: 0.28, h: 2.1, d: 0.36, x: -0.2, y: PL, color: BASE1, rough: 0.4, metal: 0.6, windows: { from: 0.06, to: 0.96, color: CYAN, glow: 0.55 } },
      { k: 'box', w: 0.28, h: 2.5, d: 0.36, x: 0.2, y: PL, color: BASE1, rough: 0.4, metal: 0.6, windows: { from: 0.06, to: 0.96, color: PINK, glow: 0.55 } },
      // 타워 코너 리브
      { k: 'box', w: 0.02, h: 2.1, d: 0.02, x: -0.33, z: 0.18, y: PL, color: GLASS },
      { k: 'box', w: 0.02, h: 2.5, d: 0.02, x: 0.33, z: 0.18, y: PL, color: GLASS },
      // 스카이브리지 2개
      { k: 'box', w: 0.16, h: 0.14, d: 0.24, y: PL + 1.6, color: STEEL, rough: 0.5, metal: 0.5 },
      neon(0.16, 0.26, PL + 1.6, CYAN),
      { k: 'box', w: 0.16, h: 0.12, d: 0.2, y: PL + 0.95, color: STEEL, rough: 0.5, metal: 0.5 },
      neon(0.16, 0.22, PL + 0.95, PINK),
      { k: 'box', w: 0.3, h: 0.12, d: 0.36, x: -0.2, y: PL + 2.1, color: STEEL },
      { k: 'box', w: 0.3, h: 0.12, d: 0.36, x: 0.2, y: PL + 2.5, color: STEEL },
      { k: 'antenna', y: PL + 2.62, h: 0.4 },
      { k: 'panel', w: 0.16, h: 0.6, pos: [-0.2, PL + 1.9, 0.18 + 0.006], color: GREEN, glow: 0.7 },
      { k: 'panel', w: 0.16, h: 0.6, pos: [0.2, PL + 2.1, 0.18 + 0.006], color: CYAN, glow: 0.7 },
      { k: 'storefront', w: 0.68, d: 0.4, faceH: 0.28, awning: PURP, sign: PINK },
    ],
  },

  // 3. 니들 스파이어
  cyber_antenna_spire: {
    label: '통신 스파이어',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: BASE2 },
      { k: 'box', w: 0.4, h: 0.5, d: 0.4, y: PL, color: BASE1, rough: 0.5, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.55 } },
      ...pilasters(0.4, 0.4, 0.5, PL, CYAN, 0.02),
      { k: 'cyl', rt: 0.07, rb: 0.18, h: 2.2, y: PL + 0.5, color: STEEL, seg: 10 },
      { k: 'box', w: 0.3, h: 0.22, d: 0.3, y: PL + 0.9, color: BASE1, rough: 0.5, windows: { from: 0.2, to: 0.8, color: PINK, glow: 0.6 } },
      { k: 'box', w: 0.24, h: 0.2, d: 0.24, y: PL + 1.6, color: BASE1, rough: 0.5, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.6 } },
      { k: 'cyl', rt: 0.14, rb: 0.14, h: 0.03, y: PL + 1.14, color: CYAN, seg: 14, detail: true },
      { k: 'cyl', rt: 0.11, rb: 0.11, h: 0.03, y: PL + 1.84, color: PINK, seg: 14, detail: true },
      { k: 'cyl', rt: 0.02, rb: 0.05, h: 0.7, y: PL + 2.7, color: STEEL, seg: 8, detail: true },
      { k: 'antenna', y: PL + 3.4, h: 0.35 },
      { k: 'panel', w: 0.3, h: 0.06, pos: [0, PL + 1.0, 0.16 + 0.008], color: GREEN, glow: 0.7 },
    ],
  },

  // 4. 드럼 + 돔 리액터
  cyber_reactor_tower: {
    label: '리액터 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.66, color: BASE2 },
      { k: 'box', w: 0.62, h: 0.16, d: 0.62, y: PL, color: STEEL },
      { k: 'cyl', rt: 0.26, rb: 0.32, h: 1.3, y: PL + 0.16, color: CONC, seg: 14 },
      { k: 'cyl', rt: 0.34, rb: 0.34, h: 0.04, y: PL + 0.5, color: CYAN, seg: 16, detail: true },
      { k: 'cyl', rt: 0.32, rb: 0.32, h: 0.04, y: PL + 1.0, color: CYAN, seg: 16, detail: true },
      { k: 'cyl', rt: 0.2, rb: 0.26, h: 0.5, y: PL + 1.46, color: STEEL, seg: 14 },
      { k: 'cyl', rt: 0.15, rb: 0.15, h: 0.34, y: PL + 1.96, color: CYAN, seg: 14, detail: true },
      { k: 'roof', type: 'dome', w: 0.5, y: PL + 2.3, color: GLASS },
      { k: 'antenna', y: PL + 2.3, h: 0.4 },
      // 냉각 파이프 4
      { k: 'box', w: 0.07, h: 1.1, d: 0.07, x: 0.28, z: 0.14, y: PL + 0.16, color: STEEL, detail: true },
      { k: 'box', w: 0.07, h: 1.1, d: 0.07, x: -0.28, z: 0.14, y: PL + 0.16, color: STEEL, detail: true },
      { k: 'box', w: 0.07, h: 1.0, d: 0.07, x: 0.28, z: -0.16, y: PL + 0.16, color: STEEL, detail: true },
      { k: 'panel', w: 0.34, h: 0.12, pos: [0, PL + 0.7, 0.31 + 0.008], color: AMBER, glow: 0.7 },
    ],
  },

  // 5. 풀 파사드 홀로 빌보드 슬랩
  cyber_holo_tower: {
    label: '홀로 광고 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.48, d: 0.34, color: BASE2 },
      { k: 'box', w: 0.48, h: 2.0, d: 0.34, y: PL, color: BASE1, rough: 0.4, metal: 0.5, windows: { from: 0.1, to: 0.95, color: GLASS, glow: 0.3 } },
      { k: 'parapet', w: 0.48, d: 0.34, y: PL + 2.0, color: BASE2 },
      { k: 'antenna', y: PL + 2.0, h: 0.5 },
      // 정면 대형 홀로 광고 (겹층)
      { k: 'panel', w: 0.44, h: 1.7, pos: [0, PL + 1.05, 0.17 + 0.008], color: PINK, glow: 0.8 },
      { k: 'panel', w: 0.36, h: 0.7, pos: [0, PL + 1.4, 0.17 + 0.02], color: CYAN, glow: 0.85 },
      { k: 'panel', w: 0.3, h: 0.4, pos: [0, PL + 0.7, 0.17 + 0.02], color: GREEN, glow: 0.8 },
      // 측면 세로 스크린
      { k: 'panel', w: 0.3, h: 1.6, pos: [0.24 + 0.008, PL + 1.05, 0], rotY: 1.5708, color: '#4FA0FF', glow: 0.75 },
      { k: 'panel', w: 0.06, h: 2.0, pos: [-0.24 - 0.008, PL + 1.0, 0], rotY: 1.5708, color: PINK, glow: 0.7 },
      { k: 'storefront', w: 0.48, d: 0.34, faceH: 0.3, awning: PURP, sign: CYAN },
    ],
  },

  // 6. 4스크린 미디어 큐브타워
  cyber_media_tower: {
    label: '미디어 스크린 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: BASE2 },
      { k: 'box', w: 0.44, h: 1.5, d: 0.44, y: PL, color: BASE1, rough: 0.4, metal: 0.5 },
      { k: 'box', w: 0.32, h: 0.5, d: 0.32, y: PL + 1.5, color: CONC, rough: 0.4 },
      { k: 'roof', type: 'pyramid', w: 0.36, y: PL + 2.0, height: 0.14, color: STEEL },
      { k: 'antenna', y: PL + 2.14, h: 0.3 },
      // 4면 스크린
      { k: 'panel', w: 0.38, h: 1.3, pos: [0, PL + 0.8, 0.22 + 0.008], color: CYAN, glow: 0.75 },
      { k: 'panel', w: 0.38, h: 1.3, pos: [0, PL + 0.8, -0.22 - 0.008], rotY: 3.1416, color: PINK, glow: 0.75 },
      { k: 'panel', w: 0.38, h: 1.3, pos: [0.22 + 0.008, PL + 0.8, 0], rotY: 1.5708, color: GREEN, glow: 0.75 },
      { k: 'panel', w: 0.38, h: 1.3, pos: [-0.22 - 0.008, PL + 0.8, 0], rotY: 1.5708, color: AMBER, glow: 0.7 },
      { k: 'panel', w: 0.28, h: 0.3, pos: [0, PL + 1.7, 0.16 + 0.008], color: PINK, glow: 0.8 },
    ],
  },

  // 7. 발코니 슬랩 (hive)
  cyber_hive_apartment: {
    label: '하이브 아파트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.54, d: 0.4, color: BASE2 },
      { k: 'box', w: 0.54, h: 1.9, d: 0.4, y: PL, color: BASE1, rough: 0.6, windows: { from: 0.06, to: 0.96, color: AMBER, glow: 0.45 } },
      { k: 'balconies', w: 0.54, d: 0.4, y0: PL + 0.18, y1: PL + 1.75, floors: 10, color: STEEL },
      ...pilasters(0.54, 0.4, 1.9, PL, GLASS, 0.025),
      neon(0.56, 0.42, PL + 0.6, CYAN),
      neon(0.56, 0.42, PL + 1.2, PINK),
      { k: 'parapet', w: 0.54, d: 0.4, y: PL + 1.9, color: BASE2 },
      { k: 'rooftopUnits', w: 0.54, y: PL + 1.9 },
      { k: 'antenna', y: PL + 1.9, h: 0.35 },
      { k: 'panel', w: 0.1, h: 1.4, pos: [0.27 + 0.006, PL + 0.9, 0], rotY: 1.5708, color: PINK, glow: 0.7 },
      { k: 'storefront', w: 0.54, d: 0.4, faceH: 0.26, awning: PURP, sign: AMBER },
    ],
  },

  // 8. 캔틸레버(역삼각) 펜트하우스
  cyber_penthouse_tower: {
    label: '캔틸레버 펜트하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.36, d: 0.36, color: BASE2 },
      { k: 'box', w: 0.28, h: 1.5, d: 0.28, y: PL, color: BASE1, rough: 0.35, metal: 0.5, windows: { from: 0.1, to: 0.92, color: CYAN, glow: 0.45 } },
      ...pilasters(0.28, 0.28, 1.5, PL, GLASS, 0.02),
      // 상부로 갈수록 넓어지는 캔틸레버 3단
      { k: 'box', w: 0.44, h: 0.24, d: 0.44, y: PL + 1.5, color: GLASS, rough: 0.2, metal: 0.6, windows: { from: 0.15, to: 0.85, color: CYAN, glow: 0.6 } },
      { k: 'box', w: 0.56, h: 0.24, d: 0.56, y: PL + 1.74, color: GLASS, rough: 0.2, metal: 0.6, windows: { from: 0.15, to: 0.85, color: PINK, glow: 0.6 } },
      neon(0.58, 0.58, PL + 1.98, CYAN),
      { k: 'parapet', w: 0.56, d: 0.56, y: PL + 1.98, color: BASE2 },
      { k: 'rooftopUnits', w: 0.5, y: PL + 1.98 },
      { k: 'antenna', y: PL + 1.98, h: 0.3 },
      { k: 'panel', w: 0.5, h: 0.06, pos: [0, PL + 1.54, 0.28 + 0.008], color: PINK, glow: 0.8 },
    ],
  },

  // 9. 폴 + 스캐너 헤드 감시탑
  cyber_surveillance_tower: {
    label: '감시탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.36, d: 0.36, color: BASE2 },
      { k: 'box', w: 0.3, h: 0.3, d: 0.3, y: PL, color: CONC, rough: 0.5 },
      { k: 'cyl', rt: 0.09, rb: 0.12, h: 1.5, y: PL + 0.3, color: STEEL, seg: 8 },
      { k: 'cyl', rt: 0.13, rb: 0.13, h: 0.04, y: PL + 0.9, color: PINK, seg: 12, detail: true },
      // 구형 스캐너 헤드 (드럼 + 헤드박스 + 돔)
      { k: 'cyl', rt: 0.24, rb: 0.2, h: 0.12, y: PL + 1.7, color: STEEL, seg: 14 },
      { k: 'box', w: 0.44, h: 0.26, d: 0.44, y: PL + 1.82, color: BASE1, rough: 0.4, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.6 } },
      { k: 'roof', type: 'dome', w: 0.44, y: PL + 2.08, color: GLASS },
      { k: 'antenna', y: PL + 2.22, h: 0.3 },
      { k: 'panel', w: 0.34, h: 0.06, pos: [0, PL + 1.9, 0.22 + 0.008], color: PINK, glow: 0.9 },
      { k: 'panel', w: 0.06, h: 0.4, pos: [0, PL + 0.9, 0.12 + 0.006], color: AMBER, glow: 0.6 },
    ],
  },

  // 10. 카오틱 적층 슬럼
  cyber_slum_stack: {
    label: '슬럼 스택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.54, d: 0.46, color: BASE2 },
      { k: 'box', w: 0.54, h: 0.5, d: 0.46, y: PL, color: CONC, rough: 0.7, windows: { from: 0.2, to: 0.85, color: AMBER, glow: 0.45 } },
      { k: 'box', w: 0.44, h: 0.44, d: 0.52, x: 0.08, y: PL + 0.5, color: BASE1, rough: 0.7, windows: { from: 0.2, to: 0.85, color: PINK, glow: 0.45 } },
      { k: 'box', w: 0.5, h: 0.42, d: 0.36, x: -0.06, z: 0.05, y: PL + 0.94, color: STEEL, rough: 0.7, windows: { from: 0.2, to: 0.85, color: CYAN, glow: 0.45 } },
      { k: 'box', w: 0.36, h: 0.4, d: 0.42, x: 0.1, z: -0.04, y: PL + 1.36, color: CONC, rough: 0.7, windows: { from: 0.2, to: 0.85, color: GREEN, glow: 0.45 } },
      { k: 'box', w: 0.3, h: 0.36, d: 0.3, x: -0.08, y: PL + 1.76, color: BASE1, rough: 0.7 },
      { k: 'rooftopUnits', w: 0.4, y: PL + 2.12 },
      { k: 'antenna', y: PL + 1.76, h: 0.5 },
      // 빨래줄/간판 난잡
      { k: 'panel', w: 0.36, h: 0.12, pos: [0.08, PL + 0.9, 0.28 + 0.008], color: GREEN, glow: 0.7 },
      { k: 'panel', w: 0.08, h: 0.34, pos: [-0.24, PL + 0.4, 0.24 + 0.006], color: PINK, glow: 0.7 },
      { k: 'panel', w: 0.08, h: 0.28, pos: [0.26, PL + 1.3, 0.2 + 0.006], color: CYAN, glow: 0.7 },
      { k: 'box', w: 0.5, h: 0.015, d: 0.015, z: 0.24, y: PL + 1.0, color: PINK, emissive: true },
    ],
  },

  // 11. 와이드 돔드럼 아레나
  cyber_arena: {
    label: '홀로 아레나',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.72, d: 0.68, color: BASE2 },
      { k: 'cyl', rt: 0.36, rb: 0.38, h: 0.7, y: PL, color: CONC, seg: 16 },
      { k: 'cyl', rt: 0.39, rb: 0.39, h: 0.05, y: PL + 0.24, color: CYAN, seg: 16, detail: true },
      { k: 'cyl', rt: 0.39, rb: 0.39, h: 0.05, y: PL + 0.5, color: PINK, seg: 16, detail: true },
      { k: 'cyl', rt: 0.32, rb: 0.36, h: 0.16, y: PL + 0.7, color: BASE1, seg: 16 },
      { k: 'roof', type: 'dome', w: 0.76, y: PL + 0.86, color: GLASS },
      { k: 'panel', w: 0.34, h: 0.34, pos: [0, PL + 1.2, 0], color: PINK, glow: 0.7 },
      { k: 'antenna', y: PL + 1.28, h: 0.35 },
      { k: 'storefront', w: 0.6, d: 0.5, faceH: 0.36, awning: PURP, sign: CYAN },
      { k: 'panel', w: 0.5, h: 0.14, pos: [0, PL + 0.52, 0.39 + 0.008], color: GREEN, glow: 0.8 },
    ],
  },

  // 12. 무창 큐브 블록 데이터센터
  cyber_datacenter: {
    label: '데이터센터 큐브',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.6, color: BASE2 },
      { k: 'box', w: 0.64, h: 1.1, d: 0.6, y: PL, color: CONC, rough: 0.6, metal: 0.3 },
      // 표면 발광 데이터 라인 다층
      neon(0.66, 0.62, PL + 0.3, CYAN),
      neon(0.66, 0.62, PL + 0.55, CYAN),
      neon(0.66, 0.62, PL + 0.8, GREEN),
      { k: 'panel', w: 0.5, h: 0.5, pos: [0, PL + 0.55, 0.3 + 0.008], color: GLASS, glow: 0.2 },
      { k: 'panel', w: 0.14, h: 0.14, pos: [-0.16, PL + 0.55, 0.3 + 0.014], color: GREEN, glow: 0.7 },
      { k: 'panel', w: 0.14, h: 0.14, pos: [0.16, PL + 0.55, 0.3 + 0.014], color: CYAN, glow: 0.7 },
      { k: 'parapet', w: 0.64, d: 0.6, y: PL + 1.1, color: BASE2 },
      { k: 'rooftopUnits', w: 0.64, y: PL + 1.1 },
      { k: 'box', w: 0.12, h: 0.34, d: 0.12, x: -0.18, y: PL + 1.1, color: STEEL, detail: true },
      { k: 'box', w: 0.12, h: 0.28, d: 0.12, x: 0.14, z: 0.12, y: PL + 1.1, color: STEEL, detail: true },
      { k: 'antenna', y: PL + 1.1, h: 0.3 },
    ],
  },

  // 13. 돌출 포드 그리드 캡슐호텔
  cyber_capsule_hotel: {
    label: '캡슐 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.5, color: BASE2 },
      { k: 'box', w: 0.52, h: 1.5, d: 0.5, y: PL, color: CONC, rough: 0.6, windows: { from: 0.08, to: 0.95, color: AMBER, glow: 0.5 } },
      // 돌출 캡슐 개구부 격자(정면 발광 링)
      neon(0.54, 0.52, PL + 0.35, CYAN),
      neon(0.54, 0.52, PL + 0.7, CYAN),
      neon(0.54, 0.52, PL + 1.05, CYAN),
      neon(0.54, 0.52, PL + 1.4, CYAN),
      { k: 'box', w: 0.1, h: 0.1, d: 0.06, x: 0.26 + 0.02, z: 0.12, y: PL + 0.5, color: STEEL, detail: true },
      { k: 'box', w: 0.1, h: 0.1, d: 0.06, x: 0.26 + 0.02, z: -0.12, y: PL + 0.9, color: STEEL, detail: true },
      { k: 'box', w: 0.1, h: 0.1, d: 0.06, x: -0.26 - 0.02, z: 0.12, y: PL + 1.2, color: STEEL, detail: true },
      { k: 'parapet', w: 0.52, d: 0.5, y: PL + 1.5, color: BASE2 },
      { k: 'rooftopUnits', w: 0.52, y: PL + 1.5 },
      { k: 'storefront', w: 0.52, d: 0.5, faceH: 0.3, awning: PURP, sign: CYAN },
      { k: 'panel', w: 0.34, h: 0.12, pos: [0, PL + 1.38, 0.25 + 0.008], color: PINK, glow: 0.8 },
    ],
  },

  // 14. 와이드 2단 네온 아케이드
  cyber_neon_arcade: {
    label: '네온 아케이드',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.48, color: BASE2 },
      { k: 'box', w: 0.68, h: 0.7, d: 0.48, y: PL, color: BASE1, rough: 0.5, windows: { from: 0.5, to: 0.9, color: PINK, glow: 0.55 } },
      { k: 'storefront', w: 0.68, d: 0.48, faceH: 0.42, awning: PURP, sign: PINK },
      cornice(0.68, 0.48, PL + 0.7, STEEL),
      { k: 'box', w: 0.56, h: 0.5, d: 0.4, y: PL + 0.75, color: CONC, rough: 0.5, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.5 } },
      { k: 'parapet', w: 0.56, d: 0.4, y: PL + 1.25, color: BASE2 },
      { k: 'rooftopUnits', w: 0.56, y: PL + 1.25 },
      // 네온 사인 다발(가로+세로)
      { k: 'panel', w: 0.58, h: 0.16, pos: [0, PL + 0.86, 0.25 + 0.008], color: CYAN, glow: 0.85 },
      { k: 'panel', w: 0.1, h: 0.6, pos: [-0.3, PL + 0.6, 0.24 + 0.006], color: PINK, glow: 0.8 },
      { k: 'panel', w: 0.1, h: 0.45, pos: [0.3, PL + 0.5, 0.24 + 0.006], color: GREEN, glow: 0.8 },
      { k: 'panel', w: 0.12, h: 0.4, pos: [0, PL + 1.3, 0.2 + 0.006], color: AMBER, glow: 0.75 },
    ],
  },

  // 15. 저층 + 옥상 사인파일런 나이트클럽
  cyber_nightclub: {
    label: '나이트클럽',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.52, color: BASE2 },
      { k: 'box', w: 0.6, h: 0.7, d: 0.52, y: PL, color: PURP, rough: 0.5, windows: { from: 0.3, to: 0.7, color: PINK, glow: 0.6 } },
      { k: 'box', w: 0.46, h: 0.16, d: 0.4, y: PL + 0.7, color: BASE1 },
      // 옥상 대형 사인 파일런
      { k: 'box', w: 0.12, h: 0.9, d: 0.12, y: PL + 0.86, color: STEEL },
      { k: 'panel', w: 0.36, h: 0.7, pos: [0, PL + 1.2, 0.06 + 0.006], color: CYAN, glow: 0.9 },
      { k: 'panel', w: 0.36, h: 0.7, pos: [0, PL + 1.2, -0.06 - 0.006], rotY: 3.1416, color: PINK, glow: 0.9 },
      { k: 'storefront', w: 0.6, d: 0.52, faceH: 0.35, awning: '#12081F', sign: PINK },
      { k: 'panel', w: 0.46, h: 0.2, pos: [0, PL + 0.58, 0.27 + 0.008], color: CYAN, glow: 0.9 },
      { k: 'panel', w: 0.12, h: 0.5, pos: [-0.3, PL + 0.5, 0.25 + 0.006], color: PINK, glow: 0.85 },
      { k: 'panel', w: 0.12, h: 0.5, pos: [0.3, PL + 0.5, 0.25 + 0.006], color: GREEN, glow: 0.85 },
      { k: 'antenna', y: PL + 1.76, h: 0.2 },
    ],
  },

  // 16. L매스 코너 전당포
  cyber_pawn_shop: {
    label: '전당포',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.52, color: BASE2 },
      // L자 매스 (긴 날개 + 짧은 날개)
      { k: 'box', w: 0.56, h: 0.9, d: 0.24, z: -0.12, y: PL, color: BASE1, rough: 0.6, windows: { from: 0.15, to: 0.85, color: GREEN, glow: 0.5 } },
      { k: 'box', w: 0.24, h: 1.3, d: 0.5, x: -0.14, y: PL, color: CONC, rough: 0.6, windows: { from: 0.12, to: 0.9, color: AMBER, glow: 0.5 } },
      { k: 'box', w: 0.26, h: 0.06, d: 0.52, x: -0.14, y: PL + 1.3, color: STEEL },
      { k: 'box', w: 0.14, h: 0.3, d: 0.14, x: -0.14, y: PL + 1.36, color: STEEL, detail: true },
      { k: 'rooftopUnits', w: 0.5, y: PL + 0.9 },
      { k: 'storefront', w: 0.4, d: 0.5, faceH: 0.4, awning: PURP, sign: AMBER },
      { k: 'panel', w: 0.16, h: 0.5, pos: [0.16, PL + 0.7, 0.25 + 0.006], color: AMBER, glow: 0.85 },
      { k: 'panel', w: 0.3, h: 0.12, pos: [-0.14, PL + 0.66, 0.25 + 0.008], color: GREEN, glow: 0.7 },
    ],
  },

  // 17. 포디움 + 십자타워 스트리트 클리닉
  cyber_street_clinic: {
    label: '스트리트 클리닉',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.58, d: 0.5, color: BASE2 },
      { k: 'box', w: 0.58, h: 0.5, d: 0.5, y: PL, color: CONC, rough: 0.55, windows: { from: 0.3, to: 0.8, color: CYAN, glow: 0.45 } },
      cornice(0.58, 0.5, PL + 0.5, STEEL),
      { k: 'box', w: 0.3, h: 1.1, d: 0.3, y: PL + 0.55, color: BASE1, rough: 0.5, windows: { from: 0.1, to: 0.9, color: CYAN, glow: 0.5 } },
      ...pilasters(0.3, 0.3, 1.1, PL + 0.55, GLASS, 0.02),
      { k: 'parapet', w: 0.3, d: 0.3, y: PL + 1.65, color: BASE2 },
      { k: 'rooftopUnits', w: 0.3, y: PL + 1.65 },
      // 발광 십자
      { k: 'cross', y: PL + 1.2, z: 0.15 + 0.008, color: GREEN, s: 0.8 },
      { k: 'cross', y: PL + 1.75, color: GREEN, s: 0.6 },
      { k: 'storefront', w: 0.58, d: 0.5, faceH: 0.34, awning: '#0E2A2A', sign: CYAN },
      { k: 'panel', w: 0.1, h: 0.4, pos: [0.29 + 0.006, PL + 0.3, 0], rotY: 1.5708, color: GREEN, glow: 0.7 },
    ],
  },

  // 18. 슬렌더 포드스택 국수타워 (was noodle_bar)
  cyber_noodle_bar: {
    label: '누들 포드타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.36, d: 0.34, color: BASE2 },
      { k: 'box', w: 0.36, h: 0.44, d: 0.34, y: PL, color: BASE1, rough: 0.6, windows: { from: 0.4, to: 0.85, color: AMBER, glow: 0.55 } },
      { k: 'storefront', w: 0.36, d: 0.34, faceH: 0.28, awning: '#12081F', sign: PINK },
      // 스택된 국수 포드 (원통 캡슐)
      { k: 'cyl', rt: 0.19, rb: 0.19, h: 0.28, y: PL + 0.44, color: CONC, seg: 12 },
      { k: 'cyl', rt: 0.19, rb: 0.19, h: 0.28, y: PL + 0.78, color: BASE1, seg: 12 },
      { k: 'cyl', rt: 0.17, rb: 0.17, h: 0.28, y: PL + 1.12, color: CONC, seg: 12 },
      { k: 'cyl', rt: 0.21, rb: 0.21, h: 0.04, y: PL + 0.72, color: CYAN, seg: 12, detail: true },
      { k: 'cyl', rt: 0.21, rb: 0.21, h: 0.04, y: PL + 1.06, color: PINK, seg: 12, detail: true },
      { k: 'roof', type: 'cone', w: 0.34, y: PL + 1.4, height: 0.18, color: STEEL },
      { k: 'antenna', y: PL + 1.58, h: 0.24 },
      // 세로 국수 사인
      { k: 'panel', w: 0.12, h: 0.9, pos: [0.16, PL + 0.9, 0.14 + 0.02], color: PINK, glow: 0.85 },
      { k: 'panel', w: 0.28, h: 0.1, pos: [0, PL + 0.36, 0.17 + 0.008], color: AMBER, glow: 0.7 },
    ],
  },

  // 19. 갠트리 프레임 자판기 (was ramen_stall)
  cyber_ramen_stall: {
    label: '자판기 갠트리',
    group: 'village',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.36, color: BASE2 },
      // 갠트리 프레임 4주 + 상부 보
      { k: 'box', w: 0.05, h: 1.1, d: 0.05, x: -0.21, z: -0.14, y: PL, color: STEEL },
      { k: 'box', w: 0.05, h: 1.1, d: 0.05, x: 0.21, z: -0.14, y: PL, color: STEEL },
      { k: 'box', w: 0.05, h: 1.1, d: 0.05, x: -0.21, z: 0.14, y: PL, color: STEEL },
      { k: 'box', w: 0.05, h: 1.1, d: 0.05, x: 0.21, z: 0.14, y: PL, color: STEEL },
      { k: 'box', w: 0.52, h: 0.08, d: 0.36, y: PL + 1.1, color: CONC },
      // 자판기 벽(발광 격자)
      { k: 'box', w: 0.4, h: 0.6, d: 0.14, z: -0.08, y: PL, color: BASE1, rough: 0.5 },
      { k: 'panel', w: 0.12, h: 0.5, pos: [-0.12, PL + 0.32, 0.0 + 0.006], color: CYAN, glow: 0.8 },
      { k: 'panel', w: 0.12, h: 0.5, pos: [0.02, PL + 0.32, 0.0 + 0.006], color: PINK, glow: 0.8 },
      { k: 'panel', w: 0.12, h: 0.5, pos: [0.16, PL + 0.32, 0.0 + 0.006], color: AMBER, glow: 0.8 },
      // 매달린 포장마차 천막
      { k: 'box', w: 0.44, h: 0.06, d: 0.32, y: PL + 0.62, color: '#7A1030' },
      { k: 'panel', w: 0.4, h: 0.1, pos: [0, PL + 0.56, 0.16 + 0.008], color: AMBER, glow: 0.7 },
      { k: 'panel', w: 0.05, h: 0.14, pos: [-0.16, PL + 0.44, 0.16 + 0.006], color: PINK, glow: 0.8 },
      { k: 'box', w: 0.5, h: 0.02, d: 0.02, z: 0.15, y: PL + 0.9, color: CYAN, emissive: true },
    ],
  },

  // 20. 네온 토리이 게이트 사당
  cyber_neon_shrine: {
    label: '네온 사당',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.44, color: BASE2 },
      // 대형 네온 토리이
      { k: 'box', w: 0.06, h: 1.1, d: 0.06, x: -0.2, z: 0.16, y: PL, color: PINK, emissive: true },
      { k: 'box', w: 0.06, h: 1.1, d: 0.06, x: 0.2, z: 0.16, y: PL, color: PINK, emissive: true },
      { k: 'box', w: 0.56, h: 0.06, d: 0.06, z: 0.16, y: PL + 0.85, color: CYAN, emissive: true },
      { k: 'box', w: 0.66, h: 0.06, d: 0.1, z: 0.16, y: PL + 1.1, color: PINK, emissive: true },
      // 부유 사당 박스
      { k: 'box', w: 0.34, h: 0.4, d: 0.3, z: -0.1, y: PL + 0.5, color: BASE1, rough: 0.5, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.6 } },
      { k: 'box', w: 0.4, h: 0.06, d: 0.36, z: -0.1, y: PL + 0.44, color: STEEL },
      { k: 'roof', type: 'pyramid', w: 0.48, d: 0.4, y: PL + 0.9, height: 0.16, color: PURP },
      { k: 'box', w: 0.03, h: 0.14, d: 0.03, z: -0.1, y: PL + 1.06, color: CYAN, emissive: true, detail: true },
      { k: 'panel', w: 0.2, h: 0.14, pos: [0, PL + 0.7, 0.05 + 0.006], color: PINK, glow: 0.85 },
      { k: 'panel', w: 0.14, h: 0.1, pos: [0, PL + 0.98, 0.16 + 0.02], color: GREEN, glow: 0.8 },
    ],
  },
} satisfies Record<string, BuildingConfig>
