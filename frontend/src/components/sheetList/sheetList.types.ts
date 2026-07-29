/**
 * 내 만다라트 목록 화면의 데이터 타입.
 *
 * 생성 화면(components/sheet)이 다루는 Sheet · Domain · Subject 전체 구조와 달리,
 * 목록 화면은 카드 한 장에 필요한 요약 정보만 본다.
 * 필드명은 서버가 내려주는 JSON 키(camelCase)를 따른다.
 */

/**
 * 목록 화면 카드의 색 테마. sheet-card--* 클래스와 이름이 맞아야 한다.
 * 서버가 내려주는 값이 아니라 화면에서 정한다(sheetList.utils 의 themeOfSheet).
 */
export type SheetCardTheme = 'green' | 'blue' | 'amber'

/** 목록 화면의 만다라트 카드 하나. */
export type SheetSummary = {
  sheetId: number //시트 아이디
  title: string //시트 이름
  isOpen: boolean //공개 여부
  likeCount: number //좋아요 수
  achievementRate: number //달성률
  createdAt: string //'YYYY-MM-DD'
  expiredAt: string //'YYYY-MM-DD'
}

/**
 * 받은 그룹 만다라트 초대 하나.
 * 그룹을 나타내는 아이콘은 쓰지 않는다. 서버가 그룹별 이모지를 내려주게 되면
 * 그때 필드를 추가한다.
 */
export type GroupInvite = {
  groupId: number
  groupTitle: string
  inviterName: string //초대한 사람 이름
}

/** 목록 화면의 그룹 만다라트 카드 하나. */
export type GroupSheetSummary = {
  groupId: number
  groupTitle: string
  doneGoals: number //완료한 목표 수
  memberCount: number //참여 멤버 수
  achievementRate: number //달성률 0~100
}
