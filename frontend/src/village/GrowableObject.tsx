import { useState, type ReactNode } from 'react'
import { PALETTE } from './palette'
import { progressStage, type Task } from './types'
import {
  StageBuilding,
  CITY_SLOT_KEYS,
  VILLAGE_SLOT_KEYS,
  type BuildingKey,
  type Stage,
  type ThemeKey,
} from './buildings'

/** ref 단위(footprint≈0.3~0.46) → 셀 월드 크기로 키우는 배율. */
const BUILD_SCALE = 2.4

/** 칸별 수동 설정: 어떤 건물을, 어떤 단계로. 'auto'면 진행률·slot 기반. */
export interface CellOverride {
  building: BuildingKey | 'auto'
  stage: Stage | 'auto'
}

export const AUTO_CELL: CellOverride = { building: 'auto', stage: 'auto' }

interface Props {
  task: Task
  slot: number
  /** 소속 블록 도시화 0~1. ≥0.5면 도시풍. */
  urbanLevel: number
  /** 1단계 일관화 테마. */
  theme: ThemeKey
  override: CellOverride
  position: [number, number, number]
  onClick?: () => void
}

/** 빈 땅: 흙 패치 + 표식 말뚝. */
function Plot() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.04, 12]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={1} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.06]} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.9} />
      </mesh>
    </group>
  )
}

/**
 * 과제 1개 = 셀 오브젝트.
 * 건물 종류: override.building이 지정되면 그것, 아니면 slot+urbanLevel 자동.
 * 표시 단계: override.stage가 지정되면 그것, 아니면 진행률(0=빈땅,1,2,3).
 */
export function GrowableObject({ task, slot, urbanLevel, theme, override, position, onClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const isCity = urbanLevel >= 0.5

  const key: BuildingKey =
    override.building !== 'auto'
      ? override.building
      : (isCity ? CITY_SLOT_KEYS : VILLAGE_SLOT_KEYS)[slot % 8]

  const stage: 0 | 1 | 2 | 3 =
    override.stage !== 'auto' ? override.stage : progressStage(task.progress)

  let content: ReactNode
  const built = stage !== 0
  if (stage === 0) content = <Plot />
  else content = <StageBuilding k={key} stage={stage} theme={theme} />

  return (
    <group
      position={position}
      scale={built ? BUILD_SCALE : 1}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {hovered && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.5, 24]} />
          <meshBasicMaterial color={0xffe08a} transparent opacity={0.8} />
        </mesh>
      )}
      {content}
    </group>
  )
}
