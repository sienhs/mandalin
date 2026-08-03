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

/**
 * 도메인 식별 색 8종. 2D 만다라트 칸·리포트 막대·마을 바닥 원반이 <b>같은 값</b>을 쓴다.
 *
 * <p>예전에는 팔레트 안의 건물색(테라코타·벽돌 등)에서 골라 썼는데, 그 색들은 재질을 위한
 * 것이라 서로 구분이 잘 안 되고(크림 vs 모래) 2D 화면의 색과도 달랐다. 같은 세부 목표가
 * 목록에서는 파랑, 마을에서는 갈색으로 보이면 둘을 같은 것으로 읽지 못한다.
 *
 * <p>지형·건물의 자연색은 그대로 둔다. 여기서 바꾸는 것은 <b>식별용 색</b>뿐이다.
 * 값을 고치면 2D 쪽(`ui/Primitives.tsx` 의 DOMAIN_COLORS)도 같이 고쳐야 한다.
 */
export const DOMAIN_COLOR_HEX = [
  '#e8590c',
  '#d9480f',
  '#1971c2',
  '#0c8599',
  '#2f9e44',
  '#5f3dc4',
  '#c2255c',
  '#f08c00',
] as const

/** 중앙 랜드마크 색. 도메인 8색과 겹치지 않는 황금빛으로 둔다. */
export const LANDMARK_ACCENT_HEX = '#f59f00'

/**
 * 블록 인덱스(0~8, 4=중앙)로 바로 뽑아 쓰는 색.
 *
 * <p>블록 인덱스와 도메인 번호가 어긋난다는 점에 주의 — 중앙(4)이 끼어 있어서
 * 블록 5~8 은 도메인 4~7 이다({@link ../mandalart.ts} 의 `blockIndexOf`).
 */
export const DOMAIN_ACCENTS: Color[] = [
  new Color(DOMAIN_COLOR_HEX[0]),
  new Color(DOMAIN_COLOR_HEX[1]),
  new Color(DOMAIN_COLOR_HEX[2]),
  new Color(DOMAIN_COLOR_HEX[3]),
  new Color(LANDMARK_ACCENT_HEX), // 4 = 중앙 랜드마크
  new Color(DOMAIN_COLOR_HEX[4]),
  new Color(DOMAIN_COLOR_HEX[5]),
  new Color(DOMAIN_COLOR_HEX[6]),
  new Color(DOMAIN_COLOR_HEX[7]),
]

/** 브랜드 색. 선택 표시·강조에 쓴다(2D 의 --color-brand-500/600 과 같은 값). */
export const BRAND = {
  base: new Color('#f75316'),
  deep: new Color('#e8390c'),
  soft: new Color('#fda474'),
} as const
