export type ShopItem = {
  /** building_item.id */
  id: number
  /** 화면에 표시할 건물 이름 */
  name: string
  /** building_item.theme 키(BASIC, SAKURA, ...). 필터·분류 기준. */
  theme: string
  /** 테마 한글 이름. 필터 버튼과 구역 제목에 쓴다. */
  themeLabel: string
  /** 랜드마크인지. 테마와 별개라 카드 배지로만 표시한다. */
  landmark: boolean
  /** 구매에 필요한 포인트. 실제 구매 시 서버 가격을 최종 기준으로 사용한다. */
  price: number
  /**
   * 카드 미리보기에 쓰는 이모지.
   *
   * ShopItemCard 가 <span>{item.thumbnail}</span> 로 텍스트 렌더하므로 이미지 URL 이
   * 아니라 글자다. building_item.thumbnail_url 은 아직 전부 비어 있어 테마 이모지로 대체한다.
   */
  thumbnail: string
  /** 카드 미리보기 배경색. 백엔드가 주지 않아 테마별 고정색을 쓴다. */
  background: string
}

/** 테마 필터 한 칸. 실제 목록에 있는 테마만 개수와 함께 만든다. */
export type ShopThemeGroup = {
  theme: string
  label: string
  items: ShopItem[]
}
