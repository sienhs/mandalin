import { Instances, Instance } from '@react-three/drei'
import { PALETTE } from '../palette'
import { GAP, SPAN } from '../layout'
import { RoadStrips, STRIP_LIFT, intersections, roadLayerY, useRoadScatter } from './common'

/**
 * 푸른 초원의 다져진 길.
 * 잔디 대지에 좁은 흙길을 내고, 길 가장자리에 야생화·관목·디딤돌을 둔다.
 */

const ROAD_W = GAP * 0.52

/** 길 양옆 야생화. 줄기 없이 색 덩어리만 — 멀리서 보는 마을이라 이 정도면 충분하다. */
function Wildflowers() {
  const items = useRoadScatter({ count: 260, seed: 3307, margin: -0.5 })
  const colors = [PALETTE.flowerRed, PALETTE.flowerOrange, PALETTE.flowerPurple, PALETTE.accent]
  if (items.length === 0) return null
  return (
    <group>
      {colors.map((c, ci) => {
        const mine = items.filter((_, i) => i % colors.length === ci)
        if (mine.length === 0) return null
        return (
          <Instances key={ci} limit={mine.length} range={mine.length}>
            <icosahedronGeometry args={[0.075, 0]} />
            <meshStandardMaterial color={c} roughness={0.65} flatShading />
            {mine.map((it, i) => (
              <Instance key={i} position={[it.pos[0], 0.07, it.pos[2]]} rotation={[0, it.rot, 0]} scale={it.r} />
            ))}
          </Instances>
        )
      })}
    </group>
  )
}

/** 길 위 디딤돌. */
function SteppingStones() {
  const items = useRoadScatter({ count: 70, seed: 5150, margin: 0.4 })
  if (items.length === 0) return null
  return (
    <Instances limit={items.length} range={items.length} receiveShadow>
      <cylinderGeometry args={[0.22, 0.24, 0.05, 7]} />
      <meshStandardMaterial color={PALETTE.stoneLight} roughness={1} flatShading />
      {items.map((it, i) => (
        <Instance key={i} position={[it.pos[0], -0.025, it.pos[2]]} rotation={[0, it.rot, 0]} scale={it.r} />
      ))}
    </Instances>
  )
}

/** 교차로 모서리 관목 덤불. */
function Shrubs() {
  const blobs: [number, number, number, number][] = [
    [0, 0.3, 0, 0.36],
    [0.34, 0.24, 0.1, 0.28],
    [-0.26, 0.22, -0.14, 0.26],
  ]
  return (
    <group>
      {intersections().map(([x, z], i) => (
        <group key={i} position={[x - ROAD_W / 2 - 0.75, 0, z - ROAD_W / 2 - 0.75]}>
          {blobs.map(([bx, by, bz, r], j) => (
            <mesh key={j} position={[bx, by, bz]} castShadow>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color={j % 2 ? PALETTE.foliage : PALETTE.bush} roughness={1} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/**
 * 길 스트립 스택의 바닥.
 *
 * <p>초원은 지형 넷 중 유일하게 스트립을 **두 겹** 쌓는다(혼합 띠 + 흙길). `RoadStrips` 는 한
 * 번에 두 겹을 쓰므로 층 간격을 직접 적지 말고 `roadLayerY` 로 뽑는다 — 예전에는 `-0.047` ·
 * `-0.045` 로 적어서 아래 층 가로와 위 층 세로가 둘 다 `-0.045` 에 놓였고, 길 교차점 16곳에서
 * 초록 띠가 깜빡였다.
 *
 * <p>대지는 이 값보다 `STRIP_LIFT` 만큼 아래에 둔다. 같은 높이면 대지와 첫 겹이 싸운다.
 */
const ROAD_BASE = -0.05
const GROUND_Y = ROAD_BASE - STRIP_LIFT

export function GrassPath() {
  return (
    <group>
      {/* 초원 */}
      <mesh position={[0, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN, SPAN]} />
        <meshStandardMaterial color={PALETTE.grass} roughness={1} />
      </mesh>

      {/* 흙길을 좁게 내고 그 밖으로 잔디와 섞이는 띠를 한 겹 더 깔아 경계를 흐린다 */}
      <RoadStrips
        y={roadLayerY(ROAD_BASE, 0)}
        width={ROAD_W * 1.5}
        color={PALETTE.grass.clone().lerp(PALETTE.path, 0.35)}
      />
      <RoadStrips y={roadLayerY(ROAD_BASE, 1)} width={ROAD_W} color={PALETTE.path} />

      <SteppingStones />
      <Wildflowers />
      <Shrubs />
    </group>
  )
}
