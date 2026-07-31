import type { BuildingConfig } from '../partTypes'
import { at, around, bigColumns, mirrorX, podium } from './_helpers'

/**
 * 랜드마크 — 궁전·영묘 계열 (3×3, 8단계).
 *
 * 모티브: 대궁전(베르사유 ㄷ자 + 정원), 대전각(자금성 태화전·근정전 이중지붕),
 *         백대리석 영묘(타지마할 양파돔 + 미나렛 4기 + 수반).
 * 좌우 대칭이 핵심이라 mirrorX 로 짝을 만들고, 정원·수반은 pool 로 깐다.
 */

const CREAM = '#E3D9C0'
const CREAM2 = '#CFC3A6'
const SLATE = '#4B5560'
const GOLD = '#C9A227'
const GRAVEL = '#C6BCA6'
const HEDGE = '#3C6B3E'
const LAWN = '#4C7A46'

const HANOK_TILE = '#3B4048'
const HANOK_WOOD = '#8C3B2E'
const HANOK_WOOD2 = '#6E2B22'
const DAN_G = '#2E6E4B'
const HANOK_STONE = '#C9C2B6'
const HANOK_WHITE = '#EFEAE0'

const MARBLE = '#F2EEE6'
const MARBLE2 = '#E0DACE'
const RED_SAND = '#9E5A45'
const INLAY = '#2F5D7C'

export const PALACE_LANDMARKS = {
  /** 7. 대궁전 — ㄷ자 좌우대칭 + 금박 지붕 + 정원 파르테르 */
  lm_grand_palace: {
    label: '대궁전',
    group: 'landmark',
    parts: [
      // 1단계 — 부지 + 자갈 전정
      ...at(1, [
        { k: 'box', w: 2.92, h: 0.05, d: 2.92, y: 0, color: GRAVEL, rough: 0.98 },
        { k: 'box', w: 2.4, h: 0.02, d: 0.9, z: 1.0, y: 0.05, color: LAWN, rough: 1 },
      ]),
      // 2단계 — 중앙 본관 저층
      ...at(2, [
        { k: 'box', w: 1.5, h: 0.42, d: 0.72, z: -0.7, y: 0.05, color: CREAM, rough: 0.85, windows: { from: 0.2, to: 0.85, color: 'glassWarm', glow: 0.2 } },
      ]),
      // 3단계 — 좌우 윙(ㄷ자로 앞으로 뻗는다)
      ...at(3, [
        ...mirrorX([{ k: 'box', w: 0.56, h: 0.4, d: 1.9, x: 1.06, z: 0.14, color: CREAM, rough: 0.85, windows: { from: 0.2, to: 0.85, color: 'glassWarm', glow: 0.2 } }]),
      ]),
      // 4단계 — 2층 + 코니스 띠
      ...at(4, [
        { k: 'box', w: 1.46, h: 0.38, d: 0.68, z: -0.7, y: 0.47, color: CREAM, rough: 0.85, windows: { from: 0.2, to: 0.85, color: 'glassWarm', glow: 0.22 } },
        ...mirrorX([{ k: 'box', w: 0.52, h: 0.36, d: 1.86, x: 1.06, z: 0.14, y: 0.45, color: CREAM, rough: 0.85, windows: { from: 0.2, to: 0.85, color: 'glassWarm', glow: 0.22 } }]),
        { k: 'box', w: 1.56, h: 0.05, d: 0.78, z: -0.7, y: 0.85, color: CREAM2, rough: 0.8 },
      ]),
      // 5단계 — 중앙 파빌리온(살롱) 상승부
      ...at(5, [
        { k: 'box', w: 0.72, h: 0.36, d: 0.8, z: -0.66, y: 0.9, color: CREAM, rough: 0.85, windows: { from: 0.15, to: 0.9, color: 'glassWarm', glow: 0.24 } },
        ...bigColumns(6, 0.6, -0.28, 0.9, 0.34, 0.045, CREAM2),
      ]),
      // 6단계 — 만사르 지붕 + 윙 지붕
      ...at(6, [
        { k: 'roof', type: 'pyramid', w: 0.8, d: 0.86, y: 1.26, height: 0.3, color: SLATE },
        ...mirrorX([{ k: 'box', w: 0.56, h: 0.06, d: 1.9, x: 1.06, z: 0.14, y: 0.81, color: SLATE, rough: 0.85 }]),
        { k: 'box', w: 1.52, h: 0.06, d: 0.74, z: -0.7, y: 0.85, color: SLATE, rough: 0.85 },
      ]),
      // 7단계 — 파르테르 정원 + 대운하 + 산울타리
      ...at(7, [
        { k: 'pool', w: 0.44, d: 0.84, z: 1.0, y: 0.05, color: 'water' },
        ...mirrorX([{ k: 'box', w: 0.5, h: 0.03, d: 0.8, x: 0.72, z: 1.06, y: 0.06, color: HEDGE, rough: 1 }]),
        ...around(6, 1.18, 1.18, (x, z) => ({
          k: 'box', w: 0.12, h: 0.2, d: 0.12, x, z, y: 0.05, color: HEDGE, rough: 1,
        })),
        { k: 'box', w: 0.9, h: 0.05, d: 0.2, z: 0.44, y: 0.05, color: GRAVEL, rough: 0.95 },
      ]),
      // 8단계 — 금박 장식·조각상·정문 철문
      ...at(8, [
        { k: 'box', w: 0.84, h: 0.05, d: 0.9, y: 1.24, z: -0.66, color: GOLD, rough: 0.4, metal: 0.6 },
        { k: 'box', w: 0.05, h: 0.26, d: 0.05, z: -0.66, y: 1.56, color: GOLD, emissive: true },
        ...mirrorX([{ k: 'box', w: 0.08, h: 0.26, d: 0.08, x: 0.3, z: 1.44, y: 0.05, color: GOLD, rough: 0.4, metal: 0.6 }]),
        ...around(10, 1.3, 1.3, (x, z) => ({
          k: 'panel', w: 0.09, h: 0.09, pos: [x, 0.12, z], color: 'glassWarm', glow: 0.75,
        })),
      ]),
    ],
  },

  /** 8. 대전각 — 3단 월대 위 이중 팔작지붕 대전 */
  lm_great_hall: {
    label: '대전각',
    group: 'landmark',
    parts: [
      // 1단계 — 3단 월대(석조 기단)
      ...at(1, [
        { k: 'box', w: 2.88, h: 0.04, d: 2.88, y: 0, color: HANOK_STONE, rough: 0.95 },
        ...podium(2.3, 1.9, 3, 0.1, 0.04, HANOK_STONE, 0.17),
      ]),
      // 2단계 — 전각 하부 몸체
      ...at(2, [
        { k: 'box', w: 1.66, h: 0.44, d: 1.16, y: 0.34, color: HANOK_WHITE, rough: 0.9 },
      ]),
      // 3단계 — 붉은 열주(정면·측면)
      ...at(3, [
        ...bigColumns(8, 1.5, 0.56, 0.34, 0.46, 0.055, HANOK_WOOD),
        ...bigColumns(8, 1.5, -0.56, 0.34, 0.46, 0.055, HANOK_WOOD),
        ...mirrorX([{ k: 'box', w: 0.11, h: 0.46, d: 0.11, x: 0.78, z: 0.28, y: 0.34, color: HANOK_WOOD }]),
        ...mirrorX([{ k: 'box', w: 0.11, h: 0.46, d: 0.11, x: 0.78, z: -0.28, y: 0.34, color: HANOK_WOOD }]),
      ]),
      // 4단계 — 창방·공포(수평 보) + 아래 지붕
      ...at(4, [
        { k: 'box', w: 1.74, h: 0.09, d: 1.24, y: 0.8, color: HANOK_WOOD2, rough: 0.85 },
        { k: 'box', w: 1.86, h: 0.06, d: 1.36, y: 0.89, color: DAN_G, rough: 0.85 },
        { k: 'roof', type: 'pyramid', w: 1.98, d: 1.46, y: 0.95, height: 0.3, color: HANOK_TILE },
      ]),
      // 5단계 — 상층 몸체
      ...at(5, [
        { k: 'box', w: 1.24, h: 0.36, d: 0.86, y: 1.25, color: HANOK_WHITE, rough: 0.9 },
        ...bigColumns(6, 1.1, 0.41, 1.25, 0.36, 0.05, HANOK_WOOD),
        ...bigColumns(6, 1.1, -0.41, 1.25, 0.36, 0.05, HANOK_WOOD),
      ]),
      // 6단계 — 상층 팔작지붕
      ...at(6, [
        { k: 'box', w: 1.34, h: 0.08, d: 0.96, y: 1.61, color: HANOK_WOOD2, rough: 0.85 },
        { k: 'box', w: 1.44, h: 0.05, d: 1.06, y: 1.69, color: DAN_G, rough: 0.85 },
        { k: 'roof', type: 'pyramid', w: 1.56, d: 1.16, y: 1.74, height: 0.34, color: HANOK_TILE },
      ]),
      // 7단계 — 월대 난간·답도·품계석·향로
      ...at(7, [
        ...around(12, 1.14, 0.94, (x, z) => ({
          k: 'box', w: 0.08, h: 0.16, d: 0.08, x, z, y: 0.34, color: HANOK_STONE, rough: 0.95,
        })),
        { k: 'box', w: 0.44, h: 0.04, d: 0.68, z: 1.14, y: 0.04, color: HANOK_STONE, rough: 0.95 },
        ...mirrorX([{ k: 'box', w: 0.12, h: 0.2, d: 0.12, x: 0.62, z: 1.0, y: 0.34, color: HANOK_STONE, rough: 0.95 }]),
        // 향로 — cyl 은 x 오프셋이 없어 좌우로 못 놓는다. 팔각 기둥(polyPrism)으로 세운다.
        ...mirrorX([{ k: 'polyPrism', sides: 8, r: 0.11, h: 0.2, x: 0.44, z: 0.76, y: 0.34, color: '#6E6A62', rough: 0.6, metal: 0.3 }]),
      ]),
      // 8단계 — 용마루 장식·단청·현판 + 야간 등
      ...at(8, [
        { k: 'box', w: 1.1, h: 0.07, d: 0.1, y: 2.06, color: HANOK_TILE, rough: 0.8 },
        ...mirrorX([{ k: 'box', w: 0.1, h: 0.14, d: 0.1, x: 0.52, y: 2.08, color: GOLD, rough: 0.4, metal: 0.6 }]),
        { k: 'panel', w: 0.5, h: 0.16, pos: [0, 1.52, 0.44], color: HANOK_WOOD2 },
        { k: 'panel', w: 0.44, h: 0.1, pos: [0, 1.52, 0.45], color: GOLD, glow: 0.3 },
        ...around(8, 1.06, 0.86, (x, z) => ({
          k: 'panel', w: 0.1, h: 0.1, pos: [x, 0.62, z], color: 'accent', glow: 0.8,
        })),
      ]),
    ],
  },

  /** 9. 백대리석 영묘 — 중앙 양파돔 + 미나렛 4기 + 수반 정원 */
  lm_taj_mausoleum: {
    label: '백대리석 영묘',
    group: 'landmark',
    parts: [
      // 1단계 — 붉은 사암 기단 + 정원 구획
      ...at(1, [
        { k: 'box', w: 2.9, h: 0.05, d: 2.9, y: 0, color: RED_SAND, rough: 0.95 },
        { k: 'box', w: 2.6, h: 0.02, d: 1.1, z: 0.86, y: 0.05, color: LAWN, rough: 1 },
      ]),
      // 2단계 — 대리석 대(platform)
      ...at(2, [
        ...podium(2.0, 2.0, 2, 0.09, 0.05, MARBLE2, 0.12),
      ]),
      // 3단계 — 본체(모서리 잘린 정사각 매스)
      ...at(3, [
        { k: 'box', w: 1.3, h: 0.6, d: 1.3, y: 0.23, color: MARBLE, rough: 0.7 },
        { k: 'polyPrism', sides: 8, r: 0.78, h: 0.6, y: 0.23, color: MARBLE2, rough: 0.7 },
      ]),
      // 4단계 — 정면 이완(대아치) 4방향
      ...at(4, [
        { k: 'arch', w: 0.4, h: 0.52, d: 1.36, thick: 0.14, y: 0.23, color: MARBLE2 },
        { k: 'arch', w: 0.4, h: 0.52, d: 1.36, thick: 0.14, y: 0.23, rotY: Math.PI / 2, color: MARBLE2 },
        { k: 'box', w: 1.34, h: 0.06, d: 1.34, y: 0.83, color: MARBLE2, rough: 0.7 },
      ]),
      // 5단계 — 돔 드럼 + 미나렛 하부
      ...at(5, [
        { k: 'cyl', rt: 0.42, rb: 0.46, h: 0.24, y: 0.89, color: MARBLE, seg: 16 },
        ...around(4, 1.16, 1.16, (x, z) => ({
          k: 'box', w: 0.16, h: 0.9, d: 0.16, x, z, y: 0.23, color: MARBLE, rough: 0.7,
        })),
      ]),
      // 6단계 — 양파돔 + 미나렛 상부·돔
      ...at(6, [
        { k: 'roof', type: 'dome', w: 1.24, y: 1.13, color: MARBLE },
        { k: 'cyl', rt: 0.2, rb: 0.3, h: 0.2, y: 1.55, color: MARBLE },
        ...around(4, 1.16, 1.16, (x, z) => ({
          k: 'box', w: 0.13, h: 0.4, d: 0.13, x, z, y: 1.13, color: MARBLE, rough: 0.7,
        })),
      ]),
      // 7단계 — 반사 수로 + 차하르바그 + 미나렛 발코니
      ...at(7, [
        { k: 'pool', w: 0.34, d: 1.0, z: 0.94, y: 0.05, color: 'water' },
        { k: 'pool', w: 1.2, d: 0.26, z: 0.44, y: 0.05, color: 'water' },
        ...around(4, 1.16, 1.16, (x, z) => ({
          k: 'box', w: 0.24, h: 0.04, d: 0.24, x, z, y: 0.78, color: MARBLE2, rough: 0.7,
        })),
        ...around(6, 1.3, 1.3, (x, z) => ({
          k: 'box', w: 0.11, h: 0.2, d: 0.11, x, z, y: 0.05, color: HEDGE, rough: 1,
        })),
      ]),
      // 8단계 — 첨탑(피니얼)·상감 문양 + 야간 조명
      ...at(8, [
        { k: 'cyl', rt: 0.03, rb: 0.07, h: 0.3, y: 1.75, color: GOLD, seg: 8 },
        { k: 'roof', type: 'cone', w: 0.14, y: 2.05, height: 0.14, color: GOLD },
        // 미나렛 첨두 — roof/cyl 은 중심 고정이라 오프셋이 안 된다. 좁아지는 box 2단으로.
        ...around(4, 1.16, 1.16, (x, z) => [
          { k: 'box' as const, w: 0.1, h: 0.1, d: 0.1, x, z, y: 1.53, color: GOLD, rough: 0.4, metal: 0.6 },
          { k: 'box' as const, w: 0.05, h: 0.12, d: 0.05, x, z, y: 1.63, color: GOLD, rough: 0.4, metal: 0.6 },
        ]),
        { k: 'panel', w: 0.3, h: 0.3, pos: [0, 0.52, 0.68], color: INLAY, glow: 0.14 },
        { k: 'panel', w: 0.3, h: 0.3, pos: [0, 0.52, -0.68], color: INLAY, glow: 0.14 },
        ...around(8, 1.24, 1.24, (x, z) => ({
          k: 'panel', w: 0.1, h: 0.1, pos: [x, 0.12, z], color: 'glassWarm', glow: 0.8,
        })),
      ]),
    ],
  },
} satisfies Record<string, BuildingConfig>
