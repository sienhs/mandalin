
//목록 화면 카드의 색 테마. 
export type SheetCardTheme = 'green' | 'blue' | 'amber'

//목록 화면의 만다라트 카드 하나.
export type SheetSummary = {
  sheetId: number //시트 아이디
  title: string //시트 이름
  isOpen: boolean //공개 여부
  likeCount: number //좋아요 수
  achievementRate: number //달성률
  createdAt: string //'YYYY-MM-DD'
  expiredAt: string //'YYYY-MM-DD'
}

//받은 그룹 만다라트 초대 하나.
export type GroupInvite = {
  groupId: number
  groupTitle: string
  inviterName: string //초대한 사람 이름
}

//목록 화면의 그룹 만다라트 카드 하나.
export type GroupSheetSummary = {
  groupId: number
  groupTitle: string
  doneGoals: number //완료한 목표 수
  memberCount: number //참여 멤버 수
  achievementRate: number //달성률 0~100
}
