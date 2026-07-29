/**
 * 상점 분류.
 *
 * 원래 '테마'/'상점'/'자연'/'랜드마크' 4종이었으나 '상점'·'자연'은 백엔드에 근거가 없다.
 * building_item 이 가진 건 type(NORMAL/LANDMARK)과 theme(BASIC + 프리미엄 12종)뿐이라,
 * 실제 데이터로 채울 수 있는 3종으로 맞췄다.
 */
export type ShopCategory = '전체' | '기본' | '테마' | '랜드마크'

export type ShopItem = {
  /** building_item.id */
  id: number
  /** 화면에 표시할 건물 이름 */
  name: string
  /** 상점 필터에 사용하는 분류. shop.api.ts 에서 type/theme 을 보고 정한다. */
  category: Exclude<ShopCategory, '전체'>
  /** 구매에 필요한 포인트. 실제 구매 시 서버 가격을 최종 기준으로 사용한다. */
  price: number
  /**
   * 카드 미리보기에 쓰는 이모지.
   *
   * ShopItemCard 가 <span className="text-5xl">{item.thumbnail}</span> 로 텍스트 렌더하므로
   * 이미지 URL 이 아니라 글자다. building_item.thumbnail_url 은 아직 전부 비어 있어
   * 테마별 이모지로 대체한다.
   */
  thumbnail: string
  /** 카드 미리보기 배경색. 백엔드가 주지 않아 테마별 고정색을 쓴다. */
  background: string
}
