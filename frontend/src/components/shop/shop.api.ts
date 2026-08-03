import { apiFetch } from '../../api/client'
import { themeStyleOf } from './shop.data'
import type { ShopItem, ShopThemeGroup } from './shop.types'

/**
 * 상점 API 연동.
 *
 * 백엔드(GET /api/v1/shop/buildings)는 카탈로그 전체를 내려주고 각 건물에 보유 여부(owned)를
 * 붙인다. 상점은 "살 수 있는 것"만 보여주면 되므로 owned 는 여기서 걸러낸다.
 *
 * 응답에는 3D 모델링 데이터(parts)가 빠져 있다 — 건물 1종의 parts 가 부품 수십~수백 개
 * 배열이라 수백 종에 실으면 응답이 수 MB 가 된다. 미리보기가 필요하면 상세 조회를 쓴다.
 */

/** GET /api/v1/shop/buildings 응답 1건 (백엔드 ShopBuildingResponse). */
type ShopBuildingResponse = {
  itemId: number
  itemKey: string
  name: string
  /** 'BASIC' 또는 프리미엄 테마 id 대문자 (예: 'MEDIEVAL'). */
  theme: string
  type: 'NORMAL' | 'LANDMARK'
  price: number
  owned: boolean
  /** 저장소에 올린 3D 스크린샷. 아직 굽지 않아 현재는 전부 null 이다. */
  thumbnailUrl: string | null
  size: { width: number; depth: number; height: number }
}

/** POST .../purchase 응답 (백엔드 BuildingPurchaseResponse). */
export type ShopPurchaseResult = {
  itemId: number
  itemKey: string
  paidPoint: number
  /** 차감 후 서버 기준 잔액. 화면 잔액은 반드시 이 값으로 덮어써야 한다. */
  remainingPoint: number
}

function toShopItem(building: ShopBuildingResponse): ShopItem {
  const style = themeStyleOf(building.theme)

  return {
    id: building.itemId,
    name: building.name,
    theme: building.theme,
    themeLabel: style.label,
    landmark: building.type === 'LANDMARK',
    price: building.price,
    // thumbnailUrl 은 아직 전부 null 이라 이모지로 대체한다. 나중에 실제 URL 을 쓰려면
    // ShopItemCard 도 <img> 로 함께 바꿔야 한다.
    thumbnail: style.emoji,
    background: style.background,
  }
}

/** 구매 가능한(=미보유) 건물 목록. 진열 순서는 서버가 정한 sortOrder 를 그대로 따른다. */
export async function fetchShopItems(): Promise<ShopItem[]> {
  const buildings = await apiFetch<ShopBuildingResponse[]>('/api/v1/shop/buildings')
  return buildings.filter((building) => !building.owned).map(toShopItem)
}

/**
 * 목록을 테마별로 묶는다.
 *
 * 테마 순서는 서버가 준 진열 순서에서 그 테마가 처음 나온 위치를 따른다 — 프론트에 별도
 * 순서 표를 두면 새 테마가 추가될 때 여기도 같이 고쳐야 하고, 빠뜨리면 조용히 뒤로 밀린다.
 */
export function groupByTheme(items: ShopItem[]): ShopThemeGroup[] {
  const groups = new Map<string, ShopThemeGroup>()

  for (const item of items) {
    const group = groups.get(item.theme)
    if (group) {
      group.items.push(item)
    } else {
      groups.set(item.theme, { theme: item.theme, label: item.themeLabel, items: [item] })
    }
  }

  return [...groups.values()]
}

/**
 * 건물 구매. 포인트 차감과 보유 등록은 서버 트랜잭션 안에서 함께 처리된다.
 *
 * 실패는 ApiError 로 던져진다 — 409(이미 보유), 400(포인트 부족), 404(없는 건물).
 * 호출자는 예외를 잡아 완료 화면으로 넘어가지 않게 해야 한다.
 */
export function purchaseShopItem(itemId: number): Promise<ShopPurchaseResult> {
  return apiFetch<ShopPurchaseResult>(
    `/api/v1/shop/buildings/${itemId}/purchase`,
    { method: 'POST' },
  )
}
