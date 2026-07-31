import type { Part } from './partTypes'
import type { OwnedBuilding } from './villageApi'

/**
 * 서버가 내려준 보유 건물을 마을 렌더에 쓰기 좋은 형태로 정리한다.
 *
 * 프론트에는 전체 카탈로그가 없으므로 "어떤 건물이 존재하는가"는 전부 이 객체가 답한다.
 * 여기 없는 key 는 그릴 수단 자체가 없다 — 그게 위·변조 방지의 실질이다.
 */

/** 테마 표시용 라벨. 순수 UI 메타라 서버가 아니라 여기서 관리한다. */
const THEME_LABELS: Record<string, string> = {
  BASIC: '기본',
  SAKURA: '벚꽃',
  CYBER: '사이버펑크',
  SEOUL: '서울',
  WEST: '서부',
  MEDIEVAL: '중세',
  SANTORINI: '산토리니',
  SCIFI: 'SF 콜로니',
  TROPICAL: '열대 리조트',
  NORDIC: '노르딕',
  STEAMPUNK: '스팀펑크',
  EGYPT: '이집트',
  ARTDECO: '아르데코',
  LANDMARK: '랜드마크',
}

export function themeLabel(theme: string): string {
  return THEME_LABELS[theme] ?? theme
}

export interface ThemeGroup {
  id: string
  label: string
  items: OwnedBuilding[]
}

export interface OwnedCatalog {
  list: OwnedBuilding[]
  byKey: Map<string, OwnedBuilding>
  /** 자동 배치용 8칸 — 마을풍(낮은 건물). */
  villageSlots: string[]
  /** 자동 배치용 8칸 — 도시풍(높은 건물). */
  citySlots: string[]
  themes: ThemeGroup[]
  /**
   * 보유한 랜드마크(3×3, 8단계). 일반 건물 목록과 완전히 분리한다 —
   * 한 변이 3배라 1칸 자리에 놓이면 옆 블록과 길을 덮어버린다.
   */
  landmarks: OwnedBuilding[]
}

const EMPTY: OwnedCatalog = {
  list: [],
  byKey: new Map(),
  villageSlots: [],
  citySlots: [],
  themes: [],
  landmarks: [],
}

/**
 * 자동 배치 슬롯은 보유 건물의 높이로 정한다.
 *
 * 예전에는 마을풍/도시풍 key 를 코드에 박아뒀지만, 인벤토리가 유저마다 달라서 고정 key 는
 * "안 가진 건물"을 가리킬 수 있다. 그래서 높이로 뽑는다.
 *
 * 단순히 "가장 낮은 8종 / 가장 높은 8종"으로 하면 전부 보유한 유저의 블록이 똑같이 생긴
 * 초고층 8개로 채워져 마천루 숲이 된다. 아래·위 절반 안에서 **고르게 표본을 뽑아**
 * 성장 대비는 유지하면서 실루엣이 다양해지게 한다.
 */
export function buildOwnedCatalog(all: OwnedBuilding[]): OwnedCatalog {
  if (all.length === 0) return EMPTY

  // 랜드마크는 정중앙 3×3 자리 전용이다. 여기서 갈라내지 않으면 높이순 슬롯 표본에 뽑혀
  // 1칸 자리에 거대 건물이 서고, 피커에도 섞여 나온다.
  const landmarks = all.filter((b) => b.type === 'LANDMARK')
  const buildings = all.filter((b) => b.type !== 'LANDMARK')

  if (buildings.length === 0) {
    return { ...EMPTY, list: all, byKey: new Map(all.map((b) => [b.itemKey, b])), landmarks }
  }

  const byHeight = [...buildings].sort((a, b) => a.size.height - b.size.height)

  /** 구간에서 8개를 균등 간격으로 표본 추출. 개수가 8보다 적으면 순환한다. */
  const pick = (source: OwnedBuilding[]) => {
    if (source.length <= 8) {
      return Array.from({ length: 8 }, (_, i) => source[i % source.length].itemKey)
    }
    const step = source.length / 8
    return Array.from({ length: 8 }, (_, i) => source[Math.floor(i * step)].itemKey)
  }

  const themeOrder: string[] = []
  const grouped = new Map<string, OwnedBuilding[]>()
  for (const b of buildings) {
    if (!grouped.has(b.theme)) {
      grouped.set(b.theme, [])
      themeOrder.push(b.theme)
    }
    grouped.get(b.theme)!.push(b)
  }

  return {
    // byKey 는 랜드마크까지 포함한다 — partsOf 로 랜드마크 모델도 찾아야 한다.
    list: buildings,
    byKey: new Map(all.map((b) => [b.itemKey, b])),
    // 낮은 절반 = 마을풍, 높은 절반 = 도시풍. 각 구간에서 고르게 뽑는다.
    villageSlots: pick(byHeight.slice(0, Math.max(1, Math.floor(byHeight.length / 2)))),
    citySlots: pick(byHeight.slice(Math.floor(byHeight.length / 2))),
    themes: themeOrder.map((id) => ({ id, label: themeLabel(id), items: grouped.get(id)! })),
    landmarks,
  }
}

export function partsOf(catalog: OwnedCatalog, key: string): Part[] | null {
  return catalog.byKey.get(key)?.parts ?? null
}
