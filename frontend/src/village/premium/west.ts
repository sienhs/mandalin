import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, bands, cornice, steps } from './_detail'

/**
 * T4 서부 아메리카 (west) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 2~3층화(min ~1.2)
 * 팔레트: 볕바랜 목재 #9B6B43·#7A4E30, 어도비 #C99A6A, 붉은지붕 #8B3A2F, 사막모래 #D9C29A, 사인 #3E2A1E.
 *
 * 매스: watertower=다리+탱크 / windmill=격자탑+날개 / mine=A프레임 권양 / church=false-front+첨탑 /
 *  hotel=3층 false-front / saloon=2층 발코니 false-front / courthouse=열주+큐폴라돔 / theater=오페라 파사드 /
 *  bank=어도비 열주+금고 / depot=넓은처마+시계큐폴라 / general=쇼프론트 / boarding=좁고높은 발코니 /
 *  blacksmith=벽돌굴뚝 / stable=대형 헛간 게이블 / sheriff=2층 감옥+감시타워 / ranch=2층+포치+풍차 /
 *  adobe=계단식 푸에블로 / stagecoach=역사+개방차고+타워 / barber=좁은 2층+폴 / schoolhouse=붉은교사+종탑
 */

const WOOD = '#9B6B43'
const WOOD2 = '#7A4E30'
const ADOBE = '#C99A6A'
const ADOBE2 = '#B8894A'
const REDROOF = '#8B3A2F'
const SAND = '#D9C29A'
const SIGN = '#3E2A1E'
const WHITE = '#E4D8BE'
const METAL = '#6E6A60'
const GOLD = '#C9A24B'

export const WEST = {
  // 1. 급수탑 (다리 + 탱크)
  west_watertower: {
    label: '급수탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: 'path' },
      { k: 'box', w: 0.3, h: 0.14, d: 0.3, y: PL, color: WOOD2 },
      { k: 'box', w: 0.06, h: 1.3, d: 0.06, x: -0.15, z: -0.15, y: PL + 0.14, color: WOOD2 },
      { k: 'box', w: 0.06, h: 1.3, d: 0.06, x: 0.15, z: -0.15, y: PL + 0.14, color: WOOD2 },
      { k: 'box', w: 0.06, h: 1.3, d: 0.06, x: -0.15, z: 0.15, y: PL + 0.14, color: WOOD2 },
      { k: 'box', w: 0.06, h: 1.3, d: 0.06, x: 0.15, z: 0.15, y: PL + 0.14, color: WOOD2 },
      // 교차 가새 X
      { k: 'box', w: 0.34, h: 0.03, d: 0.03, z: 0.15, y: PL + 0.5, color: WOOD },
      { k: 'box', w: 0.34, h: 0.03, d: 0.03, z: 0.15, y: PL + 0.9, color: WOOD },
      { k: 'box', w: 0.03, h: 0.03, d: 0.34, x: 0.15, y: PL + 0.7, color: WOOD },
      // 나무 물탱크 + 원뿔 뚜껑 + 배관
      { k: 'cyl', rt: 0.21, rb: 0.21, h: 0.5, y: PL + 1.44, color: WOOD, seg: 12 },
      { k: 'cyl', rt: 0.22, rb: 0.22, h: 0.03, y: PL + 1.6, color: WOOD2, seg: 12, detail: true },
      { k: 'cyl', rt: 0.22, rb: 0.22, h: 0.03, y: PL + 1.84, color: WOOD2, seg: 12, detail: true },
      { k: 'roof', type: 'cone', w: 0.46, y: PL + 1.94, height: 0.2, color: WOOD2 },
      { k: 'box', w: 0.04, h: 0.5, d: 0.04, x: 0.19, z: 0.1, y: PL + 0.14, color: METAL, detail: true },
      { k: 'panel', w: 0.26, h: 0.1, pos: [0, PL + 1.62, 0.21 + 0.008], color: SIGN },
    ],
  },

  // 2. 풍차 물펌프 (격자탑 + 날개)
  west_windmill_pump: {
    label: '풍차 물펌프',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.4, color: 'path' },
      { k: 'box', w: 0.3, h: 0.5, d: 0.3, y: PL, color: WOOD, rough: 0.8, windows: { from: 0.3, to: 0.7, color: 'glassWarm', glow: 0.3 } },
      // 좁아지는 격자 4주 타워
      { k: 'box', w: 0.05, h: 1.0, d: 0.05, x: -0.1, z: -0.1, y: PL + 0.5, color: WOOD2 },
      { k: 'box', w: 0.05, h: 1.0, d: 0.05, x: 0.1, z: -0.1, y: PL + 0.5, color: WOOD2 },
      { k: 'box', w: 0.05, h: 1.0, d: 0.05, x: -0.1, z: 0.1, y: PL + 0.5, color: WOOD2 },
      { k: 'box', w: 0.05, h: 1.0, d: 0.05, x: 0.1, z: 0.1, y: PL + 0.5, color: WOOD2 },
      { k: 'box', w: 0.24, h: 0.025, d: 0.025, z: 0.1, y: PL + 0.9, color: WOOD },
      { k: 'box', w: 0.24, h: 0.025, d: 0.025, z: 0.1, y: PL + 1.3, color: WOOD },
      { k: 'box', w: 0.2, h: 0.14, d: 0.2, y: PL + 1.5, color: WOOD2, rough: 0.8 },
      { k: 'blades', y: PL + 1.6 },
      // 물탱크 옆
      { k: 'box', w: 0.16, h: 0.4, d: 0.16, x: 0.24, z: 0.05, y: PL, color: METAL, detail: true },
      { k: 'box', w: 0.18, h: 0.05, d: 0.18, x: 0.24, z: 0.05, y: PL + 0.4, color: WOOD2, detail: true },
    ],
  },

  // 3. 광산 A프레임 권양탑
  west_mine_headframe: {
    label: '광산 권양탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: 'path' },
      { k: 'box', w: 0.5, h: 0.44, d: 0.44, y: PL, color: WOOD2, rough: 0.85, windows: { from: 0.3, to: 0.7, color: 'glassWarm', glow: 0.25 } },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.5, y: PL + 0.44, height: 0.1, color: METAL },
      // A형 권양 프레임(경사 → 좁아지는 box 스택)
      { k: 'box', w: 0.34, h: 0.4, d: 0.2, y: PL + 0.54, color: WOOD, rough: 0.85 },
      { k: 'box', w: 0.26, h: 0.4, d: 0.16, y: PL + 0.94, color: WOOD, rough: 0.85 },
      { k: 'box', w: 0.16, h: 0.5, d: 0.14, y: PL + 1.34, color: WOOD, rough: 0.85 },
      // 도르래 휠 2개
      { k: 'box', w: 0.24, h: 0.03, d: 0.03, z: 0.09, y: PL + 1.7, color: METAL, detail: true },
      { k: 'cyl', rt: 0.09, rb: 0.09, h: 0.03, y: PL + 1.78, color: METAL, seg: 12, detail: true },
      // 컨베이어(경사 판)
      { k: 'panel', w: 0.06, h: 0.7, pos: [0.24, PL + 0.6, 0.1], color: WOOD2 },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.24, awning: WOOD2, sign: SIGN },
    ],
  },

  // 4. 서부 교회 (false-front + 첨탑)
  west_church: {
    label: '서부 교회',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.58, color: 'path' },
      { k: 'box', w: 0.46, h: 0.9, d: 0.58, y: PL, color: WHITE, rough: 0.8, windows: { from: 0.2, to: 0.75, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.52, d: 0.64, y: PL + 0.9, height: 0.24, color: REDROOF },
      ...ribs(0.46, 0.58, 0.9, PL, 4, WOOD2, 0.02),
      // 정면 종탑 + 계단식 첨탑
      { k: 'box', w: 0.24, h: 1.2, d: 0.24, z: 0.24, y: PL, color: WHITE, rough: 0.8, windows: { from: 0.4, to: 0.6, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.2, h: 0.14, d: 0.2, z: 0.24, y: PL + 1.2, color: REDROOF },
      { k: 'box', w: 0.14, h: 0.16, d: 0.14, z: 0.24, y: PL + 1.34, color: REDROOF },
      { k: 'box', w: 0.07, h: 0.2, d: 0.07, z: 0.24, y: PL + 1.5, color: REDROOF },
      { k: 'cross', y: PL + 1.76, z: 0.24, color: WHITE, s: 0.5 },
      { k: 'panel', w: 0.14, h: 0.3, pos: [0, PL + 0.18, 0.29 + 0.006], color: WOOD2 },
      { k: 'panel', w: 0.14, h: 0.14, pos: [0, PL + 0.62, 0.24 + 0.006], color: '#9AB0C0', glow: 0.2 },
    ],
  },

  // 5. 3층 그랜드 호텔 (false-front)
  west_hotel: {
    label: '그랜드 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.46, color: 'path' },
      { k: 'box', w: 0.52, h: 1.4, d: 0.46, y: PL, color: ADOBE, rough: 0.8, windows: { from: 0.1, to: 0.9, color: 'glassWarm', glow: 0.3 } },
      // false-front 상단벽(지붕 위로 솟음)
      { k: 'box', w: 0.56, h: 0.3, d: 0.06, z: 0.2, y: PL + 1.4, color: WOOD2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.5, y: PL + 1.4, height: 0.1, color: REDROOF },
      ...bands(0.52, 0.46, [PL + 0.46, PL + 0.9], WOOD2),
      // 층별 발코니 + 난간
      { k: 'balconies', w: 0.52, d: 0.46, y0: PL + 0.5, y1: PL + 0.94, floors: 2, color: WOOD2 },
      { k: 'storefront', w: 0.52, d: 0.46, faceH: 0.32, awning: REDROOF, sign: SIGN },
      { k: 'panel', w: 0.42, h: 0.16, pos: [0, PL + 1.52, 0.24 + 0.008], color: SIGN },
      { k: 'panel', w: 0.36, h: 0.09, pos: [0, PL + 1.54, 0.245 + 0.006], color: GOLD, glow: 0.25 },
    ],
  },

  // 6. 2층 발코니 살롱 (false-front)
  west_saloon: {
    label: '살롱',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: 'path' },
      { k: 'box', w: 0.5, h: 1.0, d: 0.44, y: PL, color: WOOD, rough: 0.8, windows: { from: 0.55, to: 0.9, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.54, h: 0.36, d: 0.06, z: 0.19, y: PL + 1.0, color: WOOD2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.54, d: 0.48, y: PL + 1.0, height: 0.1, color: REDROOF },
      ...ribs(0.5, 0.44, 1.0, PL, 5, WOOD2, 0.022),
      // 2층 발코니 + 차양
      { k: 'box', w: 0.56, h: 0.03, d: 0.14, z: 0.2, y: PL + 0.5, color: WOOD2 },
      { k: 'box', w: 0.02, h: 0.2, d: 0.02, x: -0.2, z: 0.26, y: PL + 0.5, color: WOOD2 },
      { k: 'box', w: 0.02, h: 0.2, d: 0.02, x: 0.2, z: 0.26, y: PL + 0.5, color: WOOD2 },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.4, awning: REDROOF, sign: SIGN },
      { k: 'panel', w: 0.42, h: 0.16, pos: [0, PL + 1.12, 0.23 + 0.008], color: SIGN },
      { k: 'panel', w: 0.36, h: 0.09, pos: [0, PL + 1.14, 0.235 + 0.006], color: '#D9A24B', glow: 0.25 },
    ],
  },

  // 7. 법원 (열주 + 큐폴라 돔)
  west_courthouse: {
    label: '법원 청사',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.58, d: 0.5, color: 'path' },
      { k: 'box', w: 0.58, h: 1.0, d: 0.5, y: PL, color: WHITE, rough: 0.8, windows: { from: 0.2, to: 0.85, color: 'glassWarm', glow: 0.26 } },
      { k: 'columns', w: 0.58, d: 0.5, y: PL, h: 0.7, count: 6, color: SAND },
      ...steps(0.42, PL, 0.27, SAND, 3),
      { k: 'box', w: 0.62, h: 0.08, d: 0.54, y: PL + 1.0, color: SAND },
      { k: 'box', w: 0.3, h: 0.24, d: 0.3, y: PL + 1.08, color: WHITE, rough: 0.8 },
      { k: 'cyl', rt: 0.14, rb: 0.16, h: 0.14, y: PL + 1.32, color: WHITE, seg: 12 },
      { k: 'roof', type: 'dome', w: 0.36, y: PL + 1.46, color: REDROOF },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 1.59, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.34, h: 0.1, pos: [0, PL + 0.9, 0.26 + 0.008], color: SIGN },
    ],
  },

  // 8. 오페라 하우스 (파사드 + 수직 사인)
  west_theater: {
    label: '오페라 하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.48, color: 'path' },
      { k: 'box', w: 0.56, h: 1.3, d: 0.48, y: PL, color: ADOBE, rough: 0.8, windows: { from: 0.15, to: 0.85, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.6, h: 0.34, d: 0.06, z: 0.21, y: PL + 1.3, color: WOOD2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.6, d: 0.52, y: PL + 1.3, height: 0.1, color: REDROOF },
      { k: 'columns', w: 0.56, d: 0.48, y: PL, h: 0.5, count: 5, color: WHITE },
      ...bands(0.56, 0.48, [PL + 0.54, PL + 0.94], WOOD2),
      { k: 'storefront', w: 0.56, d: 0.48, faceH: 0.34, awning: '#7A2E2E', sign: GOLD },
      { k: 'panel', w: 0.14, h: 0.6, pos: [0.28, PL + 0.7, 0.24 + 0.006], color: GOLD, glow: 0.4 },
      { k: 'panel', w: 0.44, h: 0.16, pos: [0, PL + 1.42, 0.24 + 0.008], color: SIGN },
      { k: 'panel', w: 0.38, h: 0.09, pos: [0, PL + 1.44, 0.245 + 0.006], color: '#D9A24B', glow: 0.28 },
    ],
  },

  // 9. 어도비 은행 (열주 + 금고)
  west_bank: {
    label: '은행 (금고)',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.54, d: 0.46, color: 'path' },
      { k: 'box', w: 0.54, h: 1.1, d: 0.46, y: PL, color: SAND, rough: 0.8, windows: { from: 0.45, to: 0.82, color: 'glassWarm', glow: 0.26 } },
      { k: 'columns', w: 0.54, d: 0.46, y: PL, h: 0.7, count: 4, color: WHITE },
      ...steps(0.4, PL, 0.24, SAND, 2),
      cornice(0.54, 0.46, PL + 1.1, WOOD2),
      { k: 'box', w: 0.44, h: 0.24, d: 0.36, y: PL + 1.16, color: SAND, rough: 0.8 },
      { k: 'box', w: 0.46, h: 0.05, d: 0.38, y: PL + 1.4, color: WOOD2 },
      { k: 'panel', w: 0.36, h: 0.1, pos: [0, PL + 1.24, 0.19 + 0.008], color: SIGN },
      { k: 'panel', w: 0.16, h: 0.28, pos: [0, PL + 0.14, 0.23 + 0.006], color: METAL, glow: 0.1 },
    ],
  },

  // 10. 기차역 (넓은 처마 + 시계 큐폴라)
  west_train_depot: {
    label: '기차역',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.44, color: 'path' },
      { k: 'box', w: 0.68, h: 0.8, d: 0.44, y: PL, color: REDROOF, rough: 0.82, windows: { from: 0.2, to: 0.78, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.86, d: 0.6, y: PL + 0.8, height: 0.16, color: WOOD2 },
      ...bands(0.68, 0.44, [PL + 0.44], SAND),
      // 중앙 시계 큐폴라
      { k: 'box', w: 0.22, h: 0.34, d: 0.22, y: PL + 0.96, color: SAND, rough: 0.8 },
      { k: 'clock', w: 0.22, y: PL + 1.2, color: WHITE },
      { k: 'roof', type: 'pyramid', w: 0.28, y: PL + 1.3, height: 0.14, color: WOOD2 },
      // 플랫폼 차양 기둥
      { k: 'box', w: 0.03, h: 0.4, d: 0.03, x: -0.3, z: 0.22, y: PL, color: WOOD2 },
      { k: 'box', w: 0.03, h: 0.4, d: 0.03, x: 0.3, z: 0.22, y: PL, color: WOOD2 },
      { k: 'storefront', w: 0.68, d: 0.44, faceH: 0.34, awning: WOOD2, sign: SIGN },
    ],
  },

  // 11. 잡화점 (쇼프론트, 2층 false-front)
  west_general_store: {
    label: '잡화점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: 'path' },
      { k: 'box', w: 0.5, h: 1.0, d: 0.44, y: PL, color: WOOD, rough: 0.82, windows: { from: 0.55, to: 0.88, color: 'glassWarm', glow: 0.28 } },
      { k: 'box', w: 0.54, h: 0.34, d: 0.06, z: 0.19, y: PL + 1.0, color: WOOD2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.54, d: 0.48, y: PL + 1.0, height: 0.08, color: REDROOF },
      ...ribs(0.5, 0.44, 1.0, PL, 5, WOOD2, 0.02),
      // 나무 통 진열
      { k: 'box', w: 0.08, h: 0.12, d: 0.08, x: -0.28, z: 0.26, y: PL, color: WOOD2, detail: true },
      { k: 'box', w: 0.08, h: 0.12, d: 0.08, x: 0.28, z: 0.26, y: PL, color: WOOD2, detail: true },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.4, awning: SAND, sign: SIGN },
      { k: 'panel', w: 0.42, h: 0.16, pos: [0, PL + 1.12, 0.23 + 0.008], color: SIGN },
      { k: 'panel', w: 0.36, h: 0.09, pos: [0, PL + 1.14, 0.235 + 0.006], color: '#D9A24B', glow: 0.2 },
    ],
  },

  // 12. 하숙집 (좁고 높은 + 발코니)
  west_boarding_house: {
    label: '하숙집',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.44, color: 'path' },
      { k: 'box', w: 0.4, h: 1.3, d: 0.44, y: PL, color: WHITE, rough: 0.82, windows: { from: 0.12, to: 0.9, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.46, d: 0.5, y: PL + 1.3, height: 0.2, color: WOOD2 },
      ...bands(0.4, 0.44, [PL + 0.44, PL + 0.88], SAND),
      { k: 'balconies', w: 0.4, d: 0.44, y0: PL + 0.5, y1: PL + 0.94, floors: 2, color: WOOD2 },
      { k: 'box', w: 0.08, h: 0.3, d: 0.08, x: -0.12, z: -0.12, y: PL + 1.3, color: '#7A3A2E', detail: true },
      { k: 'panel', w: 0.12, h: 0.24, pos: [0, PL + 0.14, 0.23 + 0.006], color: WOOD2 },
    ],
  },

  // 13. 대장간 (벽돌 굴뚝 + 화덕)
  west_blacksmith: {
    label: '대장간',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: 'path' },
      { k: 'box', w: 0.5, h: 0.7, d: 0.44, y: PL, color: WOOD2, rough: 0.88 },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.5, y: PL + 0.7, height: 0.18, color: METAL },
      // 큰 벽돌 굴뚝
      { k: 'box', w: 0.16, h: 0.9, d: 0.16, x: 0.16, z: -0.08, y: PL + 0.7, color: '#7A3A2E' },
      { k: 'box', w: 0.18, h: 0.06, d: 0.18, x: 0.16, z: -0.08, y: PL + 1.6, color: '#5A2A1E', detail: true },
      // 개방 작업구 + 화덕 발광
      { k: 'panel', w: 0.28, h: 0.44, pos: [-0.06, PL + 0.24, 0.22 + 0.006], color: '#241A12' },
      { k: 'panel', w: 0.16, h: 0.14, pos: [0.12, PL + 0.4, 0.22 + 0.008], color: '#E07A30', glow: 0.6 },
      { k: 'box', w: 0.1, h: 0.16, d: 0.1, x: -0.06, z: 0.26, y: PL, color: METAL, detail: true },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.2, awning: SIGN, sign: '#D9A24B' },
    ],
  },

  // 14. 마구간 (대형 헛간 게이블)
  west_stable: {
    label: '마구간',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.46, color: 'path' },
      { k: 'box', w: 0.64, h: 0.8, d: 0.46, y: PL, color: REDROOF, rough: 0.85, windows: { from: 0.5, to: 0.75, color: '#3A2A1A', glow: 0 } },
      // 높은 헛간 박공 지붕
      { k: 'roof', type: 'pyramid', w: 0.72, d: 0.54, y: PL + 0.8, height: 0.4, color: WOOD2 },
      ...ribs(0.64, 0.46, 0.8, PL, 6, WHITE, 0.02),
      // 건초 다락문 + 도르래
      { k: 'panel', w: 0.18, h: 0.2, pos: [0, PL + 0.94, 0.24 + 0.006], color: '#3E2A1E' },
      { k: 'box', w: 0.04, h: 0.06, d: 0.1, z: 0.28, y: PL + 1.16, color: WOOD2, detail: true },
      // 큰 여닫이 문(양짝)
      { k: 'panel', w: 0.4, h: 0.5, pos: [0, PL + 0.25, 0.23 + 0.006], color: WOOD },
      { k: 'panel', w: 0.02, h: 0.5, pos: [0, PL + 0.25, 0.235 + 0.006], color: WOOD2 },
      { k: 'box', w: 0.1, h: 0.14, d: 0.1, x: 0.26, z: 0.26, y: PL, color: '#8A7A4A', detail: true },
    ],
  },

  // 15. 보안관 (2층 감옥 + 감시타워)
  west_sheriff: {
    label: '보안관 사무소',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.44, color: 'path' },
      { k: 'box', w: 0.52, h: 0.9, d: 0.44, y: PL, color: SAND, rough: 0.85, windows: { from: 0.2, to: 0.8, color: '#4A3020', glow: 0 } },
      { k: 'box', w: 0.54, h: 0.28, d: 0.06, z: 0.18, y: PL + 0.9, color: WOOD2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.48, y: PL + 0.9, height: 0.08, color: REDROOF },
      // 옆 감시 타워
      { k: 'box', w: 0.2, h: 1.4, d: 0.2, x: 0.24, z: -0.1, y: PL, color: WOOD2, rough: 0.85 },
      { k: 'box', w: 0.24, h: 0.2, d: 0.24, x: 0.24, z: -0.1, y: PL + 1.4, color: WOOD, rough: 0.8, windows: { from: 0.1, to: 0.9, color: 'glassWarm', glow: 0.35 } },
      { k: 'box', w: 0.28, h: 0.1, d: 0.28, x: 0.24, z: -0.1, y: PL + 1.6, color: REDROOF },
      // 창살 + 별 배지
      { k: 'panel', w: 0.14, h: 0.2, pos: [-0.12, PL + 0.4, 0.22 + 0.006], color: '#20160C' },
      { k: 'panel', w: 0.16, h: 0.16, pos: [-0.12, PL + 0.72, 0.22 + 0.008], color: GOLD, glow: 0.35 },
      { k: 'storefront', w: 0.42, d: 0.44, faceH: 0.26, awning: WOOD2, sign: SIGN },
    ],
  },

  // 16. 목장 저택 (2층 + 포치)
  west_ranch_house: {
    label: '목장 저택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.46, color: 'path' },
      { k: 'box', w: 0.66, h: 0.9, d: 0.46, y: PL, color: WOOD, rough: 0.82, windows: { from: 0.15, to: 0.85, color: 'glassWarm', glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.74, d: 0.54, y: PL + 0.9, height: 0.22, color: REDROOF },
      ...bands(0.66, 0.46, [PL + 0.46], WOOD2),
      // 넓은 현관 포치(지붕 + 기둥)
      { k: 'box', w: 0.66, h: 0.04, d: 0.14, z: 0.24, y: PL + 0.5, color: WOOD2 },
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: -0.28, z: 0.29, y: PL, color: WOOD2 },
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: 0, z: 0.29, y: PL, color: WOOD2 },
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: 0.28, z: 0.29, y: PL, color: WOOD2 },
      // 굴뚝 + 풍향계
      { k: 'box', w: 0.1, h: 0.4, d: 0.1, x: 0.22, z: -0.1, y: PL + 0.9, color: '#7A3A2E', detail: true },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, x: -0.2, y: PL + 1.12, color: METAL, detail: true },
      { k: 'panel', w: 0.14, h: 0.28, pos: [0, PL + 0.16, 0.235 + 0.006], color: WOOD2 },
    ],
  },

  // 17. 어도비 (계단식 푸에블로 3단)
  west_adobe_house: {
    label: '푸에블로 주택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.52, color: SAND },
      { k: 'box', w: 0.6, h: 0.5, d: 0.52, y: PL, color: ADOBE, rough: 0.95, windows: { from: 0.3, to: 0.7, color: '#5A3A2E', glow: 0 } },
      { k: 'box', w: 0.46, h: 0.44, d: 0.42, x: -0.06, z: -0.04, y: PL + 0.5, color: ADOBE2, rough: 0.95, windows: { from: 0.3, to: 0.7, color: '#5A3A2E', glow: 0 } },
      { k: 'box', w: 0.32, h: 0.4, d: 0.32, x: -0.12, z: -0.08, y: PL + 0.94, color: ADOBE, rough: 0.95 },
      { k: 'parapet', w: 0.6, d: 0.52, y: PL + 0.5, color: '#B98A5A' },
      // 비가(서까래) 돌출
      { k: 'box', w: 0.64, h: 0.03, d: 0.03, z: 0.22, y: PL + 0.44, color: WOOD2, detail: true },
      { k: 'box', w: 0.5, h: 0.03, d: 0.03, x: -0.06, z: 0.16, y: PL + 0.88, color: WOOD2, detail: true },
      // 사다리
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: 0.24, z: 0.2, y: PL + 0.5, color: WOOD2, detail: true },
      { k: 'panel', w: 0.12, h: 0.24, pos: [0.14, PL + 0.12, 0.27 + 0.006], color: '#5A3A2E' },
    ],
  },

  // 18. 역마차 정거장 (역사 + 개방 차고 + 타워)
  west_stagecoach_station: {
    label: '역마차 정거장',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.44, color: 'path' },
      { k: 'box', w: 0.4, h: 0.9, d: 0.44, x: -0.13, y: PL, color: ADOBE, rough: 0.82, windows: { from: 0.2, to: 0.8, color: 'glassWarm', glow: 0.28 } },
      { k: 'box', w: 0.46, h: 0.08, d: 0.5, x: -0.13, y: PL + 0.9, color: REDROOF },
      // 개방 마차 차고(지붕 + 기둥)
      { k: 'box', w: 0.06, h: 0.7, d: 0.06, x: 0.28, z: 0.16, y: PL, color: WOOD2 },
      { k: 'box', w: 0.06, h: 0.7, d: 0.06, x: 0.28, z: -0.16, y: PL, color: WOOD2 },
      { k: 'box', w: 0.28, h: 0.06, d: 0.44, x: 0.2, y: PL + 0.7, color: WOOD },
      // 신호 타워
      { k: 'box', w: 0.12, h: 1.2, d: 0.12, x: -0.13, z: -0.14, y: PL, color: WOOD2 },
      { k: 'box', w: 0.02, h: 0.02, d: 0.02, x: -0.13, z: -0.14, y: PL + 1.2, color: '#D02030', detail: true, emissive: true },
      { k: 'storefront', w: 0.4, d: 0.44, faceH: 0.3, awning: WOOD2, sign: SIGN },
      { k: 'panel', w: 0.3, h: 0.1, pos: [-0.13, PL + 0.78, 0.22 + 0.008], color: SIGN },
    ],
  },

  // 19. 이발소 (좁은 2층 + 폴)
  west_barber: {
    label: '이발소',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.38, d: 0.4, color: 'path' },
      { k: 'box', w: 0.38, h: 1.0, d: 0.4, y: PL, color: WHITE, rough: 0.82, windows: { from: 0.5, to: 0.85, color: 'glassWarm', glow: 0.3 } },
      { k: 'box', w: 0.42, h: 0.28, d: 0.06, z: 0.17, y: PL + 1.0, color: WOOD2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.42, d: 0.44, y: PL + 1.0, height: 0.08, color: REDROOF },
      ...bands(0.38, 0.4, [PL + 0.44], '#B03A48'),
      { k: 'storefront', w: 0.38, d: 0.4, faceH: 0.38, awning: '#B03A48', sign: WHITE },
      // 삼색 이발 기둥
      { k: 'box', w: 0.04, h: 0.3, d: 0.04, x: 0.15, z: 0.2, y: PL + 0.36, color: '#D02030', detail: true },
      { k: 'box', w: 0.05, h: 0.05, d: 0.05, x: 0.15, z: 0.2, y: PL + 0.66, color: WHITE, detail: true },
      { k: 'panel', w: 0.3, h: 0.14, pos: [0, PL + 1.12, 0.21 + 0.008], color: SIGN },
    ],
  },

  // 20. 학교 (붉은 교사 + 종탑)
  west_schoolhouse: {
    label: '학교',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.46, color: 'path' },
      { k: 'box', w: 0.5, h: 0.8, d: 0.46, y: PL, color: REDROOF, rough: 0.85, windows: { from: 0.25, to: 0.75, color: 'glassWarm', glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.52, y: PL + 0.8, height: 0.2, color: WOOD2 },
      ...ribs(0.5, 0.46, 0.8, PL, 4, WHITE, 0.02),
      // 종탑
      { k: 'box', w: 0.16, h: 0.3, d: 0.16, z: 0.06, y: PL + 0.9, color: WHITE, rough: 0.8 },
      { k: 'box', w: 0.18, h: 0.12, d: 0.18, z: 0.06, y: PL + 1.2, color: REDROOF },
      { k: 'box', w: 0.02, h: 0.1, d: 0.02, z: 0.06, y: PL + 1.32, color: METAL, detail: true },
      { k: 'box', w: 0.06, h: 0.06, d: 0.04, z: 0.09, y: PL + 1.24, color: '#8A7A4A', detail: true },
      { k: 'panel', w: 0.14, h: 0.26, pos: [0, PL + 0.14, 0.24 + 0.006], color: WOOD2 },
      { k: 'panel', w: 0.3, h: 0.09, pos: [0, PL + 0.66, 0.24 + 0.008], color: WHITE, glow: 0.15 },
    ],
  },
} satisfies Record<string, BuildingConfig>
