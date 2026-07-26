import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { pilasters, ribs, bands, cornice, steps, portico } from './_detail'

/**
 * T3 서울 (seoul) — 극단적 유니크 매스 · 고밀도 디테일 · min height ~1.3
 * 팔레트: 한옥기와 #3B4048, 목재 #6E4B2A, 흰벽 #EFEAE0, 단청 #2E6E4B·#B83227, 현대유리 #5E86A8.
 *
 * 매스: landmark=테이퍼 초고층 / namsan=산기단+니들+포드 / hangang=사장교 H파일런 /
 *  gangnam=유리 슬랩 / finance=다크 세트백 / apartment=와이드 판상형 슬랩 / officetel=L유리매스 /
 *  palace=월대 위 이중지붕 파빌리온 / gwanghwamun=성벽 게이트 / cityhall=석조+유리물결 복합 /
 *  museum=와이드 열주블록 / hanok_hotel=포디움+적층한옥 / hanok_mansion=중정 ㄷ자 한옥 /
 *  stone_pagoda=석조 다층탑 / dept_store=와이드 상업 / villa=적층 다세대 / market=다층 아케이드 /
 *  street_cafe=코너 카페 / convenience=포디움+오피스텔 / pojangmacha=푸드홀 블록
 */

const TILE = '#3B4048'
const WOOD = '#6E4B2A'
const STEEL = '#3A3A44'
const WHITE = '#EFEAE0'
const WHITE2 = '#DCD6C8'
const DAN_G = '#2E6E4B'
const DAN_R = '#B83227'
const GLASS = '#5E86A8'
const GLASS2 = '#7FA6C4'
const STONE = '#C9C2B6'
const STONE2 = '#B7AE9E'

export const SEOUL = {
  // 1. 테이퍼 초고층 랜드마크
  seoul_landmark_tower: {
    label: '한강 랜드마크타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.6, color: 'roofDark' },
      { k: 'box', w: 0.56, h: 0.14, d: 0.56, y: PL, color: STEEL, rough: 0.6 },
      { k: 'box', w: 0.5, h: 1.0, d: 0.5, y: PL + 0.14, color: GLASS, rough: 0.2, metal: 0.6, windows: { from: 0.08, to: 0.95, color: GLASS2, glow: 0.4 } },
      ...ribs(0.5, 0.5, 1.0, PL + 0.14, 6, GLASS2, 0.018),
      { k: 'box', w: 0.4, h: 0.9, d: 0.4, y: PL + 1.14, color: GLASS, rough: 0.2, metal: 0.6, windows: { from: 0.08, to: 0.95, color: GLASS2, glow: 0.4 } },
      { k: 'box', w: 0.3, h: 0.85, d: 0.3, y: PL + 2.04, color: GLASS, rough: 0.2, metal: 0.6, windows: { from: 0.08, to: 0.95, color: GLASS2, glow: 0.4 } },
      { k: 'cyl', rt: 0.05, rb: 0.16, h: 0.5, y: PL + 2.89, color: GLASS2, seg: 12 },
      { k: 'roof', type: 'cone', w: 0.2, y: PL + 3.39, height: 0.24, color: GLASS2 },
      { k: 'antenna', y: PL + 3.6, h: 0.3 },
      { k: 'box', w: 0.52, h: 0.05, d: 0.52, y: PL + 1.09, color: WHITE },
      { k: 'storefront', w: 0.5, d: 0.5, faceH: 0.3, awning: GLASS, sign: WHITE },
    ],
  },

  // 2. 산기단 + 니들 + 전망 포드
  seoul_namsan_tower: {
    label: '남산 전망타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.56, d: 0.56, color: 'grass' },
      { k: 'box', w: 0.46, h: 0.34, d: 0.46, y: PL, color: STONE2, rough: 0.9 },
      { k: 'box', w: 0.36, h: 0.22, d: 0.36, y: PL + 0.34, color: STONE, rough: 0.9 },
      ...steps(0.24, PL, 0.24, STONE, 3),
      { k: 'cyl', rt: 0.09, rb: 0.13, h: 1.5, y: PL + 0.56, color: 'concrete', seg: 12 },
      { k: 'cyl', rt: 0.15, rb: 0.15, h: 0.04, y: PL + 1.2, color: DAN_R, seg: 12, detail: true },
      { k: 'box', w: 0.36, h: 0.3, d: 0.36, y: PL + 2.06, color: WHITE, rough: 0.4, windows: { from: 0.2, to: 0.8, color: GLASS2, glow: 0.45 } },
      { k: 'cyl', rt: 0.12, rb: 0.2, h: 0.16, y: PL + 2.36, color: STONE, seg: 12 },
      { k: 'cyl', rt: 0.02, rb: 0.05, h: 0.5, y: PL + 2.52, color: 'concrete', seg: 8, detail: true },
      { k: 'antenna', y: PL + 3.02, h: 0.35 },
      { k: 'panel', w: 0.3, h: 0.05, pos: [0, PL + 2.2, 0.18 + 0.008], color: DAN_R, glow: 0.4 },
    ],
  },

  // 3. 사장교 H파일런
  seoul_hangang_bridge: {
    label: '한강 대교탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.42, color: 'concrete' },
      { k: 'box', w: 0.64, h: 0.16, d: 0.34, y: PL, color: 'concrete', rough: 0.7 },
      // H형 주탑
      { k: 'box', w: 0.1, h: 2.0, d: 0.12, x: -0.18, y: PL + 0.16, color: WHITE, rough: 0.5 },
      { k: 'box', w: 0.1, h: 2.0, d: 0.12, x: 0.18, y: PL + 0.16, color: WHITE, rough: 0.5 },
      { k: 'box', w: 0.36, h: 0.09, d: 0.09, y: PL + 1.2, color: WHITE, rough: 0.5 },
      { k: 'box', w: 0.36, h: 0.09, d: 0.09, y: PL + 1.9, color: WHITE, rough: 0.5 },
      // 케이블(기울인 얇은 판)
      { k: 'panel', w: 0.02, h: 1.0, pos: [-0.32, PL + 0.7, 0.02], color: '#8A8A8A' },
      { k: 'panel', w: 0.02, h: 0.8, pos: [-0.28, PL + 0.6, 0.02], color: '#8A8A8A' },
      { k: 'panel', w: 0.02, h: 1.0, pos: [0.32, PL + 0.7, 0.02], color: '#8A8A8A' },
      { k: 'panel', w: 0.02, h: 0.8, pos: [0.28, PL + 0.6, 0.02], color: '#8A8A8A' },
      { k: 'box', w: 0.02, h: 0.02, d: 0.02, x: -0.18, y: PL + 2.16, color: DAN_R, detail: true, emissive: true },
      { k: 'box', w: 0.02, h: 0.02, d: 0.02, x: 0.18, y: PL + 2.16, color: DAN_R, detail: true, emissive: true },
    ],
  },

  // 4. 유리 슬랩 오피스
  seoul_gangnam_office: {
    label: '강남 오피스타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.4, color: 'roofDark' },
      { k: 'box', w: 0.44, h: 0.16, d: 0.4, y: PL, color: STONE2, rough: 0.7 },
      { k: 'box', w: 0.44, h: 2.0, d: 0.4, y: PL + 0.16, color: GLASS, rough: 0.22, metal: 0.6, windows: { from: 0.06, to: 0.96, color: GLASS2, glow: 0.42 } },
      ...ribs(0.44, 0.4, 2.0, PL + 0.16, 7, '#4A6E8A', 0.016),
      ...bands(0.44, 0.4, [PL + 0.86, PL + 1.56], WHITE2),
      { k: 'box', w: 0.46, h: 0.05, d: 0.42, y: PL + 2.16, color: WHITE },
      { k: 'parapet', w: 0.44, d: 0.4, y: PL + 2.16, color: 'roofDark' },
      { k: 'rooftopUnits', w: 0.44, y: PL + 2.16 },
      { k: 'antenna', y: PL + 2.16, h: 0.4 },
      { k: 'storefront', w: 0.44, d: 0.4, faceH: 0.3, awning: 'roofDark', sign: GLASS2 },
    ],
  },

  // 5. 다크 세트백 파이낸스
  seoul_finance_tower: {
    label: '파이낸스 타워',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.46, color: 'roofDark' },
      { k: 'box', w: 0.52, h: 1.2, d: 0.46, y: PL, color: '#3E4650', rough: 0.3, metal: 0.55, windows: { from: 0.1, to: 0.92, color: GLASS2, glow: 0.4 } },
      { k: 'box', w: 0.54, h: 0.05, d: 0.48, y: PL + 1.2, color: STONE },
      { k: 'box', w: 0.4, h: 0.7, d: 0.36, z: -0.04, y: PL + 1.25, color: '#3E4650', rough: 0.3, metal: 0.55, windows: { from: 0.1, to: 0.92, color: GLASS2, glow: 0.4 } },
      { k: 'box', w: 0.42, h: 0.05, d: 0.38, y: PL + 1.95, color: STONE },
      { k: 'box', w: 0.26, h: 0.4, d: 0.24, z: -0.06, y: PL + 2.0, color: '#3E4650', rough: 0.3, metal: 0.55 },
      { k: 'box', w: 0.28, h: 0.06, d: 0.26, z: -0.06, y: PL + 2.4, color: 'roofDark' },
      { k: 'antenna', y: PL + 2.4, h: 0.4 },
      { k: 'columns', w: 0.52, d: 0.46, y: PL, h: 0.36, count: 4, color: STONE },
      { k: 'panel', w: 0.3, h: 0.1, pos: [0, PL + 0.5, 0.23 + 0.008], color: GLASS2, glow: 0.3 },
    ],
  },

  // 6. 와이드 판상형 아파트
  seoul_apartment: {
    label: '대단지 아파트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.32, color: 'concrete' },
      { k: 'box', w: 0.68, h: 2.0, d: 0.32, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.06, to: 0.96, color: GLASS2, glow: 0.28 } },
      { k: 'balconies', w: 0.68, d: 0.32, y0: PL + 0.16, y1: PL + 1.9, floors: 11, color: WHITE2 },
      // 세로 계단실 코어 분절
      { k: 'box', w: 0.08, h: 2.0, d: 0.34, x: -0.22, y: PL, color: STONE2, rough: 0.7 },
      { k: 'box', w: 0.08, h: 2.0, d: 0.34, x: 0.22, y: PL, color: STONE2, rough: 0.7 },
      { k: 'box', w: 0.7, h: 0.05, d: 0.34, y: PL + 2.0, color: STONE },
      { k: 'parapet', w: 0.68, d: 0.32, y: PL + 2.0, color: WHITE },
      { k: 'rooftopUnits', w: 0.68, y: PL + 2.0 },
      { k: 'box', w: 0.14, h: 0.2, d: 0.14, x: -0.18, y: PL + 2.0, color: 'concrete', detail: true },
      { k: 'panel', w: 0.14, h: 0.2, pos: [0, PL + 1.7, 0.17 + 0.008], color: DAN_R, glow: 0.25 },
    ],
  },

  // 7. L 유리매스 오피스텔
  seoul_officetel: {
    label: '오피스텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.46, color: 'concrete' },
      { k: 'box', w: 0.44, h: 1.7, d: 0.28, z: -0.09, y: PL, color: '#C8CDD2', rough: 0.4, metal: 0.4, windows: { from: 0.08, to: 0.94, color: GLASS2, glow: 0.32 } },
      { k: 'box', w: 0.22, h: 1.9, d: 0.44, x: 0.14, y: PL, color: GLASS, rough: 0.25, metal: 0.55, windows: { from: 0.08, to: 0.95, color: GLASS2, glow: 0.42 } },
      { k: 'box', w: 0.016, h: 1.9, d: 0.016, x: 0.04, z: 0.22, y: PL, color: '#4A6E8A' },
      { k: 'box', w: 0.016, h: 1.9, d: 0.016, x: 0.24, z: 0.22, y: PL, color: '#4A6E8A' },
      { k: 'box', w: 0.24, h: 0.05, d: 0.46, x: 0.14, y: PL + 1.9, color: WHITE },
      { k: 'box', w: 0.46, h: 0.05, d: 0.3, z: -0.09, y: PL + 1.7, color: 'roofDark' },
      { k: 'rooftopUnits', w: 0.4, y: PL + 1.9 },
      { k: 'antenna', y: PL + 1.9, h: 0.3 },
      { k: 'storefront', w: 0.5, d: 0.46, faceH: 0.3, awning: 'roofDark', sign: GLASS2 },
    ],
  },

  // 8. 월대 위 이중지붕 파빌리온 (정전)
  seoul_palace_hall: {
    label: '고궁 정전',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.74, d: 0.58, color: STONE },
      { k: 'box', w: 0.68, h: 0.16, d: 0.52, y: PL, color: STONE2, rough: 0.9 },
      { k: 'box', w: 0.6, h: 0.14, d: 0.46, y: PL + 0.16, color: STONE, rough: 0.9 },
      ...steps(0.34, PL, 0.27, STONE, 4),
      { k: 'box', w: 0.54, h: 0.5, d: 0.42, y: PL + 0.3, color: WHITE, rough: 0.7 },
      { k: 'columns', w: 0.54, d: 0.42, y: PL + 0.3, h: 0.5, count: 7, color: DAN_R },
      { k: 'roof', type: 'pyramid', w: 0.8, d: 0.62, y: PL + 0.8, height: 0.14, color: TILE },
      { k: 'box', w: 0.5, h: 0.14, d: 0.38, y: PL + 0.94, color: WHITE, rough: 0.7 },
      { k: 'roof', type: 'pyramid', w: 0.62, d: 0.48, y: PL + 1.08, height: 0.2, color: TILE },
      { k: 'box', w: 0.06, h: 0.07, d: 0.02, x: -0.26, y: PL + 1.08, color: TILE, detail: true },
      { k: 'box', w: 0.06, h: 0.07, d: 0.02, x: 0.26, y: PL + 1.08, color: TILE, detail: true },
      { k: 'panel', w: 0.26, h: 0.1, pos: [0, PL + 0.66, 0.22 + 0.008], color: DAN_G, glow: 0.2 },
    ],
  },

  // 9. 성벽 게이트 (광화문)
  seoul_gwanghwamun_gate: {
    label: '광화문 게이트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.74, d: 0.42, color: STONE2 },
      { k: 'box', w: 0.7, h: 0.62, d: 0.38, y: PL, color: STONE, rough: 0.88 },
      // 홍예문 3
      { k: 'panel', w: 0.14, h: 0.4, pos: [-0.2, PL + 0.2, 0.19 + 0.006], color: '#20242A' },
      { k: 'panel', w: 0.16, h: 0.44, pos: [0, PL + 0.22, 0.19 + 0.006], color: '#20242A' },
      { k: 'panel', w: 0.14, h: 0.4, pos: [0.2, PL + 0.2, 0.19 + 0.006], color: '#20242A' },
      { k: 'box', w: 0.72, h: 0.05, d: 0.4, y: PL + 0.62, color: STONE2 },
      // 2층 문루
      { k: 'box', w: 0.6, h: 0.34, d: 0.32, y: PL + 0.67, color: WHITE, rough: 0.7 },
      { k: 'columns', w: 0.6, d: 0.32, y: PL + 0.67, h: 0.34, count: 8, color: DAN_R },
      { k: 'roof', type: 'pyramid', w: 0.78, d: 0.46, y: PL + 1.01, height: 0.22, color: TILE },
      { k: 'box', w: 0.06, h: 0.07, d: 0.02, x: -0.28, y: PL + 1.23, color: TILE, detail: true },
      { k: 'box', w: 0.06, h: 0.07, d: 0.02, x: 0.28, y: PL + 1.23, color: TILE, detail: true },
      { k: 'panel', w: 0.24, h: 0.08, pos: [0, PL + 0.86, 0.17 + 0.008], color: DAN_G, glow: 0.2 },
    ],
  },

  // 10. 석조+유리물결 복합 시청
  seoul_cityhall: {
    label: '서울 시청',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.5, color: 'concrete' },
      // 뒤 신청사 유리 물결(높은 슬랩, 기울임 근사)
      { k: 'box', w: 0.56, h: 1.6, d: 0.28, z: -0.12, y: PL, color: GLASS, rough: 0.2, metal: 0.6, windows: { from: 0.08, to: 0.94, color: GLASS2, glow: 0.42 } },
      { k: 'box', w: 0.5, h: 0.2, d: 0.3, z: -0.16, y: PL + 1.6, color: GLASS2, rough: 0.2, metal: 0.6 },
      { k: 'box', w: 0.016, h: 1.6, d: 0.016, x: -0.2, z: 0.02, y: PL, color: WHITE2 },
      { k: 'box', w: 0.016, h: 1.6, d: 0.016, x: 0, z: 0.02, y: PL, color: WHITE2 },
      { k: 'box', w: 0.016, h: 1.6, d: 0.016, x: 0.2, z: 0.02, y: PL, color: WHITE2 },
      // 앞 구청사 석조
      { k: 'box', w: 0.5, h: 0.6, d: 0.32, z: 0.12, y: PL, color: WHITE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: GLASS2, glow: 0.26 } },
      { k: 'columns', w: 0.5, d: 0.32, y: PL, h: 0.6, count: 6, color: STONE2 },
      { k: 'box', w: 0.18, h: 0.34, d: 0.18, z: 0.12, y: PL + 0.6, color: WHITE, rough: 0.7 },
      { k: 'clock', w: 0.18, y: PL + 0.82, color: DAN_R },
      { k: 'roof', type: 'pyramid', w: 0.24, y: PL + 0.94, height: 0.14, color: TILE },
      { k: 'panel', w: 0.3, h: 0.08, pos: [0, PL + 0.48, 0.28 + 0.008], color: DAN_G, glow: 0.2 },
    ],
  },

  // 11. 와이드 열주블록 박물관
  seoul_museum: {
    label: '국립박물관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.74, d: 0.5, color: STONE },
      { k: 'box', w: 0.74, h: 0.8, d: 0.5, y: PL, color: STONE2, rough: 0.7, windows: { from: 0.3, to: 0.78, color: GLASS2, glow: 0.28 } },
      // 중앙 통로 개방(양 매스)
      { k: 'box', w: 0.26, h: 0.5, d: 0.5, x: -0.24, y: PL + 0.8, color: STONE2, rough: 0.7 },
      { k: 'box', w: 0.26, h: 0.5, d: 0.5, x: 0.24, y: PL + 0.8, color: STONE2, rough: 0.7 },
      { k: 'box', w: 0.16, h: 0.34, d: 0.5, y: PL + 0.8, color: STONE, rough: 0.7 },
      { k: 'box', w: 0.76, h: 0.1, d: 0.52, y: PL + 1.3, color: STONE },
      ...portico(0.74, 0.5, 0.7, PL, 9, STONE, WHITE),
      ...steps(0.4, PL, 0.25, STONE, 3),
      { k: 'panel', w: 0.34, h: 0.1, pos: [0, PL + 0.62, 0.26 + 0.008], color: DAN_G, glow: 0.2 },
    ],
  },

  // 12. 포디움 + 적층 한옥 호텔
  seoul_hanok_hotel: {
    label: '한옥 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.6, d: 0.46, color: STONE },
      { k: 'box', w: 0.6, h: 0.8, d: 0.46, y: PL, color: '#D8D2C6', rough: 0.5, windows: { from: 0.12, to: 0.88, color: GLASS2, glow: 0.3 } },
      cornice(0.6, 0.46, PL + 0.8, WOOD),
      { k: 'roof', type: 'pyramid', w: 0.68, d: 0.54, y: PL + 0.85, height: 0.1, color: TILE },
      { k: 'box', w: 0.46, h: 0.44, d: 0.36, y: PL + 0.95, color: WHITE, rough: 0.7, windows: { from: 0.2, to: 0.8, color: GLASS2, glow: 0.3 } },
      { k: 'columns', w: 0.46, d: 0.36, y: PL + 0.95, h: 0.44, count: 5, color: WOOD },
      { k: 'roof', type: 'pyramid', w: 0.6, d: 0.48, y: PL + 1.39, height: 0.2, color: TILE },
      { k: 'box', w: 0.05, h: 0.06, d: 0.02, x: -0.2, y: PL + 1.59, color: TILE, detail: true },
      { k: 'box', w: 0.05, h: 0.06, d: 0.02, x: 0.2, y: PL + 1.59, color: TILE, detail: true },
      { k: 'storefront', w: 0.6, d: 0.46, faceH: 0.4, awning: WOOD, sign: DAN_G },
      { k: 'panel', w: 0.3, h: 0.08, pos: [0, PL + 1.1, 0.2 + 0.008], color: DAN_G, glow: 0.2 },
    ],
  },

  // 13. 중정 ㄷ자 한옥 대저택 (2층화)
  seoul_hanok_mansion: {
    label: '한옥 대저택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.72, d: 0.56, color: STONE },
      // ㄷ자: 뒤 본채(2층) + 좌우 날개
      { k: 'box', w: 0.5, h: 0.5, d: 0.26, z: -0.13, y: PL + 0.1, color: WHITE, rough: 0.75, windows: { from: 0.2, to: 0.8, color: '#3A2A1A', glow: 0 } },
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: -0.2, z: 0.0, y: PL + 0.1, color: WOOD },
      { k: 'box', w: 0.03, h: 0.5, d: 0.03, x: 0.2, z: 0.0, y: PL + 0.1, color: WOOD },
      { k: 'box', w: 0.54, h: 0.06, d: 0.3, z: -0.13, y: PL + 0.6, color: TILE },
      // 중앙 2층 누각(다락)
      { k: 'box', w: 0.34, h: 0.44, d: 0.26, z: -0.11, y: PL + 0.66, color: WHITE, rough: 0.75, windows: { from: 0.2, to: 0.8, color: GLASS2, glow: 0.24 } },
      { k: 'box', w: 0.46, h: 0.14, d: 0.34, z: -0.11, y: PL + 1.1, color: TILE },
      { k: 'box', w: 0.05, h: 0.06, d: 0.02, x: -0.2, z: -0.11, y: PL + 1.24, color: TILE, detail: true },
      { k: 'box', w: 0.05, h: 0.06, d: 0.02, x: 0.2, z: -0.11, y: PL + 1.24, color: TILE, detail: true },
      { k: 'roof', type: 'pyramid', w: 0.6, d: 0.34, y: PL + 0.6, height: 0.12, color: TILE },
      { k: 'box', w: 0.22, h: 0.42, d: 0.4, x: -0.26, y: PL + 0.06, color: WHITE, rough: 0.75 },
      { k: 'box', w: 0.3, h: 0.06, d: 0.48, x: -0.26, y: PL + 0.48, color: TILE },
      { k: 'box', w: 0.22, h: 0.42, d: 0.4, x: 0.26, y: PL + 0.06, color: WHITE, rough: 0.75 },
      { k: 'box', w: 0.3, h: 0.06, d: 0.48, x: 0.26, y: PL + 0.48, color: TILE },
      // 솟을대문
      { k: 'box', w: 0.16, h: 0.4, d: 0.14, z: 0.24, y: PL, color: WOOD, rough: 0.8 },
      { k: 'box', w: 0.22, h: 0.06, d: 0.2, z: 0.24, y: PL + 0.4, color: TILE },
      { k: 'box', w: 0.14, h: 0.05, d: 0.12, z: 0.24, y: PL + 0.46, color: TILE },
      { k: 'panel', w: 0.1, h: 0.24, pos: [0, PL + 0.12, 0.32 + 0.006], color: '#3A2A1A' },
    ],
  },

  // 14. 석조 다층탑
  seoul_stone_pagoda: {
    label: '석탑 (원각사)',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.5, color: STONE },
      { k: 'box', w: 0.46, h: 0.2, d: 0.46, y: PL, color: STONE2, rough: 0.95 },
      { k: 'box', w: 0.4, h: 0.12, d: 0.4, y: PL + 0.2, color: STONE, rough: 0.95 },
      { k: 'box', w: 0.34, h: 0.26, d: 0.34, y: PL + 0.32, color: STONE, rough: 0.95 },
      { k: 'roof', type: 'pyramid', w: 0.46, y: PL + 0.58, height: 0.09, color: STONE2 },
      { k: 'box', w: 0.3, h: 0.24, d: 0.3, y: PL + 0.67, color: STONE, rough: 0.95 },
      { k: 'roof', type: 'pyramid', w: 0.4, y: PL + 0.91, height: 0.08, color: STONE2 },
      { k: 'box', w: 0.26, h: 0.22, d: 0.26, y: PL + 0.99, color: STONE, rough: 0.95 },
      { k: 'roof', type: 'pyramid', w: 0.34, y: PL + 1.21, height: 0.08, color: STONE2 },
      { k: 'box', w: 0.2, h: 0.2, d: 0.2, y: PL + 1.29, color: STONE, rough: 0.95 },
      { k: 'roof', type: 'pyramid', w: 0.28, y: PL + 1.49, height: 0.08, color: STONE2 },
      { k: 'box', w: 0.14, h: 0.18, d: 0.14, y: PL + 1.57, color: STONE, rough: 0.95 },
      { k: 'roof', type: 'pyramid', w: 0.22, y: PL + 1.75, height: 0.12, color: STONE2 },
      { k: 'box', w: 0.04, h: 0.14, d: 0.04, y: PL + 1.87, color: '#9A8A5A', detail: true },
      { k: 'panel', w: 0.16, h: 0.12, pos: [0, PL + 0.44, 0.17 + 0.006], color: '#3A342A' },
    ],
  },

  // 15. 와이드 상업 백화점
  seoul_dept_store: {
    label: '백화점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.52, color: 'concrete' },
      { k: 'box', w: 0.66, h: 1.3, d: 0.52, y: PL, color: '#D8D2C6', rough: 0.5, windows: { from: 0.12, to: 0.9, color: GLASS2, glow: 0.32 } },
      ...ribs(0.66, 0.52, 1.3, PL, 8, WHITE, 0.02),
      ...bands(0.66, 0.52, [PL + 0.5, PL + 0.9], DAN_R),
      { k: 'box', w: 0.68, h: 0.06, d: 0.54, y: PL + 1.3, color: WHITE },
      { k: 'parapet', w: 0.66, d: 0.52, y: PL + 1.36, color: '#D8D2C6' },
      { k: 'rooftopUnits', w: 0.66, y: PL + 1.36 },
      { k: 'storefront', w: 0.66, d: 0.52, faceH: 0.42, awning: DAN_R, sign: GLASS2 },
      { k: 'panel', w: 0.08, h: 1.0, pos: [0.33 + 0.006, PL + 0.7, 0], rotY: 1.5708, color: GLASS2, glow: 0.35 },
      { k: 'panel', w: 0.5, h: 0.1, pos: [0, PL + 1.2, 0.26 + 0.008], color: DAN_R, glow: 0.3 },
    ],
  },

  // 16. 적층 다세대 빌라 (3-4층화)
  seoul_villa: {
    label: '다세대 빌라',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: 'concrete' },
      { k: 'box', w: 0.5, h: 0.44, d: 0.44, y: PL, color: '#D9C7A8', rough: 0.7, windows: { from: 0.2, to: 0.82, color: GLASS2, glow: 0.28 } },
      { k: 'box', w: 0.48, h: 0.4, d: 0.42, y: PL + 0.44, color: '#E0CFB2', rough: 0.7, windows: { from: 0.15, to: 0.85, color: GLASS2, glow: 0.28 } },
      { k: 'box', w: 0.46, h: 0.4, d: 0.4, y: PL + 0.84, color: '#D9C7A8', rough: 0.7, windows: { from: 0.15, to: 0.85, color: GLASS2, glow: 0.28 } },
      { k: 'box', w: 0.42, h: 0.18, d: 0.38, y: PL + 1.24, color: '#C08A50', rough: 0.7 },
      { k: 'roof', type: 'pyramid', w: 0.52, d: 0.48, y: PL + 1.42, height: 0.12, color: DAN_R },
      { k: 'balconies', w: 0.5, d: 0.44, y0: PL + 0.3, y1: PL + 1.1, floors: 3, color: 'concrete' },
      ...pilasters(0.5, 0.44, 1.24, PL, '#B8A078', 0.022),
      { k: 'panel', w: 0.12, h: 0.22, pos: [0, PL + 0.13, 0.23 + 0.006], color: WOOD },
    ],
  },

  // 17. 다층 전통시장 아케이드
  seoul_market_arcade: {
    label: '전통시장 상가',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.42, color: 'path' },
      // 3연 점포 분절 1층
      { k: 'box', w: 0.22, h: 0.5, d: 0.42, x: -0.23, y: PL, color: '#C8B48E', rough: 0.75 },
      { k: 'box', w: 0.22, h: 0.54, d: 0.42, x: 0, y: PL, color: '#B8A078', rough: 0.75 },
      { k: 'box', w: 0.22, h: 0.48, d: 0.42, x: 0.23, y: PL, color: '#C8B48E', rough: 0.75 },
      { k: 'storefront', w: 0.68, d: 0.42, faceH: 0.3, awning: DAN_R, sign: '#E0C070' },
      // 2층 통층 + 아치 아케이드 지붕
      { k: 'box', w: 0.66, h: 0.44, d: 0.4, y: PL + 0.56, color: '#D8CBA8', rough: 0.75, windows: { from: 0.2, to: 0.8, color: GLASS2, glow: 0.28 } },
      { k: 'roof', type: 'round', w: 0.74, d: 0.46, y: PL + 1.0, color: '#8AA0B0' },
      // 매달린 간판 다발
      { k: 'panel', w: 0.12, h: 0.1, pos: [-0.24, PL + 0.42, 0.22 + 0.008], color: DAN_R, glow: 0.25 },
      { k: 'panel', w: 0.12, h: 0.1, pos: [0, PL + 0.42, 0.22 + 0.008], color: DAN_G, glow: 0.25 },
      { k: 'panel', w: 0.12, h: 0.1, pos: [0.24, PL + 0.42, 0.22 + 0.008], color: '#E0C070', glow: 0.3 },
      { k: 'panel', w: 0.5, h: 0.09, pos: [0, PL + 0.86, 0.21 + 0.008], color: '#E0C070', glow: 0.28 },
    ],
  },

  // 18. 코너 카페 (좁은 코너 매스 + 유리)
  seoul_street_cafe: {
    label: '카페거리 건물',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.4, color: 'path' },
      { k: 'box', w: 0.44, h: 1.2, d: 0.4, y: PL, color: '#5A4636', rough: 0.6, windows: { from: 0.12, to: 0.9, color: GLASS2, glow: 0.3 } },
      // 코너 라운드 유리 계단실
      { k: 'cyl', rt: 0.14, rb: 0.14, h: 1.2, y: PL, color: GLASS, seg: 12 },
      { k: 'roof', type: 'cone', w: 0.24, y: PL + 1.2, height: 0.14, color: '#4A3828' },
      ...bands(0.44, 0.4, [PL + 0.42, PL + 0.82], '#E0C070'),
      { k: 'parapet', w: 0.44, d: 0.4, y: PL + 1.2, color: '#5A4636' },
      { k: 'storefront', w: 0.44, d: 0.4, faceH: 0.34, awning: '#2E4636', sign: '#E0C070' },
      { k: 'parasol', pos: [0.14, PL + 1.2, 0.12], color: '#2E6E4B' },
      { k: 'panel', w: 0.1, h: 0.5, pos: [0.22 + 0.006, PL + 0.6, 0], rotY: 1.5708, color: '#E0C070', glow: 0.3 },
    ],
  },

  // 19. 포디움 + 오피스텔 편의점
  seoul_convenience: {
    label: '편의점 오피스텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.5, d: 0.44, color: 'concrete' },
      { k: 'box', w: 0.5, h: 0.5, d: 0.44, y: PL, color: WHITE, rough: 0.55, windows: { from: 0.4, to: 0.9, color: GLASS2, glow: 0.32 } },
      { k: 'box', w: 0.52, h: 0.06, d: 0.46, y: PL + 0.5, color: DAN_G },
      { k: 'box', w: 0.4, h: 1.0, d: 0.36, y: PL + 0.56, color: '#C8CDD2', rough: 0.4, metal: 0.4, windows: { from: 0.1, to: 0.9, color: GLASS2, glow: 0.32 } },
      ...ribs(0.4, 0.36, 1.0, PL + 0.56, 5, '#9AA6B0', 0.016),
      { k: 'parapet', w: 0.4, d: 0.36, y: PL + 1.56, color: 'roofDark' },
      { k: 'rooftopUnits', w: 0.4, y: PL + 1.56 },
      { k: 'storefront', w: 0.5, d: 0.44, faceH: 0.36, awning: DAN_G, sign: DAN_R },
      { k: 'panel', w: 0.4, h: 0.1, pos: [0, PL + 0.42, 0.23 + 0.008], color: DAN_G, glow: 0.35 },
    ],
  },

  // 20. 푸드홀 블록 (포차거리)
  seoul_pojangmacha: {
    label: '포차거리 푸드홀',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.46, color: 'path' },
      { k: 'box', w: 0.64, h: 0.9, d: 0.46, y: PL, color: '#8A4030', rough: 0.7, windows: { from: 0.5, to: 0.85, color: '#F2C060', glow: 0.4 } },
      ...ribs(0.64, 0.46, 0.9, PL, 7, '#6E3226', 0.022),
      { k: 'box', w: 0.66, h: 0.06, d: 0.48, y: PL + 0.9, color: '#C85040' },
      { k: 'roof', type: 'round', w: 0.72, d: 0.52, y: PL + 0.96, color: '#C85040' },
      { k: 'storefront', w: 0.64, d: 0.46, faceH: 0.4, awning: '#902820', sign: '#F2C060' },
      // 포차 천막 텐트 열(정면 하부)
      { k: 'box', w: 0.6, h: 0.04, d: 0.1, z: 0.24, y: PL + 0.34, color: '#D06848' },
      { k: 'panel', w: 0.5, h: 0.12, pos: [0, PL + 0.76, 0.24 + 0.008], color: '#F2C060', glow: 0.4 },
      { k: 'panel', w: 0.05, h: 0.13, pos: [-0.24, PL + 0.5, 0.24 + 0.006], color: '#F2C060', glow: 0.55 },
      { k: 'panel', w: 0.05, h: 0.13, pos: [0, PL + 0.5, 0.24 + 0.006], color: DAN_R, glow: 0.55 },
      { k: 'panel', w: 0.05, h: 0.13, pos: [0.24, PL + 0.5, 0.24 + 0.006], color: '#F2C060', glow: 0.55 },
    ],
  },
} satisfies Record<string, BuildingConfig>

