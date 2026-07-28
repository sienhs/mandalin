import { Color } from 'three'
import { PALETTE } from '../palette'
import type { Terrain } from '../villageApi'
import { CityRoad } from './CityRoad'
import { DirtRoad } from './DirtRoad'
import { FloatingBase } from './FloatingBase'
import { GrassPath } from './GrassPath'
import { WaterWay } from './WaterWay'

/**
 * 지형 4종 진입점.
 *
 * 지형은 "건물이 놓이는 환경"이라 대지·길·치장을 통째로 갈아끼운다.
 * 블록(도메인) 바닥색과 하늘도 지형을 따라가야 길과 이질감이 없어서 여기서 같이 정의한다.
 */

/**
 * 섬 아랫부분 파라미터.
 * 물길은 수면 아래에서 시작해야 하고(수면보다 위에서 시작하면 암반이 물 위로 솟는다),
 * 암반 색도 지형에 맞춰 다르게 준다.
 */
const BASE: Record<Terrain, { topY: number; rock: Color; lip: Color; depth: number }> = {
  CITY_ROAD: { topY: -0.05, rock: PALETTE.concrete.clone().multiplyScalar(0.62), lip: PALETTE.plaza, depth: 13 },
  DIRT_ROAD: { topY: -0.05, rock: PALETTE.bark, lip: PALETTE.soil, depth: 13 },
  GRASS_PATH: { topY: -0.05, rock: PALETTE.bark, lip: PALETTE.soil, depth: 14 },
  // 수면(-0.34)과 그 아래 수심 면(-0.79)보다 더 아래에서 시작한다.
  WATER_WAY: { topY: -0.85, rock: PALETTE.bark.clone().lerp(PALETTE.concrete, 0.25), lip: PALETTE.soil, depth: 12 },
}

function TerrainSurface({ terrain }: { terrain: Terrain }) {
  switch (terrain) {
    case 'CITY_ROAD':
      return <CityRoad />
    case 'DIRT_ROAD':
      return <DirtRoad />
    case 'GRASS_PATH':
      return <GrassPath />
    case 'WATER_WAY':
      return <WaterWay />
  }
}

export function TerrainGround({ terrain }: { terrain: Terrain }) {
  return (
    <group>
      <FloatingBase {...BASE[terrain]} />
      <TerrainSurface terrain={terrain} />
    </group>
  )
}

/**
 * 블록 바닥색. 지형 기본색에서 도시화(urban 0~1)만큼 광장색으로 당긴다.
 * 지형 정체성을 유지하면서 진행률이 바닥으로도 읽히던 기존 표현을 살린다.
 */
export function blockGroundColor(terrain: Terrain, urban: number): Color {
  const base: Record<Terrain, Color> = {
    CITY_ROAD: PALETTE.plaza,
    DIRT_ROAD: PALETTE.path,
    GRASS_PATH: PALETTE.grass,
    WATER_WAY: PALETTE.grass.clone().lerp(PALETTE.bush, 0.3),
  }
  return base[terrain].clone().lerp(PALETTE.plaza, urban * 0.55)
}

/** 마을풍 장식(관목·꽃밭)을 블록에 얹을지. 도시·물길은 지형이 이미 꽉 차 있어 뺀다. */
export function showsBlockGreenery(terrain: Terrain): boolean {
  return terrain === 'GRASS_PATH' || terrain === 'DIRT_ROAD'
}

/** 지형별 하늘·태양. 같은 마을이라도 환경이 바뀌면 빛도 바뀌어야 자연스럽다. */
export const SKY: Record<Terrain, {
  bg: string
  sun: [number, number, number]
  turbidity: number
  rayleigh: number
}> = {
  CITY_ROAD: { bg: '#c7d8e4', sun: [20, 30, 10], turbidity: 8, rayleigh: 1.0 },
  DIRT_ROAD: { bg: '#e3d9c2', sun: [26, 18, 6], turbidity: 12, rayleigh: 0.8 },
  GRASS_PATH: { bg: '#cfe8f0', sun: [20, 30, 10], turbidity: 5, rayleigh: 1.4 },
  WATER_WAY: { bg: '#bfe3ea', sun: [14, 26, 18], turbidity: 4, rayleigh: 1.6 },
}
