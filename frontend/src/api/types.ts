/**
 * 백엔드 DTO 를 그대로 옮긴 타입.
 *
 * 화면에서 쓰는 모델(`data/types.ts`)과 이름이 겹치는 것이 있는데 일부러 분리했다 —
 * 서버 응답은 서버 사정으로 바뀌고, 그 변화가 화면까지 번지지 않도록 `data/adapters.ts`
 * 한 곳에서만 변환한다.
 */

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

/* ─────────────────────────  인증  ───────────────────────── */

export type UserProfileDto = {
  id: number
  kakaoId: string | null
  name: string
  uuid: string
  point: number
  profileImageUrl: string | null
  createdAt: string
  deletedAt: string | null
}

export type LoginDto = UserProfileDto & { accessToken: string }

/**
 * 테스트 계정 한 줄.
 *
 * 백엔드 `app.test-login.enabled` 가 꺼져 있으면 목록 조회가 404 라서 이 타입의 값이 아예
 * 오지 않는다 — 로그인 화면은 그때 입구를 그리지 않는다.
 */
export type TestAccountDto = {
  slot: number
  name: string
  /** 친구 코드. 테스터끼리 친구 요청을 보내 볼 때 쓴다. */
  uuid: string
}

/* ─────────────────────────  시트  ───────────────────────── */

/** 백엔드 SubjectPeriod 와 1:1. 값을 더할 때는 서버 enum 도 함께 고쳐야 한다. */
export type SubjectPeriodDto = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE'

export type SubjectDetailDto = {
  subjectId: number
  position: number
  title: string
  period: SubjectPeriodDto
  point: number
  targetCount: number | null
  tryCount: number | null
  isDone: boolean
  isDonePeriod: boolean
  /** 한 주기에 몇 번 해야 하는지(예: "주 3회" 의 3). */
  countPerPeriod: number | null
  /** 이번 주기에 지금까지 몇 번 했는지. */
  currentPeriodCount: number | null
  /** 오늘 완료를 눌렀는지. */
  isDoneToday: boolean | null
  /**
   * 지금 수행 버튼을 누를 수 있는지 — <b>서버가 판단해 내려준다.</b>
   *
   * <p>클라이언트가 같은 규칙을 다시 계산하면(최종 완수 · 오늘 여부 · 주기 내 횟수) 반드시
   * 어긋난다. 서버의 판단을 그대로 쓴다.
   */
  canExecute: boolean | null
  /** 0~100. 서버가 확정한 값이라 클라이언트에서 다시 계산하지 않는다. */
  progress: number
}

export type DomainDetailDto = {
  domainId: number
  /** 0~7 */
  position: number
  title: string
  subjects: SubjectDetailDto[]
}

export type SheetDetailDto = {
  sheetId: number
  userId: number
  title: string
  isOpen: boolean
  likeCount: number
  isLiked: boolean | null
  achievementRate: number | null
  /** 0~100. 64개 과제의 개별 진행률 평균. */
  progress: number | null
  createdAt: string
  expiredAt: string | null
  domains: DomainDetailDto[]
}

export type SheetListDto = {
  sheetId: number
  title: string
  isOpen: boolean
  likeCount: number
  /** 목록에서도 좋아요 여부를 알 수 있다. */
  isLiked: boolean | null
  achievementRate: number | null
  /** 0~100. 64개 과제의 개별 진행률 평균. */
  progress: number | null
  createdAt: string
  expiredAt: string | null
}

export type SheetLikeDto = {
  sheetId: number
  isLiked: boolean
  likeCount: number
}

export type SheetCreateBody = {
  title: string
  isOpen: boolean
  expiredAt: string
  domains: Array<{
    position: number
    title: string
    subjects: Array<{
      position: number
      title: string
      period: SubjectPeriodDto
      point: number
      targetCount: number
      /**
       * 한 주기에 몇 번 수행하는가(예: "주 3회" 의 3).
       *
       * <p>전체 기간 누적 목표(targetCount)와 단위가 다르다 — 서버가 이 값에
       * 시트 기간의 주기 수를 곱해 targetCount 를 다시 산정한다.
       */
      countPerPeriod: number
    }>
  }>
}

/* ─────────────────────────  과제  ───────────────────────── */

export type TodoDto = {
  subjectId: number
  /** 완료 API 가 요구하는 값. 이 필드가 생겨서 시트 상세를 전부 받지 않아도 된다. */
  sheetId: number
  sheetTitle: string
  domainId: number
  domainTitle: string
  title: string
  period: SubjectPeriodDto
  point: number
  targetCount: number
  tryCount: number
  position: number
  isDone: boolean
  /** 매일 과제는 오늘, 주간 과제는 이번 주에 이미 했는지. */
  isDoneToday: boolean
  progress: number
}

export type SubjectCompleteDto = {
  completedSubjectIds: number[]
  totalEarnedPoint: number
  totalUserPoint: number
}

/* ─────────────────────────  상점 · 마을  ───────────────────────── */

export type BuildingSizeDto = { width: number; depth: number; height: number }

export type ShopBuildingDto = {
  itemId: number
  itemKey: string
  name: string
  theme: string
  type: 'NORMAL' | 'LANDMARK'
  price: number
  owned: boolean
  thumbnailUrl: string | null
  size: BuildingSizeDto
}

export type PurchaseDto = {
  itemId: number
  itemKey: string
  paidPoint: number
  remainingPoint: number
}

export type TerrainDto = 'CITY_ROAD' | 'DIRT_ROAD' | 'GRASS_PATH' | 'WATER_WAY'

export type OwnedBuildingDto = {
  /** user_building.id — 배치 API 가 받는 값. 카탈로그 itemId 와 다르다. */
  invenId: number
  itemId: number
  itemKey: string
  name: string
  theme: string
  type: 'NORMAL' | 'LANDMARK'
  thumbnailUrl: string | null
  size: BuildingSizeDto
  parts: unknown
}

export type VillageDto = {
  terrain: TerrainDto
  buildings: OwnedBuildingDto[]
}

/**
 * 마을 타일 한 칸.
 *
 * <p>격자 좌표(domainPosition·itemPosition, 1~9)와 만다라트 번호(domainIndex·subjectPosition,
 * 0~7)가 함께 온다. 서버가 둘을 이어 주므로 프론트에서 변환 규칙을 다시 구현하지 않는다.
 */
export type ItemSpotDto = {
  domainPosition: number
  itemPosition: number
  domainIndex: number | null
  subjectPosition: number | null
  subjectId: number | null
  subjectTitle: string | null
  progress: number | null
  invenId: number | null
  itemId: number | null
  itemKey: string | null
  name: string | null
  theme: string | null
  type: 'NORMAL' | 'LANDMARK' | null
  thumbnailUrl: string | null
  size: BuildingSizeDto | null
  dir: '0' | '90' | '180' | '270'
  landmarkSlot: boolean
}

export type VillageLayoutDto = {
  sheetId: number
  terrain: TerrainDto
  achievementRate: number
  spots: ItemSpotDto[]
}

/* ─────────────────────────  포인트 · 알림  ───────────────────────── */

export type PointHistoryDto = {
  currentPoint: number
  totalPages: number
  totalElements: number
  content: Array<{
    logId: number
    subjectId: number
    subjectTitle: string
    domainTitle: string
    earnedPoint: number
    createdAt: string
  }>
}

export type NotificationDto = {
  actionRequiredCount: number
  items: Array<{
    kind: 'FRIEND_REQUEST' | 'GROUP_INVITE' | 'TODO_REMAINING'
    referenceId: number | null
    title: string
    body: string
    actionRequired: boolean
    createdAt: string | null
  }>
}

/* ─────────────────────────  친구  ───────────────────────── */

export type FriendDto = {
  friendRelationId: number
  friendUserId: number
  uuid: string
  name: string
  profileImage: string | null
  createdAt: string
}

export type FriendRequestDto = {
  requestId: number
  senderUuid: string
  senderName: string
  senderProfileImage: string | null
  progress: 'NOT_READ' | 'READ' | 'ACCEPTED'
  createdAt: string
}

export type UserSearchDto = {
  userId: number
  uuid: string
  name: string
  profileImage: string | null
  isFriend: boolean
}

export type FriendSheetDto = {
  sheetId: number
  title: string
  isOpen: boolean
  likeCount: number
  achievementRate: number | null
  createdAt: string
  expiredAt: string | null
}

/* ─────────────────────────  리더보드 · 리포트  ───────────────────────── */

export type LeaderboardItemDto = {
  rank: number
  sheetId: number
  title: string
  name: string
  likeCount: number
}

export type LeaderboardDto = {
  totalPages: number
  content: LeaderboardItemDto[]
}

export type ReportMetricDto = { label: string; value: string }

export type ReportDomainDto = { label: string; value: number }

export type ReportSheetDto = {
  sheetId: number
  title: string
  completedCount: number
  targetCount: number
  achievementRate: number
  domains: ReportDomainDto[]
}

export type WeeklyReportDto = {
  title: string
  summary: string
  metrics: ReportMetricDto[]
  strengths: string[]
  improvements: string[]
  sheets: ReportSheetDto[]
}
