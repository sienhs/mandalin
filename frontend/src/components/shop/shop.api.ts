import type { ShopItem } from './shop.types'

/**
 * 상점 API 연동 안내
 *
 * 현재 백엔드에는 아래 기능만 구현되어 있다.
 * - GET /api/v1/village/me: 사용자가 이미 보유한 건물 조회
 * - PUT /api/v1/village/terrain: 마을 지형 변경
 * - BuildingInventoryService: 기본 건물 지급 및 보유 건물 조회
 *
 * 따라서 위 Village API로는 판매 상품 목록, 가격, 구매 및 포인트 차감을 처리할 수 없다.
 * 실제 상점을 연결하려면 백엔드에 다음 두 종류의 API가 추가되어야 한다.
 *
 * 1. 판매 가능한 건물 목록 조회
 * 2. 특정 건물 구매 및 사용자 포인트 차감
 *
 * 백엔드 API가 완성되면 `../../api`에서 `apiFetch`를 import해 아래 두 함수의
 * 임시 반환을 실제 요청으로 교체한다. ShopPage는 이미 이 함수들을 호출하므로
 * API 경로와 응답 변환 외에는 페이지 컴포넌트를 수정할 필요가 없다.
 */

/**
 * TODO [백엔드 API 연동 위치 1/2]: 판매 가능한 건물 목록 조회
 *
 * 권장 엔드포인트:
 * GET /api/v1/shop/buildings
 *
 * 권장 ApiResponse.data 예시:
 * [
 *   {
 *     "id": 1,
 *     "name": "무지개 대관람차",
 *     "category": "랜드마크",
 *     "price": 1500,
 *     "thumbnail": "https://.../ferris-wheel.png",
 *     "background": "#B7EDD0"
 *   }
 * ]
 *
 * 백엔드 DTO 필드명이 다르면 이 함수에서 ShopItem 형태로 변환한다.
 * 예를 들어 itemId/title/thumbnailUrl을 내려준다면 다음처럼 매핑한다.
 *
 * const response = await apiFetch<ShopBuildingResponse[]>('/api/v1/shop/buildings')
 * return response.map((item) => ({
 *   id: item.itemId,
 *   name: item.title,
 *   category: item.category,
 *   price: item.price,
 *   thumbnail: item.thumbnailUrl,
 *   background: item.backgroundColor,
 * }))
 *
 * 단순히 응답 필드가 ShopItem과 완전히 같다면 다음 한 줄이면 된다.
 *
 * return apiFetch<ShopItem[]>('/api/v1/shop/buildings')
 */
export async function fetchShopItems(): Promise<ShopItem[]> {
  // API 미연결 상태에서는 상품을 임의로 생성하지 않는다.
  // 빈 배열은 ShopPage에서 "등록된 건물이 없습니다."로 표시된다.
  return []
}

/**
 * TODO [백엔드 API 연동 위치 2/2]: 건물 구매 요청
 *
 * 권장 엔드포인트:
 * POST /api/v1/shop/buildings/{itemId}/purchase
 *
 * 구매 처리는 반드시 백엔드 트랜잭션 안에서 다음 순서로 처리하는 것이 안전하다.
 * 1. 로그인 사용자와 판매 건물 조회
 * 2. 이미 보유한 건물인지 확인
 * 3. 현재 포인트가 가격보다 충분한지 확인
 * 4. 사용자 포인트 차감
 * 5. user_building에 구매 건물 추가
 * 6. 차감 후 잔액과 구매한 건물 ID 반환
 *
 * 권장 ApiResponse.data 예시:
 * {
 *   "itemId": 1,
 *   "remainingPoint": 10900
 * }
 *
 * 프런트에서 `현재 포인트 - 가격`을 최종 잔액으로 확정하면 안 된다.
 * 여러 탭에서 동시에 구매하거나 서버의 실제 가격이 변경될 수 있으므로,
 * 실제 연동 후에는 서버가 반환한 remainingPoint를 화면에 반영해야 한다.
 *
 * 권장 구현 형태:
 *
 * export type ShopPurchaseResult = {
 *   itemId: number
 *   remainingPoint: number
 * }
 *
 * export function purchaseShopItem(itemId: number): Promise<ShopPurchaseResult> {
 *   return apiFetch<ShopPurchaseResult>(
 *     `/api/v1/shop/buildings/${itemId}/purchase`,
 *     { method: 'POST' },
 *   )
 * }
 */
export async function purchaseShopItem(_itemId: number): Promise<void> {
  // API 미연결 상태에서는 서버 데이터나 DB를 변경하지 않는다.
  return
}
