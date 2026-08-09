/**
 * 화면이 쓰는 모델.
 *
 * 백엔드 DTO(`api/types.ts`)에 최대한 맞췄다. 목업 때는 화면 편의대로 정의했지만,
 * 실제 연동에서는 서버가 가진 것만 그릴 수 있다. 서버에 없는 값(예: 과제 시작일,
 * 친구 달성률)은 만들어 내지 않고 화면에서 뺐다.
 */

/**
 * 백엔드 SubjectPeriod 와 같은 4단계.
 *
 * <p>⚠️ 서버의 `SubjectPeriod.fromValue` 는 모르는 값을 조용히 `NONE` 으로 떨어뜨린다.
 * 여기에 값을 더하면서 서버 enum 을 안 고치면 오류 없이 <b>다른 주기로 저장</b>되므로
 * 두 곳을 항상 함께 고친다.
 */
export type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE'

/**
 * 한 주기에 허용하는 최대 수행 횟수. 서버 스키마(count_per_period)와 같은 규칙이다.
 *
 * <p>1 이면 사용자가 정할 것이 없다 — 매일은 하루 한 번, 한번은 기간 내 딱 한 번이다.
 */
export const PERIOD_MAX_COUNT: Record<Period, number> = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
  NONE: 1,
}

export type Subject = {
  id: number
  position: number
  title: string
  period: Period
  /** 과제 1회 완료 시 적립되는 포인트. 서버가 과제마다 정한다. */
  point: number
  targetCount: number
  /** 지금까지 수행한 횟수 */
  tryCount: number
  isDone: boolean
  /** 이번 주기(오늘/이번 주/이번 달)의 목표 횟수를 채웠는지. */
  isDonePeriod: boolean
  /** 한 주기에 몇 번 해야 하는지(예: "주 3회" 의 3). */
  countPerPeriod: number
  /** 이번 주기에 지금까지 몇 번 했는지. */
  currentPeriodCount: number
  /** 오늘 완료를 눌렀는지. */
  isDoneToday: boolean
  /**
   * 지금 수행 버튼을 누를 수 있는지 — 서버 판단을 그대로 옮긴 값이다.
   *
   * <p>화면이 `isDone`·`isDoneToday`·주기 내 횟수로 직접 판단하면 서버 규칙과 어긋나
   * "눌리지만 아무 일도 안 일어나는" 버튼이 된다. 이 한 값만 본다.
   */
  canExecute: boolean
  /** 0~100. 서버가 확정한 값 — 클라이언트에서 다시 계산하지 않는다. */
  progress: number
}

export type Domain = {
  id: number
  /** 0~7 */
  position: number
  title: string
  subjects: Subject[]
}

export type Terrain = 'CITY_ROAD' | 'DIRT_ROAD' | 'GRASS_PATH' | 'WATER_WAY'

export type Sheet = {
  id: number
  title: string
  isOpen: boolean
  likeCount: number
  isLiked: boolean
  /** 0~100. 목록/상세 모두 서버 값을 그대로 쓴다. */
  achievementRate: number
  /** 서버가 계산한 64개 과제의 평균 진행률. 이전 서버 응답에서는 없을 수 있다. */
  progress?: number
  createdAt: string
  expiredAt: string | null
  /** 목록 응답에는 도메인이 없다. 상세를 받아오기 전에는 null. */
  domains: Domain[] | null
  /** 마을 API 로 따로 받는다. 아직 안 받았으면 null. */
  terrain: Terrain | null
  ownerName?: string
}

/** `/api/v1/subjects/todo` 한 건. 매일 과제와 주간 과제가 함께 온다. */
export type TodoItem = {
  subjectId: number
  /** 완료 API 가 요구하는 값. 서버가 직접 내려준다. */
  sheetId: number
  sheetTitle: string
  domainId: number
  domainTitle: string
  title: string
  period: Period
  point: number
  targetCount: number
  tryCount: number
  position: number
  isDone: boolean
  /** 매일 과제는 오늘, 주간 과제는 이번 주에 이미 했는지. */
  isDoneToday: boolean
  progress: number
}

/**
 * 마을 타일 한 칸.
 *
 * <p>격자 좌표(1~9)와 만다라트 번호(0~7)를 서버가 함께 내려준다.
 * 프론트에서 좌표 변환 규칙을 다시 구현하지 않는다 — 어긋나면 엉뚱한 칸이 자란다.
 */
export type ItemSpot = {
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
  dir: '0' | '90' | '180' | '270'
  isLandmarkSlot: boolean
}

export type VillageLayout = {
  sheetId: number
  terrain: Terrain
  achievementRate: number
  spots: ItemSpot[]
}

/**
 * 배치할 수 있는 보유 건물.
 *
 * <p>`invenId`(user_building.id)가 배치 API 가 받는 값이다. `itemId`(카탈로그)와 다르다 —
 * 같은 건물을 두 개 가질 수는 없지만, 참조하는 테이블이 달라 값이 겹치지 않는다.
 */
export type OwnedBuilding = {
  invenId: number
  itemId: number
  itemKey: string
  name: string
  theme: string
  type: 'NORMAL' | 'LANDMARK'
  thumbnailUrl: string | null
  /** 3D 마을이 높이순으로 자동 배치할 때 쓴다. */
  size: { width: number; depth: number; height: number }
}

export type PointLog = {
  logId: number
  subjectId: number
  subjectTitle: string
  domainTitle: string
  earnedPoint: number
  createdAt: string
}

export type AppNotification = {
  kind: 'FRIEND_REQUEST' | 'GROUP_INVITE' | 'TODO_REMAINING'
  referenceId: number | null
  title: string
  body: string
  actionRequired: boolean
  createdAt: string | null
}

export type ShopItem = {
  itemId: number
  itemKey: string
  name: string
  theme: string
  type: 'NORMAL' | 'LANDMARK'
  price: number
  owned: boolean
  thumbnailUrl: string | null
}

export type Friend = {
  relationId: number
  userId: number
  uuid: string
  name: string
  profileImage: string | null
  createdAt: string
}

export type FriendRequest = {
  requestId: number
  senderUuid: string
  senderName: string
  senderProfileImage: string | null
  createdAt: string
}

export type LeaderboardEntry = {
  rank: number
  sheetId: number
  title: string
  name: string
  likeCount: number
}

export type WeeklyReport = {
  title: string
  summary: string
  metrics: Array<{ label: string; value: string }>
  strengths: string[]
  improvements: string[]
  sheets: Array<{
    sheetId: number
    title: string
    completedCount: number
    targetCount: number
    achievementRate: number
    domains: Array<{ label: string; value: number }>
  }>
}

export type User = {
  id: number
  name: string
  uuid: string
  point: number
  profileImageUrl: string | null
  createdAt: string
}

/* ─────────────────────────  마일스톤 보상  ───────────────────────── */

export type RewardKind = 'CREDIT' | 'LANDMARK'

/**
 * 보상 구간 하나.
 *
 * <p>구간 폭(12.5%)과 보상표는 <b>서버가 정본</b>이다(`RewardTrack.java`). 화면은 진행률에서
 * 구간을 다시 계산하지 않고 이 배열을 그대로 그린다 — 규칙을 양쪽에 복제하면 한쪽만
 * 고쳤을 때 "화면에는 열렸는데 눌러도 못 받는" 상자가 생긴다.
 */
export type RewardMilestone = {
  /** 1~8 */
  milestone: number
  percent: number
  kind: RewardKind
  /** CREDIT 구간의 지급 포인트. LANDMARK 면 null. */
  creditAmount: number | null
  reached: boolean
  claimed: boolean
  grantedPoint: number | null
  /** 이미 수령한 구간이 준 랜드마크 이름. 아직 안 받았으면 빈 배열. */
  grantedNames: string[]
}

export type RewardTrack = {
  /** 보상 판정에 쓰는 시트(가장 먼저 만든 것). 이 시트에만 선물상자를 그린다. */
  sheetId: number | null
  /**
   * 판정 시트의 진행률(%). **이름과 달리 담기는 값은 `Sheet.progress`** — 과제별 진행률의
   * 평균이고, 헤더의 진행률 링·랜드마크 성장 단계와 같은 수다. 이름만 예전 것이 남았다.
   */
  achievementRate: number
  milestones: RewardMilestone[]
}

export type RewardLandmark = {
  itemId: number
  itemKey: string
  name: string
  thumbnailUrl: string | null
}

/** 수령 결과. 랜덤 랜드마크가 여기서 처음 밝혀진다. */
export type RewardClaimResult = {
  milestone: number
  kind: RewardKind
  grantedPoint: number | null
  landmarks: RewardLandmark[]
  currentPoint: number
  /** 랜드마크 구간인데 전종을 이미 보유해 크레딧으로 대체된 경우. */
  fallbackFromLandmark: boolean
}

/** 서버에서 오는 데이터의 로딩 상태. 화면이 스켈레톤/에러/빈 상태를 구분해 그린다. */
export type Loadable<T> = {
  data: T
  loading: boolean
  error: string | null
}

export const PERIOD_LABEL: Record<Period, string> = {
  DAILY: '매일',
  WEEKLY: '주 단위',
  MONTHLY: '월 단위',
  NONE: '기간 내',
}

export const TERRAIN_LABEL: Record<Terrain, string> = {
  GRASS_PATH: '초원',
  CITY_ROAD: '도심',
  WATER_WAY: '물길',
  DIRT_ROAD: '흙길',
}
