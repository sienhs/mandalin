import { Block } from './Block'
import { PITCH } from './layout'
import { TerrainGround } from './terrain'
import type { CellOverride } from './GrowableObject'
import type { LandmarkOverride } from './Landmark'
import type { ThemeKey } from './partTypes'
import type { OwnedCatalog } from './ownedCatalog'
import type { Terrain } from './villageApi'
import type { Mandalart } from './types'

interface Props {
  mandalart: Mandalart
  selected: number | null
  overrides: Record<string, CellOverride>
  themes: Record<string, ThemeKey>
  terrain: Terrain
  catalog: OwnedCatalog
  selectedTaskId: string | null
  landmark: LandmarkOverride
  /** 섬 아랫부분(매달린 암반)을 그릴지. Scene 에서 내려온다. */
  islandBase?: boolean
  /** 디테일 부품을 그릴지(성능 옵션). Scene 에서 내려온다. */
  details?: boolean
  onSelect: (domainIndex: number) => void
  onSelectTask: (taskId: string) => void
}

/**
 * 3×3 블록 그리드 = 8도메인 + 정중앙(LANDMARK) 전체 진행률
 * 블록 사이 통로는 선택한 지형(도시 도로/비포장/초원길/물길)이 채운다.
 */
export function Village({
  mandalart, selected, overrides, themes, terrain, catalog, selectedTaskId, landmark,
  islandBase = false, details = true, onSelect, onSelectTask,
}: Props) {
  return (
    <group>
      <TerrainGround terrain={terrain} islandBase={islandBase} />

      {mandalart.domains.slice(0, 9).map((domain, i) => {
        const gx = (i % 3) - 1
        const gz = Math.floor(i / 3) - 1
        return (
          <Block
            key={domain.id}
            domain={domain}
            domainIndex={i}
            position={[gx * PITCH, 0, gz * PITCH]}
            selected={selected === i}
            overrides={overrides}
            theme={themes[domain.id] ?? 'warm'}
            terrain={terrain}
            catalog={catalog}
            selectedTaskId={selectedTaskId}
            landmark={landmark}
            details={details}
            onSelect={() => onSelect(i)}
            onSelectTask={onSelectTask}
          />
        )
      })}
    </group>
  )
}
