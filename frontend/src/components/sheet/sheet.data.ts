/** 아직 입력하지 않은 칸에 보여줄 안내 문구. 값이 비었는지 판단하는 기준으로도 쓴다. */
export const PLACEHOLDER = {
  sheet: '+핵심 목표 추가',
  domain: '+도메인 추가',
  subject: '+과제 추가',
} as const

/** 초기 핵심 목표 */
export const INITIAL_MAIN_GOAL = '건강한 몸 만들기'

/** 각 도메인의 색. light = 일반 과제 칸, dark = 도메인(라벨) 칸 */
export const DOMAIN_COLORS: Record<number, { light: string; dark: string }> = {
  0: { light: 'bg-emerald-200 text-ink-900', dark: 'bg-emerald-500 text-white' },
  1: { light: 'bg-red-300 text-ink-900', dark: 'bg-red-500 text-white' },
  2: { light: 'bg-orange-300 text-ink-900', dark: 'bg-orange-500 text-white' },
  3: { light: 'bg-sky-300 text-ink-900', dark: 'bg-sky-500 text-white' },
  4: { light: 'bg-ink-900 text-white', dark: 'bg-ink-900 text-white' },
  5: { light: 'bg-violet-300 text-ink-900', dark: 'bg-violet-500 text-white' },
  6: { light: 'bg-amber-200 text-ink-900', dark: 'bg-amber-500 text-white' },
  7: { light: 'bg-pink-300 text-ink-900', dark: 'bg-pink-500 text-white' },
  8: { light: 'bg-blue-300 text-ink-900', dark: 'bg-blue-500 text-white' },
}

/** 만다라트 한 장의 전체 칸 수 (9x9) */
export const TOTAL_CELLS = 81

/** 도메인 개수. 각 도메인이 가질 수 있는 과제 개수도 같다. */
export const DOMAIN_COUNT = 8
