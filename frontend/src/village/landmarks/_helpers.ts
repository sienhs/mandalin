import type { Part } from '../partTypes'

/**
 * 랜드마크 config 작성용 헬퍼.
 *
 * 랜드마크는 부품마다 `st`(등장 단계 1~8)를 달아야 해서, 부품을 하나씩 적으면 단계가
 * 흩어져 읽히지 않는다. `at(단계, [...])` 로 **단계 블록 단위**로 묶어 작성한다.
 *
 * 좌표는 일반 건물과 같은 ref 단위이고, 한 변이 LANDMARK_REF(3.0) 를 넘지 않아야 한다
 * (넘으면 블록 경계를 넘어 길 위로 삐져나온다). `plinth` 는 폭을 1.14 배로 키워 그리므로
 * 랜드마크에서는 쓰지 않고 얇은 `box` 슬래브로 기단을 만든다.
 */

/** 부품 묶음에 등장 단계를 붙인다. */
export function at(st: number, parts: Part[]): Part[] {
  return parts.map((p) => ({ ...p, st }) as Part)
}

/** 계단식 기단. 위로 갈수록 inset 만큼 좁아지는 슬래브 n 단. */
export function podium(
  w: number, d: number, steps: number, stepH: number, y: number, color: string, inset = 0.16,
): Part[] {
  return Array.from({ length: steps }, (_, i) => ({
    k: 'box' as const,
    w: w - i * inset * 2,
    h: stepH,
    d: d - i * inset * 2,
    y: y + i * stepH,
    color,
    rough: 0.9,
  }))
}

/** 타원 둘레 count 곳에 부품을 만든다. make 는 (x, z, 각도, index). */
export function around(
  count: number, rx: number, rz: number,
  make: (x: number, z: number, angle: number, i: number) => Part | Part[],
): Part[] {
  const out: Part[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const made = make(Math.cos(a) * rx, Math.sin(a) * rz, a, i)
    if (Array.isArray(made)) out.push(...made)
    else out.push(made)
  }
  return out
}

/** 아치 아케이드 링 — 콜로세움·경기장 외주. 아치 면이 바깥을 보게 회전시킨다. */
export function archRing(
  count: number, rx: number, rz: number, y: number,
  w: number, h: number, thick: number, depth: number, color: string,
): Part[] {
  return around(count, rx, rz, (x, z, a) => ({
    k: 'arch',
    w, h, d: depth, thick,
    x, z, y,
    // around 의 각도는 (cos → x, sin → z) 기준이라 접선 방향이 -a 회전이다.
    rotY: -a,
    color,
  }))
}

/** x 부호를 반전한 사본을 덧붙인다(좌우 대칭 매스). x 를 쓰는 부품만 대상. */
export function mirrorX(parts: Part[]): Part[] {
  const flipped = parts
    .filter((p) => 'x' in p && typeof p.x === 'number' && p.x !== 0)
    .map((p) => ({ ...p, x: -(p as { x: number }).x }) as Part)
  return [...parts, ...flipped]
}

/** 굵은 열주 — columns 부품은 반지름이 0.022 로 고정돼 거대 매스에서는 실처럼 보인다. */
export function bigColumns(
  count: number, span: number, z: number, y: number, h: number, r: number, color: string,
): Part[] {
  // cyl 은 중심 고정이라 x 오프셋을 줄 수 없다 → 굵은 기둥은 box 로 세운다.
  return Array.from({ length: count }, (_, i) => ({
    k: 'box' as const,
    w: r * 2, h, d: r * 2,
    x: count === 1 ? 0 : (i / (count - 1) - 0.5) * span,
    z,
    y,
    color,
    rough: 0.85,
  }))
}
