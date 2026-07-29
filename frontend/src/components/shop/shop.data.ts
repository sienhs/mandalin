/**
 * 테마별 표시 정보.
 *
 * 키는 백엔드 building_item.theme 값(대문자)이다. 백엔드에는 색·이모지·한글 이름이 없고
 * thumbnail_url 도 아직 전부 비어 있어, 건물을 한눈에 구분할 수 있게 프론트에서 정해 둔다.
 *
 * village/premium 의 PREMIUM_THEMES 에도 같은 라벨이 있지만 그 모듈은 3D 부품 설정을
 * 통째로 끌고 오므로 상점 화면에서 import 하지 않는다 — 번들에 three.js 설정이 딸려온다.
 */
export type ThemeStyle = {
  label: string
  emoji: string
  background: string
}

export const THEME_STYLES: Record<string, ThemeStyle> = {
  BASIC: { label: '기본', emoji: '🏠', background: '#E8EEF5' },
  SAKURA: { label: '벚꽃', emoji: '🌸', background: '#FBE4EC' },
  MEDIEVAL: { label: '중세', emoji: '🏰', background: '#E3DAC9' },
  SANTORINI: { label: '산토리니', emoji: '⛪', background: '#DFF1FB' },
  NORDIC: { label: '노르딕', emoji: '🌲', background: '#DCE9E3' },
  EGYPT: { label: '이집트', emoji: '🔺', background: '#F5E7C6' },
  CYBER: { label: '사이버펑크', emoji: '🌃', background: '#D9DCF5' },
  SCIFI: { label: 'SF 콜로니', emoji: '🛰️', background: '#DBE7F3' },
  STEAMPUNK: { label: '스팀펑크', emoji: '⚙️', background: '#EADFD2' },
  TROPICAL: { label: '트로피컬', emoji: '🌴', background: '#DCF3E4' },
  WEST: { label: '서부', emoji: '🤠', background: '#F0E2CE' },
  SEOUL: { label: '서울', emoji: '🏢', background: '#E5E9EE' },
  ARTDECO: { label: '아르데코', emoji: '🎭', background: '#F2E6D8' },
}

/** 알 수 없는 테마가 내려와도 카드가 비지 않게 한다. */
export const DEFAULT_THEME_STYLE: ThemeStyle = {
  label: '기타',
  emoji: '🏘️',
  background: '#EDEFF2',
}

export function themeStyleOf(theme: string): ThemeStyle {
  return THEME_STYLES[theme] ?? DEFAULT_THEME_STYLE
}
