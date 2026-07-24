import { Color, LinearSRGBColorSpace } from 'three'

/**
 * 레퍼런스(MODELING_D106/ref/vilage.mtl, city.mtl, "Exported by three-d-stage")에서
 * 그대로 추출한 팔레트. mtl의 Kd 값은 linear-RGB 이므로 LinearSRGBColorSpace로 넣어
 * three.js 색 관리(sRGB 출력)에 올바르게 태운다.
 *
 * 마을풍(vilage) + 도시풍(city) 색을 한곳에 통합 — 블록의 urbanLevel(0~1)에 따라
 * 두 그룹을 섞어 쓴다.
 */
function lin(r: number, g: number, b: number): Color {
  return new Color().setRGB(r, g, b, LinearSRGBColorSpace)
}

export const PALETTE = {
  // --- 지형/바닥 ---
  soil: lin(0.147, 0.0782, 0.0343),
  grass: lin(0.1441, 0.3916, 0.0782),
  path: lin(0.5841, 0.4851, 0.2747),
  water: lin(0.0685, 0.2789, 0.5395),
  plaza: lin(0.3231, 0.3515, 0.3916),
  road: lin(0.0723, 0.0782, 0.0953),
  roadPaint: lin(0.8879, 0.8879, 0.855),

  // --- 벽/건물 몸통 ---
  wallCream: lin(0.8228, 0.7379, 0.5776),
  wallTerracotta: lin(0.6939, 0.2582, 0.1441),
  wallBlue: lin(0.2747, 0.4342, 0.5841),
  concrete: lin(0.5457, 0.5711, 0.6038),

  // --- 지붕 ---
  roof: lin(0.3663, 0.0561, 0.0273),
  roofDark: lin(0.0685, 0.0685, 0.0908),

  // --- 창/유리 (도시풍) ---
  win: lin(0.0423, 0.0908, 0.1329),
  glass: lin(0.2705, 0.5906, 0.7913),
  glassWarm: lin(0.624, 0.807, 0.8879),

  // --- 나무/식물 ---
  blade: lin(0.9047, 0.8632, 0.7758),
  wood: lin(0.2542, 0.1022, 0.0343),
  bark: lin(0.147, 0.0685, 0.0242),
  foliage: lin(0.0497, 0.2051, 0.0423),
  bush: lin(0.0782, 0.3231, 0.0578),

  // --- 포인트 컬러 (꽃/간판/비콘) ---
  accent: lin(0.9216, 0.2961, 0.0123),
  beaconRed: lin(0.7605, 0.0437, 0.0437),
  flowerRed: lin(0.8148, 0.0782, 0.2016),
  flowerOrange: lin(0.8879, 0.5333, 0.0762),
  flowerPurple: lin(0.5841, 0.1119, 0.8148),

  // --- 파생색 (config에서 참조) ---
  hospitalWhite: lin(0.853, 0.878, 0.896),
  stoneLight: lin(0.919, 0.888, 0.808),
  officeBody: lin(0.3831, 0.489, 0.592), // wallBlue↔concrete 0.4
  skyBody: lin(0.4779, 0.5369, 0.5989), // concrete↔wallBlue 0.25
} as const

export type PaletteKey = keyof typeof PALETTE

/** config의 color 문자열(팔레트 key 또는 '#hex') → THREE.Color. */
export function resolveColor(c: string): Color {
  if (c.startsWith('#')) return new Color(c)
  return (PALETTE as Record<string, Color>)[c] ?? PALETTE.wallCream
}

/** 9개 도메인을 시각적으로 구분하기 위한 지붕/포인트 색 (팔레트 안에서 고름). */
export const DOMAIN_ACCENTS: Color[] = [
  PALETTE.wallTerracotta,
  PALETTE.wallBlue,
  PALETTE.roof,
  PALETTE.flowerOrange,
  PALETTE.wallCream,
  PALETTE.flowerPurple,
  PALETTE.bush,
  PALETTE.accent,
  PALETTE.glass,
]
