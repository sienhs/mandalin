import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, bands, steps } from './_detail'

/**
 * T6 산토리니 (santorini) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 전부 2~3층 상향(min ~1.3)
 * 팔레트: 백벽 #F2F0EA, 블루돔 #2A6FB0·#1E5C99, 테라코타 #C56A3E, 목재 #7A5A3A, 바다 #3FA9C9.
 *
 * 매스: bluedome_church=백벽+대형 블루돔+종벽 / lighthouse=원통 등대 / windmill=원통+원뿔+날개 /
 *  three_bells=계단식 종벽 / boutique_hotel=적층 큐브+돔 / cliff_villa=계단식 큐브 4단 /
 *  cave_house=배럴볼트 연속 / stepped_apartment=후퇴 세트백 / villa_pool=L+인피니티풀 /
 *  cityhall=열주+시계+돔 / bell_tower=사각 종탑+돔 / chapel=드럼+돔 / museum=와이드 열주+라운드 /
 *  gallery=드럼+돔 채광 / winery=배럴 저장고 / taverna=2층+테라스 / bakery=2층+테라코타돔 /
 *  gift_shop=코너 2층 / gelato=돔 전망카페 타워 / cafe_terrace=계단식 테라스 카페
 */

const WHITE = '#F2F0EA'
const WHITE2 = '#E6E2D6'
const DOME = '#2A6FB0'
const DOME2 = '#1E5C99'
const TERRA = '#C56A3E'
const WOOD = '#7A5A3A'
const SEA = '#3FA9C9'
const DOOR = '#1E5C99'
const GOLD = '#C9A24B'
const PINK = '#E48ABF'

export const SANTORINI = {
  // 1. 블루돔 교회
  santorini_bluedome_church: {
    label: '블루돔 교회',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.54, d: 0.54, color: WHITE2 },
      { k: 'box', w: 0.48, h: 0.8, d: 0.48, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.2, to: 0.6, color: DOOR, glow: 0.15 } },
      ...steps(0.24, PL, 0.25, WHITE2, 3),
      // 드럼 + 대형 파란 돔
      { k: 'cyl', rt: 0.2, rb: 0.22, h: 0.26, y: PL + 0.8, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.22, rb: 0.22, h: 0.03, y: PL + 0.9, color: DOME2, seg: 16, detail: true },
      { k: 'roof', type: 'dome', w: 0.62, y: PL + 1.06, color: DOME },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 1.28, color: WHITE },
      { k: 'cross', y: PL + 1.44, color: WHITE, s: 0.4 },
      // 앞 종벽(3아치)
      { k: 'box', w: 0.34, h: 0.4, d: 0.06, z: 0.24, y: PL + 0.8, color: WHITE, rough: 0.85 },
      { k: 'panel', w: 0.08, h: 0.14, pos: [-0.1, PL + 0.98, 0.27 + 0.006], color: DOOR },
      { k: 'panel', w: 0.08, h: 0.14, pos: [0.1, PL + 0.98, 0.27 + 0.006], color: DOOR },
      { k: 'panel', w: 0.16, h: 0.3, pos: [0, PL + 0.24, 0.24 + 0.006], color: DOOR },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0, PL + 0.62, 0.24 + 0.006], color: SEA, glow: 0.15 },
    ],
  },

  // 2. 원통 등대
  santorini_lighthouse: {
    label: '등대',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.46, color: WHITE2 },
      { k: 'box', w: 0.38, h: 0.4, d: 0.38, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.3, to: 0.7, color: SEA, glow: 0.28 } },
      { k: 'cyl', rt: 0.1, rb: 0.17, h: 1.5, y: PL + 0.4, color: WHITE, seg: 14 },
      { k: 'cyl', rt: 0.14, rb: 0.14, h: 0.05, y: PL + 0.9, color: DOME, seg: 14, detail: true },
      { k: 'cyl', rt: 0.13, rb: 0.11, h: 0.18, y: PL + 1.9, color: WHITE2, seg: 12 },
      { k: 'box', w: 0.22, h: 0.16, d: 0.22, y: PL + 2.0, color: GOLD, emissive: true },
      { k: 'roof', type: 'cone', w: 0.32, y: PL + 2.16, height: 0.18, color: DOME },
      { k: 'panel', w: 0.12, h: 0.5, pos: [0, PL + 0.95, 0.14 + 0.006], color: SEA, glow: 0.2 },
      { k: 'panel', w: 0.14, h: 0.26, pos: [0, PL + 0.16, 0.19 + 0.006], color: DOOR },
    ],
  },

  // 3. 원통 풍차
  santorini_windmill: {
    label: '풍차',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: WHITE2 },
      { k: 'cyl', rt: 0.17, rb: 0.24, h: 1.2, y: PL, color: WHITE, seg: 14 },
      { k: 'cyl', rt: 0.2, rb: 0.2, h: 0.04, y: PL + 0.5, color: WHITE2, seg: 14, detail: true },
      { k: 'cyl', rt: 0.19, rb: 0.19, h: 0.1, y: PL + 1.2, color: WOOD, seg: 14 },
      { k: 'roof', type: 'cone', w: 0.44, y: PL + 1.3, height: 0.24, color: DOME },
      { k: 'blades', y: PL + 1.2 },
      { k: 'panel', w: 0.06, h: 0.12, pos: [0, PL + 0.6, 0.19 + 0.006], color: DOOR },
      { k: 'panel', w: 0.06, h: 0.12, pos: [0, PL + 0.9, 0.18 + 0.006], color: DOOR },
    ],
  },

  // 4. 계단식 종벽 (세 개의 종)
  santorini_three_bells: {
    label: '세 개의 종',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.58, d: 0.34, color: WHITE2 },
      { k: 'box', w: 0.52, h: 0.7, d: 0.2, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.2, to: 0.6, color: DOOR, glow: 0.15 } },
      { k: 'box', w: 0.52, h: 0.4, d: 0.16, y: PL + 0.7, color: WHITE, rough: 0.85 },
      { k: 'box', w: 0.26, h: 0.24, d: 0.16, y: PL + 1.1, color: WHITE, rough: 0.85 },
      // 세 아치 종 + 종
      { k: 'panel', w: 0.1, h: 0.2, pos: [-0.17, PL + 0.86, 0.1 + 0.006], color: DOOR },
      { k: 'panel', w: 0.1, h: 0.2, pos: [0, PL + 0.86, 0.1 + 0.006], color: DOOR },
      { k: 'panel', w: 0.1, h: 0.2, pos: [0.17, PL + 0.86, 0.1 + 0.006], color: DOOR },
      { k: 'box', w: 0.05, h: 0.07, d: 0.03, x: -0.17, y: PL + 0.86, color: WOOD, detail: true },
      { k: 'box', w: 0.05, h: 0.07, d: 0.03, x: 0, y: PL + 0.86, color: WOOD, detail: true },
      { k: 'box', w: 0.05, h: 0.07, d: 0.03, x: 0.17, y: PL + 0.86, color: WOOD, detail: true },
      { k: 'cross', y: PL + 1.34, z: 0, color: WOOD, s: 0.35 },
      { k: 'panel', w: 0.14, h: 0.28, pos: [0, PL + 0.24, 0.1 + 0.006], color: DOOR },
    ],
  },

  // 5. 적층 큐브 + 돔 부티크 호텔
  santorini_boutique_hotel: {
    label: '부티크 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.5, color: WHITE2 },
      { k: 'box', w: 0.6, h: 0.5, d: 0.5, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.3, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.46, h: 0.44, d: 0.42, y: PL + 0.5, color: WHITE, rough: 0.85, windows: { from: 0.25, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.32, h: 0.4, d: 0.34, y: PL + 0.94, color: WHITE2, rough: 0.85 },
      // 파란 돔
      { k: 'cyl', rt: 0.13, rb: 0.14, h: 0.1, y: PL + 1.34, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.42, y: PL + 1.44, color: DOME },
      { k: 'parapet', w: 0.6, d: 0.5, y: PL + 0.5, color: WHITE },
      { k: 'parapet', w: 0.46, d: 0.42, y: PL + 0.94, color: WHITE },
      { k: 'parasol', pos: [0.2, PL + 0.5, 0.16], color: SEA },
      { k: 'parasol', pos: [-0.16, PL + 0.94, 0.1], color: TERRA },
      ...bands(0.6, 0.5, [PL + 0.25], DOME2),
      { k: 'panel', w: 0.12, h: 0.24, pos: [0.16, PL + 0.14, 0.25 + 0.006], color: DOOR },
    ],
  },

  // 6. 계단식 큐브 4단 절벽 빌라
  santorini_cliff_villa: {
    label: '절벽 빌라',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.46, color: WHITE2 },
      { k: 'box', w: 0.64, h: 0.4, d: 0.46, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.35, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.5, h: 0.36, d: 0.44, x: -0.07, y: PL + 0.4, color: WHITE2, rough: 0.85, windows: { from: 0.35, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.36, h: 0.34, d: 0.42, x: -0.14, y: PL + 0.76, color: WHITE, rough: 0.85, windows: { from: 0.35, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.24, h: 0.32, d: 0.4, x: -0.2, y: PL + 1.1, color: WHITE2, rough: 0.85 },
      { k: 'parapet', w: 0.64, d: 0.46, y: PL + 0.4, color: WHITE },
      { k: 'box', w: 0.5, h: 0.05, d: 0.44, x: -0.07, y: PL + 0.76, color: WHITE },
      { k: 'box', w: 0.05, h: 0.05, d: 0.05, x: 0.28, y: PL + 0.4, color: DOME, detail: true },
      { k: 'panel', w: 0.1, h: 0.2, pos: [0.24, PL + 0.13, 0.23 + 0.006], color: DOOR },
      { k: 'panel', w: 0.1, h: 0.18, pos: [0.06, PL + 0.52, 0.22 + 0.006], color: DOOR },
      { k: 'parasol', pos: [0.24, PL + 0.4, 0.14], color: SEA },
    ],
  },

  // 7. 배럴볼트 연속 동굴집
  santorini_cave_house: {
    label: '동굴집',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.5, color: WHITE2 },
      { k: 'box', w: 0.56, h: 0.44, d: 0.5, y: PL, color: WHITE, rough: 0.85 },
      { k: 'roof', type: 'round', w: 0.6, d: 0.54, y: PL + 0.44, color: WHITE },
      { k: 'box', w: 0.38, h: 0.34, d: 0.44, x: -0.07, y: PL + 0.44, color: WHITE, rough: 0.85 },
      { k: 'roof', type: 'round', w: 0.42, d: 0.48, y: PL + 0.78, color: WHITE2 },
      { k: 'box', w: 0.22, h: 0.3, d: 0.38, x: -0.14, y: PL + 0.78, color: WHITE, rough: 0.85 },
      { k: 'roof', type: 'round', w: 0.26, d: 0.42, y: PL + 1.08, color: WHITE },
      // 아치 문 + 파란 셔터
      { k: 'panel', w: 0.14, h: 0.26, pos: [0.16, PL + 0.15, 0.25 + 0.006], color: DOOR },
      { k: 'panel', w: 0.1, h: 0.16, pos: [-0.16, PL + 0.18, 0.25 + 0.006], color: SEA, glow: 0.15 },
      { k: 'panel', w: 0.08, h: 0.14, pos: [-0.02, PL + 0.56, 0.22 + 0.006], color: DOOR },
      { k: 'parasol', pos: [0.2, PL + 0.44, 0.16], color: TERRA },
    ],
  },

  // 8. 후퇴 세트백 계단식 아파트
  santorini_stepped_apartment: {
    label: '계단식 아파트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.42, color: WHITE2 },
      { k: 'box', w: 0.64, h: 0.44, d: 0.42, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.25, to: 0.82, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.56, h: 0.42, d: 0.36, z: -0.03, y: PL + 0.44, color: WHITE2, rough: 0.85, windows: { from: 0.25, to: 0.82, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.46, h: 0.4, d: 0.32, z: -0.05, y: PL + 0.86, color: WHITE, rough: 0.85, windows: { from: 0.25, to: 0.82, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.34, h: 0.38, d: 0.28, z: -0.07, y: PL + 1.26, color: WHITE2, rough: 0.85 },
      { k: 'parapet', w: 0.64, d: 0.42, y: PL + 0.44, color: WHITE },
      { k: 'box', w: 0.56, h: 0.05, d: 0.36, z: -0.03, y: PL + 0.86, color: WHITE },
      ...bands(0.64, 0.42, [PL + 0.22], DOOR),
      { k: 'parasol', pos: [0.22, PL + 0.44, 0.16], color: SEA },
      { k: 'parasol', pos: [0.16, PL + 0.86, 0.1], color: TERRA },
    ],
  },

  // 9. L + 인피니티풀 빌라
  santorini_villa_pool: {
    label: '풀 빌라',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.48, color: WHITE2 },
      { k: 'box', w: 0.4, h: 0.5, d: 0.48, x: -0.11, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.3, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.4, h: 0.5, d: 0.48, x: -0.11, y: PL + 0.5, color: WHITE, rough: 0.85, windows: { from: 0.3, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'box', w: 0.24, h: 0.4, d: 0.3, x: 0.2, z: -0.08, y: PL, color: WHITE2, rough: 0.85 },
      { k: 'box', w: 0.4, h: 0.05, d: 0.48, x: -0.11, y: PL + 0.5, color: WHITE },
      { k: 'box', w: 0.4, h: 0.05, d: 0.48, x: -0.11, y: PL + 1.0, color: WHITE },
      { k: 'roof', type: 'dome', w: 0.28, y: PL + 1.0, color: DOME },
      // 인피니티 풀
      { k: 'box', w: 0.26, h: 0.05, d: 0.42, x: 0.22, y: PL, color: SEA, emissive: true },
      { k: 'parasol', pos: [0.22, PL + 0.05, 0.12], color: WHITE },
      { k: 'panel', w: 0.1, h: 0.22, pos: [-0.11, PL + 0.14, 0.25 + 0.006], color: DOOR },
      { k: 'panel', w: 0.1, h: 0.18, pos: [-0.11, PL + 0.64, 0.25 + 0.006], color: DOOR },
    ],
  },

  // 10. 열주 + 시계 + 돔 시청
  santorini_cityhall: {
    label: '시청',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.5, color: WHITE2 },
      { k: 'box', w: 0.62, h: 0.9, d: 0.5, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.2, to: 0.8, color: SEA, glow: 0.26 } },
      { k: 'columns', w: 0.62, d: 0.5, y: PL, h: 0.66, count: 6, color: WHITE2 },
      ...steps(0.42, PL, 0.27, WHITE2, 3),
      { k: 'box', w: 0.66, h: 0.06, d: 0.54, y: PL + 0.9, color: WHITE2 },
      { k: 'box', w: 0.24, h: 0.34, d: 0.24, y: PL + 0.96, color: WHITE, rough: 0.85 },
      { k: 'clock', w: 0.24, y: PL + 1.16, color: DOME2 },
      { k: 'cyl', rt: 0.14, rb: 0.14, h: 0.08, y: PL + 1.3, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.36, y: PL + 1.38, color: DOME },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, y: PL + 1.55, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.3, h: 0.08, pos: [0, PL + 0.62, 0.26 + 0.008], color: DOME2 },
    ],
  },

  // 11. 사각 종탑 + 돔
  santorini_bell_tower: {
    label: '종탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.38, d: 0.36, color: WHITE2 },
      { k: 'box', w: 0.32, h: 1.5, d: 0.32, y: PL, color: WHITE, rough: 0.85 },
      ...bands(0.32, 0.32, [PL + 0.5, PL + 1.0], WHITE2),
      { k: 'box', w: 0.36, h: 0.32, d: 0.36, y: PL + 1.5, color: WHITE, rough: 0.85 },
      // 아치 종실
      { k: 'panel', w: 0.16, h: 0.22, pos: [0, PL + 1.62, 0.18 + 0.006], color: DOOR },
      { k: 'cyl', rt: 0.13, rb: 0.14, h: 0.08, y: PL + 1.82, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.4, y: PL + 1.9, color: DOME },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 2.06, color: WHITE },
      { k: 'cross', y: PL + 2.2, color: WHITE, s: 0.35 },
      { k: 'panel', w: 0.08, h: 0.5, pos: [0, PL + 0.7, 0.16 + 0.006], color: SEA, glow: 0.12 },
      { k: 'panel', w: 0.1, h: 0.22, pos: [0, PL + 0.14, 0.16 + 0.006], color: DOOR },
    ],
  },

  // 12. 드럼 + 돔 예배당
  santorini_chapel: {
    label: '예배당',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.46, color: WHITE2 },
      { k: 'box', w: 0.42, h: 0.6, d: 0.42, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.25, to: 0.7, color: DOOR, glow: 0.12 } },
      ...steps(0.22, PL, 0.23, WHITE2, 2),
      { k: 'cyl', rt: 0.15, rb: 0.17, h: 0.14, y: PL + 0.6, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.44, y: PL + 0.74, color: DOME },
      { k: 'cross', y: PL + 1.0, color: WHITE, s: 0.35 },
      // 측면 소돔
      { k: 'box', w: 0.16, h: 0.34, d: 0.16, x: 0.22, z: 0.1, y: PL, color: WHITE, rough: 0.85 },
      { k: 'box', w: 0.18, h: 0.08, d: 0.18, x: 0.22, z: 0.1, y: PL + 0.34, color: DOME },
      { k: 'box', w: 0.28, h: 0.28, d: 0.05, z: 0.22, y: PL + 0.6, color: WHITE, rough: 0.85 },
      { k: 'panel', w: 0.08, h: 0.12, pos: [0, PL + 0.72, 0.25 + 0.006], color: DOOR },
      { k: 'panel', w: 0.12, h: 0.24, pos: [0, PL + 0.16, 0.22 + 0.006], color: DOOR },
    ],
  },

  // 13. 와이드 열주 + 라운드 미술관
  santorini_museum: {
    label: '미술관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.5, color: WHITE2 },
      { k: 'box', w: 0.66, h: 0.8, d: 0.5, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.3, to: 0.75, color: SEA, glow: 0.24 } },
      { k: 'columns', w: 0.66, d: 0.5, y: PL, h: 0.6, count: 7, color: WHITE2 },
      ...steps(0.44, PL, 0.27, WHITE2, 3),
      { k: 'box', w: 0.4, h: 0.2, d: 0.4, y: PL + 0.8, color: WHITE, rough: 0.85 },
      { k: 'roof', type: 'round', w: 0.7, d: 0.54, y: PL + 0.8, color: WHITE2 },
      { k: 'cyl', rt: 0.15, rb: 0.16, h: 0.1, y: PL + 1.0, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.4, y: PL + 1.1, color: DOME },
      { k: 'panel', w: 0.34, h: 0.1, pos: [0, PL + 0.62, 0.26 + 0.008], color: DOME2 },
    ],
  },

  // 14. 드럼 + 돔 채광 갤러리
  santorini_gallery: {
    label: '갤러리',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.48, color: WHITE2 },
      { k: 'box', w: 0.52, h: 0.9, d: 0.48, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.3, to: 0.78, color: SEA, glow: 0.26 } },
      ...ribs(0.52, 0.48, 0.9, PL, 5, WHITE2, 0.02),
      { k: 'cyl', rt: 0.16, rb: 0.18, h: 0.12, y: PL + 0.9, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.44, y: PL + 1.02, color: DOME },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, y: PL + 1.32, color: WHITE },
      { k: 'storefront', w: 0.52, d: 0.48, faceH: 0.32, awning: DOME, sign: WHITE },
      { k: 'panel', w: 0.36, h: 0.1, pos: [0, PL + 0.7, 0.24 + 0.008], color: DOME2 },
    ],
  },

  // 15. 배럴 저장고 와이너리
  santorini_winery: {
    label: '와이너리',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.48, color: WHITE2 },
      { k: 'box', w: 0.6, h: 0.56, d: 0.48, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.3, to: 0.75, color: SEA, glow: 0.24 } },
      { k: 'roof', type: 'round', w: 0.64, d: 0.52, y: PL + 0.56, color: TERRA },
      { k: 'box', w: 0.4, h: 0.4, d: 0.4, y: PL + 0.62, color: WHITE, rough: 0.85 },
      { k: 'roof', type: 'round', w: 0.44, d: 0.44, y: PL + 1.02, color: TERRA },
      // 아치 저장고 입구
      { k: 'panel', w: 0.2, h: 0.3, pos: [0, PL + 0.18, 0.24 + 0.006], color: '#4A2A18' },
      { k: 'box', w: 0.1, h: 0.14, d: 0.1, x: -0.22, z: 0.24, y: PL, color: '#6E3A28', detail: true },
      { k: 'box', w: 0.1, h: 0.14, d: 0.1, x: 0.22, z: 0.24, y: PL, color: '#6E3A28', detail: true },
      { k: 'storefront', w: 0.4, d: 0.48, faceH: 0.28, awning: '#6E2A2A', sign: GOLD },
    ],
  },

  // 16. 2층 + 테라스 타베르나
  santorini_taverna: {
    label: '타베르나',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: WHITE2 },
      { k: 'box', w: 0.5, h: 0.5, d: 0.44, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.45, to: 0.82, color: SEA, glow: 0.28 } },
      { k: 'box', w: 0.42, h: 0.42, d: 0.4, z: -0.02, y: PL + 0.5, color: WHITE2, rough: 0.85, windows: { from: 0.2, to: 0.8, color: SEA, glow: 0.28 } },
      { k: 'roof', type: 'round', w: 0.46, d: 0.44, y: PL + 0.92, color: SEA },
      { k: 'parapet', w: 0.5, d: 0.44, y: PL + 0.5, color: WHITE },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.3, awning: DOME, sign: WHITE },
      { k: 'parasol', pos: [0.16, PL + 0.5, 0.12], color: DOME },
      { k: 'parasol', pos: [-0.14, PL + 0.5, -0.1], color: TERRA },
      { k: 'panel', w: 0.34, h: 0.08, pos: [0, PL + 0.4, 0.23 + 0.008], color: DOME2 },
    ],
  },

  // 17. 2층 + 테라코타돔 베이커리
  santorini_bakery: {
    label: '베이커리',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.44, color: WHITE2 },
      { k: 'box', w: 0.46, h: 0.5, d: 0.44, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.45, to: 0.82, color: SEA, glow: 0.28 } },
      { k: 'box', w: 0.4, h: 0.44, d: 0.4, y: PL + 0.5, color: WHITE2, rough: 0.85, windows: { from: 0.2, to: 0.8, color: SEA, glow: 0.28 } },
      { k: 'cyl', rt: 0.14, rb: 0.15, h: 0.1, y: PL + 0.94, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.36, y: PL + 1.04, color: TERRA },
      { k: 'parapet', w: 0.46, d: 0.44, y: PL + 0.5, color: WHITE },
      { k: 'storefront', w: 0.46, d: 0.44, faceH: 0.32, awning: TERRA, sign: DOME2 },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0, PL + 0.54, 0.23 + 0.008], color: GOLD, glow: 0.2 },
    ],
  },

  // 18. 코너 2층 기념품점
  santorini_gift_shop: {
    label: '기념품점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.42, color: WHITE2 },
      { k: 'box', w: 0.44, h: 0.5, d: 0.42, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.45, to: 0.82, color: SEA, glow: 0.3 } },
      { k: 'box', w: 0.4, h: 0.44, d: 0.38, y: PL + 0.5, color: WHITE, rough: 0.85, windows: { from: 0.2, to: 0.8, color: SEA, glow: 0.3 } },
      // 코너 라운드 계단탑
      { k: 'box', w: 0.18, h: 1.0, d: 0.18, x: 0.2, z: 0.16, y: PL, color: WHITE2, rough: 0.85 },
      { k: 'box', w: 0.2, h: 0.1, d: 0.2, x: 0.2, z: 0.16, y: PL + 1.0, color: DOME },
      { k: 'parapet', w: 0.4, d: 0.38, y: PL + 0.94, color: WHITE },
      { k: 'storefront', w: 0.44, d: 0.42, faceH: 0.3, awning: SEA, sign: TERRA },
      { k: 'parasol', pos: [-0.12, PL + 0.5, 0.1], color: TERRA },
      { k: 'panel', w: 0.08, h: 0.18, pos: [-0.14, PL + 0.14, 0.21 + 0.006], color: DOOR },
    ],
  },

  // 19. 돔 전망카페 타워 (was gelato → CC)
  santorini_gelato: {
    label: '돔 전망카페',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.4, color: WHITE2 },
      { k: 'box', w: 0.42, h: 0.5, d: 0.4, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.4, to: 0.82, color: SEA, glow: 0.3 } },
      { k: 'box', w: 0.3, h: 0.6, d: 0.3, y: PL + 0.5, color: WHITE2, rough: 0.85, windows: { from: 0.15, to: 0.85, color: SEA, glow: 0.3 } },
      { k: 'cyl', rt: 0.18, rb: 0.16, h: 0.16, y: PL + 1.1, color: WHITE, seg: 14 },
      // 핑크 전망 돔
      { k: 'roof', type: 'dome', w: 0.5, y: PL + 1.26, color: PINK },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, y: PL + 1.46, color: WHITE },
      { k: 'storefront', w: 0.42, d: 0.4, faceH: 0.28, awning: PINK, sign: WHITE },
      { k: 'parasol', pos: [0.14, PL + 0.5, 0.1], color: PINK },
      { k: 'panel', w: 0.24, h: 0.08, pos: [0, PL + 0.4, 0.21 + 0.008], color: SEA, glow: 0.3 },
    ],
  },

  // 20. 계단식 테라스 카페
  santorini_cafe_terrace: {
    label: '카페 테라스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.44, color: WHITE2 },
      { k: 'box', w: 0.56, h: 0.5, d: 0.44, y: PL, color: WHITE, rough: 0.85, windows: { from: 0.45, to: 0.82, color: SEA, glow: 0.28 } },
      { k: 'box', w: 0.42, h: 0.44, d: 0.4, x: -0.07, y: PL + 0.5, color: WHITE2, rough: 0.85, windows: { from: 0.2, to: 0.8, color: SEA, glow: 0.28 } },
      { k: 'box', w: 0.28, h: 0.4, d: 0.36, x: -0.14, y: PL + 0.94, color: WHITE, rough: 0.85 },
      { k: 'parapet', w: 0.56, d: 0.44, y: PL + 0.5, color: WHITE },
      { k: 'box', w: 0.42, h: 0.05, d: 0.4, x: -0.07, y: PL + 0.94, color: WHITE },
      { k: 'box', w: 0.22, h: 0.1, d: 0.22, x: -0.14, y: PL + 1.34, color: DOME },
      { k: 'storefront', w: 0.56, d: 0.44, faceH: 0.3, awning: SEA, sign: DOME2 },
      { k: 'parasol', pos: [0.2, PL + 0.5, 0.14], color: TERRA },
      { k: 'parasol', pos: [0.1, PL + 0.94, 0.08], color: SEA },
    ],
  },
} satisfies Record<string, BuildingConfig>
