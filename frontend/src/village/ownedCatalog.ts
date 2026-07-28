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
  BASIC: '🏙 기본',
  SAKURA: '🌸 벚꽃',
  CYBER: '🌃 사이버펑크',
  SEOUL: '🏙 서울',
  WEST: '🤠 서부',
  MEDIEVAL: '🏰 중세',
  SANTORINI: '🇬🇷 산토리니',
  SCIFI: '🚀 SF 콜로니',
  TROPICAL: '🏝 열대 리조트',
  NORDIC: '❄️ 노르딕',
  STEAMPUNK: '⚙️ 스팀펑크',
  EGYPT: '🏜 이집트',
  ARTDECO: '🎭 아르데코',
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
}

const EMPTY: OwnedCatalog = {
  list: [],
  byKey: new Map(),
  villageSlots: [],
  citySlots: [],
  themes: [],
}

/**
 * 자동 배치 슬롯은 보유 건물의 높이로 정한다.
 *
 * 예전에는 마을풍/도시풍 key 를 코드에 박아뒀지만, 이제 인벤토리가 유저마다 달라서
 * 고정 key 는 "안 가진 건물"을 가리킬 수 있다. 낮은 8종=마을풍, 높은 8종=도시풍으로
 * 뽑으면 어떤 인벤토리에서도 성장 대비가 유지된다.
 */
export function buildOwnedCatalog(buildings: OwnedBuilding[]): OwnedCatalog {
  if (buildings.length === 0) return EMPTY

  const byHeight = [...buildings].sort((a, b) => a.size.height - b.size.height)
  const pick = (source: OwnedBuilding[]) =>
    Array.from({ length: 8 }, (_, i) => source[i % source.length].itemKey)

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
    list: buildings,
    byKey: new Map(buildings.map((b) => [b.itemKey, b])),
    villageSlots: pick(byHeight.slice(0, 8)),
    citySlots: pick(byHeight.slice(-8).reverse()),
    themes: themeOrder.map((id) => ({ id, label: themeLabel(id), items: grouped.get(id)! })),
  }
}

export function partsOf(catalog: OwnedCatalog, key: string): Part[] | null {
  return catalog.byKey.get(key)?.parts ?? null
}
