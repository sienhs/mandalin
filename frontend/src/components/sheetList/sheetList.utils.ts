import { CARD_THEMES } from './sheetList.data'
import type { SheetCardTheme } from './sheetList.types'

/**
 * 'YYYY-MM-DD' 또는 'YYYY-MM-DDTHH:mm:ss' → 'YYYY.MM.DD'
 * 서버(LocalDateTime)는 시각까지 붙여 내려주므로 앞 10자만 쓴다.
 */
export const toDottedDate = (value: string): string => value.slice(0, 10).replaceAll('-', '.')

/**
 * 카드 색은 서버가 내려주는 값이 아니라 화면에서 정한다.
 * 목록 순서가 아니라 시트 아이디를 기준으로 하므로, 다른 시트를 지우거나
 * 정렬이 바뀌어도 같은 시트는 계속 같은 색으로 보인다.
 */
export const themeOfSheet = (sheetId: number): SheetCardTheme =>
  CARD_THEMES[Math.abs(sheetId - 1) % CARD_THEMES.length]
