import type { BuildingConfig } from '../partTypes'
import { at, around, bigColumns, mirrorX, podium } from './_helpers'

/**
 * 랜드마크 — 관청·기념물 계열 (3×3, 8단계).
 *
 * 모티브: 오각 국방청사(펜타곤), 대의회 의사당(돔+양 윙), 개선문 광장, 중앙 시청 광장.
 * 오각 링은 polyPrism(hollow), 개선문은 arch 부품이 실루엣을 만든다.
 */

const LIME = '#D9D3C4'
const LIME2 = '#C3BCAA'
const GRAY = '#A9A79E'
const ROOF_SLATE = '#4A5058'
const GLASS = '#7FA6C4'
const MARBLE = '#EFEAE0'
const MARBLE2 = '#DED7C9'
const GOLD = '#C9A227'
const LAWN = '#4C7A46'
const STONE = '#CFC6B4'
const BRONZE = '#7A6A4F'

export const CIVIC_LANDMARKS = {
  /** 3. 오각 국방청사 — 5각 링 5중 + 중앙 안뜰 */
  lm_pentagon_hq: {
    label: '오각 국방청사',
    group: 'landmark',
    parts: [
      // 1단계 — 오각 부지 + 중앙 안뜰 잔디
      ...at(1, [
        { k: 'polyPrism', sides: 5, r: 1.48, h: 0.05, color: GRAY, rough: 0.95 },
        { k: 'polyPrism', sides: 5, r: 0.52, h: 0.02, y: 0.05, color: LAWN, rough: 1 },
      ]),
      // 2단계 — 가장 바깥 링 1개 (E링)
      ...at(2, [
        { k: 'polyPrism', sides: 5, r: 1.44, h: 0.44, y: 0.05, hollow: 0.86, color: LIME, rough: 0.85 },
      ]),
      // 3단계 — 안쪽 링 2개 (D·C링)
      ...at(3, [
        { k: 'polyPrism', sides: 5, r: 1.2, h: 0.4, y: 0.05, hollow: 0.84, color: LIME2, rough: 0.85 },
        { k: 'polyPrism', sides: 5, r: 0.98, h: 0.4, y: 0.05, hollow: 0.82, color: LIME2, rough: 0.85 },
      ]),
      // 4단계 — 마지막 링 2개 (B·A링) + 방사 연결동
      ...at(4, [
        { k: 'polyPrism', sides: 5, r: 0.78, h: 0.38, y: 0.05, hollow: 0.8, color: LIME2, rough: 0.85 },
        { k: 'polyPrism', sides: 5, r: 0.6, h: 0.38, y: 0.05, hollow: 0.76, color: LIME2, rough: 0.85 },
        ...around(5, 1.0, 1.0, (x, z) => ({
          k: 'box', w: 0.16, h: 0.36, d: 0.9, x, z, y: 0.05, color: LIME2, rough: 0.85,
        })),
      ]),
      // 5단계 — 층을 올린다(외곽 링 2층)
      ...at(5, [
        { k: 'polyPrism', sides: 5, r: 1.42, h: 0.4, y: 0.49, hollow: 0.86, color: LIME, rough: 0.85 },
        { k: 'polyPrism', sides: 5, r: 1.18, h: 0.36, y: 0.45, hollow: 0.84, color: LIME2, rough: 0.85 },
      ]),
      // 6단계 — 최상층 + 코니스 + 창
      ...at(6, [
        { k: 'polyPrism', sides: 5, r: 1.4, h: 0.34, y: 0.89, hollow: 0.86, color: LIME, rough: 0.85 },
        { k: 'polyPrism', sides: 5, r: 1.46, h: 0.06, y: 1.23, hollow: 0.9, color: GRAY, rough: 0.8 },
        ...around(20, 1.34, 1.34, (x, z) => ({
          k: 'panel', w: 0.13, h: 0.5, pos: [x, 0.62, z], color: GLASS, glow: 0.2,
        })),
      ]),
      // 7단계 — 진입 램프·주차 광장·헬리패드
      ...at(7, [
        { k: 'box', w: 0.9, h: 0.05, d: 0.5, z: 1.24, y: 0.05, color: GRAY, rough: 0.95 },
        ...bigColumns(6, 0.8, 1.24, 0.1, 0.4, 0.05, MARBLE),
        { k: 'box', w: 0.9, h: 0.04, d: 0.14, z: 1.24, y: 0.5, color: MARBLE, rough: 0.8 },
        { k: 'cyl', rt: 0.24, rb: 0.24, h: 0.03, y: 1.29, color: ROOF_SLATE, seg: 16 },
      ]),
      // 8단계 — 국기·중앙 기념 조형 + 야간 창 조명
      ...at(8, [
        { k: 'box', w: 0.03, h: 0.7, d: 0.03, z: 1.36, y: 0.1, color: MARBLE },
        { k: 'panel', w: 0.24, h: 0.15, pos: [0.13, 0.72, 1.36], color: 'beaconRed', glow: 0.4 },
        { k: 'polyPrism', sides: 5, r: 0.16, h: 0.34, y: 0.07, color: BRONZE, rough: 0.5, metal: 0.5 },
        { k: 'roof', type: 'cone', w: 0.3, y: 0.41, height: 0.2, color: GOLD },
        ...around(15, 1.32, 1.32, (x, z) => ({
          k: 'panel', w: 0.1, h: 0.08, pos: [x, 1.06, z], color: 'glassWarm', glow: 0.8,
        })),
      ]),
    ],
  },

  /** 4. 대의회 의사당 — 중앙 대돔 + 좌우 윙 + 열주 포치 */
  lm_capitol_dome: {
    label: '대의회 의사당',
    group: 'landmark',
    parts: [
      // 1단계 — 기단 + 앞 광장
      ...at(1, [
        ...podium(2.9, 2.1, 3, 0.06, 0, STONE, 0.12),
        { k: 'box', w: 2.9, h: 0.03, d: 0.66, z: 1.15, y: 0, color: LIME2, rough: 0.95 },
      ]),
      // 2단계 — 좌우 윙 하부
      ...at(2, [
        ...mirrorX([{ k: 'box', w: 0.92, h: 0.44, d: 1.2, x: 0.98, y: 0.18, color: MARBLE, rough: 0.8, windows: { from: 0.2, to: 0.85, color: GLASS, glow: 0.18 } }]),
      ]),
      // 3단계 — 중앙 매스 + 열주 골조
      ...at(3, [
        { k: 'box', w: 1.1, h: 0.6, d: 1.3, y: 0.18, color: MARBLE, rough: 0.8 },
        ...bigColumns(8, 1.0, 0.66, 0.18, 0.56, 0.05, MARBLE2),
      ]),
      // 4단계 — 윙 상층 + 코니스
      ...at(4, [
        ...mirrorX([{ k: 'box', w: 0.86, h: 0.36, d: 1.14, x: 0.98, y: 0.62, color: MARBLE, rough: 0.8, windows: { from: 0.2, to: 0.85, color: GLASS, glow: 0.18 } }]),
        { k: 'box', w: 2.86, h: 0.06, d: 1.26, y: 0.98, color: MARBLE2, rough: 0.8 },
      ]),
      // 5단계 — 중앙 드럼(원통) + 열주
      ...at(5, [
        { k: 'box', w: 1.16, h: 0.28, d: 1.36, y: 0.78, color: MARBLE, rough: 0.8 },
        { k: 'cyl', rt: 0.44, rb: 0.48, h: 0.4, y: 1.06, color: MARBLE2, seg: 20 },
        ...around(14, 0.5, 0.5, (x, z) => ({
          k: 'box', w: 0.06, h: 0.38, d: 0.06, x, z, y: 1.06, color: MARBLE, rough: 0.8,
        })),
      ]),
      // 6단계 — 돔 + 지붕
      ...at(6, [
        { k: 'cyl', rt: 0.38, rb: 0.44, h: 0.2, y: 1.46, color: MARBLE2, seg: 20 },
        { k: 'roof', type: 'dome', w: 1.1, y: 1.66, color: MARBLE },
        ...mirrorX([{ k: 'box', w: 0.9, h: 0.05, d: 1.18, x: 0.98, y: 0.98, color: ROOF_SLATE, rough: 0.85 }]),
      ]),
      // 7단계 — 포치 페디먼트 + 계단 + 조경
      ...at(7, [
        { k: 'box', w: 1.06, h: 0.06, d: 0.16, z: 0.7, y: 0.76, color: MARBLE2, rough: 0.8 },
        { k: 'roof', type: 'pyramid', w: 1.0, d: 0.22, y: 0.82, height: 0.16, color: MARBLE2 },
        { k: 'box', w: 1.2, h: 0.05, d: 0.4, z: 1.05, y: 0.06, color: STONE, rough: 0.9 },
        { k: 'box', w: 1.1, h: 0.05, d: 0.34, z: 1.2, y: 0.02, color: STONE, rough: 0.9 },
        { k: 'pool', w: 1.1, d: 0.3, z: 1.29, y: 0.03, color: 'water' },
      ]),
      // 8단계 — 랜턴·조각상·국기 + 야간 조명
      ...at(8, [
        { k: 'cyl', rt: 0.1, rb: 0.13, h: 0.22, y: 2.06, color: MARBLE, seg: 12 },
        { k: 'roof', type: 'dome', w: 0.3, y: 2.28, color: GOLD },
        { k: 'box', w: 0.05, h: 0.24, d: 0.05, y: 2.39, color: GOLD, emissive: true },
        { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: -0.62, z: 1.24, y: 0.11, color: MARBLE },
        { k: 'panel', w: 0.2, h: 0.13, pos: [-0.5, 0.53, 1.24], color: 'beaconRed', glow: 0.4 },
        ...around(12, 0.52, 0.52, (x, z) => ({
          k: 'panel', w: 0.08, h: 0.1, pos: [x, 1.24, z], color: 'glassWarm', glow: 0.75,
        })),
      ]),
    ],
  },

  /** 5. 개선문 광장 — 거대 아치 + 방사형 광장 + 부조 */
  lm_triumph_arch: {
    label: '개선문 광장',
    group: 'landmark',
    parts: [
      // 1단계 — 원형 광장 포장
      ...at(1, [
        { k: 'cyl', rt: 1.46, rb: 1.46, h: 0.05, y: 0, color: GRAY, seg: 24 },
        { k: 'cyl', rt: 0.92, rb: 0.92, h: 0.02, y: 0.05, color: LIME2, seg: 24 },
      ]),
      // 2단계 — 아치 기단
      ...at(2, [
        ...podium(1.5, 1.24, 2, 0.07, 0.05, STONE, 0.1),
      ]),
      // 3단계 — 본체 아치(개구부)
      ...at(3, [
        { k: 'arch', w: 0.6, h: 1.2, d: 1.0, thick: 0.32, y: 0.19, color: MARBLE2 },
      ]),
      // 4단계 — 측면 매스 + 직교 방향 소아치
      ...at(4, [
        { k: 'arch', w: 0.34, h: 0.66, d: 1.34, thick: 0.24, y: 0.19, rotY: Math.PI / 2, color: MARBLE2 },
        ...mirrorX([{ k: 'box', w: 0.16, h: 1.24, d: 1.0, x: 0.55, y: 0.19, color: MARBLE, rough: 0.85 }]),
      ]),
      // 5단계 — 어티크(상부 벽체)
      ...at(5, [
        { k: 'box', w: 1.28, h: 0.44, d: 1.02, y: 1.39, color: MARBLE, rough: 0.85 },
      ]),
      // 6단계 — 코니스 + 지붕 슬래브
      ...at(6, [
        { k: 'box', w: 1.4, h: 0.08, d: 1.12, y: 1.83, color: MARBLE2, rough: 0.8 },
        { k: 'box', w: 1.24, h: 0.06, d: 0.98, y: 1.91, color: ROOF_SLATE, rough: 0.85 },
      ]),
      // 7단계 — 부조 패널 + 방사 도로 + 가로수
      ...at(7, [
        ...mirrorX([{ k: 'panel', w: 0.34, h: 0.5, pos: [0.55, 0.66, 0.52], color: STONE }]),
        { k: 'panel', w: 0.9, h: 0.22, pos: [0, 1.6, 0.52], color: STONE },
        { k: 'panel', w: 0.9, h: 0.22, pos: [0, 1.6, -0.52], color: STONE },
        ...around(8, 1.24, 1.24, (x, z) => ({
          k: 'box', w: 0.34, h: 0.02, d: 0.34, x, z, y: 0.05, color: ROOF_SLATE, rough: 0.9,
        })),
        ...around(8, 1.02, 1.02, (x, z) => ({
          k: 'box', w: 0.1, h: 0.24, d: 0.1, x, z, y: 0.07, color: 'bush', rough: 1,
        })),
      ]),
      // 8단계 — 사두마차 조형 + 꺼지지 않는 불꽃
      ...at(8, [
        { k: 'box', w: 0.44, h: 0.16, d: 0.24, y: 1.97, color: BRONZE, rough: 0.5, metal: 0.5 },
        { k: 'box', w: 0.12, h: 0.2, d: 0.1, x: -0.22, y: 2.03, color: BRONZE, rough: 0.5, metal: 0.5 },
        { k: 'box', w: 0.12, h: 0.2, d: 0.1, x: 0.22, y: 2.03, color: BRONZE, rough: 0.5, metal: 0.5 },
        { k: 'cyl', rt: 0.16, rb: 0.2, h: 0.06, y: 0.07, color: BRONZE, seg: 12 },
        { k: 'panel', w: 0.16, h: 0.16, pos: [0, 0.2, 0], color: 'accent', glow: 1 },
        ...around(10, 1.34, 1.34, (x, z) => ({
          k: 'panel', w: 0.1, h: 0.1, pos: [x, 0.1, z], color: 'glassWarm', glow: 0.7,
        })),
      ]),
    ],
  },

  /** 6. 중앙 시청 광장 — 기본 지급용. 어떤 만다라트든 중앙이 비지 않게 하는 무료 랜드마크 */
  lm_civic_plaza: {
    label: '중앙 시청 광장',
    group: 'landmark',
    parts: [
      // 1단계 — 광장 포장 + 화단
      ...at(1, [
        { k: 'box', w: 2.9, h: 0.05, d: 2.9, y: 0, color: GRAY, rough: 0.95 },
        { k: 'box', w: 1.9, h: 0.02, d: 1.9, y: 0.05, color: LIME2, rough: 0.95 },
      ]),
      // 2단계 — 시청 저층부
      ...at(2, [
        { k: 'box', w: 1.7, h: 0.4, d: 0.9, y: 0.05, color: MARBLE, rough: 0.8, windows: { from: 0.2, to: 0.85, color: GLASS, glow: 0.2 } },
      ]),
      // 3단계 — 좌우 윙
      ...at(3, [
        ...mirrorX([{ k: 'box', w: 0.5, h: 0.34, d: 0.8, x: 1.06, y: 0.05, color: MARBLE2, rough: 0.85 }]),
      ]),
      // 4단계 — 중앙 타워 하부
      ...at(4, [
        { k: 'box', w: 0.66, h: 0.66, d: 0.66, y: 0.45, color: MARBLE, rough: 0.8, windows: { from: 0.15, to: 0.9, color: GLASS, glow: 0.25 } },
      ]),
      // 5단계 — 타워 상부
      ...at(5, [
        { k: 'box', w: 0.52, h: 0.6, d: 0.52, y: 1.11, color: MARBLE, rough: 0.8, windows: { from: 0.15, to: 0.9, color: GLASS, glow: 0.25 } },
      ]),
      // 6단계 — 시계 + 지붕
      ...at(6, [
        { k: 'clock', w: 0.52, y: 1.55, color: MARBLE2 },
        { k: 'roof', type: 'pyramid', w: 0.56, y: 1.71, height: 0.34, color: ROOF_SLATE },
        ...mirrorX([{ k: 'box', w: 0.54, h: 0.05, d: 0.84, x: 1.06, y: 0.39, color: ROOF_SLATE, rough: 0.85 }]),
      ]),
      // 7단계 — 분수 + 벤치 + 가로수
      ...at(7, [
        { k: 'pool', w: 0.7, d: 0.7, z: 1.06, y: 0.05, color: 'water' },
        { k: 'cyl', rt: 0.06, rb: 0.1, h: 0.2, y: 0.09, color: MARBLE2, seg: 10 },
        ...around(6, 1.2, 1.2, (x, z) => ({
          k: 'box', w: 0.1, h: 0.22, d: 0.1, x, z, y: 0.05, color: 'bush', rough: 1,
        })),
      ]),
      // 8단계 — 깃대·조형물 + 야간 조명
      ...at(8, [
        { k: 'box', w: 0.03, h: 0.6, d: 0.03, x: -0.7, z: 1.16, y: 0.07, color: MARBLE },
        { k: 'panel', w: 0.22, h: 0.14, pos: [-0.58, 0.6, 1.16], color: 'accent', glow: 0.35 },
        { k: 'box', w: 0.05, h: 0.2, d: 0.05, y: 2.05, color: GOLD, emissive: true },
        ...around(8, 1.3, 1.3, (x, z) => ({
          k: 'panel', w: 0.09, h: 0.09, pos: [x, 0.12, z], color: 'glassWarm', glow: 0.7,
        })),
      ]),
    ],
  },
} satisfies Record<string, BuildingConfig>
