import type {
  DomainDetailDto,
  FriendDto,
  FriendRequestDto,
  FriendSheetDto,
  ItemSpotDto,
  LeaderboardDto,
  SheetDetailDto,
  SheetListDto,
  ShopBuildingDto,
  SubjectDetailDto,
  UserProfileDto,
  VillageLayoutDto,
  WeeklyReportDto,
} from '../api/types'
import type {
  Domain,
  Friend,
  FriendRequest,
  ItemSpot,
  LeaderboardEntry,
  Sheet,
  ShopItem,
  Subject,
  User,
  VillageLayout,
  WeeklyReport,
} from './types'

/**
 * 서버 DTO → 화면 모델. 변환은 전부 여기서만 한다.
 *
 * 서버가 null 을 줄 수 있는 자리가 많아(targetCount, achievementRate, isLiked …)
 * 화면에서 매번 방어하는 대신 이 경계에서 기본값을 채운다.
 */

export function toSubject(dto: SubjectDetailDto): Subject {
  const targetCount = dto.targetCount ?? 1
  const tryCount = dto.tryCount ?? 0
  const isDone = dto.isDone ?? false
  const isDoneToday = dto.isDoneToday ?? false
  const isDonePeriod = dto.isDonePeriod ?? false
  const countPerPeriod = dto.countPerPeriod ?? 1
  const currentPeriodCount = dto.currentPeriodCount ?? (isDoneToday ? 1 : 0)

  return {
    id: dto.subjectId,
    position: dto.position,
    title: dto.title,
    period: dto.period,
    point: dto.point ?? 0,
    targetCount,
    tryCount,
    isDone,
    isDonePeriod,
    countPerPeriod,
    currentPeriodCount,
    isDoneToday,
    /*
      서버 판단을 그대로 쓴다. 안 내려오는 옛 응답에서만 같은 규칙으로 메운다 —
      최종 완수도 아니고, 오늘 누른 것도 아니고, 이번 주기 횟수도 남아 있어야 누를 수 있다.
    */
    canExecute:
      dto.canExecute ?? (!isDone && !isDoneToday && currentPeriodCount < countPerPeriod),
    // 서버가 progress 를 안 주면(옛 응답) 횟수로 메운다.
    progress: dto.progress ?? (targetCount > 0 ? Math.round((tryCount / targetCount) * 100) : 0),
  }
}

export function toDomain(dto: DomainDetailDto): Domain {
  return {
    id: dto.domainId,
    position: dto.position,
    title: dto.title ?? '',
    subjects: (dto.subjects ?? []).map(toSubject).sort((a, b) => a.position - b.position),
  }
}

export function toSheetFromDetail(dto: SheetDetailDto): Sheet {
  return {
    id: dto.sheetId,
    title: dto.title,
    isOpen: dto.isOpen ?? false,
    likeCount: Number(dto.likeCount ?? 0),
    isLiked: dto.isLiked ?? false,
    achievementRate: Math.round(dto.achievementRate ?? 0),
    createdAt: dto.createdAt,
    expiredAt: dto.expiredAt,
    domains: (dto.domains ?? []).map(toDomain).sort((a, b) => a.position - b.position),
    terrain: null,
  }
}

export function toSheetFromList(dto: SheetListDto): Sheet {
  return {
    id: dto.sheetId,
    title: dto.title,
    isOpen: dto.isOpen ?? false,
    likeCount: Number(dto.likeCount ?? 0),
    isLiked: dto.isLiked ?? false,
    achievementRate: Math.round(dto.achievementRate ?? 0),
    createdAt: dto.createdAt,
    expiredAt: dto.expiredAt,
    domains: null,
    terrain: null,
  }
}

export function toSheetFromFriend(dto: FriendSheetDto, ownerName: string): Sheet {
  return {
    id: dto.sheetId,
    title: dto.title,
    isOpen: dto.isOpen ?? true,
    likeCount: Number(dto.likeCount ?? 0),
    isLiked: false,
    achievementRate: Math.round(dto.achievementRate ?? 0),
    createdAt: dto.createdAt,
    expiredAt: dto.expiredAt,
    domains: null,
    terrain: null,
    ownerName,
  }
}

export function toItemSpot(dto: ItemSpotDto): ItemSpot {
  return {
    domainPosition: dto.domainPosition,
    itemPosition: dto.itemPosition,
    domainIndex: dto.domainIndex,
    subjectPosition: dto.subjectPosition,
    subjectId: dto.subjectId,
    subjectTitle: dto.subjectTitle,
    progress: dto.progress,
    invenId: dto.invenId,
    itemId: dto.itemId,
    itemKey: dto.itemKey,
    name: dto.name,
    theme: dto.theme,
    type: dto.type,
    thumbnailUrl: dto.thumbnailUrl,
    dir: dto.dir ?? '0',
    isLandmarkSlot: dto.landmarkSlot ?? dto.domainPosition === 5,
  }
}

export function toVillageLayout(dto: VillageLayoutDto): VillageLayout {
  return {
    sheetId: dto.sheetId,
    terrain: dto.terrain,
    achievementRate: Math.round(dto.achievementRate ?? 0),
    spots: (dto.spots ?? []).map(toItemSpot),
  }
}

export function toUser(dto: UserProfileDto): User {
  return {
    id: dto.id,
    name: dto.name,
    uuid: dto.uuid,
    point: dto.point ?? 0,
    profileImageUrl: dto.profileImageUrl,
    createdAt: dto.createdAt,
  }
}

export function toFriend(dto: FriendDto): Friend {
  return {
    relationId: dto.friendRelationId,
    userId: dto.friendUserId,
    uuid: dto.uuid,
    name: dto.name,
    profileImage: dto.profileImage,
    createdAt: dto.createdAt,
  }
}

export function toFriendRequest(dto: FriendRequestDto): FriendRequest {
  return {
    requestId: dto.requestId,
    senderUuid: dto.senderUuid,
    senderName: dto.senderName,
    senderProfileImage: dto.senderProfileImage,
    createdAt: dto.createdAt,
  }
}

export function toShopItem(dto: ShopBuildingDto): ShopItem {
  return {
    itemId: dto.itemId,
    itemKey: dto.itemKey,
    name: dto.name,
    theme: dto.theme,
    type: dto.type,
    price: dto.price,
    owned: dto.owned,
    thumbnailUrl: dto.thumbnailUrl,
  }
}

export function toLeaderboard(dto: LeaderboardDto): {
  entries: LeaderboardEntry[]
  totalPages: number
} {
  return {
    totalPages: dto.totalPages ?? 1,
    entries: (dto.content ?? []).map((item) => ({
      rank: item.rank,
      sheetId: item.sheetId,
      title: item.title,
      name: item.name,
      likeCount: Number(item.likeCount ?? 0),
    })),
  }
}

export function toReport(dto: WeeklyReportDto): WeeklyReport {
  return {
    title: dto.title ?? '',
    summary: dto.summary ?? '',
    metrics: dto.metrics ?? [],
    strengths: dto.strengths ?? [],
    improvements: dto.improvements ?? [],
    sheets: (dto.sheets ?? []).map((s) => ({
      sheetId: s.sheetId,
      title: s.title,
      completedCount: s.completedCount ?? 0,
      targetCount: s.targetCount ?? 0,
      achievementRate: Math.round(s.achievementRate ?? 0),
      domains: s.domains ?? [],
    })),
  }
}

/* ─────────────────────────  화면 → 서버  ───────────────────────── */

/** 'YYYY-MM-DD' → 'YYYY-MM-DDT00:00:00'. expiredAt 이 LocalDateTime 이라 자정을 붙인다. */
export function toLocalDateTime(date: string): string {
  return date.includes('T') ? date : `${date}T00:00:00`
}

/**
 * 주기별 기본 목표 횟수(전체 기간 누적).
 *
 * <p>서버가 시트 기간과 주기당 횟수로 다시 계산하므로 이 값은 <b>참고용 하한</b>이다.
 * 0 이나 음수를 보내면 서버가 자동 산정으로 넘어간다 — 그쪽이 더 정확하다.
 */
export const DEFAULT_TARGET: Record<Subject['period'], number> = {
  DAILY: 30,
  WEEKLY: 12,
  MONTHLY: 6,
  NONE: 1,
}

/** 과제 1회당 기본 포인트. 서버 SubjectCreateRequest 의 point 로 보낸다. */
export const DEFAULT_POINT = 10
