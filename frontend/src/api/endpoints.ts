import { BASE, apiFetch } from './client'
import type {
  FriendDto,
  FriendRequestDto,
  FriendSheetDto,
  ItemSpotDto,
  LeaderboardDto,
  LoginDto,
  NotificationDto,
  PointHistoryDto,
  PurchaseDto,
  RewardClaimDto,
  RewardTrackDto,
  SheetCreateBody,
  SheetDetailDto,
  SheetLikeDto,
  SheetListDto,
  ShopBuildingDto,
  SubjectCompleteDto,
  TerrainDto,
  TestAccountDto,
  TodoDto,
  UserProfileDto,
  UserSearchDto,
  VillageDto,
  VillageLayoutDto,
  WeeklyReportDto,
} from './types'

/* ─────────────────────────  인증  ───────────────────────── */

export const auth = {
  /**
   * 카카오 로그인 시작. 브라우저 자체를 백엔드로 넘긴다.
   *
   * <p>fetch 가 아니라 주소창을 옮기는 것이라 <b>BASE 를 반드시 붙여야 한다</b>.
   * 상대경로면 프론트 도메인(Vercel)으로 가는데, 거기엔 이 경로가 없어서 SPA 폴백이
   * index.html 을 돌려주고 404 화면이 뜬다. 로컬은 BASE 가 비어 있어 프록시를 탄다.
   */
  kakaoLoginUrl: () => `${BASE}/oauth2/authorization/kakao`,

  exchange: (code: string) =>
    apiFetch<LoginDto>('/api/auth/oauth/exchange', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  /**
   * 발급된 테스트 계정 아이디 목록. 비밀번호는 오지 않는다.
   *
   * <p>백엔드 스위치(`app.test-login.enabled`)가 꺼지면 컨트롤러가 등록되지 않아 404 이고,
   * 비밀번호가 설정되지 않았으면 빈 배열이다. 호출하는 쪽은 둘 다 오류로 다루지 않고
   * <b>입구를 그리지 않는 신호</b>로 쓴다.
   */
  testAccounts: () => apiFetch<TestAccountDto[]>('/api/auth/test/accounts'),

  /**
   * 테스트 계정으로 로그인.
   *
   * <p>응답이 카카오 교환(`exchange`)과 같은 모양이다 — 서버가 같은 메서드를 부르기 때문이다.
   * 리프레시 토큰은 본문에 없고 쿠키로 온다.
   *
   * <p>아이디가 없을 때와 비밀번호가 틀렸을 때가 <b>같은 401</b>이다. 어느 쪽이 틀렸는지
   * 화면에서 구분해 알려줄 수 없다(서버가 알려주지 않는다).
   */
  testLogin: (loginId: string, password: string) =>
    apiFetch<LoginDto>('/api/auth/test/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
    }),

  me: () => apiFetch<UserProfileDto>('/api/v1/users/me'),

  updateName: (name: string) =>
    apiFetch<string>('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  logout: () => apiFetch<void>('/api/auth/logout', { method: 'POST' }),
}

/* ─────────────────────────  시트  ───────────────────────── */

export const sheets = {
  list: () => apiFetch<SheetListDto[]>('/api/v1/sheets'),

  detail: (sheetId: number) => apiFetch<SheetDetailDto>(`/api/v1/sheets/${sheetId}`),

  /**
   * 생성. 서버가 세부 목표 8개 × 과제 8개를 <b>정확히</b> 요구한다 —
   * 만다라트는 생성 이후 내용을 고칠 수 없어서, 빈 칸으로 저장되면 영영 채울 수 없다.
   */
  create: (body: SheetCreateBody) =>
    apiFetch<number>('/api/v1/sheets', { method: 'POST', body: JSON.stringify(body) }),

  remove: (sheetId: number) =>
    apiFetch<void>(`/api/v1/sheets/${sheetId}`, { method: 'DELETE' }),

  toggleLike: (sheetId: number) =>
    apiFetch<SheetLikeDto>(`/api/v1/sheets/${sheetId}/likes`, { method: 'POST' }),

  /**
   * 공개 여부 변경 — 내용을 고치는 유일하지 않은 예외.
   * 제목·세부 목표·과제를 바꾸는 API 는 서버에 존재하지 않는다.
   */
  setVisibility: (sheetId: number, isOpen: boolean) =>
    apiFetch<SheetDetailDto>(`/api/v1/sheets/${sheetId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isOpen }),
    }),
}

/* ─────────────────────────  과제  ───────────────────────── */

export const subjects = {
  todo: () => apiFetch<TodoDto[]>('/api/v1/subjects/todo'),

  /**
   * 과제 수행 완료. 여러 개를 한 번에 보낼 수 있고, 적립된 포인트와 잔액이 함께 온다.
   * 포인트를 클라이언트에서 계산하지 않고 이 응답을 그대로 쓴다.
   */
  complete: (sheetId: number, subjectIds: number[]) =>
    apiFetch<SubjectCompleteDto>(`/api/v1/sheets/${sheetId}/subjects/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ subjectIds }),
    }),
}

/* ─────────────────────────  상점  ───────────────────────── */

export const shop = {
  buildings: () => apiFetch<ShopBuildingDto[]>('/api/v1/shop/buildings'),

  purchase: (itemId: number) =>
    apiFetch<PurchaseDto>(`/api/v1/shop/buildings/${itemId}/purchase`, { method: 'POST' }),
}

/* ─────────────────────────  마을  ───────────────────────── */

export const village = {
  /**
   * 시트별 마을(지형 + 보유 건물).
   */
  get: (sheetId: number) => apiFetch<VillageDto>(`/api/v1/village/sheets/${sheetId}`),

  setTerrain: (sheetId: number, terrain: TerrainDto) =>
    apiFetch<TerrainDto>(`/api/v1/village/sheets/${sheetId}/terrain`, {
      method: 'PUT',
      body: JSON.stringify({ terrain }),
    }),

  /** 타일 73칸의 배치. 어느 칸에 어떤 건물이 서 있는지. */
  layout: (sheetId: number) =>
    apiFetch<VillageLayoutDto>(`/api/v1/village/sheets/${sheetId}/spots`),

  /** 한 칸에 건물을 놓거나(invenId) 기본 스킨으로 되돌린다(null). */
  placeOne: (
    sheetId: number,
    domainPosition: number,
    itemPosition: number,
    invenId: number | null,
    dir: '0' | '90' | '180' | '270' = '0',
  ) =>
    apiFetch<ItemSpotDto>(
      `/api/v1/village/sheets/${sheetId}/spots/${domainPosition}/${itemPosition}`,
      { method: 'PATCH', body: JSON.stringify({ invenId, dir }) },
    ),

  placeMany: (
    sheetId: number,
    spots: Array<{
      domainPosition: number
      itemPosition: number
      invenId: number | null
      dir?: '0' | '90' | '180' | '270'
    }>,
  ) =>
    apiFetch<VillageLayoutDto>(`/api/v1/village/sheets/${sheetId}/spots`, {
      method: 'PUT',
      body: JSON.stringify({ spots }),
    }),
}

/* ─────────────────────────  포인트 · 알림  ───────────────────────── */

export const points = {
  history: (page = 0, size = 20) =>
    apiFetch<PointHistoryDto>(`/api/v1/users/me/point-history?page=${page}&size=${size}`),
}

export const notifications = {
  list: () => apiFetch<NotificationDto>('/api/v1/notifications'),
}

/* ─────────────────────────  친구  ───────────────────────── */

export const friends = {
  list: () => apiFetch<FriendDto[]>('/api/v1/friends'),

  search: (uuid: string) =>
    apiFetch<UserSearchDto>(`/api/v1/friends/search?uuid=${encodeURIComponent(uuid)}`),

  publicSheets: (friendUserId: number) =>
    apiFetch<FriendSheetDto[]>(`/api/v1/friends/${friendUserId}/sheets`),

  sendRequest: (targetUuid: string) =>
    apiFetch<void>('/api/v1/friends/requests', {
      method: 'POST',
      body: JSON.stringify({ targetUuid }),
    }),

  receivedRequests: () => apiFetch<FriendRequestDto[]>('/api/v1/friends/requests'),

  accept: (requestId: number) =>
    apiFetch<void>(`/api/v1/friends/requests/${requestId}/accept`, { method: 'PATCH' }),

  reject: (requestId: number) =>
    apiFetch<void>(`/api/v1/friends/requests/${requestId}/reject`, { method: 'PATCH' }),

  /**
   * 친구 삭제.
   *
   * <p>경로 변수 이름이 `friendId` 지만 <b>유저 ID 가 아니라 친구 관계 ID</b>(`friendRelationId`)
   * 다. 바로 위 `publicSheets` 의 같은 자리는 유저 ID 라서 헷갈리기 쉽다 —
   * 유저 ID 를 보내면 보통 FRIEND_NOT_FOUND 이고, 값이 겹치면 엉뚱한 친구가 지워진다.
   */
  remove: (friendRelationId: number) =>
    apiFetch<void>(`/api/v1/friends/${friendRelationId}`, { method: 'DELETE' }),
}

/* ─────────────────────────  리더보드 · 리포트  ───────────────────────── */

export const leaderboard = {
  /** 페이지 응답이다 — `{ totalPages, content }` 로 감싸여 온다. */
  page: (page = 0, size = 10) =>
    apiFetch<LeaderboardDto>(`/api/v1/leaderboard?page=${page}&size=${size}`),
}

export const reports = {
  weekly: (signal?: AbortSignal) =>
    apiFetch<WeeklyReportDto | null>('/api/v1/reports', { signal }),

  create: (signal?: AbortSignal) =>
    apiFetch<WeeklyReportDto>('/api/v1/reports', { method: 'POST', signal }),
}

/* ─────────────────────────  마일스톤 보상  ───────────────────────── */

export const rewards = {
  /**
   * 보상 트랙. 구간 8개의 보상 종류·도달·수령 여부가 <b>한 번에</b> 온다.
   *
   * <p>시트별이 아니라 <b>계정별</b> 조회다 — 판정에 쓰는 시트를 서버가 골라 `sheetId` 로
   * 알려준다(가장 먼저 만든 시트). 그래서 경로에 시트 번호가 없다.
   */
  track: () => apiFetch<RewardTrackDto>('/api/v1/rewards/track'),

  /**
   * 구간 하나 수령. <b>계정당 구간별 1회.</b>
   *
   * <p>이미 받았으면 409, 아직 못 미쳤으면 400 이다. 도달 여부는 서버가 다시 확인하므로
   * 화면이 잠긴 상자를 눌러도 보상이 새지 않는다.
   */
  claim: (milestone: number) =>
    apiFetch<RewardClaimDto>(`/api/v1/rewards/track/${milestone}/claim`, { method: 'POST' }),
}
