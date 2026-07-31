/**
 * 그룹 만다라트 화면의 데이터 타입.
 *
 * 서버 응답(GroupDetailResponse)과 같은 모양으로 둔다 — 두 벌로 만들면 서버가 필드를 바꿔도
 * 프런트 타입은 조용히 맞는 척한다.
 */

/** 멤버가 그룹에 내놓은 도메인 하나 */
export type GroupDomainSummary = {
  domainId: number
  title: string
  /** 그룹 만다라트의 도메인 자리 1~8 */
  slotIndex: number
  /** 완료한 과제 수 (최대 8) */
  completedSubjectCount: number
  /** 도메인 달성률 0~100 */
  achievementRate: number
}

/** 그룹 멤버 한 명의 기여 */
export type GroupMemberContribution = {
  userId: number
  name: string
  isCreator: boolean
  /** 이 멤버가 낸 도메인들의 달성률 0~100 */
  memberAchievementRate: number
  domains: GroupDomainSummary[]
}

/** 그룹 만다라트 한 장 */
export type GroupDetail = {
  groupId: number
  title: string
  creatorId: number
  creatorName: string
  /** 중앙 랜드마크 건물. 3D 뷰에서 쓴다. */
  landmarkBuildingId: number | null
  /** 그룹 전체 달성률 0~100 */
  groupAchievementRate: number
  /** 채워진 도메인 자리 수 (최대 8) */
  mappedDomainCount: number
  members: GroupMemberContribution[]
  createdAt: string
}
