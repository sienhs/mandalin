import type { ShopCategory, ShopItem } from './shop.types'

export const SHOP_CATEGORIES: ShopCategory[] = [
  '전체',
  '테마',
  '상점',
  '자연',
  '랜드마크',
]

/** 상점 API 연결 전 화면 확인에 사용하는 건물 아이템 fallback 데이터. */
export const FALLBACK_SHOP_ITEMS: ShopItem[] = [
  { id: 1, name: '무지개 대관람차', category: '랜드마크', price: 1500, thumbnail: '🎡', background: '#B7EDD0' },
  { id: 2, name: '에메랄드 분수', category: '자연', price: 350, thumbnail: '⛲', background: '#9CE5D5' },
  { id: 3, name: '선샤인 베이커리', category: '상점', price: 600, thumbnail: '🥐', background: '#F4D25E' },
  { id: 4, name: '라벤더 빌라', category: '테마', price: 410, thumbnail: '🏡', background: '#CAC1F5' },
  { id: 5, name: '하늘 관측탑', category: '랜드마크', price: 1200, thumbnail: '🗼', background: '#A9C5F2' },
  { id: 6, name: '벚꽃 정원', category: '자연', price: 280, thumbnail: '🌸', background: '#E4B4D5' },
  { id: 7, name: '민트 카페', category: '상점', price: 540, thumbnail: '☕', background: '#AAE6C6' },
  { id: 8, name: '파스텔 코티지', category: '테마', price: 320, thumbnail: '🏠', background: '#EDBBBB' },
]
