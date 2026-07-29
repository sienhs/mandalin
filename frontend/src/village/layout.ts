/**
 * 마을 지형 배치 상수.
 *
 * 3×3 블록(=9도메인)이 PITCH 간격으로 놓이고, 블록 사이 GAP 폭의 통로가 "길"이 된다.
 * 지형 렌더러(terrain/*)와 Block 이 같은 좌표를 봐야 길과 블록 경계가 어긋나지 않아서
 * 한 곳에 모아둔다.
 */

/** 블록 안 한 칸(과제 1개) 크기. */
export const CELL = 2.6

/** 블록(도메인 1개) 한 변. */
export const BLOCK_SIZE = CELL * 3 + 0.8

/** 블록 사이 통로 폭 = 길 폭. */
export const GAP = 2.2

/** 블록 중심 간 거리. */
export const PITCH = BLOCK_SIZE + GAP

/** 전체 대지 한 변. 바깥 순환로까지 덮을 만큼 잡는다. */
export const SPAN = PITCH * 3 + GAP + 0.6

/** 블록 중심 좌표 (x/z 공통). */
export const BLOCK_CENTERS = [-PITCH, 0, PITCH] as const

/** 블록 사이 통로 중심선 2개. */
export const ROAD_CENTERS = [-PITCH / 2, PITCH / 2] as const

/** 대지 가장자리 순환로 중심선 2개. */
export const RING_CENTERS = [
  -PITCH - BLOCK_SIZE / 2 - GAP / 2,
  PITCH + BLOCK_SIZE / 2 + GAP / 2,
] as const

/** 길 4줄(안쪽 2 + 바깥 2). 가로·세로 모두 같은 좌표를 쓴다. */
export const ALL_ROAD_CENTERS = [...RING_CENTERS, ...ROAD_CENTERS].sort((a, b) => a - b)

/**
 * 결정적 난수 (mulberry32).
 * 장식물 배치가 매 렌더 달라지면 마을이 흔들려 보이므로 seed 로 고정한다.
 */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 블록 위(=건물 자리)를 피해 길 위에만 장식을 뿌리기 위한 판정. */
export function isOnRoad(x: number, z: number, margin = 0): boolean {
  const overBlock = (v: number) =>
    BLOCK_CENTERS.some((c) => Math.abs(v - c) < BLOCK_SIZE / 2 + margin)
  return !(overBlock(x) && overBlock(z))
}
