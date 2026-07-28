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
 * 가로·세로 길 스트립.
 * 교차점은 두 겹으로 겹치는데 같은 색이라 티가 안 나고, 세로줄을 아주 살짝 위에 둬서
 * 같은 높이 두 면이 깜빡이는(z-fighting) 것만 막는다.
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
        <mesh key={`h${c}`} position={[0, y + 0.002, c]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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
