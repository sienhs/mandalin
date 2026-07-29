import type { ShopCategory } from './shop.types'

export const SHOP_CATEGORIES: ShopCategory[] = [
  '전체',
  '기본',
  '테마',
  '랜드마크',
]

/**
 * 테마별 카드 표현.
 *
 * 백엔드 building_item 에는 색·이모지가 없고 thumbnail_url 도 아직 전부 비어 있다.
 * 건물 종류를 한눈에 구분할 수 있게 프론트에서 테마 키(BASIC / MEDIEVAL / ...)마다
 * 이모지와 배경색을 정해 둔다. 모르는 테마가 오면 DEFAULT_THEME_STYLE 로 떨어진다.
 */
export const THEME_STYLES: Record<string, { emoji: string; background: string }> = {
  BASIC: { emoji: '🏠', background: '#E8EEF5' },
  MEDIEVAL: { emoji: '🏰', background: '#E3DAC9' },
  SAKURA: { emoji: '🌸', background: '#FBE4EC' },
  SANTORINI: { emoji: '⛪', background: '#DFF1FB' },
  NORDIC: { emoji: '🌲', background: '#DCE9E3' },
  EGYPT: { emoji: '🔺', background: '#F5E7C6' },
  CYBER: { emoji: '🌃', background: '#D9DCF5' },
  SCIFI: { emoji: '🛰️', background: '#DBE7F3' },
  STEAMPUNK: { emoji: '⚙️', background: '#EADFD2' },
  TROPICAL: { emoji: '🌴', background: '#DCF3E4' },
  WEST: { emoji: '🤠', background: '#F0E2CE' },
  SEOUL: { emoji: '🏢', background: '#E5E9EE' },
  ARTDECO: { emoji: '🎭', background: '#F2E6D8' },
}

export const DEFAULT_THEME_STYLE = { emoji: '🏘️', background: '#EDEFF2' }

/** 랜드마크는 테마와 무관하게 눈에 띄게 한다. */
export const LANDMARK_STYLE = { emoji: '🗼', background: '#FFE9C7' }
