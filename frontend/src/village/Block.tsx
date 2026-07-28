import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { DOMAIN_ACCENTS } from './palette'
import { GrowableObject, AUTO_CELL, type CellOverride } from './GrowableObject'
import { Bush, FlowerBed } from './buildings'
import { CELL, BLOCK_SIZE } from './layout'
import { BlockSelection } from './selection'
import { blockGroundColor, showsBlockGreenery } from './terrain'
import { type ThemeKey } from './partTypes'
import type { OwnedCatalog } from './ownedCatalog'
import type { Terrain } from './villageApi'
import { urbanLevelOf, type Domain } from './types'

interface Props {
  domain: Domain
  domainIndex: number
  position: [number, number, number]
  selected: boolean
  overrides: Record<string, CellOverride>
  theme: ThemeKey
  terrain: Terrain
  catalog: OwnedCatalog
  /** 지금 선택된 자리의 task id. 이 블록 밖의 자리일 수도 있다. */
  selectedTaskId: string | null
  onSelect: () => void
  /** 자리를 클릭했을 때. 도메인 선택과 별개로 어느 칸인지 위로 알린다. */
  onSelectTask: (taskId: string) => void
}

/** 3×3 격자에서 중앙 제외 8칸 좌표 (row-major). */
const TASK_CELLS: [number, number][] = (() => {
  const out: [number, number][] = []
  for (let dz = -1; dz <= 1; dz++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dz === 0) continue
      out.push([dx * CELL, dz * CELL])
    }
  }
  return out
})()

/**
 * 도메인 1개 = 블록 1개.
 * 바닥: 지형 기본색에서 도시화만큼 광장색으로. 중앙: 도메인 색 원반 + 라벨.
 * 주변 8칸: 과제 오브젝트(slot 고정).
 */
export function Block({
  domain, domainIndex, position, selected, overrides, theme, terrain, catalog,
  selectedTaskId, onSelect, onSelectTask,
}: Props) {
  const urban = urbanLevelOf(domain)
  const accent = DOMAIN_ACCENTS[domainIndex % DOMAIN_ACCENTS.length]

  const groundColor = useMemo(() => blockGroundColor(terrain, urban), [terrain, urban])
  const greenery = showsBlockGreenery(terrain) && urban < 0.5
  const labelY = 5.6

  return (
    <group position={position}>
      {/* 바닥 타일 */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <planeGeometry args={[BLOCK_SIZE, BLOCK_SIZE]} />
        <meshStandardMaterial color={groundColor} roughness={1} />
      </mesh>

      {/* 선택 표시 — 사방을 두르지 않고 모서리만 잡아 블록 안 건물을 가리지 않는다 */}
      {selected && <BlockSelection size={BLOCK_SIZE} />}

      {/* 중앙 도메인 색 원반 (식별용, 랜드마크는 제거) */}
      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>

      {/* 라벨 */}
      <Text
        position={[0, labelY, 0]}
        fontSize={0.6}
        color="#2b2b2b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        {domain.title}
      </Text>

      {/* 마을 장식: 관목 + 꽃밭 (초원·비포장이면서 아직 마을풍일 때만) */}
      {greenery && (
        <>
          <group position={[CELL * 1.35, 0, 0]}>
            <Bush scale={1.6} />
          </group>
          <group position={[-CELL * 1.35, 0, CELL * 0.4]}>
            <Bush scale={1.3} />
          </group>
          <group position={[0, 0, CELL * 1.4]} scale={1.6}>
            <FlowerBed />
          </group>
        </>
      )}

      {/* 8개 과제 오브젝트 */}
      {domain.tasks.slice(0, 8).map((task, i) => {
        const [x, z] = TASK_CELLS[i]
        return (
          <GrowableObject
            key={task.id}
            task={task}
            slot={i}
            urbanLevel={urban}
            theme={theme}
            catalog={catalog}
            selected={selectedTaskId === task.id}
            override={overrides[task.id] ?? AUTO_CELL}
            position={[x, 0, z]}
            onClick={() => {
              // 도메인 패널을 열고, 그 안에서 어느 칸인지까지 알린다.
              onSelect()
              onSelectTask(task.id)
            }}
          />
        )
      })}
    </group>
  )
}
