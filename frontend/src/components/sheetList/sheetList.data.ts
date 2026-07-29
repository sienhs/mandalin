import type { GroupSheetSummary, SheetSummary } from './sheetList.types'

/**
 * 목록 화면 목업 데이터.
 * TODO: GET /api/sheets (SheetListResponse) 연동 시 이 파일을 걷어낼 것.
 */
export const MY_SHEETS: SheetSummary[] = [
  {
    id: 1,
    title: '건강한 몸 만들기',
    isOpen: true,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    totalGoals: 64,
    achievementRate: 32,
    theme: 'green',
  },
  {
    id: 2,
    title: 'ios 개발자 취업',
    isOpen: false,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    totalGoals: 64,
    achievementRate: 58,
    theme: 'blue',
  },
  {
    id: 3,
    title: 'ios 개발자 취업',
    isOpen: false,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    totalGoals: 64,
    achievementRate: 41,
    theme: 'amber',
  },
]

export const GROUP_SHEETS: GroupSheetSummary[] = [
  {
    id: 1,
    title: '스터디 그룹-알고리즘 마스터',
    totalGoals: 64,
    doneGoals: 23,
    memberCount: 4,
    achievementRate: 31,
  },
]
