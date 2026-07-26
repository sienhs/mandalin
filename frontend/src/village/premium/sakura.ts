import type { BuildingConfig } from '../catalog'
import { PL } from '../catalog'
import { pilasters, ribs, bands, cornice, steps, portico } from './_detail'

/**
 * T1 사쿠라 / 벚꽃 (sakura) — 고밀도 디테일 · 유니크 아키타입 · 저층 상향(min ~1.4)
 * 팔레트: 벽 #F7E6EC·#FBD7E0, 짙은목재 #5A3A2E, 기와 #8A6D8B, 골드 #C9A24B, 유리 #BFE3EA, 벚꽃 #F6A8C4.
 */

const WOOD = '#5A3A2E'
const WOOD2 = '#7A5540'
const WALL = '#F7E6EC'
const WALL2 = '#FBD7E0'
const TILE = '#8A6D8B'
const TILE2 = '#6E5570'
const GOLD = '#C9A24B'
const GLASS = '#BFE3EA'
const BLOSSOM = '#F6A8C4'
const RED = '#B83227'
const STONE = '#D8CFC2'
const STONE2 = '#CFC4B4'
const PAPER = '#F5E6B8'

export const SAKURA = {
  // ── 초고층 랜드마크: 오층탑 (tiered pagoda) ──
  sakura_pagoda_tower: {
    label: '사쿠라 오층탑',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.64, color: STONE },
      { k: 'box', w: 0.58, h: 0.16, d: 0.58, y: PL, color: STONE2, rough: 0.9 },
      { k: 'box', w: 0.5, h: 0.06, d: 0.5, y: PL + 0.16, color: TILE2 },
      ...steps(0.3, PL, 0.29, STONE, 3),
      // 5층 (축소 스택) — 각 층 몸통 + 난간 + 처마
      { k: 'box', w: 0.5, h: 0.34, d: 0.5, y: PL + 0.22, color: WALL, rough: 0.8, windows: { from: 0.25, to: 0.82, color: GLASS, glow: 0.28 } },
      ...ribs(0.5, 0.5, 0.34, PL + 0.22, 5, WOOD, 0.02),
      { k: 'box', w: 0.56, h: 0.03, d: 0.56, y: PL + 0.5, color: RED },
      { k: 'roof', type: 'pyramid', w: 0.6, y: PL + 0.53, height: 0.14, color: TILE },
      { k: 'box', w: 0.42, h: 0.3, d: 0.42, y: PL + 0.68, color: WALL, rough: 0.8, windows: { from: 0.25, to: 0.82, color: GLASS, glow: 0.28 } },
      ...ribs(0.42, 0.42, 0.3, PL + 0.68, 4, WOOD, 0.02),
      { k: 'roof', type: 'pyramid', w: 0.52, y: PL + 0.98, height: 0.13, color: TILE },
      { k: 'box', w: 0.34, h: 0.28, d: 0.34, y: PL + 1.11, color: WALL, rough: 0.8, windows: { from: 0.25, to: 0.82, color: GLASS, glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.44, y: PL + 1.39, height: 0.12, color: TILE },
      { k: 'box', w: 0.26, h: 0.26, d: 0.26, y: PL + 1.51, color: WALL, rough: 0.8, windows: { from: 0.25, to: 0.82, color: GLASS, glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.36, y: PL + 1.77, height: 0.11, color: TILE },
      { k: 'box', w: 0.18, h: 0.22, d: 0.18, y: PL + 1.88, color: WALL, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.28, y: PL + 2.1, height: 0.13, color: TILE },
      // 상부 금빛 상륜(sorin): 노반+구륜+수연
      { k: 'box', w: 0.06, h: 0.06, d: 0.06, y: PL + 2.23, color: GOLD, detail: true },
      { k: 'cyl', rt: 0.02, rb: 0.02, h: 0.26, y: PL + 2.29, color: GOLD, seg: 8, detail: true },
      { k: 'box', w: 0.14, h: 0.02, d: 0.02, y: PL + 2.4, color: GOLD, detail: true, emissive: true },
      { k: 'box', w: 0.02, h: 0.1, d: 0.02, y: PL + 2.55, color: GOLD, detail: true, emissive: true },
      // 정면 문 + 현판
      { k: 'panel', w: 0.16, h: 0.24, pos: [0, PL + 0.34, 0.25 + 0.006], color: WOOD },
      { k: 'panel', w: 0.28, h: 0.07, pos: [0, PL + 0.6, 0.3 + 0.006], color: RED, glow: 0.25 },
    ],
  },

  // ── 초고층: 성곽 천수각 (fortress mass) ──
  sakura_castle_keep: {
    label: '사쿠라 천수각',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.7, d: 0.7, color: STONE },
      // 경사 석축 기단 3단
      { k: 'box', w: 0.64, h: 0.28, d: 0.64, y: PL, color: STONE2, rough: 0.95 },
      { k: 'box', w: 0.56, h: 0.16, d: 0.56, y: PL + 0.28, color: STONE, rough: 0.92 },
      { k: 'box', w: 0.5, h: 0.08, d: 0.5, y: PL + 0.44, color: STONE2, rough: 0.9 },
      ...steps(0.26, PL, 0.33, STONE, 4),
      // 천수 4층 + 굽은 기와지붕 + 파풍(gable)
      { k: 'box', w: 0.46, h: 0.4, d: 0.46, y: PL + 0.52, color: WALL, rough: 0.8, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.22 } },
      ...pilasters(0.46, 0.46, 0.4, PL + 0.52, WOOD),
      { k: 'roof', type: 'pyramid', w: 0.58, y: PL + 0.92, height: 0.16, color: TILE2 },
      { k: 'box', w: 0.14, h: 0.1, d: 0.03, z: 0.24, y: PL + 0.96, color: WALL2 },
      { k: 'box', w: 0.38, h: 0.34, d: 0.38, y: PL + 1.08, color: WALL, rough: 0.8, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.22 } },
      { k: 'roof', type: 'pyramid', w: 0.5, y: PL + 1.42, height: 0.15, color: TILE2 },
      { k: 'box', w: 0.3, h: 0.3, d: 0.3, y: PL + 1.57, color: WALL, rough: 0.8, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.22 } },
      { k: 'roof', type: 'pyramid', w: 0.42, y: PL + 1.87, height: 0.14, color: TILE2 },
      { k: 'box', w: 0.22, h: 0.24, d: 0.22, y: PL + 2.01, color: WALL, rough: 0.8, windows: { from: 0.2, to: 0.8, color: GOLD, glow: 0.3 } },
      { k: 'box', w: 0.28, h: 0.03, d: 0.28, y: PL + 2.25, color: GOLD },
      { k: 'roof', type: 'pyramid', w: 0.34, y: PL + 2.28, height: 0.16, color: TILE2 },
      // 황금 샤치호코 한쌍
      { k: 'box', w: 0.05, h: 0.09, d: 0.02, x: -0.09, y: PL + 2.44, color: GOLD, detail: true, emissive: true },
      { k: 'box', w: 0.05, h: 0.09, d: 0.02, x: 0.09, y: PL + 2.44, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.22, h: 0.28, pos: [0, PL + 0.66, 0.24 + 0.006], color: WOOD },
      { k: 'panel', w: 0.32, h: 0.06, pos: [0, PL + 0.86, 0.24 + 0.008], color: GOLD, glow: 0.28 },
    ],
  },

  // ── 초고층: 유리 오피스 + 기와 크라운 (modern slab) ──
  sakura_office: {
    label: '사쿠라 오피스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.4, color: 'roofDark' },
      { k: 'box', w: 0.42, h: 0.16, d: 0.4, y: PL, color: STONE2, rough: 0.8 },
      ...steps(0.24, PL, 0.21, STONE, 2),
      { k: 'box', w: 0.42, h: 1.5, d: 0.38, y: PL + 0.16, color: '#D6E9EE', rough: 0.3, metal: 0.5, windows: { from: 0.06, to: 0.95, color: GLASS, glow: 0.36 } },
      // 수직 커튼월 멀리언
      ...ribs(0.42, 0.38, 1.5, PL + 0.16, 6, '#B7D2DA', 0.02),
      ...bands(0.42, 0.38, [PL + 0.66, PL + 1.16], BLOSSOM),
      { k: 'box', w: 0.44, h: 0.05, d: 0.4, y: PL + 1.66, color: GOLD },
      { k: 'box', w: 0.3, h: 0.34, d: 0.3, y: PL + 1.71, color: '#D6E9EE', rough: 0.3, metal: 0.5, windows: { from: 0.1, to: 0.9, color: GLASS, glow: 0.36 } },
      // 사쿠라 정체성: 상부 기와 크라운 + 첨탑
      { k: 'roof', type: 'pyramid', w: 0.38, y: PL + 2.05, height: 0.18, color: TILE },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 2.23, color: GOLD, detail: true, emissive: true },
      { k: 'antenna', y: PL + 2.05, h: 0.4 },
      // 1층 아트리움 입구 + 벚꽃 배너
      { k: 'box', w: 0.44, h: 0.06, d: 0.42, y: PL + 0.16, color: GOLD },
      { k: 'panel', w: 0.22, h: 0.3, pos: [0, PL + 0.3, 0.2 + 0.006], color: GLASS, glow: 0.32 },
      { k: 'panel', w: 0.05, h: 0.6, pos: [-0.16, PL + 0.7, 0.2 + 0.006], color: BLOSSOM, glow: 0.3 },
      { k: 'panel', w: 0.05, h: 0.6, pos: [0.16, PL + 0.7, 0.2 + 0.006], color: BLOSSOM, glow: 0.3 },
    ],
  },

  // ── 고층: 트윈윙 호텔 (twin-wing massing) ──
  sakura_hotel: {
    label: '사쿠라 호텔',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.44, color: 'concrete' },
      { k: 'box', w: 0.62, h: 0.5, d: 0.44, y: PL, color: WALL2, rough: 0.6, windows: { from: 0.5, to: 0.85, color: GLASS, glow: 0.3 } },
      ...portico(0.62, 0.44, 0.44, PL, 6, WOOD, GOLD),
      // 좌우 윙 타워 + 중앙 코어(더 높음)
      { k: 'box', w: 0.22, h: 1.2, d: 0.42, x: -0.19, y: PL + 0.5, color: WALL, rough: 0.65, windows: { from: 0.05, to: 0.95, color: GLASS, glow: 0.28 } },
      { k: 'box', w: 0.22, h: 1.2, d: 0.42, x: 0.19, y: PL + 0.5, color: WALL, rough: 0.65, windows: { from: 0.05, to: 0.95, color: GLASS, glow: 0.28 } },
      { k: 'box', w: 0.24, h: 1.5, d: 0.4, y: PL + 0.5, color: WALL2, rough: 0.65, windows: { from: 0.05, to: 0.95, color: GLASS, glow: 0.28 } },
      ...bands(0.62, 0.44, [PL + 0.9, PL + 1.3], BLOSSOM),
      { k: 'box', w: 0.22, h: 0.03, d: 0.42, x: -0.19, y: PL + 1.7, color: TILE },
      { k: 'box', w: 0.28, h: 0.06, d: 0.4, y: PL + 2.0, color: TILE },
      { k: 'roof', type: 'pyramid', w: 0.34, y: PL + 2.06, height: 0.16, color: TILE },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 2.22, color: GOLD, detail: true, emissive: true },
      // 종이등 행렬
      { k: 'panel', w: 0.05, h: 0.12, pos: [-0.22, PL + 0.6, 0.23 + 0.006], color: PAPER, glow: 0.5 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0, PL + 0.6, 0.23 + 0.006], color: RED, glow: 0.5 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0.22, PL + 0.6, 0.23 + 0.006], color: PAPER, glow: 0.5 },
      { k: 'panel', w: 0.4, h: 0.08, pos: [0, PL + 0.42, 0.22 + 0.008], color: RED, glow: 0.25 },
    ],
  },

  // ── 고층: 벚꽃 백화점 (wide commercial + 세트백 + 루프가든) ──
  sakura_dept_store: {
    label: '벚꽃 백화점',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.64, d: 0.52, color: 'concrete' },
      { k: 'box', w: 0.64, h: 0.5, d: 0.52, y: PL, color: WALL, rough: 0.6, windows: { from: 0.45, to: 0.9, color: GLASS, glow: 0.3 } },
      { k: 'storefront', w: 0.64, d: 0.52, faceH: 0.32, awning: RED, sign: BLOSSOM },
      cornice(0.64, 0.52, PL + 0.5, GOLD),
      { k: 'box', w: 0.6, h: 0.5, d: 0.48, y: PL + 0.55, color: WALL2, rough: 0.6, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.3 } },
      ...ribs(0.6, 0.48, 0.5, PL + 0.55, 7, GOLD, 0.02),
      { k: 'box', w: 0.62, h: 0.05, d: 0.5, y: PL + 1.05, color: GOLD },
      { k: 'box', w: 0.44, h: 0.4, d: 0.36, y: PL + 1.1, color: WALL, rough: 0.6, windows: { from: 0.2, to: 0.85, color: GLASS, glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.52, y: PL + 1.5, height: 0.14, color: TILE },
      { k: 'parapet', w: 0.64, d: 0.52, y: PL + 0.5, color: WALL },
      // 옥상 정원(벚나무 + 등)
      { k: 'box', w: 0.05, h: 0.14, d: 0.05, x: 0.24, z: 0.16, y: PL + 0.5, color: WOOD, detail: true },
      { k: 'box', w: 0.16, h: 0.12, d: 0.16, x: 0.24, z: 0.16, y: PL + 0.64, color: BLOSSOM, detail: true },
      { k: 'panel', w: 0.5, h: 0.1, pos: [0, PL + 0.9, 0.24 + 0.008], color: GOLD, glow: 0.35 },
    ],
  },

  // ── 고층: 기와 시청 (symmetric civic + 중앙 시계탑) ──
  sakura_cityhall: {
    label: '기와 시청',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.66, d: 0.5, color: 'concrete' },
      { k: 'box', w: 0.66, h: 0.9, d: 0.5, y: PL, color: WALL, rough: 0.68, windows: { from: 0.15, to: 0.88, color: GLASS, glow: 0.26 } },
      ...portico(0.66, 0.5, 0.6, PL, 8, STONE, GOLD),
      ...bands(0.66, 0.5, [PL + 0.46], TILE),
      // 좌우 날개
      { k: 'roof', type: 'pyramid', w: 0.74, d: 0.58, y: PL + 0.9, height: 0.12, color: TILE },
      // 중앙 시계탑 + 기와 첨탑
      { k: 'box', w: 0.26, h: 0.6, d: 0.26, y: PL + 0.9, color: WALL2, rough: 0.68, windows: { from: 0.1, to: 0.5, color: GLASS, glow: 0.26 } },
      ...pilasters(0.26, 0.26, 0.6, PL + 0.9, WOOD, 0.022),
      { k: 'clock', w: 0.26, y: PL + 1.34, color: GOLD },
      { k: 'box', w: 0.32, h: 0.04, d: 0.32, y: PL + 1.5, color: RED },
      { k: 'roof', type: 'pyramid', w: 0.36, y: PL + 1.54, height: 0.2, color: TILE },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, y: PL + 1.74, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.34, h: 0.09, pos: [0, PL + 0.78, 0.25 + 0.008], color: RED, glow: 0.25 },
    ],
  },

  // ── 중층: 가부키 극장 (signage facade + karahafu) ──
  sakura_theater: {
    label: '가부키 극장',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.58, d: 0.48, color: 'concrete' },
      { k: 'box', w: 0.58, h: 1.0, d: 0.48, y: PL, color: RED, rough: 0.7, windows: { from: 0.55, to: 0.85, color: PAPER, glow: 0.32 } },
      ...ribs(0.58, 0.48, 1.0, PL, 6, GOLD, 0.022),
      { k: 'storefront', w: 0.58, d: 0.48, faceH: 0.42, awning: '#7A1F1F', sign: GOLD },
      { k: 'box', w: 0.6, h: 0.05, d: 0.5, y: PL + 1.0, color: GOLD },
      { k: 'box', w: 0.42, h: 0.3, d: 0.38, y: PL + 1.05, color: WALL, rough: 0.7 },
      // 카라하후(당파풍) 곡선 박공
      { k: 'roof', type: 'pyramid', w: 0.5, y: PL + 1.35, height: 0.13, color: TILE2 },
      { k: 'roof', type: 'round', w: 0.28, d: 0.5, y: PL + 1.35, color: TILE2 },
      { k: 'box', w: 0.02, h: 0.14, d: 0.02, y: PL + 1.62, color: GOLD, detail: true, emissive: true },
      // 대형 수직 마퀴 + 등불
      { k: 'panel', w: 0.16, h: 0.7, pos: [0.3, PL + 0.6, 0.24 + 0.006], color: BLOSSOM, glow: 0.5 },
      { k: 'panel', w: 0.44, h: 0.16, pos: [0, PL + 0.9, 0.25 + 0.008], color: BLOSSOM, glow: 0.45 },
      { k: 'panel', w: 0.05, h: 0.13, pos: [-0.24, PL + 0.5, 0.25 + 0.006], color: RED, glow: 0.55 },
      { k: 'panel', w: 0.05, h: 0.13, pos: [-0.12, PL + 0.5, 0.25 + 0.006], color: PAPER, glow: 0.55 },
    ],
  },

  // ── 중층: 벚꽃정원 맨션 (residential + 발코니 + 블라썸 테라스) ──
  sakura_garden_mansion: {
    label: '벚꽃정원 맨션',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.4, color: 'concrete' },
      { k: 'box', w: 0.52, h: 1.5, d: 0.4, y: PL, color: WALL, rough: 0.7, windows: { from: 0.1, to: 0.92, color: GLASS, glow: 0.26 } },
      { k: 'balconies', w: 0.52, d: 0.4, y0: PL + 0.24, y1: PL + 1.32, floors: 7, color: WALL2 },
      ...pilasters(0.52, 0.4, 1.5, PL, WOOD2, 0.025),
      ...bands(0.52, 0.4, [PL + 0.75], BLOSSOM),
      { k: 'box', w: 0.54, h: 0.05, d: 0.42, y: PL + 1.5, color: GOLD },
      { k: 'roof', type: 'pyramid', w: 0.58, y: PL + 1.55, height: 0.14, color: TILE },
      { k: 'parapet', w: 0.52, d: 0.4, y: PL + 1.5, color: WALL },
      // 옥상 벚나무 정원
      { k: 'box', w: 0.05, h: 0.16, d: 0.05, x: 0.18, z: 0.1, y: PL + 1.5, color: WOOD, detail: true },
      { k: 'box', w: 0.18, h: 0.14, d: 0.18, x: 0.18, z: 0.1, y: PL + 1.66, color: BLOSSOM, detail: true },
      { k: 'box', w: 0.12, h: 0.1, d: 0.12, x: -0.14, z: -0.06, y: PL + 1.5, color: '#F6C0D4', detail: true },
      { k: 'storefront', w: 0.52, d: 0.4, faceH: 0.28, awning: RED, sign: WALL },
    ],
  },

  // ── 중층: 온천 여관 (stepped multi-tier ryokan) ──
  sakura_onsen_inn: {
    label: '온천 여관',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.46, color: 'path' },
      { k: 'box', w: 0.62, h: 0.5, d: 0.46, y: PL, color: WALL, rough: 0.78, windows: { from: 0.3, to: 0.82, color: PAPER, glow: 0.3 } },
      // 넓은 처마 1층 지붕(여관 느낌) → 상층은 중앙 정렬로 반듯하게 적층
      { k: 'roof', type: 'pyramid', w: 0.72, d: 0.56, y: PL + 0.5, height: 0.13, color: TILE2 },
      { k: 'box', w: 0.5, h: 0.42, d: 0.4, y: PL + 0.63, color: WALL, rough: 0.78, windows: { from: 0.2, to: 0.8, color: PAPER, glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.58, d: 0.48, y: PL + 1.05, height: 0.13, color: TILE2 },
      { k: 'box', w: 0.36, h: 0.4, d: 0.32, y: PL + 1.18, color: WALL, rough: 0.78, windows: { from: 0.2, to: 0.8, color: PAPER, glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.44, d: 0.4, y: PL + 1.58, height: 0.14, color: TILE2 },
      // 온천 굴뚝(증기)
      { k: 'box', w: 0.07, h: 0.44, d: 0.07, x: 0.2, z: -0.12, y: PL + 1.05, color: WOOD, detail: true },
      { k: 'box', w: 0.1, h: 0.06, d: 0.1, x: 0.2, z: -0.12, y: PL + 1.49, color: '#D8D0C8', detail: true },
      // 노렌 + 종이등 행렬
      { k: 'storefront', w: 0.62, d: 0.46, faceH: 0.3, awning: RED, sign: WALL },
      { k: 'panel', w: 0.05, h: 0.12, pos: [-0.22, PL + 0.42, 0.24 + 0.006], color: RED, glow: 0.5 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [-0.07, PL + 0.42, 0.24 + 0.006], color: PAPER, glow: 0.5 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0.08, PL + 0.42, 0.24 + 0.006], color: RED, glow: 0.5 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0.23, PL + 0.42, 0.24 + 0.006], color: PAPER, glow: 0.5 },
    ],
  },

  // ── 중층: 화신 은행 (colonnade + 상층 + 기와) ──
  sakura_bank: {
    label: '화신 은행',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.54, d: 0.44, color: STONE },
      ...steps(0.4, PL, 0.23, STONE, 3),
      { k: 'box', w: 0.54, h: 0.7, d: 0.44, y: PL + 0.06, color: STONE2, rough: 0.7, windows: { from: 0.4, to: 0.85, color: GLASS, glow: 0.22 } },
      { k: 'columns', w: 0.54, d: 0.44, y: PL + 0.06, h: 0.62, count: 6, color: WALL },
      { k: 'box', w: 0.58, h: 0.06, d: 0.48, y: PL + 0.76, color: WALL },
      { k: 'box', w: 0.46, h: 0.6, d: 0.38, y: PL + 0.82, color: STONE2, rough: 0.7, windows: { from: 0.15, to: 0.85, color: GLASS, glow: 0.22 } },
      ...ribs(0.46, 0.38, 0.6, PL + 0.82, 5, WALL, 0.022),
      { k: 'box', w: 0.5, h: 0.05, d: 0.42, y: PL + 1.42, color: GOLD },
      { k: 'roof', type: 'pyramid', w: 0.56, y: PL + 1.47, height: 0.14, color: TILE },
      { k: 'parapet', w: 0.54, d: 0.44, y: PL + 0.76, color: STONE2 },
      { k: 'panel', w: 0.34, h: 0.08, pos: [0, PL + 0.62, 0.23 + 0.008], color: GOLD, glow: 0.3 },
    ],
  },

  // ── 중층: 센토 목욕탕 (karahafu curved gable + 굴뚝 + 상층) ──
  sakura_bathhouse: {
    label: '센토 목욕탕',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.52, d: 0.44, color: 'concrete' },
      { k: 'box', w: 0.52, h: 0.7, d: 0.44, y: PL, color: WALL, rough: 0.75, windows: { from: 0.4, to: 0.82, color: PAPER, glow: 0.3 } },
      ...ribs(0.52, 0.44, 0.7, PL, 5, WOOD2, 0.02),
      { k: 'box', w: 0.44, h: 0.4, d: 0.36, y: PL + 0.7, color: WALL2, rough: 0.75, windows: { from: 0.2, to: 0.75, color: PAPER, glow: 0.3 } },
      // 카라하후 곡선 박공
      { k: 'roof', type: 'round', w: 0.36, d: 0.5, y: PL + 1.1, color: TILE2 },
      { k: 'roof', type: 'pyramid', w: 0.58, d: 0.5, y: PL + 0.7, height: 0.1, color: TILE2 },
      // 높은 굴뚝
      { k: 'box', w: 0.1, h: 0.7, d: 0.1, x: 0.18, z: -0.12, y: PL + 0.7, color: '#8A5A44' },
      { k: 'box', w: 0.12, h: 0.06, d: 0.12, x: 0.18, z: -0.12, y: PL + 1.4, color: '#6E4636', detail: true },
      { k: 'storefront', w: 0.52, d: 0.44, faceH: 0.32, awning: '#2E6E8C', sign: WALL },
      { k: 'panel', w: 0.16, h: 0.14, pos: [0, PL + 0.56, 0.23 + 0.008], color: '#2E6E8C', glow: 0.3 },
    ],
  },

  // ── 중층: 마치야 상가주택 (narrow tall 3-story) ──
  sakura_machiya: {
    label: '마치야 상가주택',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.32, d: 0.46, color: 'path' },
      { k: 'box', w: 0.32, h: 0.5, d: 0.46, y: PL, color: WOOD, rough: 0.8 },
      { k: 'box', w: 0.3, h: 0.44, d: 0.44, y: PL + 0.5, color: WALL, rough: 0.8, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.24 } },
      { k: 'box', w: 0.28, h: 0.4, d: 0.42, y: PL + 0.94, color: WALL2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.24 } },
      { k: 'roof', type: 'pyramid', w: 0.38, d: 0.52, y: PL + 1.34, height: 0.16, color: TILE },
      // 격자 목재 정면(고시) + 노렌 + 무시코마도
      { k: 'panel', w: 0.28, h: 0.44, pos: [0, PL + 0.72, 0.22 + 0.006], color: '#7A5540' },
      { k: 'panel', w: 0.26, h: 0.38, pos: [0, PL + 1.14, 0.21 + 0.006], color: '#8A6550' },
      ...bands(0.32, 0.46, [PL + 0.5, PL + 0.94], WOOD2),
      { k: 'panel', w: 0.28, h: 0.1, pos: [0, PL + 0.44, 0.23 + 0.008], color: RED, glow: 0.2 },
      { k: 'panel', w: 0.06, h: 0.14, pos: [0.1, PL + 0.24, 0.23 + 0.006], color: PAPER, glow: 0.45 },
    ],
  },

  // ── 중층: 사원 본당 (monumental hall on podium) ──
  sakura_temple_hall: {
    label: '사원 본당',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.68, d: 0.54, color: STONE },
      { k: 'box', w: 0.62, h: 0.2, d: 0.48, y: PL, color: STONE2, rough: 0.9 },
      ...steps(0.34, PL, 0.25, STONE, 3),
      { k: 'box', w: 0.56, h: 0.56, d: 0.42, y: PL + 0.2, color: RED, rough: 0.75, windows: { from: 0.25, to: 0.8, color: PAPER, glow: 0.28 } },
      { k: 'columns', w: 0.56, d: 0.42, y: PL + 0.2, h: 0.56, count: 6, color: WOOD },
      // 이중 팔작지붕
      { k: 'roof', type: 'pyramid', w: 0.76, d: 0.6, y: PL + 0.76, height: 0.14, color: TILE2 },
      { k: 'box', w: 0.44, h: 0.16, d: 0.34, y: PL + 0.9, color: RED, rough: 0.75 },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.44, y: PL + 1.06, height: 0.2, color: TILE2 },
      { k: 'box', w: 0.05, h: 0.14, d: 0.05, y: PL + 1.26, color: GOLD, detail: true, emissive: true },
      // 용마루 시비
      { k: 'box', w: 0.05, h: 0.06, d: 0.02, x: -0.24, y: PL + 0.9, color: TILE, detail: true },
      { k: 'box', w: 0.05, h: 0.06, d: 0.02, x: 0.24, y: PL + 0.9, color: TILE, detail: true },
      { k: 'panel', w: 0.3, h: 0.1, pos: [0, PL + 0.64, 0.22 + 0.008], color: GOLD, glow: 0.3 },
    ],
  },

  // ── 중층: 신사 배전 (raised honden + 토리이) ──
  sakura_shrine: {
    label: '신사 배전',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.54, d: 0.46, color: STONE },
      // 높은 석조 기단
      { k: 'box', w: 0.48, h: 0.4, d: 0.4, y: PL, color: STONE2, rough: 0.9 },
      ...steps(0.24, PL, 0.21, WOOD, 4, 0.05),
      { k: 'box', w: 0.44, h: 0.5, d: 0.36, y: PL + 0.4, color: RED, rough: 0.72, windows: { from: 0.25, to: 0.78, color: PAPER, glow: 0.3 } },
      { k: 'columns', w: 0.44, d: 0.36, y: PL + 0.4, h: 0.5, count: 5, color: WOOD },
      { k: 'roof', type: 'pyramid', w: 0.58, d: 0.48, y: PL + 0.9, height: 0.24, color: TILE2 },
      // 치기 + 가쓰오기 (금박)
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, x: -0.08, y: PL + 1.14, color: GOLD, detail: true, emissive: true, rough: 0.4 },
      { k: 'box', w: 0.02, h: 0.16, d: 0.02, x: 0.08, y: PL + 1.14, color: GOLD, detail: true, emissive: true, rough: 0.4 },
      { k: 'box', w: 0.24, h: 0.04, d: 0.04, y: PL + 1.16, color: GOLD, detail: true },
      // 앞쪽 토리이 (massing 박스)
      { k: 'box', w: 0.05, h: 0.5, d: 0.05, x: -0.18, z: 0.34, y: PL, color: RED },
      { k: 'box', w: 0.05, h: 0.5, d: 0.05, x: 0.18, z: 0.34, y: PL, color: RED },
      { k: 'box', w: 0.5, h: 0.05, d: 0.06, z: 0.34, y: PL + 0.5, color: '#8A2420' },
      { k: 'box', w: 0.42, h: 0.04, d: 0.04, z: 0.34, y: PL + 0.4, color: RED },
      { k: 'panel', w: 0.18, h: 0.12, pos: [0, PL + 0.62, 0.2 + 0.006], color: PAPER, glow: 0.3 },
    ],
  },

  // ── 중층: 종이등 상점가 (WIDE 수평 2층 아케이드 — 매스 차별화) ──
  sakura_lantern_shops: {
    label: '종이등 상점가',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.7, d: 0.42, color: 'path' },
      // 3연 점포(폭 방향 분절) 1층
      { k: 'box', w: 0.23, h: 0.46, d: 0.42, x: -0.23, y: PL, color: WOOD, rough: 0.8 },
      { k: 'box', w: 0.23, h: 0.5, d: 0.42, x: 0, y: PL, color: WOOD2, rough: 0.8 },
      { k: 'box', w: 0.23, h: 0.44, d: 0.42, x: 0.23, y: PL, color: WOOD, rough: 0.8 },
      { k: 'storefront', w: 0.7, d: 0.42, faceH: 0.3, awning: RED, sign: PAPER },
      // 2층 통층 + 낮고 넓은 지붕
      { k: 'box', w: 0.68, h: 0.4, d: 0.4, y: PL + 0.5, color: WALL, rough: 0.8, windows: { from: 0.2, to: 0.8, color: PAPER, glow: 0.3 } },
      ...ribs(0.68, 0.4, 0.4, PL + 0.5, 8, WOOD2, 0.02),
      { k: 'box', w: 0.72, h: 0.04, d: 0.44, y: PL + 0.9, color: RED },
      { k: 'roof', type: 'pyramid', w: 0.8, d: 0.5, y: PL + 0.94, height: 0.16, color: TILE },
      // 처마 밑 종이등 긴 행렬
      { k: 'panel', w: 0.05, h: 0.12, pos: [-0.28, PL + 0.42, 0.21 + 0.006], color: RED, glow: 0.55 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [-0.14, PL + 0.42, 0.21 + 0.006], color: PAPER, glow: 0.55 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0, PL + 0.42, 0.21 + 0.006], color: RED, glow: 0.55 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0.14, PL + 0.42, 0.21 + 0.006], color: PAPER, glow: 0.55 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0.28, PL + 0.42, 0.21 + 0.006], color: RED, glow: 0.55 },
      { k: 'panel', w: 0.5, h: 0.09, pos: [0, PL + 0.78, 0.21 + 0.008], color: RED, glow: 0.28 },
    ],
  },

  // ── 중층: 정원 카페 빌딩 (3층 + 루프 테라스) ──
  sakura_garden_cafe: {
    label: '정원 카페',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.44, d: 0.4, color: 'path' },
      { k: 'box', w: 0.44, h: 0.48, d: 0.4, y: PL, color: WALL2, rough: 0.75, windows: { from: 0.45, to: 0.88, color: GLASS, glow: 0.3 } },
      { k: 'storefront', w: 0.44, d: 0.4, faceH: 0.3, awning: BLOSSOM, sign: WOOD },
      { k: 'box', w: 0.42, h: 0.44, d: 0.38, y: PL + 0.48, color: WALL, rough: 0.75, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.3 } },
      { k: 'box', w: 0.38, h: 0.34, d: 0.34, y: PL + 0.92, color: WALL2, rough: 0.75, windows: { from: 0.2, to: 0.8, color: GLASS, glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.46, d: 0.42, y: PL + 1.26, height: 0.13, color: TILE },
      ...pilasters(0.44, 0.4, 1.26, PL, WOOD2, 0.022),
      // 루프 테라스 파라솔 + 벚나무
      { k: 'parapet', w: 0.42, d: 0.38, y: PL + 0.92, color: WALL },
      { k: 'parasol', pos: [0.12, PL + 0.48, 0.12], color: BLOSSOM },
      { k: 'box', w: 0.04, h: 0.12, d: 0.04, x: -0.14, z: 0.1, y: PL + 0.92, color: WOOD, detail: true },
      { k: 'box', w: 0.14, h: 0.1, d: 0.14, x: -0.14, z: 0.1, y: PL + 1.04, color: BLOSSOM, detail: true },
    ],
  },

  // ── 중층: 다실 하우스 (multi-level tea pavilion) ──
  sakura_tea_house: {
    label: '다실 하우스',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.42, d: 0.42, color: 'path' },
      // 툇마루 데크
      { k: 'box', w: 0.5, h: 0.05, d: 0.5, y: PL, color: WOOD, rough: 0.85 },
      { k: 'box', w: 0.4, h: 0.44, d: 0.4, y: PL + 0.05, color: WALL, rough: 0.82, windows: { from: 0.25, to: 0.8, color: PAPER, glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.52, d: 0.52, y: PL + 0.49, height: 0.16, color: TILE2 },
      // 상부 다실 정자
      { k: 'box', w: 0.3, h: 0.36, d: 0.3, y: PL + 0.65, color: WALL2, rough: 0.82, windows: { from: 0.25, to: 0.8, color: PAPER, glow: 0.28 } },
      { k: 'roof', type: 'pyramid', w: 0.42, d: 0.42, y: PL + 1.01, height: 0.2, color: TILE2 },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, y: PL + 1.21, color: WOOD, detail: true },
      // 낮은 담 + 노렌 + 석등
      { k: 'box', w: 0.06, h: 0.14, d: 0.06, x: 0.22, z: 0.2, y: PL, color: STONE2, detail: true },
      { k: 'box', w: 0.09, h: 0.05, d: 0.09, x: 0.22, z: 0.2, y: PL + 0.14, color: STONE, detail: true },
      { k: 'panel', w: 0.06, h: 0.06, pos: [0.22, PL + 0.15, 0.2], color: PAPER, glow: 0.4 },
      { k: 'panel', w: 0.2, h: 0.14, pos: [0, PL + 0.24, 0.2 + 0.006], color: RED, glow: 0.15 },
    ],
  },

  // ── 중층: 경단 찻집 타워 (was dango_stall → 3층 shophouse) ──
  sakura_dango_stall: {
    label: '경단 찻집',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.34, d: 0.32, color: 'path' },
      { k: 'box', w: 0.34, h: 0.42, d: 0.32, y: PL, color: WOOD, rough: 0.82 },
      { k: 'storefront', w: 0.34, d: 0.32, faceH: 0.26, awning: RED, sign: PAPER },
      { k: 'box', w: 0.32, h: 0.38, d: 0.3, y: PL + 0.42, color: WALL, rough: 0.8, windows: { from: 0.2, to: 0.8, color: PAPER, glow: 0.3 } },
      { k: 'box', w: 0.3, h: 0.34, d: 0.28, y: PL + 0.8, color: WALL2, rough: 0.8, windows: { from: 0.2, to: 0.8, color: PAPER, glow: 0.3 } },
      { k: 'roof', type: 'pyramid', w: 0.42, d: 0.38, y: PL + 1.14, height: 0.16, color: TILE },
      ...bands(0.34, 0.32, [PL + 0.42, PL + 0.8], WOOD2),
      // 경단 간판(3색 구슬) + 등불
      { k: 'panel', w: 0.06, h: 0.06, pos: [0.1, PL + 0.34, 0.17 + 0.008], color: '#E86A88', glow: 0.4 },
      { k: 'panel', w: 0.06, h: 0.06, pos: [0.1, PL + 0.42, 0.17 + 0.008], color: WALL, glow: 0.3 },
      { k: 'panel', w: 0.06, h: 0.06, pos: [0.1, PL + 0.5, 0.17 + 0.008], color: '#8AB84B', glow: 0.4 },
      { k: 'panel', w: 0.05, h: 0.11, pos: [-0.11, PL + 0.32, 0.17 + 0.006], color: RED, glow: 0.5 },
      { k: 'panel', w: 0.22, h: 0.08, pos: [0, PL + 0.72, 0.16 + 0.008], color: RED, glow: 0.25 },
    ],
  },

  // ── 중층: 토리이 게이트 (monumental gate + 뒤 게이트홀) ──
  sakura_torii_gate: {
    label: '토리이 게이트',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.62, d: 0.44, color: STONE },
      // 대형 토리이
      { k: 'box', w: 0.08, h: 1.1, d: 0.08, x: -0.24, z: 0.16, y: PL, color: RED, rough: 0.7 },
      { k: 'box', w: 0.08, h: 1.1, d: 0.08, x: 0.24, z: 0.16, y: PL, color: RED, rough: 0.7 },
      { k: 'box', w: 0.62, h: 0.07, d: 0.07, z: 0.16, y: PL + 0.82, color: RED, rough: 0.7 },
      { k: 'box', w: 0.74, h: 0.08, d: 0.12, z: 0.16, y: PL + 1.1, color: '#8A2420', rough: 0.7 },
      { k: 'box', w: 0.64, h: 0.06, d: 0.09, z: 0.16, y: PL + 1.04, color: RED, rough: 0.7 },
      { k: 'box', w: 0.1, h: 0.16, d: 0.05, z: 0.16, y: PL + 0.9, color: GOLD, detail: true, emissive: true },
      // 뒤쪽 게이트 홀(누각)
      { k: 'box', w: 0.44, h: 0.6, d: 0.3, z: -0.12, y: PL, color: WALL, rough: 0.78, windows: { from: 0.3, to: 0.8, color: PAPER, glow: 0.28 } },
      { k: 'columns', w: 0.44, d: 0.3, y: PL, h: 0.5, count: 5, color: WOOD },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.4, y: PL + 0.6, height: 0.2, color: TILE2 },
      { k: 'box', w: 0.02, h: 0.12, d: 0.02, z: -0.12, y: PL + 0.8, color: GOLD, detail: true, emissive: true },
      { k: 'panel', w: 0.12, h: 0.14, pos: [0, PL + 0.86, 0.16 + 0.006], color: GOLD, glow: 0.3 },
      { k: 'panel', w: 0.05, h: 0.12, pos: [0, PL + 0.5, 0.16 + 0.006], color: PAPER, glow: 0.5 },
    ],
  },

  // ── 중층: 종루 (open-frame shoro tower) ──
  sakura_bell_tower: {
    label: '종루 (쇼로)',
    group: 'city',
    parts: [
      { k: 'plinth', w: 0.46, d: 0.46, color: STONE },
      { k: 'box', w: 0.42, h: 0.3, d: 0.42, y: PL, color: STONE2, rough: 0.92 },
      ...steps(0.22, PL, 0.23, STONE, 2),
      // 개방형 목조 4주 (경사)
      { k: 'box', w: 0.06, h: 0.9, d: 0.06, x: -0.16, z: -0.16, y: PL + 0.3, color: WOOD },
      { k: 'box', w: 0.06, h: 0.9, d: 0.06, x: 0.16, z: -0.16, y: PL + 0.3, color: WOOD },
      { k: 'box', w: 0.06, h: 0.9, d: 0.06, x: -0.16, z: 0.16, y: PL + 0.3, color: WOOD },
      { k: 'box', w: 0.06, h: 0.9, d: 0.06, x: 0.16, z: 0.16, y: PL + 0.3, color: WOOD },
      // 상부 가로보 + 몸통
      { k: 'box', w: 0.44, h: 0.06, d: 0.44, y: PL + 1.14, color: WOOD2 },
      { k: 'box', w: 0.36, h: 0.16, d: 0.36, y: PL + 1.2, color: WALL, rough: 0.8 },
      { k: 'roof', type: 'pyramid', w: 0.56, d: 0.56, y: PL + 1.36, height: 0.26, color: TILE2 },
      { k: 'box', w: 0.05, h: 0.12, d: 0.05, y: PL + 1.62, color: GOLD, detail: true, emissive: true },
      // 매달린 범종
      { k: 'cyl', rt: 0.08, rb: 0.1, h: 0.24, y: PL + 0.66, color: '#7A6A3A', detail: true },
      { k: 'box', w: 0.24, h: 0.04, d: 0.04, y: PL + 1.12, color: WOOD, detail: true },
    ],
  },
} satisfies Record<string, BuildingConfig>
