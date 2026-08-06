import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { DOMAIN_ACCENTS } from './palette'
import { GrowableObject, AUTO_CELL, type CellOverride } from './GrowableObject'
import { Landmark, type LandmarkOverride } from './Landmark'
import { Bush, FlowerBed } from './buildings'
import { CELL, BLOCK_SIZE, CENTER_BLOCK_INDEX } from './layout'
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
  /** 정중앙 블록에 세울 랜드마크 설정. 다른 블록에서는 쓰이지 않는다. */
  landmark: LandmarkOverride
  /** 디테일 부품을 그릴지(성능 옵션). 기본 true. */
  details?: boolean
  /** 도메인 이름 라벨을 그릴지. 기본 true. 자세한 내용은 {@link Village} 의 같은 prop. */
  labels?: boolean
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
 *
 * 정중앙 블록(= 만다라트 중심 목표)만 예외다. 8칸을 쓰지 않고 3×3 을 통째로 덮는
 * 랜드마크 1개가 서고, 그 단계는 8개 도메인의 전체 진행률로 결정된다.
 */
export function Block({
  domain, domainIndex, position, selected, overrides, theme, terrain, catalog,
  selectedTaskId, landmark, details = true, labels = true, onSelect, onSelectTask,
}: Props) {
  const isCenter = domainIndex === CENTER_BLOCK_INDEX
  const urban = urbanLevelOf(domain)
  const accent = DOMAIN_ACCENTS[domainIndex % DOMAIN_ACCENTS.length]

  const groundColor = useMemo(() => blockGroundColor(terrain, urban), [terrain, urban])
  const greenery = !isCenter && showsBlockGreenery(terrain) && urban < 0.5
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

      {/*
        선택 표시 — 사방을 두르지 않고 모서리만 잡아 블록 안 건물을 가리지 않는다.
        중앙 블록은 랜드마크 자체가 3×3 링으로 선택을 표시하므로 겹쳐 그리지 않는다.
      */}
      {selected && !isCenter && <BlockSelection size={BLOCK_SIZE} />}

      {/* 도메인 색 원반 (식별용). 중앙 블록은 랜드마크가 덮으므로 그리지 않는다. */}
      {!isCenter && (
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
      )}

      {/*
        라벨. 중앙 블록은 랜드마크가 최고 16 unit 까지 올라가 공중 라벨(labelY 5.6)이 건물 안에
        파묻히므로, 블록 앞 지면에 눕힌 명판으로 대신한다.
      */}
      {labels &&
        (isCenter ? (
          <Text
            position={[0, 0.09, BLOCK_SIZE / 2 + 0.55]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.62}
            color="#2b2b2b"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#ffffff"
          >
            {domain.title}
          </Text>
        ) : (
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
        ))}

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

      {/* 정중앙: 3×3 랜드마크 1개 / 그 외: 8개 과제 오브젝트 */}
      {isCenter ? (
        <Landmark
          center={domain}
          catalog={catalog}
          override={landmark}
          details={details}
          selected={selected}
          onClick={onSelect}
        />
      ) : (
        domain.tasks.slice(0, 8).map((task, i) => {
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
              details={details}
              position={[x, 0, z]}
              onClick={() => {
                // 도메인 패널을 열고, 그 안에서 어느 칸인지까지 알린다.
                onSelect()
                onSelectTask(task.id)
              }}
            />
          )
        })
      )}
    </group>
  )
}
