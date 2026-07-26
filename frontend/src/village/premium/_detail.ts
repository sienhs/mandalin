import type { Part } from '../catalog'

/**
 * 프리미엄 건물 공용 디테일 헬퍼.
 * config parts 배열에 `...helper(...)`로 스프레드해 반복 디테일(필라스터/몰딩/코니스/계단/포치)을
 * 일관되게 대량 추가한다. box/panel만 x/z 오프셋 지원(roof/cyl은 중심 고정).
 */

/** 네 모서리 수직 필라스터(트림 스트립). */
export function pilasters(w: number, d: number, h: number, y: number, color: string, t = 0.03): Part[] {
  const x = w / 2, z = d / 2
  return [
    { k: 'box', w: t, h, d: t, x: -x, z: -z, y, color },
    { k: 'box', w: t, h, d: t, x: x, z: -z, y, color },
    { k: 'box', w: t, h, d: t, x: -x, z: z, y, color },
    { k: 'box', w: t, h, d: t, x: x, z: z, y, color },
  ]
}

/** 정면(+z)에 세로 리브(필라스터) 여러 개 균등 배치. */
export function ribs(w: number, d: number, h: number, y: number, count: number, color: string, t = 0.025): Part[] {
  const out: Part[] = []
  const span = w * 0.86
  for (let i = 0; i < count; i++) {
    const x = count === 1 ? 0 : (i / (count - 1) - 0.5) * span
    out.push({ k: 'box', w: t, h, d: t, x, z: d / 2 + 0.004, y, color })
  }
  return out
}

/** 지정 y들에 수평 스트링코스(층 몰딩) 띠. */
export function bands(w: number, d: number, ys: number[], color: string, th = 0.028): Part[] {
  return ys.map((y) => ({ k: 'box', w: w + 0.014, h: th, d: (d) + 0.014, y, color } as Part))
}

/** 상단 코니스(살짝 돌출한 얇고 넓은 판). */
export function cornice(w: number, d: number, y: number, color: string, over = 0.05, h = 0.05): Part {
  return { k: 'box', w: w + over, h, d: d + over, y, color }
}

/** +z 정면 계단(entrance stairs). */
export function steps(w: number, y: number, zFace: number, color: string, n = 3, rise = 0.028, run = 0.04): Part[] {
  const out: Part[] = []
  for (let i = 0; i < n; i++) {
    out.push({ k: 'box', w: w - i * 0.04, h: rise, d: 0.055, z: zFace + (n - i) * run, y: y + i * rise, color })
  }
  return out
}

/** 정면 포치: 열주 + 엔타블러처 보. */
export function portico(w: number, d: number, h: number, y: number, count: number, colColor: string, lintelColor: string): Part[] {
  return [
    { k: 'columns', w, d, y, h, count, color: colColor },
    { k: 'box', w: w * 0.94, h: 0.05, d: 0.07, z: d / 2 + 0.03, y: y + h + 0.03, color: lintelColor },
  ]
}

/** 옥상 난간 위 흉벽 merlon(정면 일렬). */
export function merlons(w: number, y: number, zFace: number, color: string, n = 5, mw = 0.05, mh = 0.07): Part[] {
  const out: Part[] = []
  const span = w * 0.86
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1) - 0.5) * span
    out.push({ k: 'box', w: mw, h: mh, d: 0.04, x, z: zFace, y, color })
  }
  return out
}

/** 좁아지는 box 스택(오프셋 첨탑/원뿔 근사). x,z 오프셋 지원. */
export function spire(x: number, z: number, y: number, baseW: number, steps_: number, stepH: number, color: string): Part[] {
  const out: Part[] = []
  for (let i = 0; i < steps_; i++) {
    const s = baseW * (1 - i / steps_)
    out.push({ k: 'box', w: s, h: stepH, d: s, x, z, y: y + i * stepH, color })
  }
  return out
}
