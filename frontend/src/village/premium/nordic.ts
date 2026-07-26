import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, bands } from './_detail'

/**
 * T9 노르딕 겨울 (nordic) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 전부 2층+ 상향(min ~1.2)
 * 팔레트: 눈지붕 #EAF1F5, 다크팀버 #3A2E28, 붉은목조 #8C3A2E, 따뜻한창 #F2C879, 오로라 #5FE0B0.
 *
 * 매스: stave=적층 다크지붕 탑 / aurora=오로라 리브 타워 / lighthouse=원통 등대 / bell=붉은 종탑 /
 *  ski_hotel=급경사 눈지붕+발코니 / church=백색+첨탑 / town_hall=중앙 시계벨프리 / lodge=통나무 롯지 /
 *  museum=석조 열주 / chalet=발코니 샬레 / log_house=통나무 2층 / ice_hotel=얼음 볼트+오로라 /
 *  rune_stone=룬돌 / trading_post=2층 교역소 / red_cabin=2층 붉은오두막 / turf_house=잔디지붕 2층 /
 *  sauna=2층 사우나+굴뚝 / fish_market=2층+타워 / bakery=2층 화덕 / cafe=2층 카페 / gift_shop=2층 상점
 */

const SNOW = '#EAF1F5'
const SNOW2 = '#DCE6EC'
const TIMBER = '#3A2E28'
const REDW = '#8C3A2E'
const WARM = '#F2C879'
const AURORA = '#5FE0B0'
const LOG = '#6E4A32'
const LOG2 = '#5A3A28'
const STONE = '#8A8681'
const ICE = '#A8D8E8'

export const NORDIC = {
  // 1. 적층 다크지붕 스테이브 교회
  nordic_stave_church: {
    label: '스테이브 교회',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.56, color: STONE },
      { k: 'box', w: 0.46, h: 0.4, d: 0.46, y: PL, color: TIMBER, rough: 0.8, windows: { from: 0.2, to: 0.6, color: WARM, glow: 0.4 } },
      { k: 'roof', type: 'pyramid', w: 0.56, y: PL + 0.4, height: 0.24, color: TIMBER },
      { k: 'box', w: 0.34, h: 0.34, d: 0.34, y: PL + 0.64, color: TIMBER, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.44, y: PL + 0.98, height: 0.22, color: TIMBER },
      { k: 'box', w: 0.24, h: 0.3, d: 0.24, y: PL + 1.2, color: TIMBER, rough: 0.8, windows: { from: 0.2, to: 0.7, color: WARM, glow: 0.4 } },
      { k: 'roof', type: 'pyramid', w: 0.32, y: PL + 1.5, height: 0.24, color: TIMBER },
      { k: 'box', w: 0.14, h: 0.24, d: 0.14, y: PL + 1.74, color: TIMBER, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.22, y: PL + 1.98, height: 0.24, color: TIMBER },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 2.22, color: WARM, detail: true, emissive: true },
      { k: 'cross', y: PL + 2.3, color: WARM, s: 0.4 },
      // 하부 회랑 지붕
      { k: 'box', w: 0.56, h: 0.06, d: 0.56, y: PL + 0.32, color: TIMBER },
      { k: 'panel', w: 0.14, h: 0.24, pos: [0, PL + 0.14, 0.23 + 0.006], color: LOG2 },
      { k: 'box', w: 0.04, h: 0.04, d: 0.04, x: -0.2, z: 0.2, y: PL + 0.4, color: TIMBER, detail: true },
    ],
  },

  // 2. 오로라 리브 타워
  nordic_aurora_tower: {
    label: '오로라 전망탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.46, color: STONE },
      { k: 'box', w: 0.34, h: 0.4, d: 0.34, y: PL, color: TIMBER, rough: 0.6, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.4 } },
      { k: 'box', w: 0.22, h: 1.6, d: 0.22, y: PL + 0.4, color: TIMBER, rough: 0.5, metal: 0.3 },
      { k: 'box', w: 0.44, h: 0.34, d: 0.44, y: PL + 2.0, color: SNOW, rough: 0.4, windows: { from: 0.2, to: 0.8, color: ICE, glow: 0.4 } },
      { k: 'roof', type: 'pyramid', w: 0.5, y: PL + 2.34, height: 0.2, color: SNOW },
      { k: 'antenna', y: PL + 2.54, h: 0.3 },
      // 오로라 발광 리브
      { k: 'box', w: 0.02, h: 1.6, d: 0.02, x: -0.12, z: 0.12, y: PL + 0.4, color: AURORA, emissive: true },
      { k: 'box', w: 0.02, h: 1.6, d: 0.02, x: 0.12, z: 0.12, y: PL + 0.4, color: '#5FA0E0', emissive: true },
      { k: 'box', w: 0.02, h: 1.6, d: 0.02, x: 0.12, z: -0.12, y: PL + 0.4, color: AURORA, emissive: true },
      { k: 'box', w: 0.46, h: 0.03, d: 0.46, y: PL + 1.98, color: ICE, emissive: true },
    ],
  },

  // 3. 원통 등대
  nordic_lighthouse: {
    label: '등대',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: STONE },
      { k: 'box', w: 0.34, h: 0.34, d: 0.34, y: PL, color: REDW, rough: 0.7, windows: { from: 0.3, to: 0.7, color: WARM, glow: 0.4 } },
      { k: 'cyl', rt: 0.11, rb: 0.16, h: 1.4, y: PL + 0.34, color: SNOW, seg: 14 },
      { k: 'cyl', rt: 0.17, rb: 0.17, h: 0.06, y: PL + 0.7, color: REDW, seg: 14, detail: true },
      { k: 'cyl', rt: 0.15, rb: 0.15, h: 0.06, y: PL + 1.2, color: REDW, seg: 14, detail: true },
      { k: 'cyl', rt: 0.14, rb: 0.12, h: 0.16, y: PL + 1.74, color: TIMBER, seg: 12 },
      { k: 'box', w: 0.2, h: 0.12, d: 0.2, y: PL + 1.84, color: WARM, emissive: true },
      { k: 'roof', type: 'cone', w: 0.32, y: PL + 1.96, height: 0.18, color: REDW },
      { k: 'panel', w: 0.1, h: 0.4, pos: [0, PL + 0.95, 0.14 + 0.006], color: WARM, glow: 0.2 },
    ],
  },

  // 4. 붉은 종탑
  nordic_bell_tower: {
    label: '종탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.38, d: 0.38, color: STONE },
      { k: 'box', w: 0.32, h: 1.4, d: 0.32, y: PL, color: REDW, rough: 0.75, windows: { from: 0.1, to: 0.65, color: WARM, glow: 0.4 } },
      ...bands(0.32, 0.32, [PL + 0.5, PL + 1.0], SNOW2),
      { k: 'box', w: 0.36, h: 0.3, d: 0.36, y: PL + 1.4, color: TIMBER, rough: 0.8, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.4 } },
      { k: 'roof', type: 'pyramid', w: 0.44, y: PL + 1.7, height: 0.42, color: SNOW },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 2.12, color: WARM, detail: true, emissive: true },
      { k: 'panel', w: 0.14, h: 0.16, pos: [0, PL + 1.5, 0.18 + 0.006], color: TIMBER },
    ],
  },

  // 5. 급경사 눈지붕 스키 호텔
  nordic_ski_hotel: {
    label: '스키 리조트 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.5, color: STONE },
      { k: 'box', w: 0.64, h: 1.1, d: 0.5, y: PL, color: LOG, rough: 0.8, windows: { from: 0.12, to: 0.9, color: WARM, glow: 0.4 } },
      { k: 'box', w: 0.5, h: 0.4, d: 0.42, y: PL + 1.1, color: LOG2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.4 } },
      { k: 'roof', type: 'pyramid', w: 0.72, d: 0.58, y: PL + 1.1, height: 0.16, color: SNOW },
      { k: 'roof', type: 'pyramid', w: 0.58, d: 0.5, y: PL + 1.5, height: 0.36, color: SNOW },
      { k: 'balconies', w: 0.64, d: 0.5, y0: PL + 0.35, y1: PL + 0.85, floors: 3, color: LOG2 },
      ...bands(0.64, 0.5, [PL + 0.55], LOG2),
      { k: 'box', w: 0.08, h: 0.4, d: 0.08, x: 0.24, z: -0.12, y: PL + 1.1, color: STONE, detail: true },
      { k: 'storefront', w: 0.64, d: 0.5, faceH: 0.3, awning: REDW, sign: WARM },
    ],
  },

  // 6. 백색 + 첨탑 교회
  nordic_church: {
    label: '교회',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.56, color: STONE },
      { k: 'box', w: 0.46, h: 0.8, d: 0.56, y: PL, color: SNOW, rough: 0.6, windows: { from: 0.2, to: 0.7, color: WARM, glow: 0.4 } },
      { k: 'roof', type: 'pyramid', w: 0.54, d: 0.64, y: PL + 0.8, height: 0.3, color: REDW },
      ...ribs(0.46, 0.56, 0.8, PL, 3, SNOW2, 0.02),
      // 앞 첨탑
      { k: 'box', w: 0.22, h: 1.2, d: 0.22, z: 0.22, y: PL, color: SNOW, rough: 0.6, windows: { from: 0.5, to: 0.7, color: WARM, glow: 0.4 } },
      { k: 'box', w: 0.24, h: 0.12, d: 0.24, z: 0.22, y: PL + 1.2, color: REDW },
      { k: 'box', w: 0.14, h: 0.16, d: 0.14, z: 0.22, y: PL + 1.32, color: REDW },
      { k: 'box', w: 0.06, h: 0.2, d: 0.06, z: 0.22, y: PL + 1.48, color: REDW },
      { k: 'cross', y: PL + 1.74, z: 0.22, color: WARM, s: 0.4 },
      { k: 'panel', w: 0.1, h: 0.24, pos: [0, PL + 0.14, 0.28 + 0.006], color: LOG2 },
    ],
  },

  // 7. 중앙 시계 벨프리 시청
  nordic_town_hall: {
    label: '시청',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.48, color: STONE },
      { k: 'box', w: 0.6, h: 0.9, d: 0.48, y: PL, color: REDW, rough: 0.75, windows: { from: 0.15, to: 0.85, color: WARM, glow: 0.38 } },
      ...ribs(0.6, 0.48, 0.9, PL, 5, SNOW2, 0.02),
      { k: 'roof', type: 'pyramid', w: 0.68, d: 0.56, y: PL + 0.9, height: 0.18, color: SNOW },
      { k: 'box', w: 0.22, h: 0.44, d: 0.22, y: PL + 0.9, color: REDW, rough: 0.75 },
      { k: 'clock', w: 0.22, y: PL + 1.14, color: SNOW },
      { k: 'roof', type: 'pyramid', w: 0.3, y: PL + 1.34, height: 0.34, color: SNOW },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, y: PL + 1.68, color: WARM, detail: true, emissive: true },
      { k: 'panel', w: 0.3, h: 0.08, pos: [0, PL + 0.7, 0.25 + 0.008], color: SNOW, glow: 0.15 },
    ],
  },

  // 8. 통나무 롯지
  nordic_lodge: {
    label: '통나무 롯지',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.48, color: STONE },
      { k: 'box', w: 0.62, h: 0.8, d: 0.48, y: PL, color: LOG, rough: 0.85, windows: { from: 0.2, to: 0.75, color: WARM, glow: 0.42 } },
      { k: 'box', w: 0.63, h: 0.03, d: 0.49, y: PL + 0.24, color: LOG2, detail: true },
      { k: 'box', w: 0.63, h: 0.03, d: 0.49, y: PL + 0.5, color: LOG2, detail: true },
      { k: 'box', w: 0.48, h: 0.32, d: 0.4, y: PL + 0.8, color: LOG2, rough: 0.85, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.42 } },
      { k: 'roof', type: 'pyramid', w: 0.74, d: 0.6, y: PL + 1.12, height: 0.4, color: SNOW },
      { k: 'box', w: 0.09, h: 0.44, d: 0.09, x: -0.2, z: -0.12, y: PL + 1.12, color: STONE, detail: true },
      { k: 'box', w: 0.62, h: 0.06, d: 0.14, z: 0.22, y: PL + 0.4, color: LOG2 },
      { k: 'panel', w: 0.14, h: 0.26, pos: [0, PL + 0.14, 0.25 + 0.006], color: LOG2 },
    ],
  },

  // 9. 석조 열주 박물관
  nordic_museum: {
    label: '박물관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.5, color: STONE },
      { k: 'box', w: 0.64, h: 0.9, d: 0.5, y: PL, color: STONE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.34 } },
      { k: 'columns', w: 0.64, d: 0.5, y: PL, h: 0.7, count: 6, color: SNOW },
      { k: 'box', w: 0.68, h: 0.08, d: 0.54, y: PL + 0.9, color: SNOW2 },
      { k: 'roof', type: 'pyramid', w: 0.72, d: 0.58, y: PL + 0.98, height: 0.24, color: SNOW },
      { k: 'box', w: 0.08, h: 0.36, d: 0.08, x: 0.22, z: -0.12, y: PL + 0.98, color: STONE, detail: true },
      { k: 'panel', w: 0.32, h: 0.1, pos: [0, PL + 0.6, 0.26 + 0.008], color: REDW },
    ],
  },

  // 10. 발코니 샬레
  nordic_chalet: {
    label: '샬레',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.46, color: STONE },
      { k: 'box', w: 0.5, h: 0.44, d: 0.46, y: PL, color: STONE, rough: 0.85 },
      { k: 'box', w: 0.52, h: 0.44, d: 0.48, y: PL + 0.44, color: LOG, rough: 0.82, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.44 } },
      { k: 'box', w: 0.5, h: 0.34, d: 0.44, y: PL + 0.88, color: LOG2, rough: 0.82, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.44 } },
      { k: 'roof', type: 'pyramid', w: 0.66, d: 0.58, y: PL + 1.22, height: 0.36, color: SNOW },
      { k: 'balconies', w: 0.52, d: 0.48, y0: PL + 0.6, y1: PL + 1.0, floors: 2, color: LOG2 },
      { k: 'box', w: 0.53, h: 0.03, d: 0.49, y: PL + 0.86, color: LOG2 },
      { k: 'box', w: 0.08, h: 0.4, d: 0.08, x: -0.18, z: -0.12, y: PL + 1.22, color: STONE, detail: true },
    ],
  },

  // 11. 통나무 2층 주택
  nordic_log_house: {
    label: '통나무 주택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.48, d: 0.44, color: STONE },
      { k: 'box', w: 0.48, h: 0.5, d: 0.44, y: PL, color: LOG, rough: 0.85, windows: { from: 0.28, to: 0.78, color: WARM, glow: 0.42 } },
      { k: 'box', w: 0.49, h: 0.03, d: 0.45, y: PL + 0.24, color: LOG2, detail: true },
      { k: 'box', w: 0.44, h: 0.44, d: 0.4, y: PL + 0.5, color: LOG2, rough: 0.85, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.42 } },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.5, y: PL + 0.94, height: 0.34, color: SNOW },
      { k: 'box', w: 0.08, h: 0.4, d: 0.08, x: -0.14, z: -0.1, y: PL + 0.94, color: STONE, detail: true },
      { k: 'panel', w: 0.12, h: 0.24, pos: [0, PL + 0.14, 0.23 + 0.006], color: LOG2 },
    ],
  },

  // 12. 얼음 볼트 + 오로라
  nordic_ice_hotel: {
    label: '얼음 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.5, color: '#C8DCE8' },
      { k: 'box', w: 0.62, h: 0.6, d: 0.5, y: PL, color: ICE, rough: 0.25, metal: 0.2, windows: { from: 0.2, to: 0.8, color: '#CFEFF8', glow: 0.4 } },
      { k: 'roof', type: 'round', w: 0.66, d: 0.54, y: PL + 0.6, color: '#C8E8F2' },
      { k: 'box', w: 0.44, h: 0.44, d: 0.5, y: PL + 0.6, color: ICE, rough: 0.25 },
      { k: 'roof', type: 'round', w: 0.48, d: 0.54, y: PL + 1.04, color: '#C8E8F2' },
      { k: 'box', w: 0.26, h: 0.34, d: 0.5, y: PL + 1.04, color: ICE, rough: 0.25 },
      { k: 'roof', type: 'round', w: 0.3, d: 0.54, y: PL + 1.38, color: '#C8E8F2' },
      // 얼음 블록 발광 + 오로라
      { k: 'box', w: 0.64, h: 0.04, d: 0.52, y: PL + 0.25, color: AURORA, emissive: true },
      { k: 'box', w: 0.46, h: 0.04, d: 0.52, y: PL + 0.82, color: AURORA, emissive: true },
      { k: 'panel', w: 0.18, h: 0.3, pos: [0, PL + 0.16, 0.25 + 0.006], color: '#7FD8F0', glow: 0.4 },
    ],
  },

  // 13. 룬스톤
  nordic_rune_stone: {
    label: '룬스톤',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.42, color: STONE },
      { k: 'box', w: 0.2, h: 0.24, d: 0.34, y: PL, color: '#6E6A64', rough: 0.95 },
      { k: 'box', w: 0.34, h: 1.2, d: 0.14, y: PL + 0.24, color: '#7A766E', rough: 0.95 },
      { k: 'box', w: 0.28, h: 0.2, d: 0.16, y: PL + 1.44, color: '#6E6A64', rough: 0.95 },
      // 룬 각인 발광
      { k: 'panel', w: 0.16, h: 0.7, pos: [0, PL + 0.7, 0.07 + 0.006], color: AURORA, glow: 0.4 },
      { k: 'panel', w: 0.1, h: 0.1, pos: [0, PL + 1.44, 0.08 + 0.006], color: '#5FA0E0', glow: 0.4 },
      // 옆 작은 룬돌
      { k: 'box', w: 0.14, h: 0.6, d: 0.1, x: 0.24, z: -0.06, y: PL, color: '#6E6A64', rough: 0.95 },
    ],
  },

  // 14. 2층 교역소
  nordic_trading_post: {
    label: '교역소',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.46, color: STONE },
      { k: 'box', w: 0.56, h: 0.6, d: 0.46, y: PL, color: LOG, rough: 0.82, windows: { from: 0.45, to: 0.82, color: WARM, glow: 0.4 } },
      { k: 'box', w: 0.5, h: 0.44, d: 0.4, y: PL + 0.6, color: LOG2, rough: 0.82, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.4 } },
      { k: 'box', w: 0.58, h: 0.28, d: 0.06, z: 0.2, y: PL + 1.04, color: LOG2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.64, d: 0.52, y: PL + 1.04, height: 0.14, color: SNOW },
      ...bands(0.56, 0.46, [PL + 0.58], LOG2),
      { k: 'storefront', w: 0.56, d: 0.46, faceH: 0.34, awning: REDW, sign: WARM },
      { k: 'panel', w: 0.44, h: 0.14, pos: [0, PL + 1.16, 0.24 + 0.008], color: WARM, glow: 0.3 },
    ],
  },

  // 15. 2층 붉은 오두막
  nordic_red_cabin: {
    label: '붉은 오두막',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.44, color: STONE },
      { k: 'box', w: 0.46, h: 0.5, d: 0.44, y: PL, color: REDW, rough: 0.78, windows: { from: 0.25, to: 0.78, color: WARM, glow: 0.45 } },
      { k: 'box', w: 0.42, h: 0.42, d: 0.4, y: PL + 0.5, color: '#7A3226', rough: 0.78, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.45 } },
      { k: 'roof', type: 'pyramid', w: 0.54, d: 0.5, y: PL + 0.92, height: 0.34, color: SNOW },
      { k: 'box', w: 0.08, h: 0.4, d: 0.08, x: 0.14, z: -0.1, y: PL + 0.92, color: STONE, detail: true },
      // 흰 창 셔터
      { k: 'panel', w: 0.05, h: 0.14, pos: [-0.15, PL + 0.32, 0.22 + 0.006], color: SNOW },
      { k: 'panel', w: 0.05, h: 0.14, pos: [0.15, PL + 0.32, 0.22 + 0.006], color: SNOW },
      { k: 'panel', w: 0.1, h: 0.22, pos: [0, PL + 0.13, 0.22 + 0.006], color: SNOW },
    ],
  },

  // 16. 잔디지붕 2층
  nordic_turf_house: {
    label: '잔디지붕 집',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.46, color: STONE },
      { k: 'box', w: 0.56, h: 0.5, d: 0.46, y: PL, color: STONE, rough: 0.9, windows: { from: 0.3, to: 0.78, color: WARM, glow: 0.4 } },
      { k: 'box', w: 0.5, h: 0.4, d: 0.42, y: PL + 0.5, color: '#7A766E', rough: 0.9, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.4 } },
      { k: 'roof', type: 'pyramid', w: 0.64, d: 0.54, y: PL + 0.9, height: 0.34, color: '#4A7A4A' },
      { k: 'box', w: 0.62, h: 0.05, d: 0.52, y: PL + 0.9, color: '#3A5A34', detail: true },
      { k: 'box', w: 0.06, h: 0.3, d: 0.06, x: 0.16, z: -0.1, y: PL + 0.9, color: STONE, detail: true },
      { k: 'panel', w: 0.12, h: 0.2, pos: [0, PL + 0.12, 0.24 + 0.006], color: LOG2 },
    ],
  },

  // 17. 2층 사우나 + 굴뚝
  nordic_sauna: {
    label: '사우나 하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.42, color: STONE },
      { k: 'box', w: 0.44, h: 0.5, d: 0.42, y: PL, color: LOG2, rough: 0.85, windows: { from: 0.3, to: 0.7, color: WARM, glow: 0.5 } },
      { k: 'box', w: 0.4, h: 0.4, d: 0.38, y: PL + 0.5, color: LOG, rough: 0.85, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.5 } },
      { k: 'roof', type: 'pyramid', w: 0.52, d: 0.48, y: PL + 0.9, height: 0.24, color: SNOW },
      { k: 'box', w: 0.09, h: 0.5, d: 0.09, x: 0.14, z: -0.1, y: PL + 0.9, color: STONE },
      { k: 'box', w: 0.11, h: 0.06, d: 0.11, x: 0.14, z: -0.1, y: PL + 1.4, color: '#C8C4BE', detail: true },
      { k: 'box', w: 0.45, h: 0.03, d: 0.43, y: PL + 0.48, color: LOG },
      { k: 'panel', w: 0.1, h: 0.18, pos: [0, PL + 0.12, 0.22 + 0.006], color: '#2A1E18' },
    ],
  },

  // 18. 2층 어시장 + 타워
  nordic_fish_market: {
    label: '어시장',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.44, color: STONE },
      { k: 'box', w: 0.62, h: 0.5, d: 0.44, y: PL, color: '#3E6E8C', rough: 0.75, windows: { from: 0.4, to: 0.8, color: WARM, glow: 0.35 } },
      { k: 'box', w: 0.5, h: 0.4, d: 0.4, y: PL + 0.5, color: '#4A7A98', rough: 0.75, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.35 } },
      { k: 'roof', type: 'pyramid', w: 0.7, d: 0.52, y: PL + 0.9, height: 0.16, color: SNOW },
      // 옆 어망 타워
      { k: 'box', w: 0.14, h: 1.2, d: 0.14, x: 0.28, z: -0.1, y: PL, color: LOG2 },
      { k: 'box', w: 0.16, h: 0.1, d: 0.16, x: 0.28, z: -0.1, y: PL + 1.2, color: REDW },
      { k: 'storefront', w: 0.62, d: 0.44, faceH: 0.28, awning: '#2E5A72', sign: WARM },
      { k: 'parasol', pos: [-0.22, PL + 0.5, 0.14], color: '#3E6E8C' },
    ],
  },

  // 19. 2층 베이커리 + 화덕
  nordic_bakery: {
    label: '베이커리',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.42, color: STONE },
      { k: 'box', w: 0.44, h: 0.5, d: 0.42, y: PL, color: '#C89A5A', rough: 0.8, windows: { from: 0.45, to: 0.82, color: WARM, glow: 0.45 } },
      { k: 'box', w: 0.4, h: 0.42, d: 0.38, y: PL + 0.5, color: '#D8AA6A', rough: 0.8, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.45 } },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.46, y: PL + 0.92, height: 0.24, color: SNOW },
      { k: 'box', w: 0.11, h: 0.5, d: 0.11, x: -0.13, z: -0.1, y: PL + 0.92, color: '#B85A3A' },
      { k: 'box', w: 0.13, h: 0.06, d: 0.13, x: -0.13, z: -0.1, y: PL + 1.42, color: '#C8C4BE', detail: true },
      { k: 'storefront', w: 0.44, d: 0.42, faceH: 0.3, awning: REDW, sign: WARM },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0, PL + 0.42, 0.22 + 0.008], color: WARM, glow: 0.3 },
    ],
  },

  // 20. 2층 카페
  nordic_cafe: {
    label: '카페',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.4, color: STONE },
      { k: 'box', w: 0.42, h: 0.56, d: 0.4, y: PL, color: LOG, rough: 0.8, windows: { from: 0.5, to: 0.85, color: WARM, glow: 0.45 } },
      { k: 'box', w: 0.38, h: 0.42, d: 0.36, y: PL + 0.56, color: LOG2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.45 } },
      { k: 'roof', type: 'pyramid', w: 0.48, d: 0.44, y: PL + 0.98, height: 0.24, color: SNOW },
      { k: 'storefront', w: 0.42, d: 0.4, faceH: 0.34, awning: AURORA, sign: TIMBER },
      { k: 'parasol', pos: [0.12, PL + 0.56, 0.1], color: REDW },
      { k: 'box', w: 0.06, h: 0.3, d: 0.06, x: -0.12, z: -0.08, y: PL + 0.98, color: STONE, detail: true },
    ],
  },

  // 21. 2층 기념품점
  nordic_gift_shop: {
    label: '기념품점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.38, color: STONE },
      { k: 'box', w: 0.4, h: 0.5, d: 0.38, y: PL, color: REDW, rough: 0.78, windows: { from: 0.45, to: 0.82, color: WARM, glow: 0.45 } },
      { k: 'box', w: 0.36, h: 0.4, d: 0.34, y: PL + 0.5, color: '#7A3226', rough: 0.78, windows: { from: 0.2, to: 0.8, color: WARM, glow: 0.45 } },
      { k: 'roof', type: 'pyramid', w: 0.46, d: 0.44, y: PL + 0.9, height: 0.22, color: SNOW },
      { k: 'storefront', w: 0.4, d: 0.38, faceH: 0.3, awning: '#2E5A72', sign: WARM },
      { k: 'panel', w: 0.26, h: 0.08, pos: [0, PL + 0.42, 0.19 + 0.008], color: AURORA, glow: 0.3 },
    ],
  },
} satisfies Record<string, BuildingConfig>
