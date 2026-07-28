import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { PALETTE } from '../palette'
import { BLOCK_CENTERS, BLOCK_SIZE, GAP, ROAD_CENTERS, SPAN, seeded } from '../layout'

/**
 * 물 길.
 * 블록마다 물 위에 뜬 섬을 만들고 섬 사이를 목재 다리로 잇는다.
 * 다른 지형과 달리 블록 바깥이 전부 수면이라 "길"이 아니라 "수로"다.
 */

const WATER_Y = -0.34
const ISLAND_H = 0.36
const BRIDGE_W = 1.5

/** 섬: 흙 상판 + 물에 잠긴 듯 조금 더 넓은 아래턱. */
function Islands() {
  return (
    <group>
      {BLOCK_CENTERS.flatMap((x) =>
        BLOCK_CENTERS.map((z) => (
          <group key={`${x}_${z}`} position={[x, 0, z]}>
            <mesh position={[0, -ISLAND_H / 2 - 0.02, 0]} receiveShadow castShadow>
              <boxGeometry args={[BLOCK_SIZE, ISLAND_H, BLOCK_SIZE]} />
              <meshStandardMaterial color={PALETTE.soil} roughness={1} flatShading />
            </mesh>
            <mesh position={[0, -ISLAND_H - 0.06, 0]} receiveShadow>
              <boxGeometry args={[BLOCK_SIZE + 0.5, 0.12, BLOCK_SIZE + 0.5]} />
              <meshStandardMaterial color={PALETTE.bark} roughness={1} flatShading />
            </mesh>
          </group>
        )),
      )}
    </group>
  )
}

/** 목재 다리: 상판 + 난간 + 물에 박힌 기둥. */
function Bridge({ position, horizontal }: { position: [number, number, number]; horizontal: boolean }) {
  const len = GAP + 0.8
  const railOffset = BRIDGE_W / 2 - 0.06

  return (
    <group position={position} rotation={[0, horizontal ? 0 : Math.PI / 2, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[len, 0.1, BRIDGE_W]} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.95} flatShading />
      </mesh>

      {[-railOffset, railOffset].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.24, z]} castShadow>
            <boxGeometry args={[len, 0.06, 0.06]} />
            <meshStandardMaterial color={PALETTE.bark} roughness={0.95} />
          </mesh>
          {[-len / 2 + 0.15, 0, len / 2 - 0.15].map((x) => (
            <mesh key={x} position={[x, 0.1, z]} castShadow>
              <boxGeometry args={[0.07, 0.34, 0.07]} />
              <meshStandardMaterial color={PALETTE.bark} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 기둥은 섬에 파묻히지 않게 물 위 구간(중심에서 ±GAP/2 안쪽)에 세운다 */}
      {[-GAP / 2 + 0.25, GAP / 2 - 0.25].map((x) => (
        <mesh key={x} position={[x, WATER_Y / 2 - 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, Math.abs(WATER_Y) + 0.2, 6]} />
          <meshStandardMaterial color={PALETTE.bark} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** 수련잎 — 수면이 비어 보이지 않게. */
function LilyPads() {
  const items = useMemo(() => {
    const rand = seeded(8821)
    const out: { pos: [number, number, number]; s: number; rot: number }[] = []
    for (let i = 0; i < 200 && out.length < 70; i++) {
      const x = (rand() - 0.5) * SPAN
      const z = (rand() - 0.5) * SPAN
      const onIsland =
        BLOCK_CENTERS.some((c) => Math.abs(x - c) < BLOCK_SIZE / 2 + 0.5) &&
        BLOCK_CENTERS.some((c) => Math.abs(z - c) < BLOCK_SIZE / 2 + 0.5)
      if (onIsland) continue
      out.push({ pos: [x, 0, z], s: 0.5 + rand() * 0.7, rot: rand() * Math.PI * 2 })
    }
    return out
  }, [])

  if (items.length === 0) return null
  return (
    <Instances limit={items.length} range={items.length}>
      <cylinderGeometry args={[0.26, 0.26, 0.02, 7]} />
      <meshStandardMaterial color={PALETTE.bush} roughness={0.9} flatShading />
      {items.map((it, i) => (
        <Instance key={i} position={[it.pos[0], WATER_Y + 0.02, it.pos[2]]} rotation={[0, it.rot, 0]} scale={it.s} />
      ))}
    </Instances>
  )
}

/** 잔물결 — 수면 위 얇은 링을 천천히 키웠다 사라지게. */
function Ripples() {
  const ref = useRef<Group>(null)
  const spots = useMemo(() => {
    const rand = seeded(1204)
    return Array.from({ length: 7 }, () => ({
      x: (rand() - 0.5) * SPAN * 0.9,
      z: (rand() - 0.5) * SPAN * 0.9,
      phase: rand(),
    }))
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.children.forEach((child, i) => {
      const p = (t * 0.25 + spots[i].phase) % 1
      child.scale.setScalar(0.4 + p * 2.4)
      const material = (child as Mesh).material as MeshBasicMaterial
      material.opacity = 0.34 * (1 - p)
    })
  })

  return (
    <group ref={ref}>
      {spots.map((s, i) => (
        <mesh key={i} position={[s.x, WATER_Y + 0.01, s.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.62, 24]} />
          <meshBasicMaterial color={PALETTE.roadPaint} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function WaterWay() {
  return (
    <group>
      {/* 수면 */}
      <mesh position={[0, WATER_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial color={PALETTE.water} roughness={0.18} metalness={0.35} />
      </mesh>
      {/* 수심 표현용 어두운 바닥 */}
      <mesh position={[0, WATER_Y - 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial color={PALETTE.water.clone().multiplyScalar(0.4)} roughness={1} />
      </mesh>

      <Islands />

      {/* 같은 행의 이웃 섬을 잇는 가로 다리 */}
      {ROAD_CENTERS.flatMap((x) =>
        BLOCK_CENTERS.map((z) => <Bridge key={`h${x}_${z}`} position={[x, 0, z]} horizontal />),
      )}
      {/* 세로 다리 */}
      {BLOCK_CENTERS.flatMap((x) =>
        ROAD_CENTERS.map((z) => <Bridge key={`v${x}_${z}`} position={[x, 0, z]} horizontal={false} />),
      )}

      <LilyPads />
      <Ripples />
    </group>
  )
}
