import { PALETTE } from '../palette'
import { BLOCK_CENTERS, BLOCK_SIZE, GAP, SPAN } from '../layout'
import { Crosswalks, LaneDashes, RoadStrips, intersections } from './common'

/**
 * 포장도로를 깐 도시.
 * 인도(콘크리트) 위에 아스팔트를 얹고 차선·횡단보도·연석·가로등·맨홀로 채운다.
 *
 * <p>차선·횡단보도는 {@link ./common} 으로 옮겼다 — 배경별 지형(서울·SF·사이버펑크)이
 * 색만 바꿔 같은 것을 쓴다. 간격과 크기가 두 곳에 적혀 있으면 한쪽만 고쳐진다.
 */

const ROAD_W = GAP * 0.74
const CURB_H = 0.06

/** 블록 둘레 연석 — 인도와 차도의 높이 차. */
function Curbs() {
  const t = 0.16
  const half = BLOCK_SIZE / 2 + t / 2
  const edges: { pos: [number, number, number]; w: number; d: number }[] = []
  for (const bx of BLOCK_CENTERS) {
    for (const bz of BLOCK_CENTERS) {
      edges.push({ pos: [bx, 0, bz + half], w: BLOCK_SIZE + t * 2, d: t })
      edges.push({ pos: [bx, 0, bz - half], w: BLOCK_SIZE + t * 2, d: t })
      edges.push({ pos: [bx + half, 0, bz], w: t, d: BLOCK_SIZE + t * 2 })
      edges.push({ pos: [bx - half, 0, bz], w: t, d: BLOCK_SIZE + t * 2 })
    }
  }
  return (
    <group>
      {edges.map((e, i) => (
        <mesh key={i} position={[e.pos[0], CURB_H / 2 - 0.05, e.pos[2]]} receiveShadow castShadow>
          <boxGeometry args={[e.w, CURB_H, e.d]} />
          <meshStandardMaterial color={PALETTE.concrete} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 0.12, 8]} />
        <meshStandardMaterial color={PALETTE.roofDark} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.1, 8]} />
        <meshStandardMaterial color={PALETTE.concrete} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.28, 2.12, 0]} castShadow>
        <boxGeometry args={[0.62, 0.07, 0.1]} />
        <meshStandardMaterial color={PALETTE.concrete} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.56, 2.03, 0]}>
        <boxGeometry args={[0.26, 0.1, 0.16]} />
        <meshStandardMaterial
          color={PALETTE.glassWarm}
          emissive={PALETTE.glassWarm}
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

/** 도로에 박힌 맨홀 뚜껑 — 아스팔트 단조로움을 깬다. */
function Manholes() {
  const spots = intersections().filter((_, i) => i % 3 === 0)
  return (
    <group>
      {spots.map(([x, z], i) => (
        <mesh key={i} position={[x + 0.6, 0.004, z - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.24, 12]} />
          <meshStandardMaterial color={PALETTE.roofDark} roughness={0.6} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function CityRoad() {
  return (
    <group>
      {/* 인도(대지 전체) */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial color={PALETTE.plaza} roughness={0.95} />
      </mesh>

      <Curbs />
      <RoadStrips y={-0.045} width={ROAD_W} color={PALETTE.road} roughness={0.95} />

      <group position={[0, -0.045, 0]}>
        <LaneDashes roadWidth={ROAD_W} color={PALETTE.roadPaint} />
        <Crosswalks roadWidth={ROAD_W} color={PALETTE.roadPaint} />
        <Manholes />
      </group>

      {intersections().map(([x, z], i) => (
        <StreetLight key={i} position={[x - ROAD_W / 2 - 0.4, 0, z - ROAD_W / 2 - 0.4]} />
      ))}
    </group>
  )
}
