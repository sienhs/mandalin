import * as api from '../api/endpoints'
import {
  DEFAULT_POINT,
  DEFAULT_TARGET,
  toFriend,
  toFriendRequest,
  toItemSpot,
  toLeaderboard,
  toLocalDateTime,
  toReport,
  toSheetFromDetail,
  toSheetFromFriend,
  toSheetFromList,
  toShopItem,
  toUser,
  toVillageLayout,
} from './adapters'
import type {
  AppNotification,
  Friend,
  FriendRequest,
  ItemSpot,
  LeaderboardEntry,
  OwnedBuilding,
  Period,
  PointLog,
  Sheet,
  ShopItem,
  Terrain,
  TodoItem,
  User,
  VillageLayout,
  WeeklyReport,
} from './types'

/**
 * 만다라트 생성 요청.
 *
 * <p>세부 목표 8개 × 과제 8개를 <b>빠짐없이</b> 담아야 한다. 서버가 개수를 강제하고,
 * 생성 이후에는 내용을 고칠 수 없다 — 빈 칸으로 저장되면 영영 채울 수 없기 때문이다.
 */
export type SheetDraft = {
  title: string
  isOpen: boolean
  expiredAt: string
  domains: Array<{
    position: number
    title: string
    subjects: Array<{
      position: number
      title: string
      period: Period
      /** 한 주기에 몇 번 할지(예: "주 3회" 의 3). 생략하면 1. */
      countPerPeriod?: number
    }>
  }>
}

/**
 * 화면과 서버 사이의 유일한 통로.
 *
 * 실제 백엔드(`apiGateway`)와 목업(`mockGateway`)이 같은 모양을 구현한다.
 * 스토어는 어느 쪽인지 모른 채 이 인터페이스만 부르므로, 서버가 없을 때도
 * 화면 전체를 그대로 돌려볼 수 있다.
 */
export type Gateway = {
  readonly kind: 'api' | 'mock'

  me(): Promise<User>
  updateName(name: string): Promise<void>
  logout(): Promise<void>

  listSheets(): Promise<Sheet[]>
  sheetDetail(sheetId: number): Promise<Sheet>
  createSheet(draft: SheetDraft): Promise<number>
  deleteSheet(sheetId: number): Promise<void>
  toggleLike(sheetId: number): Promise<{ isLiked: boolean; likeCount: number }>
  /** 만다라트 내용은 고칠 수 없다. 공개 여부만 예외다. */
  setVisibility(sheetId: number, isOpen: boolean): Promise<Sheet>

  todo(): Promise<TodoItem[]>
  completeSubjects(
    sheetId: number,
    subjectIds: number[],
  ): Promise<{ completedSubjectIds: number[]; earned: number; totalPoint: number }>

  shopList(): Promise<ShopItem[]>
  purchase(itemId: number): Promise<{ remainingPoint: number; paidPoint: number }>

  village(sheetId: number): Promise<{ terrain: Terrain; ownedCount: number }>
  setTerrain(sheetId: number, terrain: Terrain): Promise<Terrain>
  villageLayout(sheetId: number): Promise<VillageLayout>
  placeBuilding(
    sheetId: number,
    domainPosition: number,
    itemPosition: number,
    invenId: number | null,
  ): Promise<ItemSpot>
  /** 보유 건물 목록. 배치 화면에서 고를 수 있는 것들. */
  ownedBuildings(sheetId: number): Promise<OwnedBuilding[]>

  pointHistory(
    page: number,
  ): Promise<{ logs: PointLog[]; totalPages: number; currentPoint: number }>
  notifications(): Promise<{ actionRequiredCount: number; items: AppNotification[] }>

  friends(): Promise<Friend[]>
  friendRequests(): Promise<FriendRequest[]>
  friendSheets(friendUserId: number, ownerName: string): Promise<Sheet[]>
  searchUser(uuid: string): Promise<{ name: string; uuid: string; isFriend: boolean }>
  sendFriendRequest(uuid: string): Promise<void>
  acceptRequest(requestId: number): Promise<void>
  rejectRequest(requestId: number): Promise<void>
  removeFriend(friendRelationId: number): Promise<void>

  leaderboard(page: number): Promise<{ entries: LeaderboardEntry[]; totalPages: number }>

  weeklyReport(signal?: AbortSignal): Promise<WeeklyReport | null>
  createReport(signal?: AbortSignal): Promise<WeeklyReport>
}

/* ─────────────────────────  실제 백엔드  ───────────────────────── */

export const apiGateway: Gateway = {
  kind: 'api',

  me: async () => toUser(await api.auth.me()),
  updateName: async (name) => {
    await api.auth.updateName(name)
  },
  logout: () => api.auth.logout(),

  listSheets: async () => (await api.sheets.list()).map(toSheetFromList),
  sheetDetail: async (sheetId) => toSheetFromDetail(await api.sheets.detail(sheetId)),

  createSheet: (draft) =>
    api.sheets.create({
      title: draft.title,
      isOpen: draft.isOpen,
      expiredAt: toLocalDateTime(draft.expiredAt),
      domains: draft.domains.map((d) => ({
        position: d.position,
        title: d.title,
        subjects: d.subjects.map((s) => ({
          position: s.position,
          title: s.title,
          period: s.period,
          point: DEFAULT_POINT,
          /*
            targetCount(전체 기간 누적)는 서버가 시트 기간 x 주기당 횟수로 다시 계산한다.
            여기서 보내는 값은 서버가 자동 산정으로 넘어가지 않게 하는 하한일 뿐이다.
          */
          targetCount: DEFAULT_TARGET[s.period],
          countPerPeriod: s.countPerPeriod ?? 1,
        })),
      })),
    }),

  deleteSheet: (sheetId) => api.sheets.remove(sheetId),

  toggleLike: async (sheetId) => {
    const res = await api.sheets.toggleLike(sheetId)
    return { isLiked: res.isLiked, likeCount: Number(res.likeCount) }
  },

  setVisibility: async (sheetId, isOpen) =>
    toSheetFromDetail(await api.sheets.setVisibility(sheetId, isOpen)),

  todo: async () =>
    (await api.subjects.todo()).map((t) => ({
      subjectId: t.subjectId,
      // 서버가 직접 내려준다 — 예전처럼 시트 상세를 전부 받아 맵을 만들 필요가 없다.
      sheetId: t.sheetId,
      sheetTitle: t.sheetTitle ?? '',
      domainId: t.domainId,
      domainTitle: t.domainTitle,
      title: t.title,
      period: t.period,
      point: t.point ?? 0,
      targetCount: t.targetCount ?? 1,
      tryCount: t.tryCount ?? 0,
      position: t.position,
      isDone: t.isDone ?? false,
      isDoneToday: t.isDoneToday ?? false,
      progress: t.progress ?? 0,
    })),

  completeSubjects: async (sheetId, subjectIds) => {
    const res = await api.subjects.complete(sheetId, subjectIds)
    return {
      completedSubjectIds: res.completedSubjectIds ?? [],
      earned: Number(res.totalEarnedPoint ?? 0),
      totalPoint: Number(res.totalUserPoint ?? 0),
    }
  },

  shopList: async () => (await api.shop.buildings()).map(toShopItem),

  purchase: async (itemId) => {
    const res = await api.shop.purchase(itemId)
    return { remainingPoint: res.remainingPoint, paidPoint: res.paidPoint }
  },

  village: async (sheetId) => {
    const res = await api.village.get(sheetId)
    return { terrain: res.terrain, ownedCount: res.buildings?.length ?? 0 }
  },

  setTerrain: (sheetId, terrain) => api.village.setTerrain(sheetId, terrain),

  villageLayout: async (sheetId) => toVillageLayout(await api.village.layout(sheetId)),

  placeBuilding: async (sheetId, domainPosition, itemPosition, invenId) =>
    toItemSpot(await api.village.placeOne(sheetId, domainPosition, itemPosition, invenId)),

  ownedBuildings: async (sheetId) => {
    const res = await api.village.get(sheetId)
    return (res.buildings ?? []).map((b) => ({
      invenId: b.invenId,
      itemId: b.itemId,
      itemKey: b.itemKey,
      name: b.name,
      theme: b.theme,
      type: b.type,
      thumbnailUrl: b.thumbnailUrl,
      size: b.size ?? { width: 1, depth: 1, height: 1 },
    }))
  },

  pointHistory: async (page) => {
    const res = await api.points.history(page)
    return {
      currentPoint: res.currentPoint ?? 0,
      totalPages: Math.max(1, res.totalPages ?? 1),
      logs: (res.content ?? []).map((log) => ({
        logId: log.logId,
        subjectId: log.subjectId,
        subjectTitle: log.subjectTitle,
        domainTitle: log.domainTitle,
        earnedPoint: Number(log.earnedPoint ?? 0),
        createdAt: log.createdAt,
      })),
    }
  },

  notifications: async () => {
    const res = await api.notifications.list()
    return {
      actionRequiredCount: res.actionRequiredCount ?? 0,
      items: res.items ?? [],
    }
  },

  friends: async () => (await api.friends.list()).map(toFriend),
  friendRequests: async () => (await api.friends.receivedRequests()).map(toFriendRequest),
  friendSheets: async (friendUserId, ownerName) =>
    (await api.friends.publicSheets(friendUserId)).map((s) => toSheetFromFriend(s, ownerName)),

  searchUser: async (uuid) => {
    const res = await api.friends.search(uuid)
    return { name: res.name, uuid: res.uuid, isFriend: res.isFriend }
  },

  sendFriendRequest: (uuid) => api.friends.sendRequest(uuid),
  acceptRequest: (requestId) => api.friends.accept(requestId),
  rejectRequest: (requestId) => api.friends.reject(requestId),
  removeFriend: (friendRelationId) => api.friends.remove(friendRelationId),

  leaderboard: async (page) => toLeaderboard(await api.leaderboard.page(page, 10)),

  weeklyReport: async (signal) => {
    const dto = await api.reports.weekly(signal)
    return dto ? toReport(dto) : null
  },
  createReport: async (signal) => toReport(await api.reports.create(signal)),
}
