import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, bands } from './_detail'

/**
 * T8 열대 리조트 (tropical) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 전부 2층+ 상향(min ~1.2)
 * 팔레트: 짚지붕 #B98A4B, 대나무/목재 #8A6A3A, 백벽 #F2ECDD, 터콰이즈 #2FBFB3, 팜그린 #2E7D4F.
 *
 * 매스: resort=발코니 타워+짚크라운 / lighthouse=원통 등대 / tiki_totem=적층 토템 / marina=타워+짚콘 /
 *  atrium=대형 이중 짚콘 / treehouse=줄기+오두막 / watchtower=다리+헤드 / overwater=스틸트+수면 /
 *  villa=2층+풀 / spa=파빌리온+연못 / restaurant=긴 게이블 / tiki_bar=2층 바+횃불 / dive=2층 청록 /
 *  cabana=개방 2층 / chapel=채플+십자 / market=2층 아케이드 / juice=주스 타워 / surf=2층+보드 /
 *  ice_cream=핑크콘 / gazebo=밴드스탠드
 */

const THATCH = '#B98A4B'
const THATCH2 = '#A5763A'
const BAMBOO = '#8A6A3A'
const BAMBOO2 = '#A6824A'
const WHITE = '#F2ECDD'
const TURQ = '#2FBFB3'
const PALM = '#2E7D4F'
const SAND = '#E8D6A8'
const WOOD = '#6E4A2A'
const ORANGE = '#E07A30'

export const TROPICAL = {
  // 1. 발코니 타워 + 짚 크라운 리조트
  tropical_resort_tower: {
    label: '비치 리조트 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.5, color: SAND },
      { k: 'box', w: 0.5, h: 1.7, d: 0.44, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.1, to: 0.92, color: TURQ, glow: 0.28 } },
      { k: 'balconies', w: 0.5, d: 0.44, y0: PL + 0.25, y1: PL + 1.55, floors: 8, color: BAMBOO },
      ...bands(0.5, 0.44, [PL + 0.6, PL + 1.2], PALM),
      { k: 'roof', type: 'cone', w: 0.64, y: PL + 1.7, height: 0.36, color: THATCH },
      { k: 'cyl', rt: 0.2, rb: 0.2, h: 0.04, y: PL + 1.7, color: THATCH2, seg: 12, detail: true },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.3, awning: TURQ, sign: WHITE },
      { k: 'box', w: 0.04, h: 0.5, d: 0.04, x: -0.28, z: 0.2, y: PL, color: PALM, detail: true },
      { k: 'box', w: 0.16, h: 0.14, d: 0.16, x: -0.28, z: 0.2, y: PL + 0.5, color: PALM, detail: true },
    ],
  },

  // 2. 원통 등대
  tropical_lighthouse: {
    label: '등대',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: SAND },
      { k: 'box', w: 0.36, h: 0.34, d: 0.36, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.3, to: 0.7, color: TURQ, glow: 0.28 } },
      { k: 'cyl', rt: 0.1, rb: 0.17, h: 1.5, y: PL + 0.34, color: WHITE, seg: 14 },
      { k: 'cyl', rt: 0.14, rb: 0.14, h: 0.05, y: PL + 0.8, color: TURQ, seg: 14, detail: true },
      { k: 'cyl', rt: 0.14, rb: 0.14, h: 0.05, y: PL + 1.3, color: TURQ, seg: 14, detail: true },
      { k: 'cyl', rt: 0.14, rb: 0.12, h: 0.18, y: PL + 1.84, color: BAMBOO, seg: 12 },
      { k: 'box', w: 0.22, h: 0.14, d: 0.22, y: PL + 1.94, color: '#FFE08A', emissive: true },
      { k: 'roof', type: 'cone', w: 0.34, y: PL + 2.08, height: 0.2, color: THATCH },
      { k: 'panel', w: 0.1, h: 0.5, pos: [0, PL + 0.9, 0.14 + 0.006], color: TURQ, glow: 0.18 },
    ],
  },

  // 3. 적층 토템
  tropical_tiki_totem: {
    label: '티키 토템',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: SAND },
      { k: 'box', w: 0.3, h: 0.44, d: 0.3, y: PL, color: '#7A4A28', rough: 0.85 },
      { k: 'box', w: 0.34, h: 0.34, d: 0.34, y: PL + 0.44, color: '#6E4224', rough: 0.85 },
      { k: 'box', w: 0.28, h: 0.38, d: 0.28, y: PL + 0.78, color: '#7A4A28', rough: 0.85 },
      { k: 'box', w: 0.32, h: 0.34, d: 0.32, y: PL + 1.16, color: '#6E4224', rough: 0.85 },
      { k: 'box', w: 0.26, h: 0.3, d: 0.26, y: PL + 1.5, color: '#7A4A28', rough: 0.85 },
      { k: 'roof', type: 'cone', w: 0.44, y: PL + 1.8, height: 0.26, color: THATCH },
      // 눈/입/이빨 발광
      { k: 'panel', w: 0.18, h: 0.06, pos: [0, PL + 1.32, 0.17 + 0.006], color: ORANGE, glow: 0.55 },
      { k: 'panel', w: 0.18, h: 0.05, pos: [0, PL + 0.92, 0.15 + 0.006], color: '#FFCC66', glow: 0.45 },
      { k: 'panel', w: 0.16, h: 0.05, pos: [0, PL + 0.56, 0.18 + 0.006], color: ORANGE, glow: 0.4 },
      { k: 'box', w: 0.06, h: 0.06, d: 0.04, x: -0.09, z: 0.15, y: PL + 1.36, color: '#3A2416', detail: true },
      { k: 'box', w: 0.06, h: 0.06, d: 0.04, x: 0.09, z: 0.15, y: PL + 1.36, color: '#3A2416', detail: true },
    ],
  },

  // 4. 마리나 타워
  tropical_marina: {
    label: '마리나 오피스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.46, color: SAND },
      { k: 'box', w: 0.5, h: 1.3, d: 0.46, y: PL, color: WHITE, rough: 0.65, windows: { from: 0.12, to: 0.9, color: TURQ, glow: 0.3 } },
      ...ribs(0.5, 0.46, 1.3, PL, 5, BAMBOO, 0.02),
      { k: 'box', w: 0.34, h: 0.34, d: 0.34, y: PL + 1.3, color: WHITE, rough: 0.65 },
      { k: 'roof', type: 'cone', w: 0.46, y: PL + 1.64, height: 0.26, color: THATCH },
      { k: 'balconies', w: 0.5, d: 0.46, y0: PL + 0.4, y1: PL + 0.9, floors: 2, color: BAMBOO },
      { k: 'box', w: 0.5, h: 0.03, d: 0.02, z: 0.24, y: PL + 0.66, color: TURQ, emissive: true },
      { k: 'storefront', w: 0.5, d: 0.46, faceH: 0.3, awning: '#1E7A72', sign: WHITE },
    ],
  },

  // 5. 대형 이중 짚콘 아트리움
  tropical_atrium: {
    label: '로비 아트리움',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.72, d: 0.58, color: SAND },
      { k: 'box', w: 0.72, h: 0.6, d: 0.58, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.3, to: 0.85, color: TURQ, glow: 0.28 } },
      { k: 'columns', w: 0.72, d: 0.58, y: PL, h: 0.5, count: 7, color: BAMBOO },
      { k: 'box', w: 0.44, h: 0.4, d: 0.44, y: PL + 0.6, color: WHITE, rough: 0.7 },
      { k: 'roof', type: 'cone', w: 0.92, y: PL + 0.6, height: 0.22, color: THATCH2 },
      { k: 'roof', type: 'cone', w: 0.62, y: PL + 1.0, height: 0.44, color: THATCH },
      { k: 'box', w: 0.03, h: 0.16, d: 0.03, y: PL + 1.44, color: WOOD, detail: true },
      { k: 'storefront', w: 0.72, d: 0.58, faceH: 0.34, awning: PALM, sign: WHITE },
    ],
  },

  // 6. 트리하우스
  tropical_treehouse: {
    label: '트리하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.4, color: PALM },
      { k: 'cyl', rt: 0.09, rb: 0.13, h: 0.8, y: PL, color: WOOD, seg: 8 },
      { k: 'box', w: 0.36, h: 0.2, d: 0.36, x: -0.14, z: 0.1, y: PL + 0.4, color: PALM, detail: true },
      { k: 'box', w: 0.3, h: 0.2, d: 0.3, x: 0.16, z: -0.08, y: PL + 0.6, color: '#256A42', detail: true },
      { k: 'box', w: 0.44, h: 0.06, d: 0.44, y: PL + 0.8, color: BAMBOO },
      { k: 'box', w: 0.34, h: 0.4, d: 0.34, y: PL + 0.86, color: WHITE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: TURQ, glow: 0.3 } },
      { k: 'roof', type: 'cone', w: 0.5, y: PL + 1.26, height: 0.3, color: THATCH },
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: 0.14, z: 0.18, y: PL + 0.86, color: WOOD, detail: true },
      { k: 'panel', w: 0.1, h: 0.2, pos: [0, PL + 0.96, 0.17 + 0.006], color: WOOD },
    ],
  },

  // 7. 라이프가드 워치타워
  tropical_watchtower: {
    label: '라이프가드 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: SAND },
      { k: 'box', w: 0.05, h: 0.9, d: 0.05, x: -0.15, z: -0.15, y: PL, color: WOOD },
      { k: 'box', w: 0.05, h: 0.9, d: 0.05, x: 0.15, z: -0.15, y: PL, color: WOOD },
      { k: 'box', w: 0.05, h: 0.9, d: 0.05, x: -0.15, z: 0.15, y: PL, color: WOOD },
      { k: 'box', w: 0.05, h: 0.9, d: 0.05, x: 0.15, z: 0.15, y: PL, color: WOOD },
      { k: 'box', w: 0.34, h: 0.03, d: 0.03, z: 0.15, y: PL + 0.5, color: WOOD },
      { k: 'box', w: 0.42, h: 0.34, d: 0.42, y: PL + 0.9, color: '#D94F4F', rough: 0.7, windows: { from: 0.2, to: 0.8, color: WHITE, glow: 0.2 } },
      { k: 'roof', type: 'cone', w: 0.54, y: PL + 1.24, height: 0.26, color: THATCH },
      { k: 'box', w: 0.44, h: 0.04, d: 0.1, z: 0.24, y: PL + 0.9, color: WOOD },
      { k: 'panel', w: 0.3, h: 0.08, pos: [0, PL + 1.0, 0.21 + 0.008], color: WHITE, glow: 0.2 },
    ],
  },

  // 8. 오버워터 방갈로 (스틸트 + 수면)
  tropical_overwater_bungalow: {
    label: '오버워터 방갈로',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.52, color: TURQ },
      { k: 'box', w: 0.64, h: 0.05, d: 0.54, y: 0, color: TURQ, emissive: true },
      { k: 'box', w: 0.05, h: 0.34, d: 0.05, x: -0.18, z: -0.16, y: PL, color: WOOD },
      { k: 'box', w: 0.05, h: 0.34, d: 0.05, x: 0.18, z: -0.16, y: PL, color: WOOD },
      { k: 'box', w: 0.05, h: 0.34, d: 0.05, x: -0.18, z: 0.16, y: PL, color: WOOD },
      { k: 'box', w: 0.05, h: 0.34, d: 0.05, x: 0.18, z: 0.16, y: PL, color: WOOD },
      { k: 'box', w: 0.56, h: 0.06, d: 0.48, y: PL + 0.34, color: BAMBOO },
      { k: 'box', w: 0.42, h: 0.4, d: 0.38, y: PL + 0.4, color: WHITE, rough: 0.7, windows: { from: 0.25, to: 0.8, color: TURQ, glow: 0.3 } },
      { k: 'box', w: 0.32, h: 0.3, d: 0.3, y: PL + 0.8, color: WHITE, rough: 0.7 },
      { k: 'roof', type: 'cone', w: 0.5, y: PL + 1.1, height: 0.3, color: THATCH },
      { k: 'panel', w: 0.12, h: 0.2, pos: [0, PL + 0.5, 0.19 + 0.006], color: WOOD },
      // 데크 사다리(물로)
      { k: 'box', w: 0.03, h: 0.34, d: 0.03, x: 0.24, z: 0.2, y: PL, color: WOOD, detail: true },
    ],
  },

  // 9. 2층 리조트 빌라 + 풀
  tropical_villa: {
    label: '리조트 빌라',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.48, color: SAND },
      { k: 'box', w: 0.44, h: 0.5, d: 0.48, x: -0.09, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.25, to: 0.8, color: TURQ, glow: 0.28 } },
      { k: 'box', w: 0.44, h: 0.44, d: 0.44, x: -0.09, y: PL + 0.5, color: WHITE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: TURQ, glow: 0.28 } },
      { k: 'roof', type: 'cone', w: 0.58, y: PL + 0.94, height: 0.3, color: THATCH },
      { k: 'box', w: 0.03, h: 0.44, d: 0.03, x: -0.28, z: 0.24, y: PL, color: BAMBOO },
      { k: 'box', w: 0.03, h: 0.44, d: 0.03, x: 0.1, z: 0.24, y: PL, color: BAMBOO },
      // 인피니티 풀
      { k: 'box', w: 0.28, h: 0.04, d: 0.42, x: 0.24, y: PL, color: TURQ, emissive: true },
      { k: 'parasol', pos: [0.24, PL + 0.04, 0.14], color: TURQ },
      { k: 'panel', w: 0.12, h: 0.22, pos: [-0.09, PL + 0.14, 0.25 + 0.006], color: WOOD },
    ],
  },

  // 10. 스파 파빌리온 + 연못
  tropical_spa: {
    label: '스파 파빌리온',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.54, color: SAND },
      { k: 'box', w: 0.42, h: 0.5, d: 0.42, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.3, to: 0.78, color: TURQ, glow: 0.28 } },
      { k: 'columns', w: 0.42, d: 0.42, y: PL, h: 0.44, count: 4, color: BAMBOO },
      { k: 'cyl', rt: 0.18, rb: 0.22, h: 0.16, y: PL + 0.5, color: BAMBOO, seg: 12 },
      { k: 'roof', type: 'cone', w: 0.64, y: PL + 0.66, height: 0.44, color: THATCH },
      { k: 'box', w: 0.03, h: 0.14, d: 0.03, y: PL + 1.1, color: WOOD, detail: true },
      // 연꽃 연못
      { k: 'box', w: 0.5, h: 0.03, d: 0.12, z: 0.26, y: PL, color: TURQ, emissive: true },
      { k: 'box', w: 0.06, h: 0.03, d: 0.06, z: 0.26, y: PL + 0.03, color: PALM, detail: true },
      { k: 'panel', w: 0.14, h: 0.2, pos: [0, PL + 0.16, 0.22 + 0.006], color: WOOD },
    ],
  },

  // 11. 긴 게이블 레스토랑
  tropical_restaurant: {
    label: '짚지붕 레스토랑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.5, color: SAND },
      { k: 'box', w: 0.6, h: 0.5, d: 0.46, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.35, to: 0.8, color: TURQ, glow: 0.28 } },
      { k: 'box', w: 0.5, h: 0.4, d: 0.4, y: PL + 0.5, color: WHITE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: TURQ, glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.78, d: 0.6, y: PL + 0.9, height: 0.34, color: THATCH },
      { k: 'columns', w: 0.6, d: 0.46, y: PL, h: 0.44, count: 6, color: BAMBOO },
      { k: 'box', w: 0.61, h: 0.03, d: 0.47, y: PL + 0.48, color: BAMBOO2 },
      { k: 'storefront', w: 0.6, d: 0.46, faceH: 0.28, awning: PALM, sign: WHITE },
      { k: 'parasol', pos: [0.24, PL + 0.5, 0.16], color: ORANGE },
    ],
  },

  // 12. 2층 티키 바 + 횃불
  tropical_tiki_bar: {
    label: '티키 바',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.46, color: SAND },
      { k: 'box', w: 0.5, h: 0.5, d: 0.46, y: PL, color: BAMBOO, rough: 0.8, windows: { from: 0.4, to: 0.8, color: '#FFCC66', glow: 0.35 } },
      { k: 'box', w: 0.42, h: 0.4, d: 0.4, y: PL + 0.5, color: BAMBOO2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: '#FFCC66', glow: 0.35 } },
      { k: 'roof', type: 'cone', w: 0.66, y: PL + 0.9, height: 0.36, color: THATCH },
      { k: 'storefront', w: 0.5, d: 0.46, faceH: 0.28, awning: '#8C3A2E', sign: '#FFCC66' },
      { k: 'box', w: 0.03, h: 0.4, d: 0.03, x: -0.22, z: 0.18, y: PL, color: WOOD },
      { k: 'panel', w: 0.06, h: 0.1, pos: [-0.22, PL + 0.42, 0.18], color: ORANGE, glow: 0.7 },
      { k: 'box', w: 0.03, h: 0.4, d: 0.03, x: 0.22, z: 0.18, y: PL, color: WOOD },
      { k: 'panel', w: 0.06, h: 0.1, pos: [0.22, PL + 0.42, 0.18], color: ORANGE, glow: 0.7 },
    ],
  },

  // 13. 2층 다이브 상점
  tropical_dive_shop: {
    label: '다이브 상점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.44, color: SAND },
      { k: 'box', w: 0.46, h: 0.56, d: 0.44, y: PL, color: TURQ, rough: 0.65, windows: { from: 0.45, to: 0.82, color: '#CFEFEA', glow: 0.3 } },
      { k: 'box', w: 0.4, h: 0.44, d: 0.4, y: PL + 0.56, color: '#3FA9C9', rough: 0.65, windows: { from: 0.2, to: 0.8, color: '#CFEFEA', glow: 0.3 } },
      { k: 'roof', type: 'cone', w: 0.54, y: PL + 1.0, height: 0.26, color: THATCH },
      ...ribs(0.46, 0.44, 0.56, PL, 4, WHITE, 0.02),
      { k: 'storefront', w: 0.46, d: 0.44, faceH: 0.3, awning: '#1E7A72', sign: WHITE },
      { k: 'panel', w: 0.32, h: 0.1, pos: [0, PL + 0.46, 0.22 + 0.008], color: WHITE, glow: 0.2 },
      // 산소통 진열
      { k: 'box', w: 0.05, h: 0.16, d: 0.05, x: 0.18, z: 0.24, y: PL, color: '#D9A24B', detail: true },
    ],
  },

  // 14. 개방 2층 카바나
  tropical_cabana: {
    label: '카바나',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.46, color: SAND },
      { k: 'box', w: 0.05, h: 0.5, d: 0.05, x: -0.17, z: -0.17, y: PL, color: BAMBOO },
      { k: 'box', w: 0.05, h: 0.5, d: 0.05, x: 0.17, z: -0.17, y: PL, color: BAMBOO },
      { k: 'box', w: 0.05, h: 0.5, d: 0.05, x: -0.17, z: 0.17, y: PL, color: BAMBOO },
      { k: 'box', w: 0.05, h: 0.5, d: 0.05, x: 0.17, z: 0.17, y: PL, color: BAMBOO },
      { k: 'box', w: 0.38, h: 0.44, d: 0.06, z: -0.17, y: PL, color: WHITE, rough: 0.7 },
      { k: 'box', w: 0.44, h: 0.06, d: 0.44, y: PL + 0.5, color: BAMBOO2 },
      { k: 'box', w: 0.34, h: 0.36, d: 0.34, y: PL + 0.56, color: WHITE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: TURQ, glow: 0.3 } },
      { k: 'roof', type: 'cone', w: 0.54, y: PL + 0.92, height: 0.3, color: THATCH },
      { k: 'box', w: 0.34, h: 0.04, d: 0.34, y: PL + 0.06, color: WOOD, detail: true },
      { k: 'panel', w: 0.12, h: 0.16, pos: [0, PL + 0.64, 0.17 + 0.006], color: WOOD },
    ],
  },

  // 15. 비치 채플
  tropical_chapel: {
    label: '비치 채플',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.54, color: SAND },
      { k: 'box', w: 0.42, h: 0.8, d: 0.52, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.25, to: 0.7, color: TURQ, glow: 0.26 } },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.6, y: PL + 0.8, height: 0.36, color: THATCH },
      { k: 'columns', w: 0.42, d: 0.52, y: PL, h: 0.6, count: 4, color: BAMBOO },
      { k: 'box', w: 0.02, h: 0.18, d: 0.02, z: 0.26, y: PL + 1.16, color: WOOD, detail: true },
      { k: 'cross', y: PL + 1.28, z: 0.26, color: WOOD, s: 0.4 },
      { k: 'panel', w: 0.12, h: 0.3, pos: [0, PL + 0.18, 0.27 + 0.006], color: WOOD },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0, PL + 0.56, 0.27 + 0.006], color: TURQ, glow: 0.2 },
    ],
  },

  // 16. 2층 아케이드 마켓
  tropical_market: {
    label: '비치 마켓',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.46, color: SAND },
      { k: 'box', w: 0.66, h: 0.4, d: 0.46, y: PL, color: BAMBOO, rough: 0.8 },
      { k: 'box', w: 0.58, h: 0.44, d: 0.4, y: PL + 0.4, color: WHITE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: TURQ, glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.76, d: 0.52, y: PL + 0.84, height: 0.24, color: THATCH },
      { k: 'storefront', w: 0.66, d: 0.46, faceH: 0.24, awning: ORANGE, sign: WHITE },
      { k: 'parasol', pos: [-0.24, PL + 0.4, 0.14], color: TURQ },
      { k: 'parasol', pos: [0.24, PL + 0.4, -0.1], color: ORANGE },
      { k: 'panel', w: 0.46, h: 0.08, pos: [0, PL + 0.72, 0.21 + 0.008], color: PALM, glow: 0.2 },
    ],
  },

  // 17. 주스 타워
  tropical_juice_bar: {
    label: '주스 바',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.38, color: SAND },
      { k: 'box', w: 0.4, h: 0.5, d: 0.38, y: PL, color: '#FFB84D', rough: 0.7, windows: { from: 0.4, to: 0.82, color: WHITE, glow: 0.28 } },
      { k: 'box', w: 0.3, h: 0.5, d: 0.3, y: PL + 0.5, color: '#FF9A3D', rough: 0.7, windows: { from: 0.2, to: 0.8, color: WHITE, glow: 0.28 } },
      { k: 'roof', type: 'cone', w: 0.44, y: PL + 1.0, height: 0.24, color: THATCH },
      { k: 'storefront', w: 0.4, d: 0.38, faceH: 0.28, awning: PALM, sign: WHITE },
      // 빨대/파라솔
      { k: 'box', w: 0.02, h: 0.3, d: 0.02, x: 0.1, y: PL + 1.0, color: ORANGE, detail: true },
      { k: 'panel', w: 0.26, h: 0.09, pos: [0, PL + 0.4, 0.2 + 0.008], color: '#E0402A', glow: 0.3 },
    ],
  },

  // 18. 2층 서프 상점 + 보드
  tropical_surf_shack: {
    label: '서프 오두막',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.4, color: SAND },
      { k: 'box', w: 0.44, h: 0.5, d: 0.4, y: PL, color: '#3FA9C9', rough: 0.75 },
      { k: 'box', w: 0.38, h: 0.4, d: 0.36, y: PL + 0.5, color: '#5AB9D4', rough: 0.75, windows: { from: 0.2, to: 0.8, color: WHITE, glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.46, y: PL + 0.9, height: 0.16, color: THATCH },
      { k: 'storefront', w: 0.44, d: 0.4, faceH: 0.28, awning: ORANGE, sign: WHITE },
      // 서프보드 기대놓기
      { k: 'box', w: 0.06, h: 0.5, d: 0.02, x: 0.2, z: 0.2, y: PL, color: '#F2C84B', detail: true },
      { k: 'box', w: 0.06, h: 0.5, d: 0.02, x: 0.26, z: 0.18, y: PL, color: '#E0402A', detail: true },
      { k: 'box', w: 0.06, h: 0.46, d: 0.02, x: -0.2, z: 0.2, y: PL, color: PALM, detail: true },
    ],
  },

  // 19. 핑크콘 아이스크림
  tropical_ice_cream: {
    label: '아이스크림 가게',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.38, color: SAND },
      { k: 'box', w: 0.4, h: 0.5, d: 0.38, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.4, to: 0.82, color: TURQ, glow: 0.3 } },
      { k: 'box', w: 0.3, h: 0.44, d: 0.3, y: PL + 0.5, color: '#FBE4EC', rough: 0.7, windows: { from: 0.2, to: 0.8, color: TURQ, glow: 0.3 } },
      { k: 'roof', type: 'cone', w: 0.42, y: PL + 0.94, height: 0.3, color: '#F49AC1' },
      { k: 'box', w: 0.05, h: 0.06, d: 0.05, y: PL + 1.24, color: '#E0402A', detail: true },
      { k: 'storefront', w: 0.4, d: 0.38, faceH: 0.28, awning: '#F49AC1', sign: WHITE },
      { k: 'panel', w: 0.26, h: 0.08, pos: [0, PL + 0.4, 0.2 + 0.008], color: TURQ, glow: 0.3 },
    ],
  },

  // 20. 밴드스탠드 정자
  tropical_gazebo: {
    label: '해변 밴드스탠드',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: SAND },
      { k: 'cyl', rt: 0.24, rb: 0.26, h: 0.24, y: PL, color: WHITE, seg: 12 },
      { k: 'box', w: 0.05, h: 0.7, d: 0.05, x: -0.18, z: -0.18, y: PL + 0.24, color: WHITE },
      { k: 'box', w: 0.05, h: 0.7, d: 0.05, x: 0.18, z: -0.18, y: PL + 0.24, color: WHITE },
      { k: 'box', w: 0.05, h: 0.7, d: 0.05, x: -0.18, z: 0.18, y: PL + 0.24, color: WHITE },
      { k: 'box', w: 0.05, h: 0.7, d: 0.05, x: 0.18, z: 0.18, y: PL + 0.24, color: WHITE },
      { k: 'box', w: 0.5, h: 0.06, d: 0.5, y: PL + 0.94, color: BAMBOO2 },
      { k: 'roof', type: 'cone', w: 0.64, y: PL + 1.0, height: 0.34, color: THATCH },
      { k: 'box', w: 0.03, h: 0.14, d: 0.03, y: PL + 1.34, color: WOOD, detail: true },
      { k: 'box', w: 0.44, h: 0.03, d: 0.03, z: 0.18, y: PL + 0.7, color: TURQ, emissive: true },
    ],
  },
} satisfies Record<string, BuildingConfig>
