import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import type { Color } from 'three'
import { ALL_ROAD_CENTERS, SPAN, isOnRoad, seeded } from '../layout'

/** 지형 렌더러 공용 조각 — 길 스트립과 길 위 소품 산포. */

export interface StripProps {
  y: number
  width: number
  color: Color | string
  roughness?: number
}

/**
 * `RoadStrips` 한 번이 점유하는 y 두께.
 *
 * <p>가로·세로 스트립은 교차점에서 겹치는데, 같은 높이에 두면 깊이 테스트가 승자를 정하지
 * 못해 카메라를 돌릴 때마다 깜빡인다(z-fighting). 그래서 가로만 이만큼 올린다.
 *
 * <p><b>그래서 `RoadStrips(y)` 는 y 한 겹이 아니라 `[y, y + STRIP_LIFT]` 두 겹을 쓴다.</b>
 * 층을 쌓을 때는 이 사실을 알아야 해서 상수로 내보낸다 — {@link roadLayerY} 를 쓰면 직접
 * 계산하지 않아도 된다.
 */
export const STRIP_LIFT = 0.002

/**
 * 길 스트립을 여러 겹 쌓을 때 각 층에 줄 y.
 *
 * <p>층을 손으로 적으면 `RoadStrips` 가 두 겹을 쓴다는 것을 모른 채 `STRIP_LIFT` 간격으로
 * 적게 되고, 그러면 <b>아래 층의 가로와 위 층의 세로가 정확히 같은 높이</b>에 놓여 깜빡인다.
 * 초원이 실제로 그랬다 — `-0.047` 과 `-0.045` 로 두 번 불러서 둘 다 `-0.045` 에 면을 놓았고,
 * 길 교차점 16곳에서 초록 띠가 깨져 보였다.
 *
 * @param base 가장 아래 층의 y. 지형 대지보다 최소 `STRIP_LIFT` 위여야 한다.
 * @param index 0 부터. 0 이 가장 아래 층.
 */
export function roadLayerY(base: number, index: number): number {
  return base + index * STRIP_LIFT * 2
}

/**
 * 가로·세로 길 스트립.
 *
 * <p>⚠️ 이 컴포넌트는 y 를 <b>두 겹</b> 쓴다 — `[y, y + STRIP_LIFT]`. 여러 겹을 쌓으려면
 * {@link roadLayerY} 로 y 를 뽑을 것. 겹 간격을 `STRIP_LIFT` 로 잡으면 층끼리 면이 겹친다.
 */
export function RoadStrips({ y, width, color, roughness = 1 }: StripProps) {
  return (
    <group>
      {ALL_ROAD_CENTERS.map((c) => (
        <mesh key={`v${c}`} position={[c, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, SPAN]} />
          <meshStandardMaterial color={color} roughness={roughness} />
        </mesh>
      ))}
      {ALL_ROAD_CENTERS.map((c) => (
        <mesh
          key={`h${c}`}
          position={[0, y + STRIP_LIFT, c]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[SPAN, width]} />
          <meshStandardMaterial color={color} roughness={roughness} />
        </mesh>
      ))}
    </group>
  )
}

/** 길이 교차하는 지점 (모서리 소품·횡단보도 배치용). */
export function intersections(): [number, number][] {
  return ALL_ROAD_CENTERS.flatMap((x) => ALL_ROAD_CENTERS.map((z) => [x, z] as [number, number]))
}

/**
 * 길을 따라 흐르는 선을 교차로에서 끊었을 때 남는 구간들.
 *
 * <p>가장자리 선을 길 끝까지 통으로 그으면 교차로에서 <b>다른 길의 한가운데를 가로지른다</b>.
 * 실제 도로가 자전거 도로·정지선을 교차로 앞에서 끊는 것과 같은 이유로, 교차 지점 좌우
 * `clearance` 만큼을 비운다.
 *
 * <p>가로·세로가 같은 좌표(`ALL_ROAD_CENTERS`)에서 만나므로 두 방향이 같은 구간을 쓴다.
 *
 * @param clearance 교차점 중심에서 비울 반경. 보통 길 반폭 + 여유.
 */
export function crossingSegments(clearance: number): [number, number][] {
  const half = SPAN / 2
  const out: [number, number][] = []
  let start = -half

  for (const c of [...ALL_ROAD_CENTERS].sort((a, b) => a - b)) {
    const a = c - clearance
    const b = c + clearance
    if (a > start) out.push([start, Math.min(a, half)])
    start = Math.max(start, b)
  }
  if (start < half) out.push([start, half])

  /*
    짧은 토막은 버린다. 바깥 순환로(±16.2)와 대지 끝(±17.6) 사이에 0.09 짜리 부스러기가
    양쪽에 하나씩 생기는데, 선이 아니라 점으로 보이면서 인스턴스만 차지한다.
  */
  return out.filter(([a, b]) => b - a > 0.25)
}

/**
 * 길 방향으로 흐르는 선 — <b>지형 선 그리기의 엔진</b>.
 *
 * <p>가장자리 선·중앙선·바퀴자국·레일이 전부 이것 하나다. 다른 것은 <b>중심선에서 얼마나
 * 비켜 있는가</b>(`offsets`)와 폭뿐이다. 각각 따로 쓰면 교차로에서 끊는 규칙이나 가로·세로
 * z-fighting 처리 같은 것을 그 수만큼 다시 맞춰야 한다.
 *
 * <p><b>인스턴싱한다.</b> 끊는 구간까지 생기면 면이 금세 수십 장이 되는데(오프셋 2 × 길 4줄
 * × 구간 5 × 두 방향 = 80), 그대로 두면 선 한 종류가 draw call 80 개다. 하나로 묶으면 1 개다.
 *
 * @param offsets 길 중심선에서 좌우로 밀 거리. `[0]` 이면 한가운데 한 줄(중앙선),
 *   `[-a, a]` 면 두 줄(가장자리·바퀴자국·레일).
 * @param breakAt 0 보다 크면 교차로에서 이만큼 비우고 끊는다.
 */
export function LineStrips({
  y,
  width,
  color,
  offsets,
  roughness = 0.9,
  emissive = 0,
  breakAt = 0,
}: {
  y: number
  width: number
  color: Color | string
  offsets: number[]
  roughness?: number
  emissive?: number
  breakAt?: number
}) {
  const items = useMemo(() => {
    const segments: [number, number][] =
      breakAt > 0 ? crossingSegments(breakAt) : [[-SPAN / 2, SPAN / 2]]

    const out: { pos: [number, number, number]; scale: [number, number, number] }[] = []
    for (const c of ALL_ROAD_CENTERS) {
      for (const o of offsets) {
        for (const [a, b] of segments) {
          const mid = (a + b) / 2
          const len = b - a
          // 세로 길: 폭이 x, 길이가 z.
          out.push({ pos: [c + o, y, mid], scale: [width, len, 1] })
          // 가로 길: 뒤집힌다. 교차점에서 세로와 겹치므로 한 겹 띄운다.
          out.push({ pos: [mid, y + STRIP_LIFT, c + o], scale: [len, width, 1] })
        }
      }
    }
    return out
  }, [y, width, offsets, breakAt])

  if (items.length === 0) return null
  return (
    <Instances limit={items.length} range={items.length}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive > 0 ? color : '#000000'}
        emissiveIntensity={emissive}
        roughness={roughness}
      />
      {items.map((it, i) => (
        <Instance key={i} position={it.pos} rotation={[-Math.PI / 2, 0, 0]} scale={it.scale} />
      ))}
    </Instances>
  )
}

/**
 * 막대를 흐트러뜨리는 값 — <b>자연물과 인공물을 가르는 유일한 차이</b>.
 *
 * <p>같은 간격의 곧은 막대는 <b>사람이 만든 이음매</b>다(놋쇠판 경계·데크 패널). 모래 결이나
 * 마른 갈라짐처럼 자연히 생긴 무늬에 그 규칙성을 쓰면 길이 토막 난 것처럼 보인다 —
 * 무늬가 아니라 칸막이로 읽힌다. 그래서 자연물은 반드시 이 값을 준다.
 *
 * <p>난수는 씨앗 고정({@link seeded})이라 매 렌더 같은 모양이 나온다. 흔들리면 안 되는 것은
 * 흔들지 않는다.
 */
export interface CrossBarJitter {
  seed: number
  /**
   * 한 줄을 몇 토막으로 끊을지. <b>2 이상이 자연스러움의 핵심이다</b> — 길을 가로질러
   * 끝에서 끝까지 이어진 선은 그 자체로 인공물이라, 아무리 흔들어도 칸막이로 보인다.
   */
  pieces?: number
  /** 길 방향으로 흔들 폭 — 간격에 대한 비율(0~1). */
  along?: number
  /** 좌우로 흔들 폭 — 토막 길이에 대한 비율(0~1). */
  across?: number
  /** 길이를 이 비율만큼 랜덤하게 줄인다(0~1). */
  length?: number
  /** 기울임 최대치(라디안). */
  tilt?: number
}

/**
 * 길을 가로지르는 짧은 막대들 — 포장 이음매·침목·모래 결.
 *
 * <p>{@link LineStrips} 와 짝이다. 그쪽이 길을 <b>따라</b> 흐르는 선이면 이쪽은 길을
 * <b>건너</b>지르는 선이고, 둘을 조합하면 철길(레일 두 줄 + 침목)이나 판 이음매(가로 줄만)가
 * 된다. 역시 인스턴싱한다 — 간격 0.55 면 길 하나에 64 개가 들어간다.
 *
 * @param lengthScale 길 폭에 대한 막대 길이 비율.
 * @param jitter 주면 토막이 끊기고 흔들린다. 자연 무늬에는 반드시 준다({@link CrossBarJitter}).
 */
export function CrossBars({
  roadWidth,
  y,
  color,
  spacing,
  width,
  lengthScale = 0.72,
  roughness = 0.9,
  jitter,
}: {
  roadWidth: number
  y: number
  color: Color | string
  spacing: number
  width: number
  lengthScale?: number
  roughness?: number
  jitter?: CrossBarJitter
}) {
  const items = useMemo(() => {
    const rowLen = roadWidth * lengthScale
    const half = SPAN / 2
    const out: {
      pos: [number, number, number]
      scale: [number, number, number]
      rot: number
    }[] = []

    const pieces = jitter?.pieces ?? 1
    const rand = jitter ? seeded(jitter.seed) : () => 0.5
    const seg = rowLen / pieces

    for (const c of ALL_ROAD_CENTERS) {
      for (let t = -half + spacing / 2; t < half; t += spacing) {
        for (let k = 0; k < pieces; k++) {
          const len = seg * (1 - (jitter?.length ?? 0) * rand())
          /*
            토막은 <b>제 몫의 칸 안에서만</b> 흔들린다. 칸 폭이 `seg` 이고 토막이 `len` 이니
            남는 여유는 좌우로 `(seg - len) / 2` 씩이다. 이보다 크게 흔들면 결이 길가 잔디
            위로 삐져나가는데, 결은 길 위 무늬라 그 순간 무늬가 아니라 이물질로 보인다.
            이 값이면 가장 바깥 토막의 끝이 정확히 `rowLen / 2` 에서 멈춘다.
          */
          const room = (seg - len) / 2
          const across =
            -rowLen / 2 + seg * (k + 0.5) + (rand() - 0.5) * 2 * room * (jitter?.across ?? 0)
          const along = t + (rand() - 0.5) * spacing * (jitter?.along ?? 0)
          const rot = (rand() - 0.5) * 2 * (jitter?.tilt ?? 0)

          out.push({ pos: [c + across, y, along], scale: [len, width, 1], rot })
          out.push({ pos: [along, y + STRIP_LIFT, c + across], scale: [width, len, 1], rot })
        }
      }
    }
    return out
  }, [roadWidth, y, spacing, width, lengthScale, jitter])

  if (items.length === 0) return null
  return (
    <Instances limit={items.length} range={items.length}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={roughness} />
      {items.map((it, i) => (
        <Instance
          key={i}
          position={it.pos}
          /*
            Euler 'XYZ' 는 z → y → x 순으로 적용되므로, 여기 z 는 판이 눕기 <b>전에</b>
            제 평면 안에서 도는 각이다. 즉 지면 위에서의 회전이다(횡단보도가 쓰는 것과 같은 수법).
          */
          rotation={[-Math.PI / 2, 0, it.rot]}
          scale={it.scale}
        />
      ))}
    </Instances>
  )
}

/**
 * 길 가장자리를 따라 흐르는 좁은 띠 두 줄. 자전거 도로·발광 라인.
 *
 * <p>{@link LineStrips} 에 "길 안쪽 가장자리" 라는 오프셋 계산만 얹은 것이다.
 */
export function EdgeLines({
  roadWidth,
  color,
  y,
  width = 0.09,
  inset = 0.12,
  emissive = 0,
  breakAt = 0,
}: {
  roadWidth: number
  color: Color | string
  y: number
  width?: number
  inset?: number
  emissive?: number
  breakAt?: number
}) {
  const off = roadWidth / 2 - inset - width / 2
  return (
    <LineStrips
      y={y}
      width={width}
      color={color}
      offsets={[-off, off]}
      emissive={emissive}
      roughness={0.6}
      breakAt={breakAt}
    />
  )
}

/**
 * 길 중앙 점선. 교차로 근처는 비워야 실제 도로처럼 보인다.
 *
 * <p>도시 지형과 배경별 지형(서울·SF·사이버펑크)이 함께 쓴다. 색만 다르고 간격·크기는 같다.
 */
export function LaneDashes({
  roadWidth,
  color,
  y = 0.005,
  emissive = 0,
}: {
  roadWidth: number
  color: Color | string
  y?: number
  emissive?: number
}) {
  const dashes: { pos: [number, number]; horizontal: boolean }[] = []
  const step = 1.6
  for (const c of ALL_ROAD_CENTERS) {
    for (let t = -SPAN / 2 + step; t < SPAN / 2; t += step) {
      if (ALL_ROAD_CENTERS.some((o) => Math.abs(t - o) < roadWidth / 2 + 0.7)) continue
      dashes.push({ pos: [c, t], horizontal: false })
      dashes.push({ pos: [t, c], horizontal: true })
    }
  }

  return (
    <Instances limit={dashes.length} range={dashes.length}>
      <planeGeometry args={[0.09, 0.8]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive > 0 ? color : '#000000'}
        emissiveIntensity={emissive}
        roughness={0.8}
      />
      {dashes.map((d, i) => (
        <Instance
          key={i}
          position={[d.pos[0], y, d.pos[1]]}
          rotation={[-Math.PI / 2, 0, d.horizontal ? Math.PI / 2 : 0]}
        />
      ))}
    </Instances>
  )
}

/** 교차로 네 방향 횡단보도. */
export function Crosswalks({
  roadWidth,
  color,
  y = 0.006,
}: {
  roadWidth: number
  color: Color | string
  y?: number
}) {
  const bars: { pos: [number, number]; rot: number }[] = []
  const stripes = 5
  const offset = roadWidth / 2 + 0.55
  for (const [cx, cz] of intersections()) {
    for (let i = 0; i < stripes; i++) {
      const t = (i / (stripes - 1) - 0.5) * roadWidth * 0.78
      bars.push({ pos: [cx + t, cz + offset], rot: 0 })
      bars.push({ pos: [cx + t, cz - offset], rot: 0 })
      bars.push({ pos: [cx + offset, cz + t], rot: Math.PI / 2 })
      bars.push({ pos: [cx - offset, cz + t], rot: Math.PI / 2 })
    }
  }

  return (
    <Instances limit={bars.length} range={bars.length}>
      <planeGeometry args={[0.14, 0.8]} />
      <meshStandardMaterial color={color} roughness={0.85} />
      {bars.map((b, i) => (
        <Instance key={i} position={[b.pos[0], y, b.pos[1]]} rotation={[-Math.PI / 2, 0, b.rot]} />
      ))}
    </Instances>
  )
}

/** 길마다 바퀴자국 두 줄. 길보다 살짝 어두워 파인 것처럼 보인다. */
export function WheelRuts({
  roadWidth,
  color,
  y = -0.042,
  width = 0.34,
}: {
  roadWidth: number
  color: Color | string
  y?: number
  width?: number
}) {
  const off = roadWidth * 0.22
  // 자국은 교차로에서도 이어진다 — 수레가 지나간 자리라 끊길 이유가 없다.
  return (
    <LineStrips y={y} width={width} color={color} offsets={[-off, off]} roughness={1} />
  )
}

export interface ScatterOptions {
  /** 뿌릴 개수(최대). 블록 위에 걸린 것은 버려지므로 실제 개수는 이보다 적다. */
  count: number
  seed: number
  /** 블록 경계에서 이만큼 떨어져야 통과. 음수면 블록에 살짝 걸치는 것도 허용. */
  margin?: number
  spread?: number
}

/** 길 위에만 놓이는 결정적 좌표 목록. */
export function useRoadScatter({ count, seed, margin = 0.2, spread = SPAN }: ScatterOptions) {
  return useMemo(() => {
    const rand = seeded(seed)
    const out: { pos: [number, number, number]; r: number; rot: number }[] = []
    // 블록 위에 떨어진 좌표는 버리므로 넉넉히 굴린다.
    for (let i = 0; i < count * 3 && out.length < count; i++) {
      const x = (rand() - 0.5) * spread
      const z = (rand() - 0.5) * spread
      if (!isOnRoad(x, z, margin)) continue
      out.push({ pos: [x, 0, z], r: 0.4 + rand() * 0.8, rot: rand() * Math.PI * 2 })
    }
    return out
  }, [count, seed, margin, spread])
}

interface ScatterMeshProps extends ScatterOptions {
  y: number
  color: Color | string
  size: number
  /** true 면 납작한 원반(자갈·수련잎), false 면 덩어리. */
  flat?: boolean
}

/** 인스턴싱 소품 산포 — 수백 개도 드로우콜 1회. */
export function ScatterProps({ y, color, size, flat = false, ...opts }: ScatterMeshProps) {
  const items = useRoadScatter(opts)
  if (items.length === 0) return null
  return (
    <Instances limit={items.length} range={items.length} castShadow>
      {flat ? <cylinderGeometry args={[size, size, size * 0.25, 6]} /> : <icosahedronGeometry args={[size, 0]} />}
      <meshStandardMaterial color={color} roughness={0.95} flatShading />
      {items.map((it, i) => (
        <Instance
          key={i}
          position={[it.pos[0], y + size * 0.3, it.pos[2]]}
          rotation={[0, it.rot, 0]}
          scale={it.r}
        />
      ))}
    </Instances>
  )
}
