import { Instances, Instance } from '@react-three/drei'
import { PALETTE } from '../palette'
import { ALL_ROAD_CENTERS, GAP, SPAN } from '../layout'
import { RoadStrips, ScatterProps, intersections, useRoadScatter } from './common'

/**
 * 거친 비포장 도로.
 * 마른 흙 위에 바퀴자국 두 줄을 파고, 자갈·마른 풀·나무 말뚝을 흩뿌린다.
 */

const ROAD_W = GAP * 0.86
const RUT_OFFSET = ROAD_W * 0.22
const RUT_W = 0.34

/** 길마다 바퀴자국 두 줄. 흙보다 살짝 어두워 파인 것처럼 보인다. */
function WheelRuts() {
  const color = PALETTE.soil.clone().lerp(PALETTE.path, 0.35)
  return (
    <group>
      {ALL_ROAD_CENTERS.flatMap((c) =>
        [-RUT_OFFSET, RUT_OFFSET].map((o) => (
          <mesh key={`v${c}${o}`} position={[c + o, -0.042, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[RUT_W, SPAN]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        )),
      )}
      {ALL_ROAD_CENTERS.flatMap((c) =>
        [-RUT_OFFSET, RUT_OFFSET].map((o) => (
          <mesh key={`h${c}${o}`} position={[0, -0.041, c + o]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[SPAN, RUT_W]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        )),
      )}
    </group>
  )
}

/** 길가 마른 풀 포기. */
function DryTufts() {
  const items = useRoadScatter({ count: 90, seed: 4211, margin: -0.25 })
  if (items.length === 0) return null
  return (
    <Instances limit={items.length} range={items.length} castShadow>
      <coneGeometry args={[0.12, 0.34, 4]} />
      <meshStandardMaterial color={PALETTE.blade} roughness={1} flatShading />
      {items.map((it, i) => (
        <Instance key={i} position={[it.pos[0], 0.11, it.pos[2]]} rotation={[0, it.rot, 0]} scale={it.r} />
      ))}
    </Instances>
  )
}

/** 교차로 모서리 나무 말뚝 — 옛 시골길 경계 표식. */
function Posts() {
  return (
    <group>
      {intersections().map(([x, z], i) => (
        <group key={i} position={[x - ROAD_W / 2 - 0.3, 0, z - ROAD_W / 2 - 0.3]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.7, 6]} />
            <meshStandardMaterial color={PALETTE.wood} roughness={1} flatShading />
          </mesh>
          {i % 2 === 0 && (
            <mesh position={[0, 0.62, 0.02]} rotation={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[0.42, 0.16, 0.03]} />
              <meshStandardMaterial color={PALETTE.blade} roughness={0.9} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

export function DirtRoad() {
  return (
    <group>
      {/* 마른 대지 */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={1} />
      </mesh>

      {/* 다져진 흙길 */}
      <RoadStrips y={-0.045} width={ROAD_W} color={PALETTE.path} />
      <WheelRuts />

      <ScatterProps count={220} seed={91} y={-0.04} color={PALETTE.concrete} size={0.09} margin={-0.3} />
      <ScatterProps count={80} seed={7} y={-0.04} color={PALETTE.bark} size={0.13} margin={-0.3} />
      <DryTufts />
      <Posts />
    </group>
  )
}
