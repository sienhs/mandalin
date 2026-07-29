/**
 * 내 만다라트 목록 화면의 데이터 타입.
 *
 * 생성 화면(components/sheet)이 다루는 Sheet · Domain · Subject 전체 구조와 달리,
 * 목록 화면은 카드 한 장에 필요한 요약 정보만 본다.
 * 필드명은 서버가 내려주는 JSON 키(camelCase)를 따른다.
 */

/** 목록 화면 카드의 색 테마. sheet-card--* 클래스와 이름이 맞아야 한다. */
export type SheetCardTheme = 'green' | 'blue' | 'amber'

/** 목록 화면의 만다라트 카드 하나. */
export type SheetSummary = {
  id: number
  title: string
  isOpen: boolean //공개 여부
  startDate: string //'YYYY-MM-DD'
  endDate: string //'YYYY-MM-DD'
  totalGoals: number //전체 목표 수
  achievementRate: number //달성률 0~100. 서버 SheetDetailResponse.achievementRate 와 같은 값.
  theme: SheetCardTheme
}

/** 초대 항목 아이콘의 색 테마. invite-icon--* 클래스와 이름이 맞아야 한다. */
export type InviteIconTheme = 'blue' | 'pink'

/** 받은 그룹 만다라트 초대 하나. */
export type GroupInvite = {
  id: number
  groupTitle: string
  inviterName: string //초대한 사람 이름
  emoji: string //그룹 대표 이모지
  iconTheme: InviteIconTheme
}

/** 목록 화면의 그룹 만다라트 카드 하나. */
export type GroupSheetSummary = {
  id: number
  title: string
  totalGoals: number //전체 목표 수
  doneGoals: number //완료한 목표 수
  memberCount: number //참여 멤버 수
  achievementRate: number //달성률 0~100
}
