import { Block, BLOCK_SIZE } from './Block'
import { PALETTE } from './palette'
import type { CellOverride } from './GrowableObject'
import type { ThemeKey } from './partTypes'
import type { OwnedCatalog } from './ownedCatalog'
import type { Mandalart } from './types'

const GAP = 2.2
const PITCH = BLOCK_SIZE + GAP // 블록 중심 간 거리

interface Props {
  mandalart: Mandalart
  selected: number | null
  overrides: Record<string, CellOverride>
  themes: Record<string, ThemeKey>
  catalog: OwnedCatalog
  onSelect: (domainIndex: number) => void
}

/**
 * 3×3 블록 그리드 = 9도메인.
 * 블록 사이 통로는 흙길(path) 바닥으로 깔아 만다라트 격자를 지형으로 재현.
 */
export function Village({ mandalart, selected, overrides, themes, catalog, onSelect }: Props) {
  const span = PITCH * 3 + 2

  return (
    <group>
      {/* 전체 대지 (블록 사이 통로 = 흙길) */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[span, span]} />
        <meshStandardMaterial color={PALETTE.path} roughness={1} />
      </mesh>

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
            catalog={catalog}
            onSelect={() => onSelect(i)}
          />
        )
      })}
    </group>
  )
}
