export type ShopCategory = '전체' | '테마' | '상점' | '자연' | '랜드마크'

export type ShopItem = {
  id: number
  name: string
  category: Exclude<ShopCategory, '전체'>
  price: number
  thumbnail: string
  background: string
}
