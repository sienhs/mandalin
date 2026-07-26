import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, bands, cornice, steps, portico } from './_detail'

/**
 * T12 아르데코 / 1920s (artdeco) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 상향(min ~1.3)
 * 팔레트: 크림 #EDE3CC, 골드 #C9A24B, 딥그린 #1F4A3A, 브론즈 #7A5A2E, 유리 #7FA8C9.
 *
 * 매스: empire=세트백+스파이어 / chrysler=부채크라운 / radio=송신마스트 / fountain=분수기둥 /
 *  clock_pylon=시계 파일런 / hotel=세트백+그린지붕 / luxury_apt=세트백+발코니 / cityhall=열주+타워 /
 *  penthouse=유리 펜트 / apartment=세트백+골드리브 / bank=열주+피라미드 / department=와이드 필라 /
 *  theater=수직 필라+마퀴 / cinema=계단크라운+수직사인 / museum=대칭 세트백 / library=골드 필라 /
 *  subway=지하철 오피스타워 / diner=크롬 다이너+타워사인 / boutique=2층 부티크 / cafe=2층 카페
 */

const CREAM = '#EDE3CC'
const CREAM2 = '#DDD0B4'
const GOLD = '#C9A24B'
const GREEN = '#1F4A3A'
const GREEN2 = '#2E5A46'
const BRONZE = '#7A5A2E'
const GLASS = '#7FA8C9'
const RED = '#B03A48'

export const ARTDECO = {
  // 1. 세트백 + 스파이어 엠파이어
  artdeco_empire_tower: {
    label: '엠파이어 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.62, color: BRONZE },
      { k: 'box', w: 0.66, h: 0.9, d: 0.62, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.1, to: 0.95, color: GLASS, glow: 0.35 } },
      cornice(0.66, 0.62, PL + 0.9, GOLD),
      { k: 'box', w: 0.5, h: 0.8, d: 0.48, y: PL + 0.95, color: CREAM, rough: 0.6, windows: { from: 0.1, to: 0.95, color: GLASS, glow: 0.35 } },
      cornice(0.5, 0.48, PL + 1.75, GOLD),
      { k: 'box', w: 0.34, h: 0.75, d: 0.34, y: PL + 1.8, color: CREAM2, rough: 0.6, windows: { from: 0.1, to: 0.95, color: GLASS, glow: 0.35 } },
      { k: 'box', w: 0.2, h: 0.3, d: 0.2, y: PL + 2.55, color: CREAM2, rough: 0.6 },
      { k: 'roof', type: 'pyramid', w: 0.24, y: PL + 2.85, height: 0.12, color: GOLD },
      { k: 'antenna', y: PL + 2.97, h: 0.4 },
      { k: 'box', w: 0.03, h: 0.9, d: 0.03, x: -0.2, z: 0.31, y: PL, color: GOLD },
      { k: 'box', w: 0.03, h: 0.9, d: 0.03, x: 0.2, z: 0.31, y: PL, color: GOLD },
      ...ribs(0.34, 0.34, 0.75, PL + 1.8, 4, GOLD, 0.016),
    ],
  },

  // 2. 부채 크라운 크라이슬러
  artdeco_chrysler_tower: {
    label: '크라이슬러 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.58, d: 0.58, color: BRONZE },
      { k: 'box', w: 0.54, h: 1.6, d: 0.54, y: PL, color: CREAM, rough: 0.55, windows: { from: 0.08, to: 0.95, color: GLASS, glow: 0.38 } },
      ...ribs(0.54, 0.54, 1.6, PL, 6, GOLD, 0.016),
      // 부채꼴 크라운
      { k: 'box', w: 0.46, h: 0.2, d: 0.46, y: PL + 1.6, color: GOLD, rough: 0.4, metal: 0.5 },
      { k: 'box', w: 0.36, h: 0.2, d: 0.36, y: PL + 1.8, color: GOLD, rough: 0.4, metal: 0.5 },
      { k: 'box', w: 0.26, h: 0.2, d: 0.26, y: PL + 2.0, color: GOLD, rough: 0.4, metal: 0.5 },
      { k: 'box', w: 0.16, h: 0.2, d: 0.16, y: PL + 2.2, color: GOLD, rough: 0.4, metal: 0.5 },
      { k: 'roof', type: 'cone', w: 0.16, y: PL + 2.4, height: 0.3, color: GOLD },
      { k: 'antenna', y: PL + 2.7, h: 0.4 },
    ],
  },

  // 3. 송신 마스트 라디오
  artdeco_radio_tower: {
    label: '라디오 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: BRONZE },
      { k: 'box', w: 0.46, h: 0.9, d: 0.46, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.34 } },
      cornice(0.46, 0.46, PL + 0.9, GOLD),
      { k: 'box', w: 0.32, h: 0.5, d: 0.32, y: PL + 0.95, color: CREAM2, rough: 0.6, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.34 } },
      { k: 'cyl', rt: 0.06, rb: 0.16, h: 1.4, y: PL + 1.45, color: CREAM2, seg: 8 },
      { k: 'cyl', rt: 0.14, rb: 0.14, h: 0.04, y: PL + 1.9, color: GOLD, seg: 12, detail: true },
      { k: 'cyl', rt: 0.1, rb: 0.1, h: 0.04, y: PL + 2.4, color: GOLD, seg: 12, detail: true },
      { k: 'antenna', y: PL + 2.85, h: 0.4 },
      { k: 'box', w: 0.02, h: 0.02, d: 0.02, y: PL + 2.85, color: '#FF4A4A', detail: true, emissive: true },
      ...ribs(0.46, 0.46, 0.9, PL, 4, GOLD, 0.016),
    ],
  },

  // 4. 분수 기둥 기념탑
  artdeco_fountain_tower: {
    label: '분수 기념탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.58, d: 0.58, color: BRONZE },
      { k: 'cyl', rt: 0.26, rb: 0.28, h: 0.16, y: PL, color: CREAM2, seg: 16 },
      { k: 'cyl', rt: 0.24, rb: 0.24, h: 0.03, y: PL + 0.16, color: GLASS, seg: 16, detail: true },
      { k: 'box', w: 0.24, h: 0.4, d: 0.24, y: PL + 0.16, color: CREAM, rough: 0.6 },
      { k: 'box', w: 0.16, h: 1.0, d: 0.16, y: PL + 0.56, color: CREAM, rough: 0.6 },
      ...ribs(0.16, 0.16, 1.0, PL + 0.56, 3, GOLD, 0.014),
      { k: 'box', w: 0.22, h: 0.14, d: 0.22, y: PL + 1.56, color: GOLD },
      { k: 'box', w: 0.14, h: 0.12, d: 0.14, y: PL + 1.7, color: CREAM2 },
      { k: 'roof', type: 'cone', w: 0.14, y: PL + 1.82, height: 0.24, color: GOLD },
      { k: 'box', w: 0.06, h: 0.16, d: 0.06, y: PL + 1.42, color: BRONZE, detail: true },
      { k: 'panel', w: 0.02, h: 0.3, pos: [-0.16, PL + 0.36, 0.06], color: GLASS, glow: 0.3 },
      { k: 'panel', w: 0.02, h: 0.3, pos: [0.16, PL + 0.36, 0.06], color: GLASS, glow: 0.3 },
    ],
  },

  // 5. 시계 파일런
  artdeco_clock_pylon: {
    label: '시계 파일런',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: BRONZE },
      { k: 'box', w: 0.34, h: 0.3, d: 0.34, y: PL, color: CREAM2, rough: 0.6 },
      { k: 'box', w: 0.28, h: 1.3, d: 0.28, y: PL + 0.3, color: CREAM, rough: 0.6, windows: { from: 0.1, to: 0.7, color: GLASS, glow: 0.3 } },
      ...ribs(0.28, 0.28, 1.3, PL + 0.3, 3, GOLD, 0.016),
      { k: 'clock', w: 0.28, y: PL + 1.3, color: GOLD },
      { k: 'box', w: 0.32, h: 0.12, d: 0.32, y: PL + 1.6, color: CREAM2 },
      { k: 'box', w: 0.22, h: 0.12, d: 0.22, y: PL + 1.72, color: GOLD },
      { k: 'roof', type: 'pyramid', w: 0.2, y: PL + 1.84, height: 0.16, color: GREEN },
      { k: 'antenna', y: PL + 2.0, h: 0.24 },
    ],
  },

  // 6. 세트백 + 그린지붕 호텔
  artdeco_hotel: {
    label: '그랜드 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.5, color: BRONZE },
      { k: 'box', w: 0.56, h: 1.3, d: 0.5, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.1, to: 0.9, color: GLASS, glow: 0.34 } },
      cornice(0.56, 0.5, PL + 1.3, GOLD),
      { k: 'box', w: 0.4, h: 0.34, d: 0.36, y: PL + 1.35, color: CREAM2, rough: 0.6, windows: { from: 0.1, to: 0.9, color: GLASS, glow: 0.34 } },
      { k: 'roof', type: 'pyramid', w: 0.44, y: PL + 1.69, height: 0.18, color: GREEN },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 1.87, color: GOLD, detail: true, emissive: true },
      { k: 'box', w: 0.03, h: 1.3, d: 0.03, x: -0.24, z: 0.25, y: PL, color: GOLD },
      { k: 'box', w: 0.03, h: 1.3, d: 0.03, x: 0.24, z: 0.25, y: PL, color: GOLD },
      ...bands(0.56, 0.5, [PL + 0.5, PL + 0.9], GOLD),
      { k: 'storefront', w: 0.56, d: 0.5, faceH: 0.3, awning: GREEN, sign: GOLD },
    ],
  },

  // 7. 세트백 + 발코니 고급 아파트
  artdeco_luxury_apartment: {
    label: '고급 아파트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.46, color: BRONZE },
      { k: 'box', w: 0.6, h: 1.0, d: 0.46, y: PL, color: CREAM2, rough: 0.6, windows: { from: 0.1, to: 0.9, color: GLASS, glow: 0.34 } },
      cornice(0.6, 0.46, PL + 1.0, GOLD),
      { k: 'box', w: 0.46, h: 0.5, d: 0.38, y: PL + 1.05, color: CREAM, rough: 0.6, windows: { from: 0.1, to: 0.9, color: GLASS, glow: 0.34 } },
      { k: 'box', w: 0.3, h: 0.3, d: 0.26, y: PL + 1.55, color: CREAM2, rough: 0.6 },
      { k: 'roof', type: 'pyramid', w: 0.34, y: PL + 1.85, height: 0.16, color: GREEN },
      { k: 'balconies', w: 0.6, d: 0.46, y0: PL + 0.3, y1: PL + 0.8, floors: 3, color: GOLD },
      { k: 'box', w: 0.03, h: 1.0, d: 0.03, x: 0, z: 0.24, y: PL, color: GOLD },
      ...ribs(0.46, 0.38, 0.5, PL + 1.05, 3, GOLD, 0.016),
    ],
  },

  // 8. 열주 + 타워 시청
  artdeco_cityhall: {
    label: '시청',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.52, color: BRONZE },
      { k: 'box', w: 0.66, h: 0.8, d: 0.52, y: PL, color: CREAM2, rough: 0.6, windows: { from: 0.2, to: 0.85, color: GLASS, glow: 0.3 } },
      ...portico(0.66, 0.52, 0.6, PL, 6, CREAM, GOLD),
      ...steps(0.44, PL, 0.27, CREAM2, 3),
      { k: 'box', w: 0.34, h: 0.5, d: 0.34, y: PL + 0.8, color: CREAM, rough: 0.6, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.32 } },
      { k: 'box', w: 0.24, h: 0.3, d: 0.24, y: PL + 1.3, color: CREAM2, rough: 0.6 },
      { k: 'roof', type: 'pyramid', w: 0.28, y: PL + 1.6, height: 0.2, color: GREEN },
      { k: 'box', w: 0.02, h: 0.18, d: 0.02, y: PL + 1.8, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.4, h: 0.08, pos: [0, PL + 0.68, 0.27 + 0.008], color: GOLD, glow: 0.3 },
    ],
  },

  // 9. 유리 펜트하우스
  artdeco_penthouse: {
    label: '펜트하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.46, color: BRONZE },
      { k: 'box', w: 0.5, h: 1.5, d: 0.46, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.1, to: 0.92, color: GLASS, glow: 0.34 } },
      ...ribs(0.5, 0.46, 1.5, PL, 5, GOLD, 0.016),
      cornice(0.5, 0.46, PL + 1.5, GOLD),
      { k: 'box', w: 0.44, h: 0.34, d: 0.4, y: PL + 1.56, color: GLASS, rough: 0.3, metal: 0.4, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.4 } },
      { k: 'parapet', w: 0.5, d: 0.46, y: PL + 1.5, color: GOLD },
      { k: 'box', w: 0.03, h: 1.5, d: 0.03, x: -0.2, z: 0.24, y: PL, color: GOLD },
      { k: 'box', w: 0.03, h: 1.5, d: 0.03, x: 0.2, z: 0.24, y: PL, color: GOLD },
      { k: 'antenna', y: PL + 1.9, h: 0.3 },
    ],
  },

  // 10. 세트백 + 골드리브 아파트
  artdeco_apartment: {
    label: '아파트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.54, d: 0.44, color: BRONZE },
      { k: 'box', w: 0.54, h: 1.4, d: 0.44, y: PL, color: CREAM, rough: 0.65, windows: { from: 0.1, to: 0.92, color: GLASS, glow: 0.32 } },
      cornice(0.54, 0.44, PL + 1.4, GOLD),
      { k: 'box', w: 0.4, h: 0.3, d: 0.32, y: PL + 1.45, color: CREAM2, rough: 0.65, windows: { from: 0.1, to: 0.9, color: GLASS, glow: 0.32 } },
      cornice(0.4, 0.32, PL + 1.75, GOLD),
      { k: 'parapet', w: 0.4, d: 0.32, y: PL + 1.8, color: CREAM2 },
      { k: 'box', w: 0.03, h: 1.4, d: 0.03, x: -0.18, z: 0.22, y: PL, color: GOLD },
      { k: 'box', w: 0.03, h: 1.4, d: 0.03, x: 0, z: 0.22, y: PL, color: GOLD },
      { k: 'box', w: 0.03, h: 1.4, d: 0.03, x: 0.18, z: 0.22, y: PL, color: GOLD },
    ],
  },

  // 11. 열주 + 피라미드 은행
  artdeco_bank: {
    label: '은행 본점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.52, color: BRONZE },
      { k: 'box', w: 0.64, h: 1.0, d: 0.52, y: PL, color: CREAM2, rough: 0.6, windows: { from: 0.3, to: 0.85, color: GLASS, glow: 0.3 } },
      { k: 'columns', w: 0.64, d: 0.52, y: PL, h: 0.8, count: 6, color: CREAM },
      ...steps(0.44, PL, 0.27, CREAM2, 3),
      cornice(0.64, 0.52, PL + 1.0, GOLD),
      { k: 'box', w: 0.4, h: 0.2, d: 0.3, y: PL + 1.05, color: CREAM, rough: 0.6 },
      { k: 'roof', type: 'pyramid', w: 0.44, y: PL + 1.25, height: 0.16, color: GREEN },
      { k: 'panel', w: 0.44, h: 0.1, pos: [0, PL + 0.9, 0.27 + 0.008], color: GOLD, glow: 0.3 },
    ],
  },

  // 12. 와이드 필라 백화점
  artdeco_department: {
    label: '백화점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.54, color: BRONZE },
      { k: 'box', w: 0.68, h: 1.1, d: 0.54, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.2, to: 0.9, color: GLASS, glow: 0.32 } },
      cornice(0.68, 0.54, PL + 1.1, GOLD),
      { k: 'parapet', w: 0.68, d: 0.54, y: PL + 1.18, color: CREAM2 },
      { k: 'box', w: 0.03, h: 0.9, d: 0.03, x: -0.28, z: 0.27, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.9, d: 0.03, x: 0, z: 0.27, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.9, d: 0.03, x: 0.28, z: 0.27, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.9, d: 0.03, x: -0.14, z: 0.27, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.9, d: 0.03, x: 0.14, z: 0.27, y: PL + 0.1, color: GOLD },
      { k: 'storefront', w: 0.68, d: 0.54, faceH: 0.4, awning: GREEN, sign: GOLD },
    ],
  },

  // 13. 수직 필라 + 마퀴 극장
  artdeco_theater: {
    label: '라디오시티 극장',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.52, color: BRONZE },
      { k: 'box', w: 0.68, h: 1.0, d: 0.52, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.55, to: 0.85, color: GLASS, glow: 0.32 } },
      { k: 'box', w: 0.03, h: 0.7, d: 0.03, x: -0.24, z: 0.26, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.7, d: 0.03, x: -0.08, z: 0.26, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.7, d: 0.03, x: 0.08, z: 0.26, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.7, d: 0.03, x: 0.24, z: 0.26, y: PL + 0.1, color: GOLD },
      cornice(0.68, 0.52, PL + 1.0, GOLD),
      { k: 'box', w: 0.4, h: 0.2, d: 0.3, y: PL + 1.05, color: CREAM2, rough: 0.6 },
      { k: 'storefront', w: 0.68, d: 0.52, faceH: 0.36, awning: GREEN, sign: GOLD },
      { k: 'panel', w: 0.14, h: 0.6, pos: [0.3, PL + 0.5, 0.26 + 0.006], color: RED, glow: 0.5 },
      { k: 'panel', w: 0.5, h: 0.12, pos: [0, PL + 0.8, 0.27 + 0.008], color: GOLD, glow: 0.35 },
    ],
  },

  // 14. 계단 크라운 + 수직사인 시네마
  artdeco_cinema: {
    label: '시네마',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.44, color: BRONZE },
      { k: 'box', w: 0.52, h: 0.9, d: 0.44, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.55, to: 0.85, color: GLASS, glow: 0.3 } },
      ...ribs(0.52, 0.44, 0.9, PL, 4, GOLD, 0.016),
      { k: 'box', w: 0.4, h: 0.16, d: 0.44, y: PL + 0.9, color: CREAM2 },
      { k: 'box', w: 0.28, h: 0.14, d: 0.4, y: PL + 1.06, color: GOLD },
      { k: 'box', w: 0.18, h: 0.12, d: 0.36, y: PL + 1.2, color: CREAM2 },
      { k: 'storefront', w: 0.52, d: 0.44, faceH: 0.34, awning: '#7A1F3A', sign: GOLD },
      { k: 'panel', w: 0.44, h: 0.14, pos: [0, PL + 0.56, 0.23 + 0.008], color: GOLD, glow: 0.4 },
      { k: 'panel', w: 0.12, h: 0.8, pos: [0, PL + 1.1, 0.24 + 0.006], color: RED, glow: 0.5 },
    ],
  },

  // 15. 대칭 세트백 미술관
  artdeco_museum: {
    label: '미술관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.52, color: BRONZE },
      { k: 'box', w: 0.68, h: 0.8, d: 0.52, y: PL, color: CREAM2, rough: 0.6, windows: { from: 0.3, to: 0.78, color: GLASS, glow: 0.28 } },
      { k: 'columns', w: 0.68, d: 0.52, y: PL, h: 0.64, count: 7, color: CREAM },
      ...steps(0.46, PL, 0.28, CREAM2, 3),
      cornice(0.68, 0.52, PL + 0.8, GOLD),
      { k: 'box', w: 0.28, h: 0.4, d: 0.5, x: -0.19, y: PL + 0.86, color: CREAM, rough: 0.6 },
      { k: 'box', w: 0.28, h: 0.4, d: 0.5, x: 0.19, y: PL + 0.86, color: CREAM, rough: 0.6 },
      { k: 'box', w: 0.18, h: 0.6, d: 0.4, y: PL + 0.86, color: CREAM2, rough: 0.6 },
      { k: 'roof', type: 'pyramid', w: 0.22, y: PL + 1.46, height: 0.16, color: GREEN },
      { k: 'panel', w: 0.4, h: 0.1, pos: [0, PL + 0.6, 0.27 + 0.008], color: GOLD, glow: 0.3 },
    ],
  },

  // 16. 골드 필라 도서관
  artdeco_library: {
    label: '도서관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.5, color: BRONZE },
      { k: 'box', w: 0.6, h: 1.0, d: 0.5, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.25, to: 0.85, color: GLASS, glow: 0.3 } },
      { k: 'box', w: 0.03, h: 0.8, d: 0.03, x: -0.22, z: 0.26, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.8, d: 0.03, x: -0.075, z: 0.26, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.8, d: 0.03, x: 0.075, z: 0.26, y: PL + 0.1, color: GOLD },
      { k: 'box', w: 0.03, h: 0.8, d: 0.03, x: 0.22, z: 0.26, y: PL + 0.1, color: GOLD },
      cornice(0.6, 0.5, PL + 1.0, GOLD),
      { k: 'box', w: 0.4, h: 0.16, d: 0.3, y: PL + 1.05, color: CREAM2, rough: 0.6 },
      { k: 'parapet', w: 0.6, d: 0.5, y: PL + 1.08, color: CREAM2 },
      ...steps(0.4, PL, 0.26, CREAM2, 2),
      { k: 'panel', w: 0.16, h: 0.3, pos: [0, PL + 0.18, 0.26 + 0.006], color: BRONZE },
    ],
  },

  // 17. 지하철 오피스타워 (was subway LOW → CC)
  artdeco_subway_station: {
    label: '지하철 역사',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.48, color: BRONZE },
      { k: 'box', w: 0.56, h: 0.5, d: 0.48, y: PL, color: CREAM2, rough: 0.6, windows: { from: 0.35, to: 0.8, color: GLASS, glow: 0.32 } },
      cornice(0.56, 0.48, PL + 0.5, GOLD),
      { k: 'box', w: 0.42, h: 0.9, d: 0.38, y: PL + 0.55, color: CREAM, rough: 0.6, windows: { from: 0.1, to: 0.9, color: GLASS, glow: 0.32 } },
      ...ribs(0.42, 0.38, 0.9, PL + 0.55, 4, GOLD, 0.016),
      { k: 'box', w: 0.44, h: 0.12, d: 0.4, y: PL + 1.45, color: GOLD },
      { k: 'roof', type: 'pyramid', w: 0.34, y: PL + 1.57, height: 0.14, color: GREEN },
      // 아치 입구
      { k: 'panel', w: 0.24, h: 0.34, pos: [0, PL + 0.18, 0.24 + 0.006], color: '#1E1A16' },
      { k: 'box', w: 0.3, h: 0.06, d: 0.06, z: 0.24, y: PL + 0.36, color: GOLD },
      { k: 'panel', w: 0.3, h: 0.1, pos: [0, PL + 0.44, 0.24 + 0.008], color: GOLD, glow: 0.35 },
    ],
  },

  // 18. 크롬 다이너 + 타워사인 (was diner LOW → 상향)
  artdeco_diner: {
    label: '다이너',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.42, color: BRONZE },
      { k: 'box', w: 0.5, h: 0.5, d: 0.42, y: PL, color: '#C8CDD2', rough: 0.4, metal: 0.4, windows: { from: 0.35, to: 0.82, color: GLASS, glow: 0.36 } },
      { k: 'box', w: 0.52, h: 0.05, d: 0.44, y: PL + 0.24, color: RED },
      { k: 'box', w: 0.42, h: 0.4, d: 0.38, y: PL + 0.5, color: '#D2D7DC', rough: 0.4, metal: 0.4, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.36 } },
      { k: 'roof', type: 'round', w: 0.46, d: 0.42, y: PL + 0.9, color: '#C8CDD2' },
      { k: 'box', w: 0.43, h: 0.04, d: 0.39, y: PL + 0.74, color: RED },
      { k: 'storefront', w: 0.5, d: 0.42, faceH: 0.28, awning: RED, sign: GOLD },
      // 수직 네온 타워 사인
      { k: 'box', w: 0.08, h: 0.7, d: 0.08, x: 0.24, z: 0.14, y: PL + 0.9, color: '#C8CDD2' },
      { k: 'panel', w: 0.1, h: 0.6, pos: [0.24, PL + 1.05, 0.2], color: RED, glow: 0.55 },
    ],
  },

  // 19. 2층 부티크 (was LOW → 상향)
  artdeco_boutique: {
    label: '부티크',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.4, color: BRONZE },
      { k: 'box', w: 0.44, h: 0.56, d: 0.4, y: PL, color: GREEN, rough: 0.55, windows: { from: 0.45, to: 0.82, color: GLASS, glow: 0.34 } },
      cornice(0.44, 0.4, PL + 0.56, GOLD),
      { k: 'box', w: 0.4, h: 0.44, d: 0.36, y: PL + 0.61, color: GREEN2, rough: 0.55, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.34 } },
      { k: 'box', w: 0.42, h: 0.12, d: 0.38, y: PL + 1.05, color: GOLD },
      { k: 'parapet', w: 0.4, d: 0.36, y: PL + 1.05, color: GREEN2 },
      { k: 'storefront', w: 0.44, d: 0.4, faceH: 0.32, awning: GOLD, sign: CREAM },
      { k: 'box', w: 0.03, h: 0.4, d: 0.03, x: -0.16, z: 0.21, y: PL + 0.08, color: GOLD },
      { k: 'box', w: 0.03, h: 0.4, d: 0.03, x: 0.16, z: 0.21, y: PL + 0.08, color: GOLD },
    ],
  },

  // 20. 2층 카페 (was LOW → 상향)
  artdeco_cafe: {
    label: '카페',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.4, color: BRONZE },
      { k: 'box', w: 0.42, h: 0.6, d: 0.4, y: PL, color: CREAM, rough: 0.6, windows: { from: 0.5, to: 0.85, color: GLASS, glow: 0.32 } },
      cornice(0.42, 0.4, PL + 0.6, GOLD),
      { k: 'box', w: 0.38, h: 0.44, d: 0.36, y: PL + 0.65, color: CREAM2, rough: 0.6, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.32 } },
      { k: 'box', w: 0.4, h: 0.12, d: 0.38, y: PL + 1.09, color: GOLD },
      { k: 'parapet', w: 0.38, d: 0.36, y: PL + 1.09, color: CREAM2 },
      ...ribs(0.42, 0.4, 0.6, PL, 3, GOLD, 0.016),
      { k: 'storefront', w: 0.42, d: 0.4, faceH: 0.34, awning: GREEN, sign: GOLD },
      { k: 'parasol', pos: [0.12, PL + 0.6, 0.1], color: GREEN },
    ],
  },
} satisfies Record<string, BuildingConfig>
