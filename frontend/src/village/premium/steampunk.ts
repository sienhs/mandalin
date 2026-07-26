import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, bands, cornice } from './_detail'

/**
 * T10 스팀펑크 (steampunk) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 상향(min ~1.2)
 * 팔레트: 브라스 #B8863B, 코퍼 #A65A2E, 다크메탈 #33302B, 벽돌 #7A3E2E, 유리 #8FB0A0.
 *
 * 매스: airship=계류마스트 / telegraph=크로스암 철탑 / cog_monument=톱니 적층 / clocktower=톱니 시계탑 /
 *  gasometer=대형 가스탱크 / factory=쌍 굴뚝 / foundry=용광로 / pipe_apt=외부 배관 / brass_opera=놋쇠돔 /
 *  cityhall=시계+코퍼돔 / tenement=철제계단 공동주택 / manor=놋쇠돔 코너탑 / townhouse=타운하우스 /
 *  observatory=코퍼돔 망원경 / pump=밸브휠+증기 / locomotive=라운드하우스 / workshop=톱니 작업장 /
 *  tinker=2층 땜장이 / pub=2층 펍 / museum=놋쇠 열주
 */

const BRASS = '#B8863B'
const COPPER = '#A65A2E'
const DARKM = '#33302B'
const BRICK = '#7A3E2E'
const BRICK2 = '#8E4A36'
const GLASS = '#8FB0A0'
const IRON = '#4A453E'
const VERDI = '#5E9E8A'
const STEAM = '#C8C4BE'
const EMBER = '#E07A30'

export const STEAMPUNK = {
  // 1. 계류 마스트 비행선 도크
  steampunk_airship_dock: {
    label: '비행선 도크타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.56, color: DARKM },
      { k: 'box', w: 0.5, h: 0.9, d: 0.5, y: PL, color: BRICK, rough: 0.85, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.3 } },
      ...bands(0.5, 0.5, [PL + 0.45], BRASS),
      { k: 'box', w: 0.38, h: 0.7, d: 0.38, y: PL + 0.9, color: BRICK2, rough: 0.85, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.3 } },
      { k: 'cyl', rt: 0.05, rb: 0.16, h: 1.0, y: PL + 1.6, color: IRON, seg: 10 },
      { k: 'cyl', rt: 0.18, rb: 0.18, h: 0.05, y: PL + 2.1, color: BRASS, seg: 14, detail: true },
      { k: 'cyl', rt: 0.1, rb: 0.1, h: 0.05, y: PL + 2.4, color: BRASS, seg: 14, detail: true },
      { k: 'antenna', y: PL + 2.6, h: 0.3 },
      { k: 'box', w: 0.07, h: 0.9, d: 0.07, x: 0.24, z: 0.18, y: PL, color: COPPER, detail: true },
      { k: 'box', w: 0.07, h: 0.9, d: 0.07, x: -0.24, z: 0.18, y: PL, color: COPPER, detail: true },
      { k: 'box', w: 0.2, h: 0.06, d: 0.06, x: 0.2, z: 0.18, y: PL + 0.5, color: COPPER, detail: true },
    ],
  },

  // 2. 크로스암 철탑 전신탑
  steampunk_telegraph_tower: {
    label: '전신탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: DARKM },
      { k: 'box', w: 0.34, h: 0.5, d: 0.34, y: PL, color: BRICK, rough: 0.82, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.3 } },
      { k: 'cyl', rt: 0.08, rb: 0.18, h: 1.9, y: PL + 0.5, color: IRON, seg: 8 },
      { k: 'box', w: 0.44, h: 0.04, d: 0.04, y: PL + 1.3, color: IRON, detail: true },
      { k: 'box', w: 0.36, h: 0.04, d: 0.04, y: PL + 1.7, color: IRON, detail: true },
      { k: 'box', w: 0.28, h: 0.04, d: 0.04, y: PL + 2.1, color: IRON, detail: true },
      { k: 'cyl', rt: 0.1, rb: 0.1, h: 0.05, y: PL + 2.4, color: BRASS, seg: 12, detail: true },
      { k: 'antenna', y: PL + 2.45, h: 0.35 },
      { k: 'box', w: 0.03, h: 0.03, d: 0.03, x: 0.2, y: PL + 1.32, color: EMBER, detail: true, emissive: true },
      { k: 'box', w: 0.03, h: 0.03, d: 0.03, x: -0.2, y: PL + 1.32, color: EMBER, detail: true, emissive: true },
      { k: 'panel', w: 0.06, h: 0.3, pos: [0, PL + 0.9, 0.1 + 0.006], color: EMBER, glow: 0.35 },
    ],
  },

  // 3. 톱니 적층 기념탑
  steampunk_cog_monument: {
    label: '톱니 기념탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.46, color: DARKM },
      { k: 'box', w: 0.32, h: 0.5, d: 0.32, y: PL, color: IRON, rough: 0.7, windows: { from: 0.2, to: 0.7, color: EMBER, glow: 0.4 } },
      { k: 'cyl', rt: 0.06, rb: 0.1, h: 1.5, y: PL + 0.5, color: COPPER, seg: 10 },
      { k: 'cyl', rt: 0.26, rb: 0.26, h: 0.06, y: PL + 0.7, color: BRASS, seg: 12, detail: true },
      { k: 'cyl', rt: 0.2, rb: 0.2, h: 0.06, y: PL + 1.1, color: COPPER, seg: 12, detail: true },
      { k: 'cyl', rt: 0.24, rb: 0.24, h: 0.06, y: PL + 1.5, color: BRASS, seg: 12, detail: true },
      { k: 'cyl', rt: 0.16, rb: 0.16, h: 0.06, y: PL + 1.9, color: COPPER, seg: 12, detail: true },
      { k: 'antenna', y: PL + 2.1, h: 0.24 },
      { k: 'panel', w: 0.24, h: 0.1, pos: [0, PL + 0.36, 0.17 + 0.008], color: EMBER, glow: 0.5 },
    ],
  },

  // 4. 톱니 시계탑
  steampunk_clocktower: {
    label: '톱니 시계탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: DARKM },
      { k: 'box', w: 0.38, h: 1.5, d: 0.38, y: PL, color: BRICK, rough: 0.85, windows: { from: 0.1, to: 0.55, color: GLASS, glow: 0.28 } },
      ...bands(0.38, 0.38, [PL + 0.5, PL + 1.0], BRASS),
      { k: 'clock', w: 0.38, y: PL + 1.28, color: BRASS },
      { k: 'cyl', rt: 0.22, rb: 0.22, h: 0.04, y: PL + 1.1, color: BRASS, seg: 12, detail: true },
      { k: 'cyl', rt: 0.16, rb: 0.16, h: 0.04, y: PL + 0.7, color: COPPER, seg: 12, detail: true },
      { k: 'box', w: 0.42, h: 0.14, d: 0.42, y: PL + 1.5, color: DARKM, rough: 0.7 },
      { k: 'roof', type: 'dome', w: 0.44, y: PL + 1.64, color: COPPER },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 1.86, color: BRASS, detail: true, emissive: true },
      { k: 'panel', w: 0.14, h: 0.26, pos: [0, PL + 0.2, 0.19 + 0.006], color: DARKM },
    ],
  },

  // 5. 대형 가스탱크
  steampunk_gasometer: {
    label: '가스탱크',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.7, d: 0.7, color: DARKM },
      { k: 'cyl', rt: 0.36, rb: 0.36, h: 1.3, y: PL, color: IRON, seg: 16 },
      { k: 'cyl', rt: 0.37, rb: 0.37, h: 0.05, y: PL + 0.35, color: BRASS, seg: 16, detail: true },
      { k: 'cyl', rt: 0.37, rb: 0.37, h: 0.05, y: PL + 0.8, color: BRASS, seg: 16, detail: true },
      { k: 'cyl', rt: 0.34, rb: 0.36, h: 0.12, y: PL + 1.3, color: DARKM, seg: 16 },
      { k: 'cyl', rt: 0.24, rb: 0.24, h: 0.14, y: PL + 1.42, color: IRON, seg: 16 },
      { k: 'box', w: 0.06, h: 1.5, d: 0.06, x: 0.34, z: 0.1, y: PL, color: IRON, detail: true },
      { k: 'box', w: 0.06, h: 1.5, d: 0.06, x: -0.34, z: 0.1, y: PL, color: IRON, detail: true },
      { k: 'box', w: 0.06, h: 1.5, d: 0.06, x: 0.1, z: 0.34, y: PL, color: IRON, detail: true },
      { k: 'panel', w: 0.3, h: 0.14, pos: [0, PL + 0.55, 0.37 + 0.008], color: EMBER, glow: 0.4 },
    ],
  },

  // 6. 쌍 굴뚝 공장
  steampunk_factory: {
    label: '공장 굴뚝동',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.5, color: DARKM },
      { k: 'box', w: 0.68, h: 0.8, d: 0.5, y: PL, color: BRICK, rough: 0.88, windows: { from: 0.2, to: 0.8, color: EMBER, glow: 0.35 } },
      ...ribs(0.68, 0.5, 0.8, PL, 7, BRICK2, 0.022),
      { k: 'roof', type: 'round', w: 0.72, d: 0.54, y: PL + 0.8, color: IRON },
      { k: 'box', w: 0.12, h: 1.0, d: 0.12, x: -0.22, z: -0.12, y: PL + 0.8, color: BRICK2 },
      { k: 'box', w: 0.14, h: 0.08, d: 0.14, x: -0.22, z: -0.12, y: PL + 1.8, color: COPPER, detail: true },
      { k: 'box', w: 0.12, h: 0.8, d: 0.12, x: 0.1, z: -0.14, y: PL + 0.8, color: BRICK2 },
      { k: 'box', w: 0.14, h: 0.08, d: 0.14, x: 0.1, z: -0.14, y: PL + 1.6, color: COPPER, detail: true },
      { k: 'box', w: 0.14, h: 0.06, d: 0.14, x: -0.22, z: -0.12, y: PL + 1.88, color: STEAM, detail: true },
      { k: 'storefront', w: 0.68, d: 0.5, faceH: 0.34, awning: IRON, sign: BRASS },
    ],
  },

  // 7. 용광로 주조소
  steampunk_foundry: {
    label: '주조소',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.5, color: DARKM },
      { k: 'box', w: 0.6, h: 0.9, d: 0.5, y: PL, color: IRON, rough: 0.8, metal: 0.3, windows: { from: 0.3, to: 0.75, color: EMBER, glow: 0.5 } },
      { k: 'roof', type: 'pyramid', w: 0.68, d: 0.56, y: PL + 0.9, height: 0.12, color: DARKM },
      { k: 'cyl', rt: 0.13, rb: 0.16, h: 0.9, y: PL + 0.9, color: BRICK2, seg: 12 },
      { k: 'cyl', rt: 0.16, rb: 0.16, h: 0.06, y: PL + 1.8, color: BRASS, seg: 12, detail: true },
      { k: 'box', w: 0.16, h: 0.16, d: 0.16, y: PL + 1.2, color: EMBER, emissive: true },
      { k: 'box', w: 0.62, h: 0.04, d: 0.52, y: PL + 0.4, color: BRASS, detail: true },
      { k: 'panel', w: 0.2, h: 0.3, pos: [-0.1, PL + 0.3, 0.25 + 0.006], color: '#241812' },
      { k: 'panel', w: 0.14, h: 0.14, pos: [0.12, PL + 0.4, 0.25 + 0.008], color: EMBER, glow: 0.7 },
    ],
  },

  // 8. 외부 배관 파이프 아파트
  steampunk_pipe_apartment: {
    label: '파이프 아파트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: DARKM },
      { k: 'box', w: 0.5, h: 1.7, d: 0.44, y: PL, color: BRICK, rough: 0.85, windows: { from: 0.1, to: 0.92, color: GLASS, glow: 0.3 } },
      ...bands(0.5, 0.44, [PL + 0.6, PL + 1.2], BRICK2),
      { k: 'parapet', w: 0.5, d: 0.44, y: PL + 1.7, color: DARKM },
      { k: 'rooftopUnits', w: 0.5, y: PL + 1.7 },
      { k: 'box', w: 0.06, h: 1.6, d: 0.06, x: 0.26, z: 0.14, y: PL, color: COPPER, detail: true },
      { k: 'box', w: 0.06, h: 0.5, d: 0.06, x: 0.26, z: 0.14, y: PL + 0.8, color: VERDI, detail: true },
      { k: 'box', w: 0.24, h: 0.06, d: 0.06, x: 0.16, z: 0.14, y: PL + 1.3, color: COPPER, detail: true },
      { k: 'box', w: 0.06, h: 1.3, d: 0.06, x: -0.26, z: 0.14, y: PL, color: COPPER, detail: true },
      { k: 'box', w: 0.06, h: 0.06, d: 0.06, x: -0.26, z: 0.14, y: PL + 0.7, color: BRASS, detail: true },
    ],
  },

  // 9. 놋쇠 돔 오페라
  steampunk_brass_opera: {
    label: '놋쇠 돔 오페라',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.56, color: DARKM },
      { k: 'box', w: 0.6, h: 0.9, d: 0.52, y: PL, color: BRICK2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.32 } },
      { k: 'columns', w: 0.6, d: 0.52, y: PL, h: 0.6, count: 6, color: BRASS },
      { k: 'cyl', rt: 0.22, rb: 0.26, h: 0.18, y: PL + 0.9, color: BRICK2, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.6, y: PL + 1.08, color: BRASS },
      { k: 'box', w: 0.02, h: 0.18, d: 0.02, y: PL + 1.3, color: BRASS, detail: true, emissive: true },
      cornice(0.6, 0.52, PL + 0.9, BRASS),
      { k: 'panel', w: 0.34, h: 0.1, pos: [0, PL + 0.6, 0.27 + 0.008], color: BRASS, glow: 0.3 },
    ],
  },

  // 10. 시계 + 코퍼돔 시청
  steampunk_cityhall: {
    label: '시청',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.5, color: DARKM },
      { k: 'box', w: 0.62, h: 0.9, d: 0.5, y: PL, color: BRICK, rough: 0.82, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.3 } },
      { k: 'columns', w: 0.62, d: 0.5, y: PL, h: 0.5, count: 6, color: BRASS },
      { k: 'roof', type: 'pyramid', w: 0.7, d: 0.58, y: PL + 0.9, height: 0.14, color: IRON },
      { k: 'box', w: 0.24, h: 0.44, d: 0.24, y: PL + 0.9, color: BRICK2, rough: 0.82 },
      { k: 'clock', w: 0.24, y: PL + 1.14, color: BRASS },
      { k: 'roof', type: 'dome', w: 0.34, y: PL + 1.34, color: COPPER },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, y: PL + 1.56, color: BRASS, detail: true, emissive: true },
      { k: 'panel', w: 0.3, h: 0.08, pos: [0, PL + 0.68, 0.26 + 0.008], color: BRASS, glow: 0.25 },
    ],
  },

  // 11. 철제계단 공동주택
  steampunk_tenement: {
    label: '공동주택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.44, color: DARKM },
      { k: 'box', w: 0.56, h: 1.6, d: 0.44, y: PL, color: BRICK2, rough: 0.85, windows: { from: 0.1, to: 0.92, color: GLASS, glow: 0.3 } },
      ...bands(0.56, 0.44, [PL + 0.5, PL + 1.0], BRICK), // 벽돌 코스
      { k: 'parapet', w: 0.56, d: 0.44, y: PL + 1.6, color: DARKM },
      // 외부 철제 화재계단
      { k: 'balconies', w: 0.56, d: 0.44, y0: PL + 0.3, y1: PL + 1.4, floors: 5, color: IRON },
      { k: 'box', w: 0.03, h: 1.3, d: 0.03, x: 0.24, z: 0.23, y: PL + 0.3, color: IRON },
      { k: 'box', w: 0.03, h: 1.3, d: 0.03, x: -0.24, z: 0.23, y: PL + 0.3, color: IRON },
      { k: 'box', w: 0.1, h: 0.4, d: 0.1, x: -0.2, z: -0.1, y: PL + 1.6, color: BRICK2 },
      { k: 'box', w: 0.06, h: 1.4, d: 0.06, x: 0.28, z: 0.1, y: PL, color: COPPER, detail: true },
    ],
  },

  // 12. 놋쇠돔 코너탑 저택
  steampunk_manor: {
    label: '발명가 저택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.48, color: DARKM },
      { k: 'box', w: 0.64, h: 0.9, d: 0.48, y: PL, color: BRICK, rough: 0.82, windows: { from: 0.18, to: 0.82, color: GLASS, glow: 0.32 } },
      { k: 'roof', type: 'pyramid', w: 0.72, d: 0.56, y: PL + 0.9, height: 0.2, color: IRON },
      ...ribs(0.64, 0.48, 0.9, PL, 6, BRICK2, 0.02),
      // 좌측 놋쇠돔 코너탑
      { k: 'box', w: 0.22, h: 1.2, d: 0.22, x: -0.28, z: 0.06, y: PL, color: BRICK2, rough: 0.82, windows: { from: 0.3, to: 0.8, color: GLASS, glow: 0.32 } },
      { k: 'cyl', rt: 0.13, rb: 0.15, h: 0.1, y: PL + 1.2, color: DARKM, seg: 12 },
      { k: 'box', w: 0.24, h: 0.16, d: 0.24, x: -0.28, z: 0.06, y: PL + 1.2, color: DARKM },
      { k: 'box', w: 0.2, h: 0.14, d: 0.2, x: -0.28, z: 0.06, y: PL + 1.36, color: BRASS },
      { k: 'box', w: 0.08, h: 0.4, d: 0.08, x: 0.22, z: -0.1, y: PL + 0.9, color: BRICK2, detail: true },
      { k: 'panel', w: 0.14, h: 0.26, pos: [0.05, PL + 0.16, 0.24 + 0.006], color: IRON },
    ],
  },

  // 13. 타운하우스
  steampunk_townhouse: {
    label: '타운하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: DARKM },
      { k: 'box', w: 0.42, h: 1.3, d: 0.42, y: PL, color: BRICK, rough: 0.85, windows: { from: 0.12, to: 0.9, color: GLASS, glow: 0.32 } },
      ...bands(0.42, 0.42, [PL + 0.44, PL + 0.88], BRICK2),
      { k: 'roof', type: 'pyramid', w: 0.48, d: 0.48, y: PL + 1.3, height: 0.16, color: IRON },
      { k: 'box', w: 0.1, h: 0.4, d: 0.1, x: 0.14, z: -0.1, y: PL + 1.3, color: BRICK2 },
      { k: 'box', w: 0.12, h: 0.06, d: 0.12, x: 0.14, z: -0.1, y: PL + 1.7, color: COPPER, detail: true },
      { k: 'box', w: 0.06, h: 1.0, d: 0.06, x: -0.22, z: 0.14, y: PL, color: COPPER, detail: true },
      { k: 'panel', w: 0.12, h: 0.24, pos: [0, PL + 0.14, 0.22 + 0.006], color: IRON },
    ],
  },

  // 14. 코퍼돔 망원경 천문대
  steampunk_observatory: {
    label: '천문대',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: DARKM },
      { k: 'box', w: 0.44, h: 0.9, d: 0.44, y: PL, color: BRICK, rough: 0.82, windows: { from: 0.2, to: 0.75, color: GLASS, glow: 0.3 } },
      ...ribs(0.44, 0.44, 0.9, PL, 4, BRICK2, 0.02),
      { k: 'cyl', rt: 0.24, rb: 0.26, h: 0.28, y: PL + 0.9, color: BRICK2, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.62, y: PL + 1.18, color: COPPER },
      { k: 'box', w: 0.06, h: 0.4, d: 0.06, x: 0.08, y: PL + 1.3, color: BRASS, detail: true },
      { k: 'box', w: 0.46, h: 0.04, d: 0.46, y: PL + 0.45, color: BRASS, detail: true },
      { k: 'panel', w: 0.3, h: 0.08, pos: [0, PL + 0.66, 0.23 + 0.008], color: BRASS, glow: 0.25 },
    ],
  },

  // 15. 밸브휠 + 증기 펌프장
  steampunk_pump_station: {
    label: '증기 펌프장',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.48, color: DARKM },
      { k: 'box', w: 0.52, h: 0.9, d: 0.48, y: PL, color: BRICK, rough: 0.85, windows: { from: 0.3, to: 0.75, color: EMBER, glow: 0.4 } },
      { k: 'roof', type: 'round', w: 0.56, d: 0.52, y: PL + 0.9, color: IRON },
      { k: 'cyl', rt: 0.16, rb: 0.16, h: 0.04, y: PL + 1.1, color: BRASS, seg: 12, detail: true },
      { k: 'box', w: 0.1, h: 0.6, d: 0.1, x: 0.18, z: -0.1, y: PL + 0.9, color: COPPER },
      { k: 'box', w: 0.12, h: 0.06, d: 0.12, x: 0.18, z: -0.1, y: PL + 1.5, color: STEAM, detail: true },
      ...ribs(0.52, 0.48, 0.9, PL, 5, BRICK2, 0.02),
      { k: 'panel', w: 0.16, h: 0.16, pos: [0, PL + 0.4, 0.25 + 0.008], color: EMBER, glow: 0.5 },
    ],
  },

  // 16. 라운드하우스 기관차고
  steampunk_locomotive_shed: {
    label: '기관차고',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.5, color: DARKM },
      { k: 'box', w: 0.66, h: 0.8, d: 0.5, y: PL, color: BRICK2, rough: 0.85 },
      { k: 'roof', type: 'round', w: 0.72, d: 0.56, y: PL + 0.8, color: IRON },
      { k: 'panel', w: 0.32, h: 0.5, pos: [0, PL + 0.25, 0.25 + 0.006], color: '#1E1A16' },
      { k: 'box', w: 0.34, h: 0.06, d: 0.06, z: 0.25, y: PL + 0.5, color: BRASS },
      { k: 'box', w: 0.12, h: 0.7, d: 0.12, x: -0.22, z: -0.12, y: PL + 0.8, color: BRICK2 },
      { k: 'box', w: 0.14, h: 0.06, d: 0.14, x: -0.22, z: -0.12, y: PL + 1.5, color: COPPER, detail: true },
      ...ribs(0.66, 0.5, 0.8, PL, 6, BRICK, 0.02),
      { k: 'panel', w: 0.4, h: 0.1, pos: [0, PL + 0.66, 0.26 + 0.008], color: BRASS, glow: 0.28 },
    ],
  },

  // 17. 톱니 작업장
  steampunk_workshop: {
    label: '발명가 작업장',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.46, color: DARKM },
      { k: 'box', w: 0.5, h: 0.9, d: 0.46, y: PL, color: BRICK, rough: 0.85, windows: { from: 0.4, to: 0.8, color: GLASS, glow: 0.35 } },
      { k: 'roof', type: 'round', w: 0.54, d: 0.5, y: PL + 0.9, color: COPPER },
      { k: 'cyl', rt: 0.12, rb: 0.12, h: 0.04, y: PL + 1.16, color: BRASS, seg: 10, detail: true },
      { k: 'box', w: 0.05, h: 0.3, d: 0.05, x: 0.12, z: -0.06, y: PL + 0.9, color: COPPER, detail: true },
      ...bands(0.5, 0.46, [PL + 0.48], BRICK2),
      { k: 'storefront', w: 0.5, d: 0.46, faceH: 0.32, awning: IRON, sign: BRASS },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0.14, PL + 0.7, 0.24 + 0.008], color: EMBER, glow: 0.5 },
    ],
  },

  // 18. 2층 땜장이 상점
  steampunk_tinker_shop: {
    label: '땜장이 상점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.4, color: DARKM },
      { k: 'box', w: 0.44, h: 0.56, d: 0.4, y: PL, color: COPPER, rough: 0.7, metal: 0.3, windows: { from: 0.45, to: 0.82, color: GLASS, glow: 0.35 } },
      { k: 'box', w: 0.4, h: 0.44, d: 0.36, y: PL + 0.56, color: BRICK, rough: 0.85, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.35 } },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.44, y: PL + 1.0, height: 0.16, color: IRON },
      { k: 'cyl', rt: 0.1, rb: 0.1, h: 0.04, y: PL + 1.16, color: BRASS, seg: 10, detail: true },
      { k: 'box', w: 0.08, h: 0.3, d: 0.08, x: 0.14, z: -0.08, y: PL + 1.0, color: COPPER },
      { k: 'storefront', w: 0.44, d: 0.4, faceH: 0.3, awning: DARKM, sign: BRASS },
      { k: 'panel', w: 0.1, h: 0.1, pos: [0.14, PL + 0.4, 0.2 + 0.008], color: EMBER, glow: 0.5 },
    ],
  },

  // 19. 2층 펍
  steampunk_pub: {
    label: '펍',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.42, color: DARKM },
      { k: 'box', w: 0.46, h: 0.6, d: 0.42, y: PL, color: BRICK, rough: 0.85, windows: { from: 0.4, to: 0.8, color: EMBER, glow: 0.4 } },
      { k: 'box', w: 0.42, h: 0.44, d: 0.38, y: PL + 0.6, color: BRICK2, rough: 0.85, windows: { from: 0.2, to: 0.8, color: EMBER, glow: 0.4 } },
      { k: 'box', w: 0.48, h: 0.24, d: 0.06, z: 0.19, y: PL + 1.04, color: BRICK2, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.5, d: 0.44, y: PL + 1.04, height: 0.12, color: IRON },
      ...ribs(0.46, 0.42, 0.6, PL, 4, BRICK2, 0.02),
      { k: 'storefront', w: 0.46, d: 0.42, faceH: 0.34, awning: '#5A2A1E', sign: BRASS },
      // 매달린 간판
      { k: 'box', w: 0.02, h: 0.14, d: 0.1, x: 0.22, z: 0.2, y: PL + 0.6, color: IRON },
      { k: 'panel', w: 0.12, h: 0.12, pos: [0.22, PL + 0.56, 0.2 + 0.008], color: BRASS, glow: 0.3 },
    ],
  },

  // 20. 놋쇠 열주 박물관
  steampunk_museum: {
    label: '기계 박물관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.5, color: DARKM },
      { k: 'box', w: 0.64, h: 0.9, d: 0.5, y: PL, color: BRICK2, rough: 0.82, windows: { from: 0.25, to: 0.78, color: GLASS, glow: 0.3 } },
      { k: 'columns', w: 0.64, d: 0.5, y: PL, h: 0.7, count: 7, color: BRASS },
      { k: 'box', w: 0.68, h: 0.08, d: 0.54, y: PL + 0.9, color: BRASS },
      { k: 'roof', type: 'round', w: 0.68, d: 0.54, y: PL + 0.98, color: IRON },
      // 지붕 위 대형 톱니 전시
      { k: 'cyl', rt: 0.18, rb: 0.18, h: 0.05, y: PL + 1.2, color: BRASS, seg: 12, detail: true },
      { k: 'cyl', rt: 0.12, rb: 0.12, h: 0.05, y: PL + 1.36, color: COPPER, seg: 12, detail: true },
      { k: 'panel', w: 0.32, h: 0.1, pos: [0, PL + 0.62, 0.26 + 0.008], color: BRASS, glow: 0.3 },
    ],
  },
} satisfies Record<string, BuildingConfig>
