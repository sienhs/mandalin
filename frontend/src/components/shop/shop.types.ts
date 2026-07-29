export type ShopCategory = '전체' | '테마' | '상점' | '자연' | '랜드마크'

export type ShopItem = {
  /** building_item 또는 상점 상품 DTO의 고유 식별자 */
  id: number
  /** 화면에 표시할 건물 이름 */
  name: string
  /** 상점 필터에 사용하는 분류. 백엔드 enum과 값이 일치해야 한다. */
  category: Exclude<ShopCategory, '전체'>
  /** 구매에 필요한 포인트. 실제 구매 시 서버 가격을 최종 기준으로 사용한다. */
  price: number
  /** 정적 파일 또는 CDN의 건물 썸네일 URL */
  thumbnail: string
  /** 카드 미리보기 배경색. 백엔드가 주지 않으면 프런트 디자인 값으로 대체 가능하다. */
  background: string
}
