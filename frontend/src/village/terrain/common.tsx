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
