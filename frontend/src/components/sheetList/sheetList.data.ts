import type {
  GroupInvite,
  GroupSheetSummary,
  SheetCardTheme,
  SheetSummary,
} from './sheetList.types'


//만다라트 한 장의 과제 수. 
export const TOTAL_GOALS = 64

/** 카드에 돌려 쓸 색 테마. themeOfSheet 가 시트 아이디로 하나를 고른다. */
export const CARD_THEMES: SheetCardTheme[] = ['green', 'blue', 'amber']


//목록 화면 목업 데이터.
export const MY_SHEETS: SheetSummary[] = [
  {
    sheetId: 1,
    title: '건강한 몸 만들기',
    isOpen: true,
    likeCount: 12,
    achievementRate: 32,
    createdAt: '2026-06-01',
    expiredAt: '2026-06-30',
  },
  {
    sheetId: 2,
    title: 'ios 개발자 취업',
    isOpen: false,
    likeCount: 0,
    achievementRate: 58,
    createdAt: '2026-01-01',
    expiredAt: '2026-12-31',
  },
  {
    sheetId: 3,
    title: 'ios 개발자 취업',
    isOpen: false,
    likeCount: 4,
    achievementRate: 41,
    createdAt: '2026-03-01',
    expiredAt: '2026-12-31',
  },
]

export const GROUP_SHEETS: GroupSheetSummary[] = [
  {
    groupId: 1,
    groupTitle: '스터디 그룹-알고리즘 마스터',
    doneGoals: 23,
    memberCount: 4,
    achievementRate: 31,
  },
]

// 받은 그룹 초대 목업.
export const GROUP_INVITES: GroupInvite[] = [
  { groupId: 1, groupTitle: '꾸준한 독서 모임', inviterName: '도현' },
  { groupId: 2, groupTitle: '운동 크루', inviterName: '민지' },
]
