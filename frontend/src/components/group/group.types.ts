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

/**
 * 그룹 도시 가운데에 놓는 랜드마크.
 *
 * buildingId 는 그룹 생성 요청의 centerBuildingId(팀장이 보유한 랜드마크 인벤토리 아이디)다.
 * icon 은 목업 편의용이다 — 실제 응답은 3D parts(또는 thumbnailUrl)를 주므로 그때 교체한다.
 */
export type GroupLandmark = {
  buildingId: number
  name: string
  icon: string
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
