import { useState } from 'react'
import { LandmarkParts } from './buildings'
import { BUILD_SCALE, CELL } from './layout'
import { LandmarkSelection } from './selection'
import { partsOf, type OwnedCatalog } from './ownedCatalog'
import type { LandmarkStage } from './partTypes'
import { landmarkStageOf, type Domain } from './types'

/** 랜드마크가 덮는 월드 폭 = 3×3 칸. 선택 표시와 클릭 판정에 쓴다. */
export const LANDMARK_SPAN = CELL * 3

/** 정중앙 자리 설정. 'auto' 면 보유 목록 첫 종 / 진행률 기반 단계. */
export interface LandmarkOverride {
  building: string | 'auto'
  stage: LandmarkStage | 'auto'
}

export const AUTO_LANDMARK: LandmarkOverride = { building: 'auto', stage: 'auto' }

interface Props {
  /** 정중앙 블록. tasks 는 실제 과제가 아니라 8개 도메인의 진행률 요약이다. */
  center: Domain
  catalog: OwnedCatalog
  override: LandmarkOverride
  selected: boolean
  onClick: () => void
}

/**
 * 만다라트 중심 목표 = 마을 정중앙 랜드마크 1개.
 *
 * 일반 블록은 8칸에 건물 8개를 세우지만, 중앙은 3×3 을 통째로 쓰는 거대 건물 하나가
 * 8개 도메인의 전체 진행률(12.5% 구간마다 1단계)로 자란다.
 *
 * 보유하지 않은(=서버가 parts 를 안 준) 랜드마크는 그릴 수단이 없으므로 공사 부지로
 * 떨어진다 — 미보유 건물을 세울 수 없다는 원칙은 여기서도 같다.
 */
export function Landmark({ center, catalog, override, selected, onClick }: Props) {
  const [hovered, setHovered] = useState(false)

  const key = override.building !== 'auto' ? override.building : catalog.landmarks[0]?.itemKey
  const parts = key ? partsOf(catalog, key) : null
  const stage: LandmarkStage = override.stage !== 'auto' ? override.stage : landmarkStageOf(center)

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {/* 표시는 건물 스케일 밖에 둔다. 안에 두면 건물과 같이 커져 칸 크기와 어긋난다. */}
      <LandmarkSelection hovered={hovered} active={selected} span={LANDMARK_SPAN} />

      <group scale={BUILD_SCALE}>
        <LandmarkParts parts={parts} stage={stage} />
      </group>
    </group>
  )
}
