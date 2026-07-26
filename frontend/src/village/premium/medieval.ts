import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, bands, steps, portico, merlons, spire } from './_detail'

/**
 * T5 중세 (medieval) — 극단적 유니크 매스 · 고밀도 디테일 · min ~1.3
 * 팔레트: 석재 #8C8A83·#6E6B63, 목재 #5A3E28, 원뿔지붕 #3E5B8C·#7A2E2E, 배너 #B03A48·#2E5A8C, 금 #C9A24B.
 *
 * 매스: keep=사각성채+4모서리첨탑+흉벽 / cathedral=신랑+쌍첨탑 / palace=대전+중앙원뿔탑+양탑 /
 *  towerhouse=원형석탑+원뿔 / clocktower=사각시계탑 / watchtower=원형감시탑 / gatehouse=쌍원탑 성문 /
 *  guildhall=하프팀버 돌출 / townhall=중앙 벨프리 / market=개방 아케이드 / tavern=하프팀버 여관 /
 *  manor=장원+모서리탑 / halftimber=좁은 하프팀버 3층 / apothecary=약재상 / blacksmith=대장간 /
 *  bakery=제빵 화덕 / watermill=물레바퀴 / well_house=우물+도브코트탑 / cottage_row=3층 연립
 */

const STONE = '#8C8A83'
const STONE2 = '#6E6B63'
const WOOD = '#5A3E28'
const CONE_B = '#3E5B8C'
const CONE_R = '#7A2E2E'
const BANNER_R = '#B03A48'
const BANNER_B = '#2E5A8C'
const GOLD = '#C9A24B'
const PLASTER = '#D8CDB8'
const PLASTER2 = '#E4DAC6'
const DARKWOOD = '#3E2A1C'

export const MEDIEVAL = {
  // 1. 사각 성채 + 4모서리 첨탑 + 흉벽
  medieval_castle_keep: {
    label: '성 천수탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.68, color: STONE2 },
      { k: 'box', w: 0.6, h: 0.2, d: 0.6, y: PL, color: STONE2, rough: 0.9 },
      { k: 'box', w: 0.5, h: 1.4, d: 0.5, y: PL + 0.2, color: STONE, rough: 0.9, windows: { from: 0.15, to: 0.85, color: '#3A2A1A', glow: 0 } },
      ...bands(0.5, 0.5, [PL + 0.7, PL + 1.1], STONE2),
      { k: 'parapet', w: 0.5, d: 0.5, y: PL + 1.6, color: STONE2 },
      ...merlons(0.5, PL + 1.67, 0.25, STONE2, 5),
      // 4 모서리 첨탑
      ...[[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].flatMap(([x, z]) => [
        { k: 'box', w: 0.14, h: 1.7, d: 0.14, x, z, y: PL, color: STONE, rough: 0.9 } as const,
        ...spire(x, z, PL + 1.7, 0.18, 3, 0.1, CONE_B),
      ]),
      { k: 'box', w: 0.16, h: 0.28, d: 0.02, z: 0.25, y: PL + 0.9, color: BANNER_R },
      { k: 'panel', w: 0.14, h: 0.3, pos: [0, PL + 0.2, 0.25 + 0.006], color: DARKWOOD },
      ...steps(0.24, PL, 0.33, STONE, 3),
    ],
  },

  // 2. 신랑 + 쌍 첨탑 대성당
  medieval_cathedral: {
    label: '대성당',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.64, color: STONE2 },
      { k: 'box', w: 0.36, h: 1.0, d: 0.62, y: PL, color: STONE, rough: 0.85, windows: { from: 0.2, to: 0.75, color: '#3A2A4A', glow: 0.15 } },
      { k: 'roof', type: 'pyramid', w: 0.42, d: 0.68, y: PL + 1.0, height: 0.24, color: CONE_B },
      { k: 'box', w: 0.02, h: 0.12, d: 0.5, y: PL + 1.24, color: GOLD, detail: true },
      // 전면 쌍탑 + 첨탑
      { k: 'box', w: 0.18, h: 1.5, d: 0.18, x: -0.24, z: 0.22, y: PL, color: STONE, rough: 0.85 },
      { k: 'box', w: 0.18, h: 1.5, d: 0.18, x: 0.24, z: 0.22, y: PL, color: STONE, rough: 0.85 },
      ...spire(-0.24, 0.22, PL + 1.5, 0.2, 4, 0.1, CONE_B),
      ...spire(0.24, 0.22, PL + 1.5, 0.2, 4, 0.1, CONE_B),
      { k: 'box', w: 0.2, h: 0.028, d: 0.2, x: -0.24, z: 0.22, y: PL + 0.6, color: STONE2 },
      { k: 'box', w: 0.2, h: 0.028, d: 0.2, x: 0.24, z: 0.22, y: PL + 0.6, color: STONE2 },
      { k: 'box', w: 0.2, h: 0.028, d: 0.2, x: -0.24, z: 0.22, y: PL + 1.0, color: STONE2 },
      { k: 'box', w: 0.2, h: 0.028, d: 0.2, x: 0.24, z: 0.22, y: PL + 1.0, color: STONE2 },
      // 장미창 + 아치문
      { k: 'panel', w: 0.18, h: 0.18, pos: [0, PL + 0.7, 0.32 + 0.006], color: BANNER_B, glow: 0.35 },
      { k: 'panel', w: 0.16, h: 0.34, pos: [0, PL + 0.18, 0.32 + 0.006], color: DARKWOOD },
      { k: 'cross', y: PL + 1.2, z: 0.32, color: GOLD, s: 0.5 },
    ],
  },

  // 3. 대전 + 중앙 원뿔탑 + 양탑
  medieval_royal_palace: {
    label: '왕궁',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.74, d: 0.56, color: STONE2 },
      { k: 'box', w: 0.68, h: 1.0, d: 0.5, y: PL, color: PLASTER, rough: 0.8, windows: { from: 0.15, to: 0.85, color: 'glassWarm', glow: 0.28 } },
      ...portico(0.68, 0.5, 0.6, PL, 7, STONE, STONE2),
      ...bands(0.68, 0.5, [PL + 0.55], BANNER_B),
      { k: 'roof', type: 'pyramid', w: 0.74, d: 0.56, y: PL + 1.0, height: 0.12, color: CONE_B },
      // 중앙 대탑
      { k: 'box', w: 0.3, h: 0.5, d: 0.3, y: PL + 1.12, color: PLASTER, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.28 } },
      { k: 'cyl', rt: 0.16, rb: 0.18, h: 0.12, y: PL + 1.62, color: STONE, seg: 12 },
      { k: 'roof', type: 'cone', w: 0.42, y: PL + 1.74, height: 0.4, color: CONE_R },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 2.14, color: GOLD, detail: true, emissive: true },
      // 양 끝 원뿔탑
      { k: 'box', w: 0.16, h: 1.2, d: 0.16, x: -0.32, z: 0.08, y: PL, color: PLASTER, rough: 0.8 },
      ...spire(-0.32, 0.08, PL + 1.2, 0.2, 3, 0.1, CONE_R),
      { k: 'box', w: 0.16, h: 1.2, d: 0.16, x: 0.32, z: 0.08, y: PL, color: PLASTER, rough: 0.8 },
      ...spire(0.32, 0.08, PL + 1.2, 0.2, 3, 0.1, CONE_R),
      { k: 'panel', w: 0.1, h: 0.4, pos: [-0.12, PL + 0.5, 0.26 + 0.006], color: BANNER_R, glow: 0.15 },
      { k: 'panel', w: 0.1, h: 0.4, pos: [0.12, PL + 0.5, 0.26 + 0.006], color: BANNER_B, glow: 0.15 },
    ],
  },

  // 4. 원형 석탑 타워하우스
  medieval_towerhouse: {
    label: '타워하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: STONE2 },
      { k: 'box', w: 0.4, h: 0.2, d: 0.4, y: PL, color: STONE2, rough: 0.9 },
      { k: 'cyl', rt: 0.19, rb: 0.21, h: 1.5, y: PL + 0.2, color: STONE, seg: 12 },
      { k: 'cyl', rt: 0.22, rb: 0.22, h: 0.04, y: PL + 0.7, color: STONE2, seg: 12, detail: true },
      { k: 'cyl', rt: 0.22, rb: 0.22, h: 0.04, y: PL + 1.2, color: STONE2, seg: 12, detail: true },
      { k: 'cyl', rt: 0.23, rb: 0.21, h: 0.12, y: PL + 1.7, color: STONE2, seg: 12 },
      { k: 'roof', type: 'cone', w: 0.44, y: PL + 1.82, height: 0.34, color: CONE_R },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 2.16, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.05, h: 0.16, pos: [0, PL + 1.0, 0.2 + 0.006], color: '#2A1A0E' },
      { k: 'panel', w: 0.05, h: 0.16, pos: [0, PL + 0.55, 0.2 + 0.006], color: '#2A1A0E' },
      { k: 'panel', w: 0.12, h: 0.4, pos: [0, PL + 0.75, 0.21 + 0.006], color: BANNER_B, glow: 0.15 },
      { k: 'box', w: 0.1, h: 0.3, d: 0.1, x: 0.18, z: -0.1, y: PL + 1.7, color: STONE2, detail: true },
    ],
  },

  // 5. 사각 시계탑
  medieval_clocktower: {
    label: '시계탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: STONE2 },
      { k: 'box', w: 0.38, h: 1.6, d: 0.38, y: PL, color: STONE, rough: 0.85, windows: { from: 0.1, to: 0.55, color: '#2A1A0E', glow: 0 } },
      ...bands(0.38, 0.38, [PL + 0.55, PL + 1.05], STONE2),
      { k: 'clock', w: 0.38, y: PL + 1.36, color: PLASTER },
      { k: 'parapet', w: 0.38, d: 0.38, y: PL + 1.6, color: STONE2 },
      ...merlons(0.38, PL + 1.67, 0.19, STONE2, 4),
      { k: 'box', w: 0.24, h: 0.24, d: 0.24, y: PL + 1.6, color: STONE, rough: 0.85 },
      { k: 'roof', type: 'cone', w: 0.36, y: PL + 1.84, height: 0.36, color: CONE_B },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 2.2, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.12, h: 0.28, pos: [0, PL + 0.2, 0.19 + 0.006], color: DARKWOOD },
    ],
  },

  // 6. 원형 감시탑
  medieval_watchtower: {
    label: '감시탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: STONE2 },
      { k: 'cyl', rt: 0.17, rb: 0.24, h: 1.7, y: PL, color: STONE, seg: 12 },
      { k: 'cyl', rt: 0.2, rb: 0.2, h: 0.04, y: PL + 0.6, color: STONE2, seg: 12, detail: true },
      { k: 'cyl', rt: 0.18, rb: 0.18, h: 0.04, y: PL + 1.2, color: STONE2, seg: 12, detail: true },
      // 돌출 흉벽 링(machicolation)
      { k: 'cyl', rt: 0.26, rb: 0.2, h: 0.16, y: PL + 1.7, color: STONE2, seg: 12 },
      { k: 'roof', type: 'cone', w: 0.5, y: PL + 1.86, height: 0.32, color: CONE_B },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 2.18, color: BANNER_R, detail: true },
      { k: 'panel', w: 0.05, h: 0.16, pos: [0, PL + 1.0, 0.2 + 0.006], color: '#2A1A0E' },
      { k: 'panel', w: 0.05, h: 0.16, pos: [0, PL + 0.55, 0.21 + 0.006], color: '#2A1A0E' },
      { k: 'panel', w: 0.12, h: 0.36, pos: [0, PL + 0.85, 0.21 + 0.006], color: BANNER_R, glow: 0.15 },
    ],
  },

  // 7. 쌍 원탑 성문
  medieval_gatehouse: {
    label: '성문',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.74, d: 0.42, color: STONE2 },
      { k: 'box', w: 0.74, h: 0.9, d: 0.36, y: PL, color: STONE, rough: 0.9 },
      { k: 'panel', w: 0.22, h: 0.56, pos: [0, PL + 0.28, 0.18 + 0.006], color: '#20160C' },
      { k: 'parapet', w: 0.74, d: 0.36, y: PL + 0.9, color: STONE2 },
      ...merlons(0.74, PL + 0.97, 0.18, STONE2, 7),
      // 쌍둥이 원탑 + 원뿔
      { k: 'box', w: 0.24, h: 1.4, d: 0.28, x: -0.3, y: PL, color: STONE, rough: 0.9 },
      { k: 'box', w: 0.24, h: 1.4, d: 0.28, x: 0.3, y: PL, color: STONE, rough: 0.9 },
      { k: 'cyl', rt: 0.2, rb: 0.16, h: 0.14, y: PL + 1.4, color: STONE2, seg: 12 },
      ...spire(-0.3, 0, PL + 1.4, 0.26, 3, 0.12, CONE_B),
      ...spire(0.3, 0, PL + 1.4, 0.26, 3, 0.12, CONE_B),
      { k: 'panel', w: 0.14, h: 0.4, pos: [0, PL + 0.6, 0.19 + 0.006], color: BANNER_R, glow: 0.15 },
    ],
  },

  // 8. 하프팀버 돌출 길드홀
  medieval_guildhall: {
    label: '길드홀',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.46, color: STONE2 },
      { k: 'box', w: 0.56, h: 0.5, d: 0.46, y: PL, color: STONE, rough: 0.85 },
      { k: 'box', w: 0.6, h: 0.5, d: 0.5, y: PL + 0.5, color: PLASTER, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.64, h: 0.44, d: 0.54, y: PL + 1.0, color: PLASTER2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.7, d: 0.6, y: PL + 1.44, height: 0.3, color: CONE_R },
      // 하프팀버 목재 격자
      ...ribs(0.6, 0.5, 0.5, PL + 0.5, 5, DARKWOOD, 0.022),
      ...ribs(0.64, 0.54, 0.44, PL + 1.0, 6, DARKWOOD, 0.022),
      { k: 'box', w: 0.62, h: 0.03, d: 0.52, y: PL + 0.98, color: DARKWOOD },
      { k: 'box', w: 0.66, h: 0.03, d: 0.56, y: PL + 1.42, color: DARKWOOD },
      { k: 'storefront', w: 0.56, d: 0.46, faceH: 0.3, awning: BANNER_R, sign: GOLD },
      { k: 'panel', w: 0.16, h: 0.2, pos: [0, PL + 0.6, 0.26 + 0.006], color: GOLD, glow: 0.2 },
    ],
  },

  // 9. 중앙 벨프리 시청
  medieval_townhall: {
    label: '시청',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.48, color: STONE2 },
      { k: 'box', w: 0.6, h: 1.0, d: 0.48, y: PL, color: PLASTER, rough: 0.8, windows: { from: 0.18, to: 0.85, color: 'glassWarm', glow: 0.3 } },
      ...portico(0.6, 0.48, 0.6, PL, 5, STONE, STONE2),
      { k: 'roof', type: 'pyramid', w: 0.66, d: 0.54, y: PL + 1.0, height: 0.14, color: CONE_R },
      // 중앙 종루
      { k: 'box', w: 0.24, h: 0.5, d: 0.24, y: PL + 1.14, color: STONE, rough: 0.85, windows: { from: 0.3, to: 0.7, color: '#2A1A0E', glow: 0 } },
      { k: 'roof', type: 'cone', w: 0.34, y: PL + 1.64, height: 0.32, color: CONE_R },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 1.96, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.1, h: 0.36, pos: [-0.1, PL + 0.55, 0.24 + 0.006], color: BANNER_R, glow: 0.15 },
      { k: 'panel', w: 0.1, h: 0.36, pos: [0.1, PL + 0.55, 0.24 + 0.006], color: BANNER_B, glow: 0.15 },
    ],
  },

  // 10. 개방 아케이드 시장 홀
  medieval_market_hall: {
    label: '시장 홀',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.5, color: STONE2 },
      { k: 'box', w: 0.66, h: 0.16, d: 0.5, y: PL, color: STONE2, rough: 0.85 },
      // 개방 아케이드 기둥층
      { k: 'columns', w: 0.66, d: 0.5, y: PL + 0.16, h: 0.44, count: 6, color: STONE },
      { k: 'box', w: 0.66, h: 0.06, d: 0.5, y: PL + 0.6, color: STONE },
      { k: 'box', w: 0.6, h: 0.5, d: 0.44, y: PL + 0.66, color: PLASTER, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.3 } },
      ...ribs(0.6, 0.44, 0.5, PL + 0.66, 6, DARKWOOD, 0.02),
      { k: 'roof', type: 'pyramid', w: 0.72, d: 0.52, y: PL + 1.16, height: 0.24, color: CONE_B },
      // 종루 큐폴라
      { k: 'box', w: 0.16, h: 0.2, d: 0.16, y: PL + 1.4, color: WOOD, rough: 0.8 },
      { k: 'roof', type: 'cone', w: 0.24, y: PL + 1.6, height: 0.2, color: CONE_B },
      { k: 'box', w: 0.5, h: 0.03, d: 0.44, y: PL + 0.64, color: DARKWOOD },
    ],
  },

  // 11. 하프팀버 여관 (선술집)
  medieval_tavern: {
    label: '선술집',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.48, d: 0.46, color: STONE2 },
      { k: 'box', w: 0.48, h: 0.5, d: 0.46, y: PL, color: STONE, rough: 0.85, windows: { from: 0.4, to: 0.8, color: 'glassWarm', glow: 0.35 } },
      { k: 'box', w: 0.52, h: 0.44, d: 0.5, y: PL + 0.5, color: PLASTER, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.35 } },
      { k: 'box', w: 0.5, h: 0.4, d: 0.48, y: PL + 0.94, color: PLASTER2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.35 } },
      { k: 'roof', type: 'pyramid', w: 0.58, d: 0.56, y: PL + 1.34, height: 0.26, color: CONE_R },
      ...ribs(0.52, 0.5, 0.44, PL + 0.5, 5, DARKWOOD, 0.022),
      { k: 'box', w: 0.53, h: 0.03, d: 0.51, y: PL + 0.92, color: DARKWOOD },
      { k: 'box', w: 0.1, h: 0.4, d: 0.1, x: 0.18, z: -0.12, y: PL + 1.34, color: STONE2, detail: true },
      // 매달린 간판
      { k: 'box', w: 0.02, h: 0.16, d: 0.12, x: 0.24, z: 0.24, y: PL + 0.5, color: DARKWOOD },
      { k: 'panel', w: 0.14, h: 0.14, pos: [0.24, PL + 0.44, 0.24 + 0.008], color: GOLD, glow: 0.25 },
      { k: 'storefront', w: 0.48, d: 0.46, faceH: 0.28, awning: DARKWOOD, sign: BANNER_R },
    ],
  },

  // 12. 장원 + 모서리 원뿔탑
  medieval_manor: {
    label: '장원 저택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.46, color: STONE2 },
      { k: 'box', w: 0.64, h: 0.9, d: 0.46, y: PL, color: PLASTER, rough: 0.8, windows: { from: 0.15, to: 0.85, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.72, d: 0.54, y: PL + 0.9, height: 0.24, color: CONE_R },
      ...ribs(0.64, 0.46, 0.9, PL, 6, DARKWOOD, 0.02),
      { k: 'box', w: 0.65, h: 0.03, d: 0.47, y: PL + 0.46, color: DARKWOOD },
      // 좌측 모서리 원뿔탑
      { k: 'box', w: 0.2, h: 1.3, d: 0.2, x: -0.28, z: 0.08, y: PL, color: STONE, rough: 0.85 },
      ...spire(-0.28, 0.08, PL + 1.3, 0.26, 3, 0.12, CONE_B),
      // 굴뚝
      { k: 'box', w: 0.08, h: 0.4, d: 0.08, x: 0.2, z: -0.1, y: PL + 0.9, color: STONE2, detail: true },
      { k: 'panel', w: 0.14, h: 0.3, pos: [0.05, PL + 0.16, 0.24 + 0.006], color: DARKWOOD },
    ],
  },

  // 13. 좁은 하프팀버 3층
  medieval_halftimber_house: {
    label: '하프팀버 주택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.42, color: STONE2 },
      { k: 'box', w: 0.4, h: 0.44, d: 0.42, y: PL, color: STONE, rough: 0.85 },
      { k: 'box', w: 0.44, h: 0.42, d: 0.46, y: PL + 0.44, color: PLASTER, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.48, h: 0.4, d: 0.5, y: PL + 0.86, color: PLASTER2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.58, y: PL + 1.26, height: 0.28, color: CONE_R },
      { k: 'box', w: 0.07, h: 0.34, d: 0.07, x: 0.16, z: -0.12, y: PL + 1.26, color: STONE2, detail: true },
      // 하프팀버 격자(가로+세로+대각)
      ...ribs(0.44, 0.46, 0.42, PL + 0.44, 4, DARKWOOD, 0.022),
      ...ribs(0.48, 0.5, 0.4, PL + 0.86, 4, DARKWOOD, 0.022),
      { k: 'box', w: 0.45, h: 0.03, d: 0.47, y: PL + 0.84, color: DARKWOOD },
      { k: 'box', w: 0.49, h: 0.03, d: 0.51, y: PL + 1.24, color: DARKWOOD },
      { k: 'panel', w: 0.12, h: 0.28, pos: [0, PL + 0.16, 0.22 + 0.006], color: DARKWOOD },
    ],
  },

  // 14. 약재상
  medieval_apothecary: {
    label: '약재상',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: STONE2 },
      { k: 'box', w: 0.42, h: 0.5, d: 0.42, y: PL, color: STONE, rough: 0.85, windows: { from: 0.5, to: 0.85, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.44, h: 0.44, d: 0.44, y: PL + 0.5, color: PLASTER, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.42, h: 0.38, d: 0.42, y: PL + 0.94, color: PLASTER2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.5, y: PL + 1.32, height: 0.28, color: CONE_R },
      ...ribs(0.44, 0.44, 0.44, PL + 0.5, 4, DARKWOOD, 0.022),
      { k: 'storefront', w: 0.42, d: 0.42, faceH: 0.34, awning: '#2E5A4A', sign: GOLD },
      // 매달린 절구 간판
      { k: 'box', w: 0.02, h: 0.14, d: 0.1, x: 0.2, z: 0.22, y: PL + 0.5, color: DARKWOOD },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0.2, PL + 0.46, 0.22 + 0.008], color: '#2E7D4F', glow: 0.3 },
    ],
  },

  // 15. 대장간
  medieval_blacksmith: {
    label: '대장간',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: STONE2 },
      { k: 'box', w: 0.5, h: 0.7, d: 0.44, y: PL, color: STONE, rough: 0.88 },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.5, y: PL + 0.7, height: 0.2, color: DARKWOOD },
      { k: 'box', w: 0.14, h: 0.8, d: 0.14, x: 0.16, z: -0.08, y: PL + 0.7, color: STONE2 },
      { k: 'box', w: 0.16, h: 0.06, d: 0.16, x: 0.16, z: -0.08, y: PL + 1.5, color: STONE, detail: true },
      { k: 'panel', w: 0.28, h: 0.44, pos: [-0.06, PL + 0.24, 0.22 + 0.006], color: '#1A120A' },
      { k: 'panel', w: 0.16, h: 0.14, pos: [0.12, PL + 0.4, 0.22 + 0.008], color: '#E07A30', glow: 0.6 },
      { k: 'box', w: 0.1, h: 0.16, d: 0.1, x: -0.06, z: 0.26, y: PL, color: STONE2, detail: true },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.2, awning: DARKWOOD, sign: GOLD },
    ],
  },

  // 16. 제빵소
  medieval_bakery: {
    label: '제빵소',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.42, color: STONE2 },
      { k: 'box', w: 0.44, h: 0.6, d: 0.42, y: PL, color: PLASTER, rough: 0.8, windows: { from: 0.45, to: 0.82, color: 'glassWarm', glow: 0.32 } },
      { k: 'box', w: 0.42, h: 0.44, d: 0.4, y: PL + 0.6, color: PLASTER2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.32 } },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.48, y: PL + 1.04, height: 0.24, color: CONE_R },
      { k: 'box', w: 0.13, h: 0.5, d: 0.13, x: -0.14, z: -0.08, y: PL + 1.04, color: '#B85A3A' },
      { k: 'box', w: 0.15, h: 0.06, d: 0.15, x: -0.14, z: -0.08, y: PL + 1.54, color: '#8A4030', detail: true },
      ...ribs(0.42, 0.4, 0.44, PL + 0.6, 4, DARKWOOD, 0.02),
      { k: 'storefront', w: 0.44, d: 0.42, faceH: 0.34, awning: '#B8863B', sign: DARKWOOD },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0, PL + 0.48, 0.22 + 0.008], color: GOLD, glow: 0.25 },
    ],
  },

  // 17. 물레방아
  medieval_watermill: {
    label: '물레방아',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.46, color: STONE2 },
      { k: 'box', w: 0.42, h: 0.7, d: 0.42, y: PL, color: PLASTER, rough: 0.8, windows: { from: 0.3, to: 0.75, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.38, h: 0.44, d: 0.38, y: PL + 0.7, color: PLASTER2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.5, y: PL + 1.14, height: 0.26, color: CONE_R },
      ...ribs(0.42, 0.42, 0.7, PL, 4, DARKWOOD, 0.02),
      { k: 'box', w: 0.43, h: 0.03, d: 0.43, y: PL + 0.68, color: DARKWOOD },
      // 물레바퀴 + 수로
      { k: 'blades', y: PL + 0.34 },
      { k: 'box', w: 0.5, h: 0.06, d: 0.06, z: 0.24, y: PL, color: STONE2, detail: true },
      { k: 'box', w: 0.08, h: 0.34, d: 0.08, x: -0.16, z: -0.1, y: PL + 0.7, color: STONE2, detail: true },
    ],
  },

  // 18. 우물 + 도브코트 탑 (was well_house LOW → 상향)
  medieval_well_house: {
    label: '우물 도브코트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: STONE2 },
      { k: 'cyl', rt: 0.17, rb: 0.19, h: 0.3, y: PL, color: STONE, seg: 12 },
      // 상부 도브코트(비둘기집) 탑
      { k: 'box', w: 0.04, h: 0.44, d: 0.04, x: -0.13, z: -0.13, y: PL + 0.3, color: WOOD },
      { k: 'box', w: 0.04, h: 0.44, d: 0.04, x: 0.13, z: -0.13, y: PL + 0.3, color: WOOD },
      { k: 'box', w: 0.04, h: 0.44, d: 0.04, x: -0.13, z: 0.13, y: PL + 0.3, color: WOOD },
      { k: 'box', w: 0.04, h: 0.44, d: 0.04, x: 0.13, z: 0.13, y: PL + 0.3, color: WOOD },
      { k: 'box', w: 0.34, h: 0.5, d: 0.34, y: PL + 0.74, color: PLASTER, rough: 0.8 },
      // 비둘기 구멍(어두운 패널 격자)
      { k: 'panel', w: 0.05, h: 0.05, pos: [-0.08, PL + 1.0, 0.17 + 0.006], color: '#2A1A0E' },
      { k: 'panel', w: 0.05, h: 0.05, pos: [0.08, PL + 1.0, 0.17 + 0.006], color: '#2A1A0E' },
      { k: 'panel', w: 0.05, h: 0.05, pos: [0, PL + 0.88, 0.17 + 0.006], color: '#2A1A0E' },
      { k: 'roof', type: 'pyramid', w: 0.44, d: 0.44, y: PL + 1.24, height: 0.24, color: CONE_B },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, y: PL + 1.48, color: GOLD, detail: true },
      // 우물 지붕 소형(도르래)
      { k: 'box', w: 0.24, h: 0.03, d: 0.03, z: 0.2, y: PL + 0.62, color: WOOD, detail: true },
    ],
  },

  // 19. 3층 연립 (cottage_row LOW → 상향)
  medieval_cottage_row: {
    label: '연립주택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.42, color: STONE2 },
      // 3연립(폭 분절, 높이 다름)
      { k: 'box', w: 0.22, h: 1.0, d: 0.42, x: -0.23, y: PL, color: PLASTER, rough: 0.8, windows: { from: 0.15, to: 0.85, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.22, h: 1.2, d: 0.42, x: 0, y: PL, color: STONE, rough: 0.85, windows: { from: 0.12, to: 0.88, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.22, h: 1.1, d: 0.42, x: 0.23, y: PL, color: PLASTER2, rough: 0.8, windows: { from: 0.14, to: 0.86, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.24, h: 0.14, d: 0.46, x: -0.23, y: PL + 1.0, color: CONE_R },
      { k: 'box', w: 0.24, h: 0.16, d: 0.46, x: 0, y: PL + 1.2, color: CONE_B },
      { k: 'box', w: 0.24, h: 0.14, d: 0.46, x: 0.23, y: PL + 1.1, color: DARKWOOD },
      // 하프팀버 트림
      { k: 'box', w: 0.09, h: 0.34, d: 0.09, x: 0.1, z: -0.12, y: PL + 1.2, color: STONE2, detail: true },
      { k: 'panel', w: 0.5, h: 0.03, pos: [0, PL + 0.5, 0.21 + 0.006], color: DARKWOOD },
    ],
  },

  // 20. 예배당 (게이블 + 벨코트 + 원형 앱스)
  medieval_chapel: {
    label: '예배당',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.56, color: STONE2 },
      { k: 'box', w: 0.44, h: 0.9, d: 0.56, y: PL, color: STONE, rough: 0.85, windows: { from: 0.25, to: 0.7, color: '#3A2A4A', glow: 0.15 } },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.62, y: PL + 0.9, height: 0.3, color: CONE_B },
      ...ribs(0.44, 0.56, 0.9, PL, 3, STONE2, 0.02),
      // 후면 원형 앱스(반원 볼트)
      { k: 'cyl', rt: 0.22, rb: 0.22, h: 0.6, y: PL, color: STONE, seg: 12 },
      { k: 'roof', type: 'dome', w: 0.42, y: PL + 0.6, color: CONE_B },
      // 정면 벨코트(종 아치)
      { k: 'box', w: 0.28, h: 0.34, d: 0.06, z: 0.28, y: PL + 0.9, color: STONE, rough: 0.85 },
      { k: 'panel', w: 0.1, h: 0.16, pos: [0, PL + 1.06, 0.31 + 0.006], color: '#2A1A0E' },
      { k: 'box', w: 0.05, h: 0.06, d: 0.02, z: 0.28, y: PL + 1.06, color: DARKWOOD, detail: true },
      { k: 'cross', y: PL + 1.34, z: 0.28, color: GOLD, s: 0.4 },
      { k: 'panel', w: 0.18, h: 0.18, pos: [0, PL + 0.62, 0.28 + 0.006], color: BANNER_B, glow: 0.3 },
      { k: 'panel', w: 0.12, h: 0.3, pos: [0, PL + 0.18, 0.28 + 0.006], color: DARKWOOD },
    ],
  },
} satisfies Record<string, BuildingConfig>
