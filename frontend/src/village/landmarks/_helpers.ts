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

/**
 * 타원 둘레 count 곳에 부품을 만든다. make 는 (x, z, 각도, index).
 *
 * `phase`(라디안)는 링 전체를 돌려서 **다른 링과 자리가 겹치지 않게** 한다 — 기둥 16개와
 * 파사드 24장은 45° 마다 같은 자리에 오고, 그러면 패널이 기둥 속으로 들어가 8장이 사라진다.
 */
export function around(
  count: number, rx: number, rz: number,
  make: (x: number, z: number, angle: number, i: number) => Part | Part[],
  phase = 0,
): Part[] {
  const out: Part[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + phase
    const made = make(Math.cos(a) * rx, Math.sin(a) * rz, a, i)
    if (Array.isArray(made)) out.push(...made)
    else out.push(made)
  }
  return out
}

/**
 * 정n각형의 **면 위**에 부품을 붙인다.
 *
 * `around` 로 원주에 돌리면 다각형에서는 어긋난다 — 변 앞에서는 공중에 뜨고 꼭짓점 쪽에서는
 * 벽 속에 박힌다. 오각 국방청사의 창 35장이 그랬다(변까지 1.15, 꼭짓점까지 1.46 인데 전부
 * 반경 1.34 에 놓여 있었다).
 *
 * `polyPrism` 렌더러가 반 세그먼트를 미리 돌려 **면 하나가 +z 를 보게** 맞추므로
 * (`PolyPrismPart` 의 `align`), 면 f 의 중심 방향은 정확히 `f · 2π/n` 이다.
 * 면마다 `perFace` 개를 접선 방향으로 `spread` 폭에 걸쳐 벌려 놓고, 면의 법선 방향을
 * `rotY` 로 넘겨 준다 — `panel` 은 그 값을 안 주면 전부 +z 만 본다.
 *
 * `apothem` 은 중심에서 면까지의 거리(= r·cos(π/n))보다 조금 크게 줘야 벽에 묻히지 않는다.
 */
export function onFaces(
  sides: number, apothem: number, y: number, perFace: number, spread: number,
  make: (pos: [number, number, number], rotY: number, i: number) => Part,
): Part[] {
  const out: Part[] = []
  for (let f = 0; f < sides; f++) {
    const th = (f / sides) * Math.PI * 2
    const nx = Math.sin(th), nz = Math.cos(th)
    for (let k = 0; k < perFace; k++) {
      const t = perFace === 1 ? 0 : (k / (perFace - 1) - 0.5) * spread
      out.push(make([apothem * nx + Math.cos(th) * t, y, apothem * nz - Math.sin(th) * t], th, f * perFace + k))
    }
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
    /*
      `arch` 는 **기둥이 x 로 벌어지고 개구부가 ±z 를 보는** 부품이다(`ArchPart`).
      `around` 의 위치는 (cos a → x, sin a → z) 이므로 바깥 법선이 (cos a, sin a) 이고,
      panel·arch 의 +z 를 그 방향으로 돌리는 각은 **π/2 − a** 다.
      예전 `-a` 는 90° 틀려서 기둥이 벽 두께 방향(반경)으로 벌어졌다 — 아케이드가 뚫린
      아치가 아니라 벽에 눌린 사각 자국으로 보였다.
    */
    rotY: Math.PI / 2 - a,
    color,
  }))
}

/**
 * `mirrorX` 가 아무것도 못 뒤집은 호출의 기록.
 *
 * **console.warn 이 아니라 배열인 이유:** config 는 모듈이 적재되는 순간 만들어지고, 정적
 * import 는 검사 스크립트의 본문보다 먼저 실행된다. 그래서 스크립트가 console 을 가로채려
 * 하면 이미 늦어 있다(`check-landmarks.mjs` 가 `export-catalog.mjs` 를 통해 config 를 먼저
 * 끌어온다). 남겨 둔 배열은 언제 읽어도 남아 있다.
 */
export const MIRROR_NOOPS: string[] = []

/**
 * x 부호를 반전한 사본을 덧붙인다(좌우 대칭 매스).
 *
 * **좌표가 `x` 인 부품과 `pos` 인 부품을 모두 다룬다.** 예전에는 `x` 만 봤는데, `panel` ·
 * `shell` · `floodlight` · `parasol` 은 좌표를 `pos` 에 담아서 조용히 걸러졌다 — 개선문 광장의
 * 측면 부조가 오른쪽에만 붙어 있었고(`civic.ts` 7단계) 예외도 경고도 없었다.
 *
 * 회전(`rotY`·`rot`)도 같이 뒤집는다. 안 뒤집으면 거울상이 아니라 **같은 방향으로 돌아간
 * 사본**이 나와서, 아치나 쉘처럼 앞뒤가 있는 부품이 한쪽만 이상하게 보인다.
 *
 * 뒤집을 것이 하나도 없으면 경고한다. `mirrorX` 를 부른 것 자체가 "짝을 만들어 달라"는
 * 뜻이라, 결과가 입력과 같다면 부르는 쪽이 좌표를 안 준 것이다 —
 * `npm run check:landmarks` 가 이 경고를 실패로 잡는다.
 */
export function mirrorX(parts: Part[]): Part[] {
  const flipped: Part[] = []

  for (const p of parts) {
    // 회전이 있으면 같이 반전한다. 없는 부품에 키를 새로 만들지 않도록 조건부로 넣는다.
    const spin: Record<string, number> = {}
    if ('rotY' in p && typeof p.rotY === 'number' && p.rotY !== 0) spin.rotY = -p.rotY
    if ('rot' in p && typeof p.rot === 'number' && p.rot !== 0) spin.rot = -p.rot

    if ('x' in p && typeof p.x === 'number' && p.x !== 0) {
      flipped.push({ ...p, ...spin, x: -p.x } as Part)
      continue
    }
    if ('pos' in p && Array.isArray(p.pos) && p.pos[0] !== 0) {
      flipped.push({ ...p, ...spin, pos: [-p.pos[0], p.pos[1], p.pos[2]] } as Part)
    }
  }

  if (flipped.length === 0) {
    const message =
      `mirrorX 가 아무것도 못 뒤집었다 — x 도 pos[0] 도 없거나 0 이다: ` +
      parts.map((p) => p.k).join(', ')
    MIRROR_NOOPS.push(message)
    // 브라우저에서 만졌을 때도 바로 보이게 같이 남긴다. 검사의 근거는 위 배열이다.
    console.warn(`[landmarks] ${message}`)
  }

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
