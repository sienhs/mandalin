import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { ribs, cornice } from './_detail'

/**
 * T7 미래 SF 콜로니 (scifi) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 상향(min ~1.2)
 * 팔레트: 클린화이트 #E8EEF2, 실버 #AEB8C2, 시안 #4FE3FF, 딥블루 #12203A, 솔라 #0B1B3A.
 *
 * 매스: arcology=3세트백 메가타워 / spaceport=관제 원반 / beacon=니들 / ring=3링 타워 /
 *  hq=시안밴드 타워 / control=폴+관제헤드 / pod=원통+링포드 / capsule=포드그리드 슬랩 /
 *  fusion=원자로 드럼+돔 / lab=부유 큐브 / media=스크린 큐브 / academy=열주+돔 /
 *  hydro=물탱크 구 / terrace=스텝 테라스 / observatory=박스+돔슬릿 / biodome=대형 그린돔 /
 *  habitat=드럼타워+돔+도킹암 / market=돔 포드타워 / solar=솔라 타워 / medbay=메드타워+십자
 */

const WHITE = '#E8EEF2'
const WHITE2 = '#D2DAE2'
const SILVER = '#AEB8C2'
const CYAN = '#4FE3FF'
const DEEP = '#12203A'
const SOLAR = '#0B1B3A'
const GLASS = '#8FD4E8'
const GREEN = '#39FFB0'

const neon = (w: number, d: number, y: number, color: string, x = 0, z = 0) =>
  ({ k: 'box', w, h: 0.02, d, x, z, y, color, emissive: true } as const)

export const SCIFI = {
  // 1. 3세트백 메가타워
  scifi_arcology: {
    label: '아콜로지 초고층',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.68, color: DEEP },
      { k: 'box', w: 0.68, h: 0.12, d: 0.68, y: PL, color: SILVER },
      { k: 'box', w: 0.62, h: 1.0, d: 0.62, y: PL + 0.12, color: WHITE, rough: 0.35, metal: 0.4, windows: { from: 0.1, to: 0.95, color: CYAN, glow: 0.45 } },
      ...ribs(0.62, 0.62, 1.0, PL + 0.12, 7, GLASS, 0.02),
      neon(0.64, 0.64, PL + 0.62, CYAN),
      { k: 'box', w: 0.48, h: 0.9, d: 0.48, y: PL + 1.12, color: WHITE, rough: 0.35, metal: 0.4, windows: { from: 0.1, to: 0.95, color: CYAN, glow: 0.45 } },
      neon(0.5, 0.5, PL + 1.6, CYAN),
      { k: 'box', w: 0.32, h: 0.85, d: 0.32, y: PL + 2.02, color: WHITE2, rough: 0.35, metal: 0.4, windows: { from: 0.1, to: 0.95, color: CYAN, glow: 0.45 } },
      { k: 'cyl', rt: 0.1, rb: 0.16, h: 0.2, y: PL + 2.87, color: SILVER, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.3, y: PL + 3.07, color: GLASS },
      { k: 'antenna', y: PL + 3.07, h: 0.35 },
      { k: 'box', w: 0.02, h: 1.0, d: 0.02, x: -0.3, z: 0.3, y: PL + 0.12, color: CYAN, emissive: true },
      { k: 'box', w: 0.02, h: 1.0, d: 0.02, x: 0.3, z: 0.3, y: PL + 0.12, color: CYAN, emissive: true },
      { k: 'storefront', w: 0.62, d: 0.62, faceH: 0.32, awning: DEEP, sign: CYAN },
    ],
  },

  // 2. 관제 원반 스페이스포트
  scifi_spaceport_control: {
    label: '스페이스포트 관제탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: DEEP },
      { k: 'box', w: 0.4, h: 0.3, d: 0.4, y: PL, color: WHITE, rough: 0.4, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.4 } },
      { k: 'cyl', rt: 0.12, rb: 0.16, h: 1.6, y: PL + 0.3, color: WHITE, seg: 14 },
      { k: 'cyl', rt: 0.18, rb: 0.18, h: 0.04, y: PL + 0.9, color: CYAN, seg: 14, detail: true },
      // 관제 원반
      { k: 'cyl', rt: 0.34, rb: 0.26, h: 0.24, y: PL + 1.9, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.3, rb: 0.34, h: 0.12, y: PL + 2.14, color: DEEP, seg: 16 },
      { k: 'cyl', rt: 0.36, rb: 0.36, h: 0.03, y: PL + 2.02, color: CYAN, seg: 16, detail: true },
      { k: 'roof', type: 'dome', w: 0.6, y: PL + 2.26, color: GLASS },
      { k: 'antenna', y: PL + 2.44, h: 0.3 },
      { k: 'box', w: 0.06, h: 1.0, d: 0.06, x: 0.16, z: 0.1, y: PL + 0.3, color: SILVER, detail: true },
    ],
  },

  // 3. 니들 비콘 스파이어
  scifi_beacon_spire: {
    label: '비콘 스파이어',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: DEEP },
      { k: 'box', w: 0.4, h: 0.5, d: 0.4, y: PL, color: WHITE, rough: 0.4, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.4 } },
      ...ribs(0.4, 0.4, 0.5, PL, 4, GLASS, 0.02),
      { k: 'cyl', rt: 0.04, rb: 0.14, h: 2.0, y: PL + 0.5, color: SILVER, seg: 10 },
      { k: 'cyl', rt: 0.08, rb: 0.08, h: 0.1, y: PL + 0.9, color: CYAN, seg: 12, detail: true },
      { k: 'cyl', rt: 0.06, rb: 0.06, h: 0.1, y: PL + 1.5, color: CYAN, seg: 12, detail: true },
      { k: 'cyl', rt: 0.05, rb: 0.05, h: 0.14, y: PL + 2.1, color: CYAN, seg: 12, detail: true },
      { k: 'box', w: 0.2, h: 0.2, d: 0.2, y: PL + 2.5, color: WHITE2, rough: 0.4 },
      { k: 'antenna', y: PL + 2.7, h: 0.35 },
      { k: 'panel', w: 0.3, h: 0.06, pos: [0, PL + 0.9, 0.16 + 0.008], color: CYAN, glow: 0.6 },
    ],
  },

  // 4. 3링 스테이션 타워
  scifi_ring_station: {
    label: '링 스테이션 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: DEEP },
      { k: 'cyl', rt: 0.15, rb: 0.18, h: 2.0, y: PL, color: WHITE, seg: 14 },
      { k: 'cyl', rt: 0.36, rb: 0.36, h: 0.06, y: PL + 0.6, color: CYAN, seg: 20, detail: true },
      { k: 'cyl', rt: 0.36, rb: 0.36, h: 0.06, y: PL + 1.2, color: CYAN, seg: 20, detail: true },
      { k: 'cyl', rt: 0.3, rb: 0.3, h: 0.06, y: PL + 1.7, color: CYAN, seg: 20, detail: true },
      { k: 'cyl', rt: 0.19, rb: 0.15, h: 0.16, y: PL + 2.0, color: SILVER, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.32, y: PL + 2.16, color: GLASS },
      { k: 'antenna', y: PL + 2.16, h: 0.3 },
      { k: 'panel', w: 0.06, h: 0.4, pos: [0, PL + 1.0, 0.16 + 0.006], color: CYAN, glow: 0.4 },
    ],
  },

  // 5. 시안밴드 HQ 타워
  scifi_hq_tower: {
    label: '콜로니 본사',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.48, d: 0.44, color: DEEP },
      { k: 'box', w: 0.48, h: 1.8, d: 0.44, y: PL, color: WHITE, rough: 0.3, metal: 0.45, windows: { from: 0.08, to: 0.92, color: CYAN, glow: 0.4 } },
      ...ribs(0.48, 0.44, 1.8, PL, 6, GLASS, 0.016),
      neon(0.5, 0.46, PL + 0.6, CYAN),
      neon(0.5, 0.46, PL + 1.2, CYAN),
      { k: 'cyl', rt: 0.16, rb: 0.22, h: 0.2, y: PL + 1.8, color: SILVER, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.4, y: PL + 2.0, color: GLASS },
      { k: 'antenna', y: PL + 2.0, h: 0.35 },
      { k: 'storefront', w: 0.48, d: 0.44, faceH: 0.3, awning: DEEP, sign: CYAN },
    ],
  },

  // 6. 폴 + 관제헤드 관제탑
  scifi_control_tower: {
    label: '관제 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.4, d: 0.4, color: DEEP },
      { k: 'box', w: 0.34, h: 0.3, d: 0.34, y: PL, color: SILVER, rough: 0.4 },
      { k: 'box', w: 0.2, h: 1.3, d: 0.2, y: PL + 0.3, color: SILVER, rough: 0.4, metal: 0.5 },
      { k: 'box', w: 0.46, h: 0.3, d: 0.46, y: PL + 1.6, color: WHITE, rough: 0.35, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.5 } },
      { k: 'roof', type: 'dome', w: 0.48, y: PL + 1.9, color: GLASS },
      { k: 'antenna', y: PL + 2.06, h: 0.34 },
      neon(0.48, 0.48, PL + 1.58, CYAN),
      { k: 'panel', w: 0.34, h: 0.06, pos: [0, PL + 1.72, 0.23 + 0.008], color: CYAN, glow: 0.6 },
    ],
  },

  // 7. 원통 + 링포드 타워
  scifi_pod_tower: {
    label: '포드 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: DEEP },
      { k: 'cyl', rt: 0.14, rb: 0.16, h: 1.7, y: PL, color: WHITE2, seg: 14 },
      { k: 'cyl', rt: 0.27, rb: 0.27, h: 0.18, y: PL + 0.4, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.27, rb: 0.27, h: 0.18, y: PL + 0.9, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.25, rb: 0.25, h: 0.18, y: PL + 1.4, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.28, rb: 0.28, h: 0.03, y: PL + 0.58, color: CYAN, seg: 16, detail: true },
      { k: 'cyl', rt: 0.28, rb: 0.28, h: 0.03, y: PL + 1.08, color: CYAN, seg: 16, detail: true },
      { k: 'roof', type: 'dome', w: 0.34, y: PL + 1.7, color: GLASS },
      { k: 'antenna', y: PL + 1.7, h: 0.28 },
    ],
  },

  // 8. 포드그리드 캡슐 주거
  scifi_capsule_housing: {
    label: '캡슐 주거',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.5, color: DEEP },
      { k: 'box', w: 0.56, h: 1.5, d: 0.5, y: PL, color: WHITE2, rough: 0.4, metal: 0.3, windows: { from: 0.08, to: 0.95, color: CYAN, glow: 0.4 } },
      neon(0.58, 0.52, PL + 0.4, CYAN),
      neon(0.58, 0.52, PL + 0.8, CYAN),
      neon(0.58, 0.52, PL + 1.2, CYAN),
      { k: 'box', w: 0.14, h: 0.14, d: 0.1, x: 0.28 + 0.02, z: 0.12, y: PL + 0.35, color: SILVER },
      { k: 'box', w: 0.14, h: 0.14, d: 0.1, x: 0.28 + 0.02, z: -0.14, y: PL + 0.75, color: SILVER },
      { k: 'box', w: 0.14, h: 0.14, d: 0.1, x: -0.28 - 0.02, z: 0.1, y: PL + 0.55, color: SILVER },
      { k: 'box', w: 0.14, h: 0.14, d: 0.1, x: -0.28 - 0.02, z: -0.14, y: PL + 1.1, color: SILVER },
      { k: 'parapet', w: 0.56, d: 0.5, y: PL + 1.5, color: DEEP },
      { k: 'rooftopUnits', w: 0.56, y: PL + 1.5 },
      { k: 'storefront', w: 0.56, d: 0.5, faceH: 0.3, awning: DEEP, sign: CYAN },
    ],
  },

  // 9. 원자로 드럼 + 돔 핵융합
  scifi_fusion_plant: {
    label: '핵융합 발전소',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.7, d: 0.62, color: DEEP },
      { k: 'box', w: 0.7, h: 0.5, d: 0.62, y: PL, color: SILVER, rough: 0.4, metal: 0.5 },
      { k: 'cyl', rt: 0.24, rb: 0.28, h: 0.5, y: PL + 0.5, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.28, rb: 0.28, h: 0.04, y: PL + 0.7, color: CYAN, seg: 16, detail: true },
      { k: 'roof', type: 'dome', w: 0.6, y: PL + 1.0, color: GLASS },
      { k: 'box', w: 0.14, h: 0.8, d: 0.14, x: -0.26, z: -0.18, y: PL + 0.5, color: WHITE2, detail: true },
      { k: 'box', w: 0.14, h: 0.8, d: 0.14, x: 0.26, z: -0.18, y: PL + 0.5, color: WHITE2, detail: true },
      { k: 'box', w: 0.16, h: 0.06, d: 0.16, x: -0.26, z: -0.18, y: PL + 1.3, color: SILVER, detail: true },
      neon(0.72, 0.64, PL + 0.25, CYAN),
      { k: 'panel', w: 0.34, h: 0.12, pos: [0, PL + 0.3, 0.31 + 0.008], color: CYAN, glow: 0.7 },
    ],
  },

  // 10. 부유 큐브 랩
  scifi_lab_cube: {
    label: '랩 큐브',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.58, d: 0.56, color: DEEP },
      { k: 'box', w: 0.5, h: 0.9, d: 0.5, y: PL, color: WHITE, rough: 0.3, metal: 0.4, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.4 } },
      { k: 'box', w: 0.34, h: 0.14, d: 0.34, y: PL + 0.9, color: SILVER },
      // 부유 상부 큐브(더 넓음)
      { k: 'box', w: 0.58, h: 0.44, d: 0.58, y: PL + 1.04, color: WHITE2, rough: 0.3, metal: 0.4, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.4 } },
      neon(0.6, 0.6, PL + 1.26, CYAN),
      { k: 'parapet', w: 0.58, d: 0.58, y: PL + 1.48, color: DEEP },
      { k: 'box', w: 0.52, h: 0.04, d: 0.52, y: PL + 0.44, color: CYAN, emissive: true },
      { k: 'antenna', y: PL + 1.48, h: 0.3 },
      { k: 'box', w: 0.06, h: 0.14, d: 0.06, x: 0.24, z: 0.24, y: PL + 0.9, color: SILVER, detail: true },
    ],
  },

  // 11. 스크린 큐브 미디어
  scifi_media_cube: {
    label: '미디어 큐브',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: DEEP },
      { k: 'box', w: 0.5, h: 1.4, d: 0.5, y: PL, color: DEEP, rough: 0.35, metal: 0.5 },
      { k: 'box', w: 0.34, h: 0.3, d: 0.34, y: PL + 1.4, color: SILVER, rough: 0.4 },
      { k: 'roof', type: 'pyramid', w: 0.38, y: PL + 1.7, height: 0.12, color: SILVER },
      { k: 'antenna', y: PL + 1.82, h: 0.3 },
      { k: 'panel', w: 0.44, h: 1.2, pos: [0, PL + 0.75, 0.25 + 0.008], color: CYAN, glow: 0.7 },
      { k: 'panel', w: 0.44, h: 1.2, pos: [0, PL + 0.75, -0.25 - 0.008], rotY: 3.1416, color: '#4FA0FF', glow: 0.7 },
      { k: 'panel', w: 0.44, h: 1.2, pos: [0.25 + 0.008, PL + 0.75, 0], rotY: 1.5708, color: GREEN, glow: 0.65 },
      { k: 'panel', w: 0.44, h: 1.2, pos: [-0.25 - 0.008, PL + 0.75, 0], rotY: 1.5708, color: '#FF6AC0', glow: 0.65 },
    ],
  },

  // 12. 열주 + 돔 아카데미
  scifi_academy: {
    label: '콜로니 아카데미',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.5, color: DEEP },
      { k: 'box', w: 0.66, h: 0.9, d: 0.5, y: PL, color: WHITE, rough: 0.4, windows: { from: 0.2, to: 0.8, color: CYAN, glow: 0.36 } },
      { k: 'columns', w: 0.66, d: 0.5, y: PL, h: 0.66, count: 6, color: SILVER },
      cornice(0.66, 0.5, PL + 0.9, CYAN),
      { k: 'box', w: 0.34, h: 0.34, d: 0.34, y: PL + 0.95, color: WHITE2, rough: 0.4 },
      { k: 'cyl', rt: 0.18, rb: 0.2, h: 0.1, y: PL + 1.29, color: WHITE, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.48, y: PL + 1.39, color: GLASS },
      { k: 'antenna', y: PL + 1.55, h: 0.24 },
      { k: 'panel', w: 0.34, h: 0.1, pos: [0, PL + 0.7, 0.26 + 0.008], color: CYAN, glow: 0.4 },
    ],
  },

  // 13. 물탱크 구 하이드로
  scifi_hydro_tower: {
    label: '하이드로 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: DEEP },
      { k: 'box', w: 0.3, h: 0.3, d: 0.3, y: PL, color: SILVER, rough: 0.4 },
      { k: 'cyl', rt: 0.11, rb: 0.13, h: 0.9, y: PL + 0.3, color: SILVER, seg: 12 },
      // 상부 물탱크 구(원통 근사)
      { k: 'cyl', rt: 0.26, rb: 0.2, h: 0.24, y: PL + 1.2, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.24, rb: 0.26, h: 0.2, y: PL + 1.44, color: WHITE, seg: 16 },
      { k: 'roof', type: 'dome', w: 0.52, y: PL + 1.64, color: GLASS },
      { k: 'cyl', rt: 0.28, rb: 0.28, h: 0.03, y: PL + 1.42, color: CYAN, seg: 16, detail: true },
      { k: 'antenna', y: PL + 1.86, h: 0.24 },
      { k: 'box', w: 0.06, h: 0.9, d: 0.06, x: 0.16, z: 0.05, y: PL + 0.3, color: WHITE2, detail: true },
    ],
  },

  // 14. 스텝 테라스 주거
  scifi_terrace_hab: {
    label: '테라스 주거',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.46, color: DEEP },
      { k: 'box', w: 0.64, h: 0.44, d: 0.46, y: PL, color: WHITE, rough: 0.4, windows: { from: 0.3, to: 0.85, color: CYAN, glow: 0.36 } },
      { k: 'box', w: 0.52, h: 0.42, d: 0.4, z: -0.04, y: PL + 0.44, color: WHITE, rough: 0.4, windows: { from: 0.3, to: 0.85, color: CYAN, glow: 0.36 } },
      { k: 'box', w: 0.4, h: 0.4, d: 0.34, z: -0.08, y: PL + 0.86, color: WHITE2, rough: 0.4, windows: { from: 0.3, to: 0.85, color: CYAN, glow: 0.36 } },
      { k: 'box', w: 0.28, h: 0.38, d: 0.28, z: -0.1, y: PL + 1.26, color: WHITE, rough: 0.4 },
      // 테라스 녹지 발광
      { k: 'box', w: 0.6, h: 0.03, d: 0.06, z: 0.2, y: PL + 0.44, color: GREEN, emissive: true },
      { k: 'box', w: 0.48, h: 0.03, d: 0.06, z: 0.14, y: PL + 0.86, color: GREEN, emissive: true },
      { k: 'box', w: 0.36, h: 0.03, d: 0.06, z: 0.08, y: PL + 1.26, color: GREEN, emissive: true },
      { k: 'roof', type: 'dome', w: 0.24, y: PL + 1.64, color: GLASS },
    ],
  },

  // 15. 박스 + 돔슬릿 천문대
  scifi_observatory: {
    label: '천문대',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: DEEP },
      { k: 'box', w: 0.44, h: 0.9, d: 0.44, y: PL, color: WHITE, rough: 0.4, windows: { from: 0.2, to: 0.75, color: CYAN, glow: 0.36 } },
      ...ribs(0.44, 0.44, 0.9, PL, 4, GLASS, 0.018),
      { k: 'cyl', rt: 0.24, rb: 0.26, h: 0.3, y: PL + 0.9, color: WHITE2, seg: 16 },
      { k: 'roof', type: 'dome', w: 0.66, y: PL + 1.2, color: SILVER },
      { k: 'panel', w: 0.08, h: 0.3, pos: [0, PL + 1.4, 0.24 + 0.006], color: DEEP },
      neon(0.46, 0.46, PL + 0.45, CYAN),
      { k: 'panel', w: 0.34, h: 0.08, pos: [0, PL + 0.7, 0.23 + 0.008], color: CYAN, glow: 0.4 },
    ],
  },

  // 16. 대형 그린돔 바이오돔 (LOW→상향: 드럼 높임)
  scifi_biodome: {
    label: '바이오돔 온실',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.72, d: 0.72, color: DEEP },
      { k: 'cyl', rt: 0.36, rb: 0.4, h: 0.7, y: PL, color: SILVER, seg: 18 },
      { k: 'cyl', rt: 0.4, rb: 0.4, h: 0.04, y: PL + 0.3, color: CYAN, seg: 18, detail: true },
      { k: 'roof', type: 'dome', w: 1.06, y: PL + 0.7, color: '#7FE8C0' },
      { k: 'cyl', rt: 0.4, rb: 0.4, h: 0.04, y: PL + 0.68, color: GREEN, seg: 18, detail: true },
      { k: 'box', w: 0.16, h: 0.3, d: 0.18, z: 0.4, y: PL, color: WHITE },
      { k: 'box', w: 0.12, h: 0.24, d: 0.14, x: 0.4, z: 0, y: PL, color: WHITE },
      { k: 'panel', w: 0.1, h: 0.14, pos: [0, PL + 0.16, 0.49 + 0.006], color: CYAN, glow: 0.5 },
      { k: 'antenna', y: PL + 1.1, h: 0.3 },
    ],
  },

  // 17. 드럼타워 + 돔 + 도킹암 (habitat LOW→상향)
  scifi_habitat_dome: {
    label: '거주 돔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.62, color: DEEP },
      { k: 'cyl', rt: 0.28, rb: 0.32, h: 1.0, y: PL, color: WHITE, seg: 16 },
      { k: 'cyl', rt: 0.32, rb: 0.32, h: 0.04, y: PL + 0.4, color: CYAN, seg: 16, detail: true },
      { k: 'cyl', rt: 0.32, rb: 0.32, h: 0.04, y: PL + 0.8, color: CYAN, seg: 16, detail: true },
      { k: 'roof', type: 'dome', w: 0.8, y: PL + 1.0, color: GLASS },
      // 도킹 암 2
      { k: 'box', w: 0.2, h: 0.14, d: 0.16, x: 0.34, z: 0, y: PL + 0.5, color: SILVER },
      { k: 'box', w: 0.2, h: 0.14, d: 0.16, x: -0.34, z: 0, y: PL + 0.7, color: SILVER },
      { k: 'panel', w: 0.14, h: 0.14, pos: [0.44, PL + 0.56, 0], rotY: 1.5708, color: CYAN, glow: 0.5 },
      { k: 'antenna', y: PL + 1.3, h: 0.3 },
    ],
  },

  // 18. 돔 포드타워 마켓 (LOW→상향)
  scifi_market_pod: {
    label: '마켓 포드',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.48, color: DEEP },
      { k: 'cyl', rt: 0.24, rb: 0.26, h: 0.5, y: PL, color: WHITE, seg: 16 },
      { k: 'roof', type: 'dome', w: 0.58, y: PL + 0.5, color: GLASS },
      { k: 'cyl', rt: 0.16, rb: 0.18, h: 0.6, y: PL + 0.72, color: WHITE2, seg: 14 },
      { k: 'roof', type: 'dome', w: 0.4, y: PL + 1.32, color: GLASS },
      { k: 'antenna', y: PL + 1.48, h: 0.24 },
      { k: 'cyl', rt: 0.27, rb: 0.27, h: 0.03, y: PL + 0.24, color: CYAN, seg: 16, detail: true },
      { k: 'storefront', w: 0.52, d: 0.48, faceH: 0.28, awning: DEEP, sign: CYAN },
      { k: 'panel', w: 0.3, h: 0.1, pos: [0, PL + 0.34, 0.26 + 0.008], color: CYAN, glow: 0.5 },
    ],
  },

  // 19. 솔라 타워 (LOW→상향/CC)
  scifi_solar_farm: {
    label: '솔라 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: DEEP },
      { k: 'box', w: 0.32, h: 1.4, d: 0.32, y: PL, color: SILVER, rough: 0.4, metal: 0.5, windows: { from: 0.1, to: 0.9, color: CYAN, glow: 0.36 } },
      // 방사형 솔라 패널(층별 슬래브)
      { k: 'box', w: 0.66, h: 0.03, d: 0.2, y: PL + 0.4, color: SOLAR },
      { k: 'box', w: 0.2, h: 0.03, d: 0.66, y: PL + 0.7, color: SOLAR },
      { k: 'box', w: 0.6, h: 0.03, d: 0.2, y: PL + 1.0, color: SOLAR },
      neon(0.66, 0.04, PL + 0.42, CYAN),
      neon(0.04, 0.66, PL + 0.72, CYAN),
      { k: 'box', w: 0.36, h: 0.16, d: 0.36, y: PL + 1.4, color: WHITE, rough: 0.4 },
      { k: 'roof', type: 'dome', w: 0.4, y: PL + 1.56, color: GLASS },
      { k: 'antenna', y: PL + 1.72, h: 0.24 },
    ],
  },

  // 20. 메드타워 + 십자 (LOW→상향)
  scifi_medbay: {
    label: '메드베이',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.44, color: DEEP },
      { k: 'box', w: 0.46, h: 1.4, d: 0.44, y: PL, color: WHITE, rough: 0.35, windows: { from: 0.1, to: 0.9, color: CYAN, glow: 0.4 } },
      ...ribs(0.46, 0.44, 1.4, PL, 5, GLASS, 0.016),
      neon(0.48, 0.46, PL + 0.5, GREEN),
      neon(0.48, 0.46, PL + 1.0, GREEN),
      { k: 'parapet', w: 0.46, d: 0.44, y: PL + 1.4, color: DEEP },
      { k: 'rooftopUnits', w: 0.46, y: PL + 1.4 },
      { k: 'cross', y: PL + 1.0, z: 0.22 + 0.008, color: GREEN, s: 0.8 },
      { k: 'cross', y: PL + 1.55, color: GREEN, s: 0.6 },
      { k: 'storefront', w: 0.46, d: 0.44, faceH: 0.3, awning: '#0E2A2A', sign: GREEN },
    ],
  },
} satisfies Record<string, BuildingConfig>
