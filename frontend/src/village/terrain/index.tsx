import { Color } from 'three'
import { PALETTE } from '../palette'
import type { Terrain } from '../villageApi'
import { CityRoad } from './CityRoad'
import { DirtRoad } from './DirtRoad'
import { GrassPath } from './GrassPath'
import { WaterWay } from './WaterWay'

/**
 * 지형 4종 진입점.
 *
 * 지형은 "건물이 놓이는 환경"이라 대지·길·치장을 통째로 갈아끼운다.
 * 블록(도메인) 바닥색과 하늘도 지형을 따라가야 길과 이질감이 없어서 여기서 같이 정의한다.
 */

export function TerrainGround({ terrain }: { terrain: Terrain }) {
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
