import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { steps } from './_detail'

/**
 * T11 고대 이집트 (egypt) — 극단적 유니크 매스 · 고밀도 디테일 · 저층 상향(min ~1.2)
 * 팔레트: 사암 #D8B77A·#C79A5B, 골드 #D9B23A, 라피스 #1F4E8C, 붉은황토 #9B4B2E, 흑현무암 #2B2723.
 *
 * 매스: obelisk=오벨리스크 / step_pyramid=계단 피라미드 / great_pyramid=대피라미드 / great_temple=파일런+열주 /
 *  pharaoh=파라오궁 / pylon_gate=쌍 파일런 / sphinx_gate=스핑크스 문 / sun_temple=태양신전 /
 *  mortuary=계단 테라스 / colossus=거상 / watchtower=계단 탑 / library=열주 도서관 / granary=곡물 사일로 /
 *  noble_house=2층+윈드캐처 / scribe=2층 열주 / priest=2층 사제관 / market=2층 열주시장 / bakery=2층 화덕 /
 *  pottery=2층 가마 / shrine=신당 탑
 */

const SAND = '#D8B77A'
const SAND2 = '#C79A5B'
const SANDD = '#B8894A'
const GOLD = '#D9B23A'
const LAPIS = '#1F4E8C'
const OCHRE = '#9B4B2E'
const BASALT = '#2B2723'

export const EGYPT = {
  // 1. 오벨리스크
  egypt_obelisk: {
    label: '오벨리스크',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: SAND2 },
      { k: 'box', w: 0.3, h: 0.24, d: 0.3, y: PL, color: SAND2, rough: 0.9 },
      ...steps(0.18, PL, 0.16, SANDD, 2),
      { k: 'box', w: 0.18, h: 2.1, d: 0.18, y: PL + 0.24, color: SAND, rough: 0.88 },
      { k: 'box', w: 0.15, h: 0.05, d: 0.15, y: PL + 2.34, color: SAND2 },
      { k: 'roof', type: 'pyramid', w: 0.14, y: PL + 2.39, height: 0.2, color: GOLD },
      { k: 'panel', w: 0.1, h: 1.6, pos: [0, PL + 1.1, 0.09 + 0.006], color: OCHRE, glow: 0.08 },
      { k: 'panel', w: 0.1, h: 1.6, pos: [0.09 + 0.006, PL + 1.1, 0], rotY: 1.5708, color: OCHRE, glow: 0.08 },
    ],
  },

  // 2. 계단 피라미드
  egypt_step_pyramid: {
    label: '계단 피라미드',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.76, d: 0.76, color: SAND2 },
      { k: 'box', w: 0.7, h: 0.4, d: 0.7, y: PL, color: SAND, rough: 0.92 },
      { k: 'box', w: 0.56, h: 0.34, d: 0.56, y: PL + 0.4, color: SAND2, rough: 0.92 },
      { k: 'box', w: 0.44, h: 0.3, d: 0.44, y: PL + 0.74, color: SAND, rough: 0.92 },
      { k: 'box', w: 0.32, h: 0.28, d: 0.32, y: PL + 1.04, color: SAND2, rough: 0.92 },
      { k: 'box', w: 0.2, h: 0.26, d: 0.2, y: PL + 1.32, color: SAND, rough: 0.92 },
      { k: 'roof', type: 'pyramid', w: 0.22, y: PL + 1.58, height: 0.14, color: SAND2 },
      { k: 'panel', w: 0.14, h: 0.24, pos: [0, PL + 0.16, 0.35 + 0.006], color: BASALT },
      { k: 'box', w: 0.08, h: 0.16, d: 0.08, x: 0.34, z: 0.34, y: PL, color: GOLD, detail: true, emissive: true },
    ],
  },

  // 3. 대피라미드
  egypt_great_pyramid: {
    label: '대피라미드',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.8, d: 0.8, color: SAND2 },
      { k: 'box', w: 0.76, h: 0.18, d: 0.76, y: PL, color: SAND2, rough: 0.95 },
      { k: 'roof', type: 'pyramid', w: 0.76, d: 0.76, y: PL + 0.18, height: 1.1, color: SAND },
      { k: 'roof', type: 'pyramid', w: 0.18, d: 0.18, y: PL + 1.1, height: 0.16, color: GOLD },
      { k: 'panel', w: 0.16, h: 0.24, pos: [0, PL + 0.26, 0.38 + 0.006], color: BASALT },
      // 위성 소피라미드
    ],
  },

  // 4. 파일런 + 열주 대신전
  egypt_great_temple: {
    label: '대신전',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.74, d: 0.6, color: SAND2 },
      // 파일런 2탑(좁아지는 배터)
      { k: 'box', w: 0.24, h: 1.1, d: 0.36, x: -0.24, z: 0.14, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.2, h: 0.14, d: 0.32, x: -0.24, z: 0.14, y: PL + 1.1, color: SAND2, rough: 0.9 },
      { k: 'box', w: 0.24, h: 1.1, d: 0.36, x: 0.24, z: 0.14, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.2, h: 0.14, d: 0.32, x: 0.24, z: 0.14, y: PL + 1.1, color: SAND2, rough: 0.9 },
      // 뒤 열주 홀(더 높게)
      { k: 'box', w: 0.6, h: 0.8, d: 0.34, z: -0.12, y: PL, color: SAND2, rough: 0.9, windows: { from: 0.4, to: 0.75, color: LAPIS, glow: 0.15 } },
      { k: 'box', w: 0.64, h: 0.12, d: 0.38, z: -0.12, y: PL + 0.8, color: SAND, rough: 0.9 },
      { k: 'panel', w: 0.16, h: 0.6, pos: [0, PL + 0.34, 0.32 + 0.006], color: BASALT },
      { k: 'panel', w: 0.4, h: 0.08, pos: [0, PL + 1.16, 0.15 + 0.006], color: LAPIS, glow: 0.15 },
      { k: 'box', w: 0.06, h: 0.16, d: 0.06, x: -0.24, z: 0.24, y: PL + 1.24, color: GOLD, detail: true, emissive: true },
      { k: 'box', w: 0.06, h: 0.16, d: 0.06, x: 0.24, z: 0.24, y: PL + 1.24, color: GOLD, detail: true, emissive: true },
    ],
  },

  // 5. 파라오 궁
  egypt_pharaoh_palace: {
    label: '파라오 궁',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.74, d: 0.56, color: SAND2 },
      { k: 'box', w: 0.7, h: 0.16, d: 0.5, y: PL, color: SANDD, rough: 0.9 },
      { k: 'box', w: 0.62, h: 0.7, d: 0.44, y: PL + 0.16, color: SAND, rough: 0.88, windows: { from: 0.3, to: 0.75, color: LAPIS, glow: 0.2 } },
      { k: 'columns', w: 0.62, d: 0.44, y: PL + 0.16, h: 0.7, count: 7, color: GOLD },
      { k: 'box', w: 0.66, h: 0.12, d: 0.48, y: PL + 0.86, color: LAPIS, rough: 0.7 },
      { k: 'box', w: 0.5, h: 0.34, d: 0.36, y: PL + 0.98, color: SAND, rough: 0.88, windows: { from: 0.2, to: 0.8, color: LAPIS, glow: 0.2 } },
      { k: 'box', w: 0.54, h: 0.08, d: 0.4, y: PL + 1.32, color: GOLD },
      ...steps(0.4, PL, 0.25, SANDD, 3),
      { k: 'panel', w: 0.5, h: 0.08, pos: [0, PL + 0.78, 0.23 + 0.008], color: GOLD, glow: 0.3 },
      { k: 'panel', w: 0.16, h: 0.34, pos: [0, PL + 0.33, 0.23 + 0.006], color: BASALT },
    ],
  },

  // 6. 쌍 파일런 대문
  egypt_pylon_gate: {
    label: '파일런 대문',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.72, d: 0.42, color: SAND2 },
      { k: 'box', w: 0.3, h: 1.4, d: 0.38, x: -0.2, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.24, h: 0.18, d: 0.32, x: -0.2, y: PL + 1.4, color: SAND2, rough: 0.9 },
      { k: 'box', w: 0.3, h: 1.4, d: 0.38, x: 0.2, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.24, h: 0.18, d: 0.32, x: 0.2, y: PL + 1.4, color: SAND2, rough: 0.9 },
      { k: 'box', w: 0.16, h: 0.9, d: 0.3, y: PL, color: BASALT, rough: 0.8 },
      { k: 'box', w: 0.5, h: 0.14, d: 0.34, y: PL + 0.9, color: SAND2, rough: 0.9 },
      { k: 'panel', w: 0.26, h: 0.7, pos: [-0.2, PL + 0.5, 0.2 + 0.006], color: OCHRE, glow: 0.1 },
      { k: 'panel', w: 0.26, h: 0.7, pos: [0.2, PL + 0.5, 0.2 + 0.006], color: OCHRE, glow: 0.1 },
      { k: 'panel', w: 0.4, h: 0.08, pos: [0, PL + 0.98, 0.18 + 0.006], color: LAPIS, glow: 0.15 },
      // 깃대
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: -0.2, z: 0.2, y: PL + 1.4, color: OCHRE, detail: true },
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: 0.2, z: 0.2, y: PL + 1.4, color: OCHRE, detail: true },
    ],
  },

  // 7. 스핑크스 게이트
  egypt_sphinx_gate: {
    label: '스핑크스 게이트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.72, d: 0.5, color: SAND2 },
      { k: 'box', w: 0.26, h: 1.1, d: 0.4, x: -0.22, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.22, h: 0.16, d: 0.36, x: -0.22, y: PL + 1.1, color: SAND2, rough: 0.9 },
      { k: 'box', w: 0.26, h: 1.1, d: 0.4, x: 0.22, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.22, h: 0.16, d: 0.36, x: 0.22, y: PL + 1.1, color: SAND2, rough: 0.9 },
      { k: 'panel', w: 0.16, h: 0.6, pos: [0, PL + 0.3, 0.2 + 0.006], color: BASALT },
      { k: 'box', w: 0.5, h: 0.12, d: 0.4, y: PL + 0.9, color: SAND2, rough: 0.9 },
      // 좌우 스핑크스(몸통+머리+네메스)
      { k: 'box', w: 0.14, h: 0.12, d: 0.3, x: -0.3, z: 0.3, y: PL, color: SANDD },
      { k: 'box', w: 0.12, h: 0.14, d: 0.12, x: -0.3, z: 0.42, y: PL + 0.12, color: GOLD },
      { k: 'box', w: 0.14, h: 0.12, d: 0.3, x: 0.3, z: 0.3, y: PL, color: SANDD },
      { k: 'box', w: 0.12, h: 0.14, d: 0.12, x: 0.3, z: 0.42, y: PL + 0.12, color: GOLD },
      { k: 'panel', w: 0.34, h: 0.06, pos: [0, PL + 0.94, 0.15 + 0.006], color: LAPIS, glow: 0.15 },
    ],
  },

  // 8. 태양신전
  egypt_sun_temple: {
    label: '태양신전',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.56, color: SAND2 },
      { k: 'box', w: 0.6, h: 0.6, d: 0.5, y: PL, color: SAND, rough: 0.9, windows: { from: 0.3, to: 0.7, color: LAPIS, glow: 0.15 } },
      { k: 'columns', w: 0.6, d: 0.5, y: PL, h: 0.5, count: 6, color: SANDD },
      { k: 'box', w: 0.64, h: 0.1, d: 0.54, y: PL + 0.6, color: SAND2 },
      // 중앙 벤벤 오벨리스크
      { k: 'box', w: 0.2, h: 0.8, d: 0.2, y: PL + 0.7, color: SAND2, rough: 0.88 },
      { k: 'roof', type: 'pyramid', w: 0.2, y: PL + 1.5, height: 0.14, color: GOLD },
      // 태양 원반
      { k: 'cyl', rt: 0.16, rb: 0.16, h: 0.05, y: PL + 1.2, color: GOLD, seg: 16, detail: true },
      { k: 'panel', w: 0.4, h: 0.07, pos: [0, PL + 0.48, 0.26 + 0.008], color: LAPIS, glow: 0.15 },
    ],
  },

  // 9. 계단 테라스 장제전
  egypt_mortuary_temple: {
    label: '장제전',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.76, d: 0.56, color: SAND2 },
      { k: 'box', w: 0.76, h: 0.34, d: 0.56, y: PL, color: SAND, rough: 0.9 },
      { k: 'columns', w: 0.76, d: 0.56, y: PL, h: 0.28, count: 8, color: SANDD },
      { k: 'box', w: 0.62, h: 0.06, d: 0.46, y: PL + 0.34, color: SAND2 },
      { k: 'box', w: 0.6, h: 0.34, d: 0.42, z: -0.04, y: PL + 0.4, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.46, h: 0.06, d: 0.32, y: PL + 0.74, color: SAND2 },
      { k: 'box', w: 0.44, h: 0.34, d: 0.3, z: -0.08, y: PL + 0.8, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.3, h: 0.06, d: 0.24, z: -0.08, y: PL + 1.14, color: SAND2 },
      // 중앙 성소 오벨리스크
      { k: 'box', w: 0.14, h: 0.4, d: 0.14, z: -0.08, y: PL + 1.2, color: SAND2 },
      { k: 'roof', type: 'pyramid', w: 0.14, y: PL + 1.6, height: 0.12, color: GOLD },
      { k: 'panel', w: 0.5, h: 0.06, pos: [0, PL + 0.32, 0.29 + 0.006], color: LAPIS, glow: 0.12 },
      { k: 'panel', w: 0.14, h: 0.16, pos: [0, PL + 0.24, 0.29 + 0.006], color: BASALT },
    ],
  },

  // 10. 거상
  egypt_colossus: {
    label: '거상',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: SAND2 },
      { k: 'box', w: 0.42, h: 0.4, d: 0.36, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.36, h: 0.6, d: 0.3, z: -0.04, y: PL + 0.4, color: SAND2, rough: 0.9 },
      // 팔(양옆)
      { k: 'box', w: 0.1, h: 0.5, d: 0.16, x: -0.22, z: 0.02, y: PL + 0.42, color: SAND },
      { k: 'box', w: 0.1, h: 0.5, d: 0.16, x: 0.22, z: 0.02, y: PL + 0.42, color: SAND },
      { k: 'box', w: 0.24, h: 0.24, d: 0.22, z: -0.04, y: PL + 1.0, color: SAND, rough: 0.9 },
      // 네메스 두건 (금+라피스)
      { k: 'box', w: 0.3, h: 0.16, d: 0.26, z: -0.04, y: PL + 1.24, color: GOLD, rough: 0.6 },
      { k: 'box', w: 0.32, h: 0.05, d: 0.28, z: -0.04, y: PL + 1.22, color: LAPIS, rough: 0.6 },
      { k: 'box', w: 0.06, h: 0.16, d: 0.04, z: 0.06, y: PL + 1.4, color: GOLD, detail: true },
      { k: 'panel', w: 0.12, h: 0.16, pos: [0, PL + 1.06, 0.1 + 0.006], color: BASALT },
      { k: 'panel', w: 0.3, h: 0.24, pos: [0, PL + 0.56, 0.12 + 0.006], color: BASALT },
    ],
  },

  // 11. 계단 감시탑
  egypt_watchtower: {
    label: '감시탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.44, color: SAND2 },
      { k: 'box', w: 0.4, h: 0.6, d: 0.4, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.32, h: 0.5, d: 0.32, y: PL + 0.6, color: SAND2, rough: 0.9, windows: { from: 0.2, to: 0.8, color: BASALT, glow: 0 } },
      { k: 'box', w: 0.24, h: 0.44, d: 0.24, y: PL + 1.1, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.34, h: 0.12, d: 0.34, y: PL + 1.54, color: SAND2, rough: 0.9 },
      // 흉벽 코너
      { k: 'box', w: 0.06, h: 0.08, d: 0.06, x: -0.13, z: 0.13, y: PL + 1.66, color: SAND2, detail: true },
      { k: 'box', w: 0.06, h: 0.08, d: 0.06, x: 0.13, z: 0.13, y: PL + 1.66, color: SAND2, detail: true },
      { k: 'box', w: 0.06, h: 0.08, d: 0.06, x: -0.13, z: -0.13, y: PL + 1.66, color: SAND2, detail: true },
      { k: 'box', w: 0.06, h: 0.08, d: 0.06, x: 0.13, z: -0.13, y: PL + 1.66, color: SAND2, detail: true },
      { k: 'panel', w: 0.24, h: 0.06, pos: [0, PL + 0.98, 0.16 + 0.006], color: LAPIS, glow: 0.15 },
    ],
  },

  // 12. 열주 도서관
  egypt_library: {
    label: '서기관 도서관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.5, color: SAND2 },
      { k: 'box', w: 0.64, h: 0.9, d: 0.5, y: PL, color: SAND, rough: 0.9, windows: { from: 0.3, to: 0.75, color: LAPIS, glow: 0.2 } },
      { k: 'columns', w: 0.64, d: 0.5, y: PL, h: 0.7, count: 7, color: SANDD },
      { k: 'box', w: 0.68, h: 0.1, d: 0.54, y: PL + 0.9, color: SAND2, rough: 0.9 },
      { k: 'box', w: 0.5, h: 0.3, d: 0.4, y: PL + 1.0, color: OCHRE, rough: 0.85 },
      { k: 'box', w: 0.54, h: 0.06, d: 0.44, y: PL + 1.3, color: SAND2 },
      ...steps(0.4, PL, 0.25, SANDD, 3),
      { k: 'panel', w: 0.5, h: 0.08, pos: [0, PL + 0.78, 0.26 + 0.008], color: LAPIS, glow: 0.15 },
      { k: 'panel', w: 0.14, h: 0.3, pos: [0, PL + 0.18, 0.26 + 0.006], color: BASALT },
    ],
  },

  // 13. 곡물 사일로 창고
  egypt_granary: {
    label: '나일 창고',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.5, color: SAND2 },
      { k: 'box', w: 0.64, h: 0.4, d: 0.5, y: PL, color: SANDD, rough: 0.92 },
      // 원뿔형 곡물 저장고 (중앙 큰 것 + 양옆)
      { k: 'cyl', rt: 0.14, rb: 0.17, h: 0.8, y: PL + 0.4, color: SAND, seg: 12 },
      { k: 'roof', type: 'cone', w: 0.3, y: PL + 1.2, height: 0.18, color: SAND2 },
      { k: 'box', w: 0.18, h: 0.6, d: 0.18, x: -0.24, z: 0.06, y: PL + 0.4, color: SAND },
      { k: 'box', w: 0.2, h: 0.12, d: 0.2, x: -0.24, z: 0.06, y: PL + 1.0, color: SAND2 },
      { k: 'box', w: 0.18, h: 0.6, d: 0.18, x: 0.24, z: 0.06, y: PL + 0.4, color: SAND },
      { k: 'box', w: 0.2, h: 0.12, d: 0.2, x: 0.24, z: 0.06, y: PL + 1.0, color: SAND2 },
      { k: 'panel', w: 0.4, h: 0.06, pos: [0, PL + 0.28, 0.26 + 0.008], color: LAPIS, glow: 0.12 },
    ],
  },

  // 14. 2층 + 윈드캐처 귀족 저택
  egypt_noble_house: {
    label: '귀족 저택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.48, color: SAND2 },
      { k: 'box', w: 0.6, h: 0.56, d: 0.48, y: PL, color: SAND, rough: 0.9, windows: { from: 0.3, to: 0.7, color: BASALT, glow: 0 } },
      { k: 'box', w: 0.52, h: 0.44, d: 0.42, y: PL + 0.56, color: SANDD, rough: 0.9, windows: { from: 0.2, to: 0.8, color: BASALT, glow: 0 } },
      { k: 'parapet', w: 0.52, d: 0.42, y: PL + 1.0, color: '#B8895A' },
      // 윈드캐처(말카프) 탑
      { k: 'box', w: 0.24, h: 0.4, d: 0.24, y: PL + 1.0, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.28, h: 0.06, d: 0.14, z: 0.02, y: PL + 1.4, color: OCHRE },
      { k: 'columns', w: 0.24, d: 0.24, y: PL + 1.0, h: 0.4, count: 3, color: GOLD },
      { k: 'panel', w: 0.5, h: 0.06, pos: [0, PL + 0.44, 0.25 + 0.008], color: LAPIS, glow: 0.12 },
      { k: 'panel', w: 0.12, h: 0.24, pos: [0, PL + 0.14, 0.25 + 0.006], color: BASALT },
    ],
  },

  // 15. 2층 열주 서기관 학교
  egypt_scribe_school: {
    label: '서기관 학교',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.46, color: SAND2 },
      { k: 'box', w: 0.56, h: 0.6, d: 0.46, y: PL, color: SANDD, rough: 0.9, windows: { from: 0.35, to: 0.72, color: BASALT, glow: 0 } },
      { k: 'columns', w: 0.56, d: 0.46, y: PL, h: 0.5, count: 5, color: SAND },
      { k: 'box', w: 0.6, h: 0.08, d: 0.5, y: PL + 0.6, color: SAND2 },
      { k: 'box', w: 0.48, h: 0.44, d: 0.4, y: PL + 0.68, color: SAND, rough: 0.9, windows: { from: 0.2, to: 0.8, color: BASALT, glow: 0 } },
      { k: 'parapet', w: 0.48, d: 0.4, y: PL + 1.12, color: SAND2 },
      { k: 'panel', w: 0.4, h: 0.07, pos: [0, PL + 0.46, 0.24 + 0.008], color: LAPIS, glow: 0.12 },
      { k: 'box', w: 0.5, h: 0.06, d: 0.06, z: 0.2, y: PL + 1.06, color: OCHRE, detail: true },
    ],
  },

  // 16. 2층 사제관
  egypt_priest_house: {
    label: '사제관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: SAND2 },
      { k: 'box', w: 0.5, h: 0.6, d: 0.44, y: PL, color: SAND, rough: 0.9, windows: { from: 0.3, to: 0.72, color: BASALT, glow: 0 } },
      { k: 'box', w: 0.44, h: 0.5, d: 0.4, y: PL + 0.6, color: SANDD, rough: 0.9, windows: { from: 0.2, to: 0.8, color: BASALT, glow: 0 } },
      { k: 'parapet', w: 0.44, d: 0.4, y: PL + 1.1, color: SAND2 },
      { k: 'box', w: 0.44, h: 0.06, d: 0.06, z: 0.22, y: PL + 0.5, color: OCHRE, detail: true },
      { k: 'box', w: 0.44, h: 0.06, d: 0.06, z: 0.2, y: PL + 1.0, color: OCHRE, detail: true },
      { k: 'panel', w: 0.14, h: 0.26, pos: [0, PL + 0.15, 0.23 + 0.006], color: BASALT },
      { k: 'panel', w: 0.4, h: 0.06, pos: [0, PL + 0.94, 0.21 + 0.008], color: LAPIS, glow: 0.12 },
    ],
  },

  // 17. 2층 열주 시장
  egypt_market: {
    label: '시장',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.46, color: SAND2 },
      { k: 'box', w: 0.66, h: 0.4, d: 0.46, y: PL, color: SAND, rough: 0.9 },
      { k: 'columns', w: 0.66, d: 0.46, y: PL, h: 0.34, count: 7, color: SANDD },
      { k: 'box', w: 0.72, h: 0.06, d: 0.5, y: PL + 0.4, color: SAND2 },
      { k: 'box', w: 0.56, h: 0.44, d: 0.4, y: PL + 0.46, color: SANDD, rough: 0.9, windows: { from: 0.2, to: 0.8, color: BASALT, glow: 0 } },
      { k: 'box', w: 0.6, h: 0.06, d: 0.44, y: PL + 0.9, color: OCHRE },
      { k: 'storefront', w: 0.66, d: 0.46, faceH: 0.26, awning: OCHRE, sign: LAPIS },
      { k: 'parasol', pos: [-0.24, PL + 0.4, 0.14], color: LAPIS },
      { k: 'parasol', pos: [0.24, PL + 0.4, -0.12], color: OCHRE },
    ],
  },

  // 18. 2층 화덕 제빵소
  egypt_bakery: {
    label: '제빵소',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.44, color: SAND2 },
      { k: 'box', w: 0.46, h: 0.56, d: 0.44, y: PL, color: SANDD, rough: 0.9, windows: { from: 0.4, to: 0.78, color: '#E07A30', glow: 0.4 } },
      { k: 'box', w: 0.4, h: 0.42, d: 0.4, y: PL + 0.56, color: SAND, rough: 0.9, windows: { from: 0.2, to: 0.8, color: BASALT, glow: 0 } },
      { k: 'parapet', w: 0.4, d: 0.4, y: PL + 0.98, color: SAND2 },
      // 빵 화덕 돔
      { k: 'cyl', rt: 0.1, rb: 0.13, h: 0.2, y: PL + 0.98, color: OCHRE, seg: 12 },
      { k: 'roof', type: 'dome', w: 0.24, y: PL + 1.18, color: OCHRE },
      { k: 'storefront', w: 0.46, d: 0.44, faceH: 0.28, awning: OCHRE, sign: SAND },
      { k: 'panel', w: 0.12, h: 0.1, pos: [0.14, PL + 0.44, 0.23 + 0.008], color: '#E07A30', glow: 0.4 },
    ],
  },

  // 19. 2층 가마 도기공방
  egypt_pottery: {
    label: '도기공방',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.42, color: SAND2 },
      { k: 'box', w: 0.44, h: 0.5, d: 0.42, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.4, h: 0.4, d: 0.38, y: PL + 0.5, color: SANDD, rough: 0.9, windows: { from: 0.2, to: 0.8, color: BASALT, glow: 0 } },
      { k: 'roof', type: 'pyramid', w: 0.48, d: 0.46, y: PL + 0.9, height: 0.1, color: OCHRE },
      // 가마 굴뚝
      { k: 'box', w: 0.12, h: 0.5, d: 0.12, x: 0.14, z: -0.1, y: PL + 0.9, color: OCHRE },
      { k: 'box', w: 0.14, h: 0.06, d: 0.14, x: 0.14, z: -0.1, y: PL + 1.4, color: '#7A3A24', detail: true },
      { k: 'storefront', w: 0.44, d: 0.42, faceH: 0.26, awning: BASALT, sign: LAPIS },
      { k: 'box', w: 0.08, h: 0.1, d: 0.08, x: -0.16, z: 0.24, y: PL, color: OCHRE, detail: true },
    ],
  },

  // 20. 신당 탑
  egypt_shrine: {
    label: '소신당',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.44, color: SAND2 },
      { k: 'box', w: 0.24, h: 0.2, d: 0.34, x: -0.16, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.24, h: 0.2, d: 0.34, x: 0.16, y: PL, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.26, h: 0.9, d: 0.3, y: PL, color: SAND2, rough: 0.9, windows: { from: 0.3, to: 0.7, color: BASALT, glow: 0 } },
      { k: 'box', w: 0.34, h: 0.12, d: 0.38, y: PL + 0.9, color: SAND, rough: 0.9 },
      { k: 'box', w: 0.16, h: 0.24, d: 0.16, y: PL + 1.02, color: GOLD, detail: true, emissive: true },
      { k: 'roof', type: 'pyramid', w: 0.2, y: PL + 1.26, height: 0.12, color: SAND2 },
      { k: 'panel', w: 0.14, h: 0.4, pos: [0, PL + 0.4, 0.16 + 0.006], color: BASALT },
      { k: 'panel', w: 0.26, h: 0.06, pos: [0, PL + 0.82, 0.16 + 0.008], color: LAPIS, glow: 0.15 },
    ],
  },
} satisfies Record<string, BuildingConfig>
