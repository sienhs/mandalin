import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { BLOCK_CENTERS, BLOCK_SIZE, GAP, ROAD_CENTERS, SPAN, seeded } from '../layout'
import { RoadStrips, STRIP_LIFT, intersections, roadLayerY } from './common'
import { RoadDecals } from './decals'
import type { MarkerKind, PavedSkin, TerrainSkin, WaterSkin } from './skins'

/**
 * {@link ./skins} 의 설정 하나를 실제 지형으로 그린다.
 *
 * <p>기존 지형 4종은 각자 하나씩 손으로 쓴 컴포넌트지만, 배경별 10종은 <b>같은 뼈대에
 * 색과 소품만 다른</b> 것들이라 설정표 하나로 묶었다. 열 개를 손으로 쓰면 z-fighting 을
 * 피하는 층 규칙(`roadLayerY`)이나 산포 시드 같은 것을 열 번 다시 맞춰야 한다.
 */

/* ─────────────────────────  교차로 소품  ───────────────────────── */

/** 석등 — 벚꽃. 받침·기둥·불집·삿갓. */
function Lantern() {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.16, 6]} />
        <meshStandardMaterial color="#b8b0a2" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.55, 6]} />
        <meshStandardMaterial color="#c6bfb1" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[0.34, 0.3, 0.34]} />
        <meshStandardMaterial
          color="#e8e0cd"
          emissive="#f2d9a8"
          emissiveIntensity={0.35}
          roughness={0.8}
        />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <coneGeometry args={[0.34, 0.2, 4]} />
        <meshStandardMaterial color="#a89f90" roughness={1} flatShading />
      </mesh>
    </group>
  )
}

/** 오벨리스크 — 이집트. 사암 기단 위 가늘어지는 각기둥. */
function Obelisk() {
  return (
    <group>
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.18, 0.44]} />
        <meshStandardMaterial color="#bf9e67" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.17, 1.2, 4]} />
        <meshStandardMaterial color="#d3b077" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 1.48, 0]} castShadow>
        <coneGeometry args={[0.14, 0.22, 4]} />
        <meshStandardMaterial color="#e3c58c" roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

/** 가로등 — 서울. 도시 지형과 같은 형태다. */
function Lamp() {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 0.12, 8]} />
        <meshStandardMaterial color="#2a2c31" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.1, 8]} />
        <meshStandardMaterial color="#8d939c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.28, 2.12, 0]} castShadow>
        <boxGeometry args={[0.62, 0.07, 0.1]} />
        <meshStandardMaterial color="#8d939c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.56, 2.03, 0]}>
        <boxGeometry args={[0.26, 0.1, 0.16]} />
        <meshStandardMaterial
          color="#e6f0f6"
          emissive="#e6f0f6"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

/** 야자 — 열대. 살짝 기운 줄기에 잎 다섯 장. */
function Palm() {
  const fronds = [0, 1, 2, 3, 4]
  return (
    <group rotation={[0, 0, 0.09]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.15, 2.3, 6]} />
        <meshStandardMaterial color="#7a6142" roughness={1} flatShading />
      </mesh>
      {fronds.map((i) => {
        const a = (i / fronds.length) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.45, 2.32, Math.sin(a) * 0.45]}
            rotation={[Math.sin(a) * 0.8, -a, -Math.cos(a) * 0.8 + Math.PI / 2]}
            castShadow
          >
            <coneGeometry args={[0.2, 1.05, 4]} />
            <meshStandardMaterial color="#3f7a3a" roughness={0.9} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}

/** 톱니바퀴 — 스팀펑크. 서 있는 원반에 이빨 여덟 개. */
function Gear() {
  const teeth = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)
  return (
    <group position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.11, 14]} />
        <meshStandardMaterial color="#a8804a" metalness={0.6} roughness={0.45} flatShading />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.14, 10]} />
        <meshStandardMaterial color="#6b4f2c" metalness={0.5} roughness={0.6} />
      </mesh>
      {teeth.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.56, 0, Math.sin(a) * 0.56]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.17, 0.1, 0.14]} />
          <meshStandardMaterial color="#c69a58" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/** 나무 말뚝 — 서부. 가로대를 댄 옛 경계 표식. */
function Post() {
  return (
    <group>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.9, 6]} />
        <meshStandardMaterial color="#6b4a30" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.7, 0.02]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.13, 0.04]} />
        <meshStandardMaterial color="#8a6a48" roughness={1} />
      </mesh>
    </group>
  )
}

/** 발광 기둥 — SF. 가는 강철 기둥 가운데 청록 띠. */
function Pylon() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.1, 8]} />
        <meshStandardMaterial color="#3a4252" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.8, 8]} />
        <meshStandardMaterial color="#79839a" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.4, 8]} />
        <meshStandardMaterial
          color="#4fd8e8"
          emissive="#4fd8e8"
          emissiveIntensity={1.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

/** 네온 간판 — 사이버펑크. 검은 기둥에 세로 마젠타 막대. */
function Neon() {
  return (
    <group>
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.0, 6]} />
        <meshStandardMaterial color="#14111f" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0.13, 1.6, 0]}>
        <boxGeometry args={[0.07, 1.0, 0.07]} />
        <meshStandardMaterial
          color="#ff3fa4"
          emissive="#ff3fa4"
          emissiveIntensity={1.9}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[-0.11, 1.15, 0]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial
          color="#39e6ff"
          emissive="#39e6ff"
          emissiveIntensity={1.6}
          roughness={0.25}
        />
      </mesh>
    </group>
  )
}

const MARKER: Record<Exclude<MarkerKind, 'none'>, () => React.ReactElement> = {
  lantern: Lantern,
  obelisk: Obelisk,
  lamp: Lamp,
  palm: Palm,
  gear: Gear,
  post: Post,
  pylon: Pylon,
  neon: Neon,
}

/**
 * 교차로 열여섯 곳의 같은 모서리에 소품을 하나씩.
 *
 * <p>길 폭의 절반 + 여유만큼 비켜 세운다 — 교차점 한가운데에 두면 길 위에 물건이 서 있는
 * 꼴이 되고, 카메라를 돌릴 때 블록을 가린다.
 */
function Markers({
  kind,
  roadWidth,
  every = 1,
}: {
  kind: MarkerKind
  roadWidth: number
  every?: number
}) {
  if (kind === 'none') return null
  const Shape = MARKER[kind]
  // 기존 지형(가로등·말뚝)이 쓰던 것과 같은 여유. 블록 모서리에 걸치듯 선다.
  const off = roadWidth / 2 + 0.4

  return (
    <group>
      {intersections()
        .filter((_, i) => i % every === 0)
        .map(([x, z], i) => (
          <group key={i} position={[x - off, 0, z - off]}>
            <Shape />
          </group>
        ))}
    </group>
  )
}

/* ─────────────────────────  포장·흙 지형  ───────────────────────── */

/**
 * 길 스택의 바닥 y. 대지는 이보다 `STRIP_LIFT` 아래에 둔다 —
 * 같은 높이면 대지와 첫 겹이 z-fighting 한다.
 */
const ROAD_BASE = -0.05
const GROUND_Y = ROAD_BASE - STRIP_LIFT

function Paved({ skin }: { skin: PavedSkin }) {
  const roadWidth = GAP * skin.roadRatio
  /** 마지막 길 겹의 y. 그 위에 얹는 선·자국·소품이 기준으로 삼는다. */
  const topY = roadLayerY(ROAD_BASE, skin.road.length - 1) + STRIP_LIFT

  return (
    <group>
      <mesh position={[0, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial color={skin.ground} roughness={1} />
      </mesh>

      {skin.road.map((layer, i) => (
        <RoadStrips
          key={i}
          y={roadLayerY(ROAD_BASE, i)}
          width={roadWidth * layer.widthScale}
          color={layer.color}
          roughness={layer.roughness ?? 1}
        />
      ))}

      {/*
        길 위에 얹는 층들. 높이는 `RoadDecals` 가 목록 순서대로 나눠 준다 — 여기서 층
        번호를 세지 않는다는 것이 요점이다.
      */}
      {skin.decals && (
        <RoadDecals items={skin.decals} roadWidth={roadWidth} base={topY} />
      )}

      <Markers kind={skin.marker} roadWidth={roadWidth} every={skin.markerEvery} />
    </group>
  )
}

/* ─────────────────────────  물 지형  ───────────────────────── */

const WATER_Y = -0.34
const ISLAND_H = 0.36
const BRIDGE_W = 1.5

function Bridge({
  position,
  horizontal,
  skin,
}: {
  position: [number, number, number]
  horizontal: boolean
  skin: WaterSkin
}) {
  const len = GAP + 0.8
  const railOffset = BRIDGE_W / 2 - 0.06

  return (
    <group position={position} rotation={[0, horizontal ? 0 : Math.PI / 2, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[len, 0.1, BRIDGE_W]} />
        <meshStandardMaterial color={skin.bridge} roughness={0.95} flatShading />
      </mesh>

      {[-railOffset, railOffset].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.24, z]} castShadow>
            <boxGeometry args={[len, 0.06, 0.06]} />
            <meshStandardMaterial color={skin.bridgeRail} roughness={0.95} />
          </mesh>
          {[-len / 2 + 0.15, 0, len / 2 - 0.15].map((x) => (
            <mesh key={x} position={[x, 0.1, z]} castShadow>
              <boxGeometry args={[0.07, 0.34, 0.07]} />
              <meshStandardMaterial color={skin.bridgeRail} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 기둥은 섬에 파묻히지 않게 물 위 구간(중심에서 ±GAP/2 안쪽)에 세운다 */}
      {[-GAP / 2 + 0.25, GAP / 2 - 0.25].map((x) => (
        <mesh key={x} position={[x, WATER_Y / 2 - 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, Math.abs(WATER_Y) + 0.2, 6]} />
          <meshStandardMaterial color={skin.bridgeRail} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** 수면 위에 뜬 것 — 수련잎이 아니라 배경에 따라 거품이거나 유빙이다. */
function Floats({ skin }: { skin: WaterSkin }) {
  const items = useMemo(() => {
    const rand = seeded(8821)
    const out: { pos: [number, number]; s: number; rot: number }[] = []
    for (let i = 0; i < skin.float.count * 3 && out.length < skin.float.count; i++) {
      const x = (rand() - 0.5) * SPAN
      const z = (rand() - 0.5) * SPAN
      const onIsland =
        BLOCK_CENTERS.some((c) => Math.abs(x - c) < BLOCK_SIZE / 2 + 0.5) &&
        BLOCK_CENTERS.some((c) => Math.abs(z - c) < BLOCK_SIZE / 2 + 0.5)
      if (onIsland) continue
      out.push({ pos: [x, z], s: 0.5 + rand() * 0.7, rot: rand() * Math.PI * 2 })
    }
    return out
  }, [skin.float.count])

  if (items.length === 0) return null
  return (
    <Instances limit={items.length} range={items.length}>
      <cylinderGeometry args={[skin.float.size, skin.float.size * 0.86, 0.05, 7]} />
      <meshStandardMaterial color={skin.float.color} roughness={0.9} flatShading />
      {items.map((it, i) => (
        <Instance
          key={i}
          position={[it.pos[0], WATER_Y + 0.03, it.pos[1]]}
          rotation={[0, it.rot, 0]}
          scale={it.s}
        />
      ))}
    </Instances>
  )
}

/** 잔물결 — 얇은 링을 천천히 키웠다 사라지게. */
function Ripples({ color }: { color: string }) {
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
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Water({ skin }: { skin: WaterSkin }) {
  return (
    <group>
      <mesh position={[0, WATER_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial
          color={skin.surface}
          roughness={skin.roughness}
          metalness={skin.metalness}
        />
      </mesh>
      <mesh position={[0, WATER_Y - 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial color={skin.deep} roughness={1} />
      </mesh>

      {/* 블록을 받치는 섬 */}
      {BLOCK_CENTERS.flatMap((x) =>
        BLOCK_CENTERS.map((z) => (
          <group key={`${x}_${z}`} position={[x, 0, z]}>
            <mesh position={[0, -ISLAND_H / 2 - 0.02, 0]} receiveShadow castShadow>
              <boxGeometry args={[BLOCK_SIZE, ISLAND_H, BLOCK_SIZE]} />
              <meshStandardMaterial color={skin.island} roughness={1} flatShading />
            </mesh>
            <mesh position={[0, -ISLAND_H - 0.06, 0]} receiveShadow>
              <boxGeometry args={[BLOCK_SIZE + 0.5, 0.12, BLOCK_SIZE + 0.5]} />
              <meshStandardMaterial color={skin.islandLip} roughness={1} flatShading />
            </mesh>
          </group>
        )),
      )}

      {ROAD_CENTERS.flatMap((x) =>
        BLOCK_CENTERS.map((z) => (
          <Bridge key={`h${x}_${z}`} position={[x, 0, z]} horizontal skin={skin} />
        )),
      )}
      {BLOCK_CENTERS.flatMap((x) =>
        ROAD_CENTERS.map((z) => (
          <Bridge key={`v${x}_${z}`} position={[x, 0, z]} horizontal={false} skin={skin} />
        )),
      )}

      <Floats skin={skin} />
      <Ripples color={skin.ripple} />
    </group>
  )
}

export function SkinnedSurface({ skin }: { skin: TerrainSkin }) {
  return skin.kind === 'water' ? <Water skin={skin} /> : <Paved skin={skin} />
}
