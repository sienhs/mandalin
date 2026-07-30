import { useState, type ReactNode } from 'react'
import { PALETTE } from './palette'
import { progressStage, type Task } from './types'
import { StageParts } from './buildings'
import { BUILD_SCALE } from './layout'
import { CellSelection } from './selection'
import type { Stage, ThemeKey } from './partTypes'
import { partsOf, type OwnedCatalog } from './ownedCatalog'

/** 칸별 수동 설정: 어떤 건물을, 어떤 단계로. 'auto'면 진행률·slot 기반. */
export interface CellOverride {
  building: string | 'auto'
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
  /** 서버가 내려준 보유 건물. 여기 없는 건물은 그릴 수단이 없다. */
  catalog: OwnedCatalog
  /** 디테일 부품을 그릴지(성능 옵션). 기본 true. */
  details?: boolean
  /** 지금 선택된 자리인지. 우측 패널의 하이라이트와 짝을 이룬다. */
  selected: boolean
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
export function GrowableObject({
  task, slot, urbanLevel, theme, override, catalog, selected, position, details = true, onClick,
}: Props) {
  const [hovered, setHovered] = useState(false)
  const isCity = urbanLevel >= 0.5

  const slots = isCity ? catalog.citySlots : catalog.villageSlots
  const key = override.building !== 'auto' ? override.building : slots[slot % 8]

  const stage: 0 | 1 | 2 | 3 =
    override.stage !== 'auto' ? override.stage : progressStage(task.progress)

  // 서버가 안 내려준(=미보유) 건물이 지정돼 있으면 빈 땅으로 떨어뜨린다.
  const parts = key ? partsOf(catalog, key) : null
  const built = stage !== 0 && (stage === 1 || parts !== null)

  let content: ReactNode
  if (!built) content = <Plot />
  else content = <StageParts parts={parts} stage={stage as Stage} theme={theme} details={details} />

  return (
    <group
      position={position}
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
      {/* 하이라이트는 건물 스케일 밖에 둔다. 안에 두면 건물과 같이 커져 칸 크기와 어긋난다. */}
      <CellSelection hovered={hovered} active={selected} />

      <group scale={built ? BUILD_SCALE : 1}>{content}</group>
    </group>
  )
}
