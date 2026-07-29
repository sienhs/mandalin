import type { SubjectTemplate } from './sheet.types'

/** 아직 입력하지 않은 칸에 보여줄 안내 문구. 값이 비었는지 판단하는 기준으로도 쓴다. */
export const PLACEHOLDER = {
  sheet: '+핵심 목표 추가',
  domain: '+도메인 추가',
  subject: '+태스크 추가',
} as const

/** 초기 핵심 목표 */
export const INITIAL_MAIN_GOAL = '건강한 몸 만들기'

/** 각 도메인의 색. light = 일반 태스크 칸, dark = 도메인(라벨) 칸 */
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

/** 사이드 패널의 추천 과제 목록 */
export const TASK_RECOMMEND: SubjectTemplate[] = [
  { emoji: '🥗', title: '샐러드 1끼 먹기', domainName: '식단', period: 'daily' },
  { emoji: '🚫', title: '당류 섭취 줄이기', domainName: '식단', period: 'none' },
  { emoji: '💊', title: '영양제 챙겨 먹기', domainName: '식단', period: 'daily' },
]

/** 추가할 수 있는 과제 목록의 페이지 버튼 */
export const PAGES = ['‹', '1', '2', '3', '›']

/** 만다라트 한 장의 전체 칸 수 (9x9) */
export const TOTAL_CELLS = 81

/** 도메인 개수. 각 도메인이 가질 수 있는 과제 개수도 같다. */
export const DOMAIN_COUNT = 8
