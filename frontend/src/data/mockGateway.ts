import type { Gateway, SheetDraft } from './gateway'
import { DEFAULT_TARGET } from './adapters'
import { LANDMARK_CATALOG, SHOP_CATALOG } from './shopCatalog'
import type {
  AppNotification,
  Friend,
  FriendRequest,
  ItemSpot,
  Period,
  PointLog,
  RewardKind,
  RewardLandmark,
  Sheet,
  ShopItem,
  Subject,
  Terrain,
  TodoItem,
  User,
  VillageLayout,
  WeeklyReport,
} from './types'

/**
 * 서버 없이 도는 목업.
 *
 * 백엔드가 꺼져 있거나 로그인 왕복을 끝낼 수 없을 때 화면을 그대로 확인하려고 둔다.
 * `apiGateway` 와 같은 인터페이스라 스토어는 어느 쪽인지 신경 쓰지 않는다.
 * 상태는 localStorage 에만 남고 서버로 나가지 않는다.
 */

/**
 * localStorage 키. **끝의 버전을 올리면 저장분이 버려지고 `initial()` 이 다시 돈다.**
 *
 * <p>`load()` 는 저장분이 있으면 그대로 쓰므로, 카탈로그나 상태 모양을 바꿔도 이미 목업을
 * 켜 본 사람에게는 반영되지 않는다. 그때 올린다.
 *
 * <p>v3: 보유 목록에 랜드마크 13종 추가(`LANDMARK_CATALOG`). v2 저장분에는 랜드마크가 없어
 * 마을 정중앙이 계속 공사 부지로 남는다.
 *
 * <p>v4: 마일스톤 보상 수령 기록(`rewardClaims`) 추가. v3 저장분에는 그 필드가 없어
 * `state.rewardClaims[m]` 이 터진다.
 */
const KEY = 'mandarin.mock.v4'

let seq = 1000
const nextId = () => (seq += 1)

function subject(
  position: number,
  title: string,
  period: Period,
  ratio: number,
): Subject {
  const targetCount = DEFAULT_TARGET[period]
  const tryCount = Math.round(targetCount * ratio)
  const isDone = tryCount >= targetCount
  return {
    id: nextId(),
    position,
    title,
    period,
    point: 10,
    targetCount,
    tryCount,
    isDone,
    isDonePeriod: false,
    countPerPeriod: 1,
    currentPeriodCount: 0,
    isDoneToday: false,
    // 실제 서버와 같은 규칙으로 내려준다 — 화면은 이 값만 보고 버튼을 잠근다.
    canExecute: !isDone,
    progress: Math.round((tryCount / targetCount) * 100),
  }
}

function domain(position: number, title: string, rows: Array<[string, Period, number]>) {
  return {
    id: nextId(),
    position,
    title,
    subjects: rows.map(([t, p, r], i) => subject(i, t, p, r)),
  }
}

function sheetProgressOf(sheet: Sheet): number {
  const all = sheet.domains?.flatMap((d) => d.subjects) ?? []
  if (all.length === 0) return 0
  return Math.round(all.reduce((acc, s) => acc + s.progress, 0) / all.length)
}

function healthSheet(): Sheet {
  const sheet: Sheet = {
    id: 1,
    title: '건강한 몸 만들기',
    isOpen: true,
    likeCount: 42,
    isLiked: false,
    achievementRate: 0,
    createdAt: '2026-06-01T09:00:00',
    expiredAt: '2026-12-31T00:00:00',
    terrain: 'GRASS_PATH',
    domains: [
      domain(0, '규칙적인 운동', [
        ['주 3회 웨이트 트레이닝', 'WEEKLY', 0.75],
        ['아침 스트레칭 10분', 'DAILY', 0.9],
        ['퇴근길 한 정거장 걷기', 'DAILY', 0.63],
        ['주말 등산 가기', 'WEEKLY', 0.42],
        ['플랭크 3분 버티기', 'DAILY', 0.53],
        ['수영 강습 등록하기', 'NONE', 1],
        ['계단으로 올라가기', 'DAILY', 0.8],
        ['운동 일지 기록', 'DAILY', 0.47],
      ]),
      domain(1, '바른 식습관', [
        ['하루 물 2L 마시기', 'DAILY', 0.87],
        ['아침 거르지 않기', 'DAILY', 0.7],
        ['야식 끊기', 'DAILY', 0.4],
        ['채소 한 접시 챙기기', 'DAILY', 0.6],
        ['단백질 챙겨 먹기', 'DAILY', 0.55],
        ['식단 사진으로 남기기', 'DAILY', 0.33],
        ['외식 주 2회 이하', 'WEEKLY', 0.5],
        ['설탕 음료 줄이기', 'DAILY', 0.66],
      ]),
      domain(2, '충분한 수면', [
        ['12시 전에 잠들기', 'DAILY', 0.43],
        ['자기 전 휴대폰 멀리 두기', 'DAILY', 0.36],
        ['기상 시간 고정하기', 'DAILY', 0.73],
        ['낮잠 20분 이내', 'DAILY', 0.6],
        ['침실 조도 낮추기', 'NONE', 1],
        ['카페인 오후 2시 이후 금지', 'DAILY', 0.5],
        ['수면 기록 확인', 'WEEKLY', 0.58],
        ['주말에도 같은 시간 기상', 'WEEKLY', 0.25],
      ]),
      domain(3, '스트레스 관리', [
        ['명상 10분', 'DAILY', 0.3],
        ['감사 일기 쓰기', 'DAILY', 0.23],
        ['산책하며 통화하기', 'WEEKLY', 0.42],
        ['취미 시간 확보', 'WEEKLY', 0.33],
        ['일과 분리하기', 'DAILY', 0.4],
        ['상담 받아보기', 'NONE', 0],
        ['호흡 운동 배우기', 'NONE', 1],
        ['주말 디지털 디톡스', 'WEEKLY', 0.16],
      ]),
      domain(4, '체중 관리', [
        ['매일 아침 체중 재기', 'DAILY', 0.83],
        ['목표 체중 -5kg', 'NONE', 0],
        ['체지방률 기록', 'WEEKLY', 0.5],
        ['간식 칼로리 확인', 'DAILY', 0.36],
        ['한 달 사진 비교', 'NONE', 0],
        ['인바디 측정', 'WEEKLY', 0.33],
        ['식사량 손바닥 기준', 'DAILY', 0.46],
        ['체중 정체기 기록', 'WEEKLY', 0.25],
      ]),
      domain(5, '꾸준한 습관', [
        ['아침 루틴 지키기', 'DAILY', 0.7],
        ['하루 마무리 정리', 'DAILY', 0.53],
        ['주간 회고 쓰기', 'WEEKLY', 0.58],
        ['알람 한 번에 일어나기', 'DAILY', 0.43],
        ['정해진 시간에 운동', 'DAILY', 0.5],
        ['습관 체크리스트 갱신', 'WEEKLY', 0.41],
        ['빠진 날 이유 적기', 'WEEKLY', 0.33],
        ['한 달 개근 도전', 'NONE', 0],
      ]),
      domain(6, '정기 검진', [
        ['건강검진 예약', 'NONE', 1],
        ['치과 스케일링', 'NONE', 0],
        ['시력 검사', 'NONE', 0],
        ['혈압 기록', 'WEEKLY', 0.5],
        ['영양제 챙겨 먹기', 'DAILY', 0.63],
        ['가족력 정리', 'NONE', 1],
        ['검진 결과 기록', 'NONE', 0],
        ['필요한 예방접종 확인', 'NONE', 1],
      ]),
      domain(7, '활동적인 일상', [
        ['하루 8천 보 걷기', 'DAILY', 0.76],
        ['엘리베이터 대신 계단', 'DAILY', 0.6],
        ['주말 자전거 타기', 'WEEKLY', 0.33],
        ['1시간마다 일어나기', 'DAILY', 0.43],
        ['걷기 좋은 길 찾기', 'NONE', 1],
        ['근처 공원 산책', 'WEEKLY', 0.5],
        ['러닝 크루 참여', 'WEEKLY', 0.25],
        ['활동량 주간 비교', 'WEEKLY', 0.41],
      ]),
    ],
  }
  sheet.achievementRate = sheetProgressOf(sheet)
  return sheet
}

function devSheet(): Sheet {
  const sheet: Sheet = {
    id: 2,
    title: '프론트엔드 개발자 되기',
    isOpen: false,
    likeCount: 8,
    isLiked: true,
    achievementRate: 0,
    createdAt: '2026-07-15T02:30:00',
    expiredAt: '2027-03-31T00:00:00',
    terrain: 'CITY_ROAD',
    domains: [
      domain(0, '자바스크립트', [
        ['모던 JS 딥다이브 정독', 'WEEKLY', 0.25],
        ['비동기 처리 정리하기', 'NONE', 1],
        ['클로저 예제 만들어보기', 'NONE', 0],
        ['이벤트 루프 설명해보기', 'NONE', 0],
        ['타입 강제 변환 정리', 'NONE', 0],
        ['프로토타입 체인 그리기', 'NONE', 0],
        ['모듈 시스템 비교', 'NONE', 0],
        ['ES2024 문법 살펴보기', 'NONE', 0],
      ]),
      domain(1, '리액트', [
        ['공식 문서 완독', 'WEEKLY', 0.16],
        ['커스텀 훅 5개 만들기', 'NONE', 0],
        ['렌더링 최적화 실습', 'NONE', 0],
        ['상태관리 라이브러리 비교', 'NONE', 0],
        ['서버 컴포넌트 이해하기', 'NONE', 0],
        ['테스트 코드 작성', 'WEEKLY', 0.08],
        ['폼 처리 패턴 정리', 'NONE', 0],
        ['접근성 체크리스트 적용', 'NONE', 0],
      ]),
      domain(2, '알고리즘', [
        ['매일 한 문제 풀기', 'DAILY', 0.36],
        ['자료구조 복습', 'WEEKLY', 0.25],
        ['풀이 블로그에 정리', 'WEEKLY', 0.16],
        ['모의 코딩테스트', 'WEEKLY', 0.33],
        ['그래프 탐색 익히기', 'NONE', 0],
        ['DP 유형 정리', 'NONE', 0],
        ['시간복잡도 계산 연습', 'NONE', 0],
        ['스터디 참여하기', 'WEEKLY', 0.33],
      ]),
      domain(3, '포트폴리오', [
        ['개인 프로젝트 완성', 'NONE', 0],
        ['깃허브 리드미 정리', 'NONE', 1],
        ['배포까지 해보기', 'NONE', 0],
        ['README 스크린샷 넣기', 'NONE', 0],
        ['기술 선택 이유 적기', 'NONE', 0],
        ['성능 개선 기록 남기기', 'NONE', 0],
        ['코드 리뷰 받아보기', 'NONE', 0],
        ['데모 영상 찍기', 'NONE', 0],
      ]),
      domain(4, 'CS 기초', []),
      domain(5, '협업', []),
      domain(6, '영어', []),
      domain(7, '취업 준비', []),
    ],
  }
  sheet.achievementRate = sheetProgressOf(sheet)
  return sheet
}


/** 수령한 구간 하나. 실제 `reward_claim` + `reward_claim_item` 을 흉내 낸다. */
type MockRewardClaim = {
  kind: RewardKind
  grantedPoint: number | null
  landmarks: RewardLandmark[]
}

type MockState = {
  user: User
  sheets: Sheet[]
  shop: ShopItem[]
  friends: Friend[]
  requests: FriendRequest[]
  friendSheets: Record<number, Sheet[]>
  /** "{sheetId}:{domainPosition}:{itemPosition}" → invenId. 실제 item_spot 을 흉내 낸다. */
  placements: Record<string, number>
  pointLogs: PointLog[]
  /**
   * 구간 번호(1~8) → 수령 기록.
   *
   * <p><b>시트를 갖지 않는다</b> — 서버와 같다(`reward_claim` 에 sheet_id 가 없다).
   * 그래서 시트를 새로 만들어도 이미 받은 구간은 다시 열리지 않는다.
   */
  rewardClaims: Record<number, MockRewardClaim>
}


/**
 * 목업 마을에 건물을 미리 세워 둔다.
 *
 * <p>서버 없이 보는 화면에서 마을이 전부 기본 스킨이면 배치 기능이 있는지조차 알 수 없다.
 * 시트 성격에 맞는 테마를 골라 칸을 채워 둔다 — 건강 시트는 초원과 어울리는 자연 계열,
 * 개발 시트는 도심과 어울리는 사이버·증기기관 계열이다.
 *
 * <p>목업은 모든 건물을 보유한 상태라 배치에 제약이 없다. 실제 서버에서는 보유한 것만
 * 세울 수 있다(`ItemSpotService` 가 `user_building` 을 대조한다).
 *
 * <p>정중앙(5·5)에는 <b>시트 1 에만</b> 랜드마크를 세워 둔다. 시트 2 는 비워서 "고르지 않은
 * 상태"(= 보유 목록 첫 종이 서는 자동 동작)를 같이 확인할 수 있게 한다. 시트 1 에 자동
 * 기본값이 아닌 종을 넣는 이유는, 같은 종을 넣으면 <b>화면이 서버 값을 읽은 것인지 자동으로
 * 떨어진 것인지 구분할 수 없기</b> 때문이다.
 *
 * @returns "{sheetId}:{domainPosition}:{itemPosition}" → invenId
 */
function seedPlacements(shop: ShopItem[]): Record<string, number> {
  const byTheme = (themes: string[]) =>
    shop.filter((item) => themes.includes(item.theme) && item.type === 'NORMAL')

  /** 시트별로 쓸 테마. 지형과 어울리는 것으로 고른다. */
  const plans: Array<{ sheetId: number; items: ShopItem[] }> = [
    { sheetId: 1, items: byTheme(['BASIC', 'NORDIC', 'SAKURA']) },
    { sheetId: 2, items: byTheme(['CYBER', 'STEAMPUNK', 'SEOUL']) },
  ]

  const placements: Record<string, number> = {}

  // 자동 기본값(LANDMARK_CATALOG 첫 종)이 아닌 것을 고른다 — 위 주석 참고.
  const centerLandmark = shop.find((item) => item.itemKey === 'lm_iron_tower')
  if (centerLandmark) placements['1:5:5'] = centerLandmark.itemId

  for (const { sheetId, items } of plans) {
    if (items.length === 0) continue

    let n = 0
    // 8개 구역(중앙 5 제외) × 구역 안 8칸(중앙 5 제외).
    for (let dPos = 1; dPos <= 9; dPos += 1) {
      if (dPos === 5) continue
      for (let iPos = 1; iPos <= 9; iPos += 1) {
        if (iPos === 5) continue

        // 전부 채우면 어느 칸이 기본 스킨인지 비교가 안 된다. 3칸 중 2칸만 세운다.
        if (n % 3 === 2) {
          n += 1
          continue
        }

        const item = items[n % items.length]
        placements[`${sheetId}:${dPos}:${iPos}`] = item.itemId
        n += 1
      }
    }
  }

  return placements
}

function initial(): MockState {
  /*
    상점 목록은 서버 카탈로그(buildings.json)에서 뽑은 것을 그대로 쓴다.
    목업과 실제 서버가 다른 상점을 보여주면 목업으로 확인한 것을 믿을 수 없다.
  */
  const shop: ShopItem[] = SHOP_CATALOG.map(
    ([itemKey, name, theme, price], i) => ({
      itemId: 100 + i,
      itemKey,
      name,
      theme,
      price,
      type: 'NORMAL' as const,
      /*
        목업은 **전부 보유** 상태로 둔다.

        실제 서버는 기본 지급분(0P)만 갖고 시작하지만, 목업의 목적은 화면과 배치를
        확인하는 것이라 256종을 다 열어 둔다. 상점에서 하나씩 사 모으지 않아도
        마을에 아무 건물이나 세워 볼 수 있다.

        `granted` 를 무시하므로 상점 화면은 전부 "보유"로 보이고 구매 버튼이 없다 —
        구매 흐름을 확인하려면 서버 모드로 전환한다.
      */
      owned: true,
      thumbnailUrl: null,
    }),
  )

  /*
    랜드마크를 보유 목록에 이어 붙인다.

    **상점 목록(`shopList`)에서는 걸러낸다** — 서버가 그러기 때문이다(`ShopService.findAll`).
    같은 배열에 두는 이유는 `invenId` 로 건물을 찾는 곳(`buildLayout`·`placeBuilding`)이
    이 배열 하나만 보기 때문이고, 목록을 둘로 나누면 그 조회를 전부 두 번 하게 된다.

    가격은 0 이다. "무료" 가 아니라 **상점 재화가 아님**의 표시다(서버 시드도 0 으로 나간다).
  */
  shop.push(
    ...LANDMARK_CATALOG.map(([itemKey, name], i) => ({
      itemId: 100 + SHOP_CATALOG.length + i,
      itemKey,
      name,
      theme: 'LANDMARK',
      price: 0,
      type: 'LANDMARK' as const,
      owned: true,
      thumbnailUrl: null,
    })),
  )

  // 배치를 먼저 계산한다 — 이 안에서 쓰인 건물이 owned 로 바뀐다.
  const placements = seedPlacements(shop)

  return {
    user: {
      id: 1,
      name: '정희성',
      uuid: '3f2a9c10-1b4e-4a77-9c2d-8f1e6b0d5a33',
      // 서버의 가입 축하 포인트(OAuthLoginService.WELCOME_POINT)와 같은 값.
      // 300P 짜리 건물을 30채 남짓 지어 볼 수 있다.
      point: 10_000,
      profileImageUrl: null,
      createdAt: '2026-06-01T00:00:00',
    },
    sheets: [healthSheet(), devSheet()],
    shop,
    friends: [
      {
        relationId: 1,
        userId: 11,
        uuid: 'b2c3d4e5-1111-4a77-9c2d-8f1e6b0d5a33',
        name: '김재현',
        profileImage: null,
        createdAt: '2026-06-10T00:00:00',
      },
      {
        relationId: 2,
        userId: 12,
        uuid: 'c3d4e5f6-2222-4a77-9c2d-8f1e6b0d5a33',
        name: '지상근',
        profileImage: null,
        createdAt: '2026-06-20T00:00:00',
      },
    ],
    requests: [
      {
        requestId: 91,
        senderUuid: 'd4e5f6a7-3333-4a77-9c2d-8f1e6b0d5a33',
        senderName: '권병수',
        senderProfileImage: null,
        createdAt: new Date(Date.now() - 140 * 60000).toISOString().slice(0, 19),
      },
      {
        requestId: 92,
        senderUuid: 'e5f6a7b8-4444-4a77-9c2d-8f1e6b0d5a33',
        senderName: '이성현',
        senderProfileImage: null,
        createdAt: new Date(Date.now() - 1500 * 60000).toISOString().slice(0, 19),
      },
    ],
    placements,
    rewardClaims: {},
    pointLogs: [
      {
        logId: 9001,
        subjectId: 0,
        subjectTitle: '아침 스트레칭 10분',
        domainTitle: '규칙적인 운동',
        earnedPoint: 100,
        createdAt: new Date(Date.now() - 120 * 60000).toISOString().slice(0, 19),
      },
      {
        logId: 9002,
        subjectId: 0,
        subjectTitle: '하루 물 2L 마시기',
        domainTitle: '바른 식습관',
        earnedPoint: 100,
        createdAt: new Date(Date.now() - 1600 * 60000).toISOString().slice(0, 19),
      },
    ],
    friendSheets: {
      11: [
        {
          id: 501,
          title: '아침형 인간 되기',
          isOpen: true,
          likeCount: 19,
          isLiked: false,
          achievementRate: 72,
          createdAt: '2026-05-01T00:00:00',
          expiredAt: '2026-12-31T00:00:00',
          domains: null,
          terrain: null,
          ownerName: '김재현',
        },
      ],
      12: [
        {
          id: 502,
          title: '1년에 50권 읽기',
          isOpen: true,
          likeCount: 26,
          isLiked: false,
          achievementRate: 54,
          createdAt: '2026-05-01T00:00:00',
          expiredAt: '2026-12-31T00:00:00',
          domains: null,
          terrain: null,
          ownerName: '지상근',
        },
      ],
    },
  }
}

function load(): MockState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as MockState
      if (parsed.user && parsed.sheets) return parsed
    }
  } catch {
    /* 저장분이 깨졌으면 새로 만든다 */
  }
  return initial()
}

let state: MockState = typeof window === 'undefined' ? initial() : load()

function save() {
  window.localStorage.setItem(KEY, JSON.stringify(state))
}

/**
 * 격자 번호(1~9) → 만다라트 번호(0~7). 가운데(5)는 null.
 * 서버 `MandalartGrid` 와 같은 규칙이다 — 어긋나면 목업과 실서버가 다른 칸을 가리킨다.
 */
function toIndex(grid: number): number | null {
  if (grid === 5 || grid < 1 || grid > 9) return null
  return grid < 5 ? grid - 1 : grid - 2
}

/** 서버의 배치 응답을 흉내 낸다. 73칸(중앙 1 + 8구역 × 9칸). */
function buildLayout(sheet: Sheet): VillageLayout {
  const byPosition = new Map((sheet.domains ?? []).map((d) => [d.position, d]))
  const spots: ItemSpot[] = []

  for (let dPos = 1; dPos <= 9; dPos += 1) {
    const tiles = dPos === 5 ? [5] : [1, 2, 3, 4, 5, 6, 7, 8, 9]

    for (const iPos of tiles) {
      const domainIndex = dPos === 5 ? null : toIndex(dPos)
      const subjectPosition = dPos === 5 ? null : toIndex(iPos)
      const domain = domainIndex == null ? undefined : byPosition.get(domainIndex)
      const subject =
        subjectPosition == null
          ? undefined
          : domain?.subjects.find((s) => s.position === subjectPosition)

      const invenId = state.placements[`${sheet.id}:${dPos}:${iPos}`] ?? null
      const item = invenId == null ? undefined : state.shop.find((i) => i.itemId === invenId)

      spots.push({
        domainPosition: dPos,
        itemPosition: iPos,
        domainIndex,
        subjectPosition,
        subjectId: subject?.id ?? null,
        subjectTitle: subject?.title ?? null,
        progress: subject?.progress ?? null,
        invenId,
        itemId: item?.itemId ?? null,
        itemKey: item?.itemKey ?? null,
        name: item?.name ?? null,
        theme: item?.theme ?? null,
        type: item?.type ?? null,
        thumbnailUrl: item?.thumbnailUrl ?? null,
        dir: '0',
        isLandmarkSlot: dPos === 5,
      })
    }
  }

  return {
    sheetId: sheet.id,
    terrain: sheet.terrain ?? 'GRASS_PATH',
    achievementRate: sheet.achievementRate,
    spots,
  }
}

/**
 * 건물 치수. 3D 가 높이순으로 자동 배치할 때 쓴다.
 * 서버 카탈로그의 실제 값을 그대로 쓰므로 목업 마을도 실제와 같은 실루엣이 된다.
 *
 * <p>랜드마크도 넣는다. 빠지면 기본값(0.46 × 0.46 × 1)으로 떨어져 3×3 거대 건물이 1칸짜리
 * 치수로 보고된다. 지금은 그 값을 읽는 곳이 없지만(랜드마크는 `parts` 로 그리고,
 * `buildOwnedCatalog` 는 높이순 표본에서 랜드마크를 먼저 걸러낸다) 서버가 주는 값과
 * 어긋난 채로 두면 나중에 이 치수를 쓰는 코드가 조용히 틀린다.
 */
const SIZE_BY_KEY = new Map<string, { width: number; depth: number; height: number }>([
  ...SHOP_CATALOG.map(
    ([key, , , , , width, depth, height]) => [key, { width, depth, height }] as const,
  ),
  ...LANDMARK_CATALOG.map(
    ([key, , width, depth, height]) => [key, { width, depth, height }] as const,
  ),
])

function sizeOf(itemKey: string): { width: number; depth: number; height: number } {
  return SIZE_BY_KEY.get(itemKey) ?? { width: 0.46, depth: 0.46, height: 1 }
}

/** 목업에도 약간의 지연을 준다 — 스켈레톤과 로딩 처리가 실제로 보이는지 확인하려고. */
const delay = <T,>(value: T, ms = 180): Promise<T> =>
  new Promise((resolve) => window.setTimeout(() => resolve(value), ms))

function recalc(sheet: Sheet) {
  sheet.achievementRate = sheetProgressOf(sheet)
}

/* ─────────────────────────  마일스톤 보상  ───────────────────────── */

/**
 * 보상표 — 서버 `RewardTrack.java` 를 옮긴 것이다.
 *
 * <p>이 상수들은 <b>목업 안에서만</b> 쓴다. 화면은 트랙 응답의 `milestones` 배열만 그리고
 * 진행률에서 구간을 다시 계산하지 않는다 — 표가 화면에도 있으면 서버 표를 고쳤을 때
 * "열려 보이는데 눌러도 못 받는" 상자가 생긴다.
 */
const MILESTONE_COUNT = 8
const STEP_PERCENT = 100 / MILESTONE_COUNT
const CREDIT_AMOUNT = 1000

/** 구간별 보상 종류. 인덱스 0 = 1구간. 앞 두 구간이 크레딧이고 마지막 둘이 랜드마크다. */
const REWARD_KINDS: RewardKind[] = [
  'CREDIT',
  'CREDIT',
  'LANDMARK',
  'CREDIT',
  'LANDMARK',
  'CREDIT',
  'LANDMARK',
  'LANDMARK',
]

/**
 * 보상 판정에 쓰는 시트 — <b>가장 먼저 만든 것.</b> 서버와 같은 규칙이다.
 *
 * <p>가장 높은 시트로 하면 시트를 여러 개 만들어 쉬운 구간만 골라 넘길 수 있다.
 * `createdAt` 은 'YYYY-MM-DDTHH:mm:ss' 라 문자열 비교로도 시간순이 맞는다.
 */
function boundSheet(): Sheet | undefined {
  return [...state.sheets].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
}

/**
 * 보상으로 줄 수 있는 랜드마크.
 *
 * <p>⚠️ <b>서버와 판정 기준이 다르다.</b> 서버는 "아직 보유하지 않은 랜드마크"를 뽑지만,
 * 목업은 화면 확인 편의를 위해 13종을 처음부터 전부 보유 상태로 둔다(`initial()`). 그 기준을
 * 그대로 옮기면 후보가 항상 비어서 <b>언제나 크레딧으로 대체 지급</b>되고, 랜덤 랜드마크
 * 공개 연출을 목업에서 확인할 길이 사라진다 — 목업을 두는 이유가 바로 그 확인이다.
 *
 * <p>그래서 목업은 "<b>보상으로 아직 준 적 없는</b> 랜드마크"를 후보로 삼는다. 전종을 다 준
 * 뒤에는 후보가 비어 크레딧 대체(`fallbackFromLandmark`)로 넘어가므로, 그 경로도 끝까지
 * 받아 보면 확인할 수 있다.
 */
function rewardLandmarkPool(): RewardLandmark[] {
  const given = new Set(
    Object.values(state.rewardClaims).flatMap((claim) =>
      claim.landmarks.map((landmark) => landmark.itemKey),
    ),
  )
  return state.shop
    .filter((item) => item.type === 'LANDMARK' && !given.has(item.itemKey))
    .map((item) => ({
      itemId: item.itemId,
      itemKey: item.itemKey,
      name: item.name,
      thumbnailUrl: item.thumbnailUrl,
    }))
}

export function resetMock() {
  state = initial()
  save()
}

export const mockGateway: Gateway = {
  kind: 'mock',

  me: () => delay(state.user),

  updateName: async (name) => {
    state.user = { ...state.user, name }
    save()
    await delay(null)
  },

  logout: async () => {
    await delay(null)
  },

  listSheets: () =>
    delay(state.sheets.map((s) => ({ ...s, domains: null, isLiked: false }))),

  sheetDetail: async (sheetId) => {
    const found = state.sheets.find((s) => s.id === sheetId)
    if (!found) throw new Error('만다라트를 찾을 수 없습니다.')
    return delay(JSON.parse(JSON.stringify(found)) as Sheet)
  },

  createSheet: async (draft: SheetDraft) => {
    const id = nextId()
    const sheet: Sheet = {
      id,
      title: draft.title,
      isOpen: draft.isOpen,
      likeCount: 0,
      isLiked: false,
      achievementRate: 0,
      createdAt: new Date().toISOString().slice(0, 19),
      expiredAt: draft.expiredAt,
      terrain: 'GRASS_PATH',
      domains: draft.domains.map((d) => ({
        id: nextId(),
        position: d.position,
        title: d.title,
        subjects: d.subjects.map((s, i) => ({
          id: nextId(),
          position: i,
          title: s.title,
          period: s.period,
          point: 10,
          targetCount: DEFAULT_TARGET[s.period],
          tryCount: 0,
          isDone: false,
          isDonePeriod: false,
          countPerPeriod: s.countPerPeriod ?? 1,
          currentPeriodCount: 0,
          isDoneToday: false,
          canExecute: true,
          progress: 0,
        })),
      })),
    }
    state.sheets = [sheet, ...state.sheets]
    save()
    return delay(id)
  },

  deleteSheet: async (sheetId) => {
    state.sheets = state.sheets.filter((s) => s.id !== sheetId)
    save()
    await delay(null)
  },

  toggleLike: async (sheetId) => {
    const sheet = state.sheets.find((s) => s.id === sheetId)
    if (!sheet) throw new Error('만다라트를 찾을 수 없습니다.')
    sheet.isLiked = !sheet.isLiked
    sheet.likeCount += sheet.isLiked ? 1 : -1
    save()
    return delay({ isLiked: sheet.isLiked, likeCount: sheet.likeCount })
  },

  setVisibility: async (sheetId, isOpen) => {
    const sheet = state.sheets.find((s) => s.id === sheetId)
    if (!sheet) throw new Error('만다라트를 찾을 수 없습니다.')
    sheet.isOpen = isOpen
    save()
    return delay(JSON.parse(JSON.stringify(sheet)) as Sheet)
  },

  todo: () => {
    const rows: TodoItem[] = []
    for (const sheet of state.sheets) {
      for (const d of sheet.domains ?? []) {
        for (const s of d.subjects) {
          if (s.isDone) continue
          // 서버와 같은 기준: 매일·주간 과제만 오늘의 할 일이다.
          if (s.period === 'NONE') continue
          rows.push({
            subjectId: s.id,
            sheetId: sheet.id,
            sheetTitle: sheet.title,
            domainId: d.id,
            domainTitle: d.title,
            title: s.title,
            period: s.period,
            point: s.point,
            targetCount: s.targetCount,
            tryCount: s.tryCount,
            position: s.position,
            isDone: s.isDone,
            isDoneToday: s.isDonePeriod,
            progress: s.progress,
          })
        }
      }
    }
    return delay(rows.sort((a, b) => Number(a.isDoneToday) - Number(b.isDoneToday)))
  },

  completeSubjects: async (sheetId, subjectIds) => {
    const sheet = state.sheets.find((s) => s.id === sheetId)
    if (!sheet) throw new Error('만다라트를 찾을 수 없습니다.')

    let earned = 0
    for (const d of sheet.domains ?? []) {
      for (const s of d.subjects) {
        if (!subjectIds.includes(s.id) || s.isDone) continue
        // 서버와 같은 규칙: 지금 누를 수 없는 과제는 건너뛴다(오늘 이미 함 · 주기 횟수 소진).
        if (!s.canExecute) continue

        s.tryCount += 1
        s.currentPeriodCount += 1
        s.isDoneToday = true
        s.isDonePeriod = s.currentPeriodCount >= s.countPerPeriod
        s.isDone = s.tryCount >= s.targetCount
        /*
          다시 누를 수 있는지 서버와 같은 식으로 다시 매긴다. 목업이 이 값을 갱신하지 않으면
          목업 모드에서만 버튼이 계속 열려 있어, 정작 고치려던 증상이 그대로 남는다.
        */
        s.canExecute = !s.isDone && !s.isDoneToday && s.currentPeriodCount < s.countPerPeriod
        s.progress = Math.round((s.tryCount / s.targetCount) * 100)
        earned += s.point

        state.pointLogs = [
          {
            logId: nextId(),
            subjectId: s.id,
            subjectTitle: s.title,
            domainTitle: d.title,
            earnedPoint: s.point,
            createdAt: new Date().toISOString().slice(0, 19),
          },
          ...state.pointLogs,
        ].slice(0, 100)
      }
    }
    recalc(sheet)
    state.user = { ...state.user, point: state.user.point + earned }
    save()
    return delay({ completedSubjectIds: subjectIds, earned, totalPoint: state.user.point })
  },

  /*
    랜드마크는 진열하지 않는다 — 서버와 같은 규칙이다(`ShopService.findAll` 이 `type=LANDMARK`
    를 걸러낸다). 보유 목록(`ownedBuildings`)에는 그대로 들어간다.
  */
  shopList: () => delay(state.shop.filter((i) => i.type !== 'LANDMARK')),

  purchase: async (itemId) => {
    const item = state.shop.find((i) => i.itemId === itemId)
    if (!item) throw new Error('건물을 찾을 수 없습니다.')
    /*
      목록에서 뺀 것만으로는 못 막는다 — itemId 를 알면 직접 부를 수 있다.
      서버도 같은 이유로 `purchase` 에서 한 번 더 막는다(BUILDING_NOT_PURCHASABLE).
    */
    if (item.type === 'LANDMARK') {
      throw new Error('랜드마크는 상점에서 살 수 없습니다. 만다라트를 완성해 해금하세요.')
    }
    if (item.owned) throw new Error('이미 보유한 건물입니다.')
    if (state.user.point < item.price) throw new Error('포인트가 부족합니다.')

    item.owned = true
    state.user = { ...state.user, point: state.user.point - item.price }
    save()
    return delay({ remainingPoint: state.user.point, paidPoint: item.price })
  },

  village: async (sheetId) => {
    const sheet = state.sheets.find((s) => s.id === sheetId)
    return delay({
      terrain: (sheet?.terrain ?? 'GRASS_PATH') as Terrain,
      ownedCount: state.shop.filter((i) => i.owned).length,
    })
  },

  setTerrain: async (sheetId, terrain) => {
    const sheet = state.sheets.find((s) => s.id === sheetId)
    if (sheet) sheet.terrain = terrain
    save()
    return delay(terrain)
  },

  villageLayout: async (sheetId) => {
    const sheet = state.sheets.find((s) => s.id === sheetId)
    if (!sheet) throw new Error('만다라트를 찾을 수 없습니다.')
    return delay(buildLayout(sheet))
  },

  placeBuilding: async (sheetId, domainPosition, itemPosition, invenId) => {
    const sheet = state.sheets.find((s) => s.id === sheetId)
    if (!sheet) throw new Error('만다라트를 찾을 수 없습니다.')

    const center = domainPosition === 5
    if (invenId != null) {
      const item = state.shop.find((i) => i.itemId === invenId)
      if (!item || !item.owned) throw new Error('보유하지 않은 건물입니다.')
      // 서버와 같은 규칙: 중앙은 랜드마크만, 나머지는 일반 건물만.
      if (center && item.type !== 'LANDMARK') {
        throw new Error('가운데 자리에는 랜드마크만 세울 수 있어요.')
      }
      if (!center && item.type === 'LANDMARK') {
        throw new Error('랜드마크는 가운데 자리에만 세울 수 있어요.')
      }
      // 같은 건물이 다른 칸에 있으면 그 칸을 비운다.
      for (const [key, value] of Object.entries(state.placements)) {
        if (value === invenId && key.startsWith(`${sheetId}:`)) delete state.placements[key]
      }
      state.placements[`${sheetId}:${domainPosition}:${itemPosition}`] = invenId
    } else {
      delete state.placements[`${sheetId}:${domainPosition}:${itemPosition}`]
    }
    save()

    const layout = buildLayout(sheet)
    const spot = layout.spots.find(
      (s) => s.domainPosition === domainPosition && s.itemPosition === itemPosition,
    )
    if (!spot) throw new Error('그 자리를 찾을 수 없습니다.')
    return delay(spot)
  },

  ownedBuildings: async () =>
    delay(
      state.shop
        .filter((i) => i.owned)
        .map((i) => ({
          // 목업에서는 인벤토리 아이디를 카탈로그 아이디와 같게 둔다.
          invenId: i.itemId,
          itemId: i.itemId,
          itemKey: i.itemKey,
          name: i.name,
          theme: i.theme,
          type: i.type,
          thumbnailUrl: i.thumbnailUrl,
          size: sizeOf(i.itemKey),
        })),
    ),

  pointHistory: async (page) => {
    const size = 20
    const start = page * size
    return delay({
      currentPoint: state.user.point,
      totalPages: Math.max(1, Math.ceil(state.pointLogs.length / size)),
      logs: state.pointLogs.slice(start, start + size),
    })
  },

  notifications: async () => {
    const items: AppNotification[] = state.requests.map((r) => ({
      kind: 'FRIEND_REQUEST',
      referenceId: r.requestId,
      title: `${r.senderName}님이 친구를 신청했어요`,
      body: '수락하면 서로의 공개 만다라트를 볼 수 있어요.',
      actionRequired: true,
      createdAt: r.createdAt,
    }))

    const actionRequiredCount = items.length

    const remaining = state.sheets
      .flatMap((s) => s.domains?.flatMap((d) => d.subjects) ?? [])
      .filter((s) => !s.isDone && s.period !== 'NONE' && !s.isDonePeriod).length

    // 확인만 하면 되는 안내라 배지 수에는 넣지 않는다 — 서버와 같은 규칙.
    if (remaining > 0) {
      items.push({
        kind: 'TODO_REMAINING',
        referenceId: null,
        title: `오늘 남은 과제가 ${remaining}개 있어요`,
        body: '하나만 체크해도 마을의 건물이 자랍니다.',
        actionRequired: false,
        createdAt: null,
      })
    }

    return delay({ actionRequiredCount, items })
  },

  friends: () => delay(state.friends),
  friendRequests: () => delay(state.requests),
  friendSheets: (friendUserId) => delay(state.friendSheets[friendUserId] ?? []),

  searchUser: async (uuid) => {
    const friend = state.friends.find((f) => f.uuid === uuid)
    if (friend) return delay({ name: friend.name, uuid, isFriend: true })
    if (uuid === state.user.uuid) throw new Error('본인에게는 요청할 수 없습니다.')
    if (uuid.length < 8) throw new Error('해당 UUID 를 가진 사용자를 찾지 못했습니다.')
    return delay({ name: '만다린 사용자', uuid, isFriend: false })
  },

  sendFriendRequest: async () => {
    await delay(null)
  },

  acceptRequest: async (requestId) => {
    const req = state.requests.find((r) => r.requestId === requestId)
    if (req) {
      state.friends = [
        ...state.friends,
        {
          relationId: nextId(),
          userId: nextId(),
          uuid: req.senderUuid,
          name: req.senderName,
          profileImage: req.senderProfileImage,
          createdAt: new Date().toISOString().slice(0, 19),
        },
      ]
      state.requests = state.requests.filter((r) => r.requestId !== requestId)
      save()
    }
    await delay(null)
  },

  rejectRequest: async (requestId) => {
    state.requests = state.requests.filter((r) => r.requestId !== requestId)
    save()
    await delay(null)
  },

  removeFriend: async (friendRelationId) => {
    state.friends = state.friends.filter((f) => f.relationId !== friendRelationId)
    save()
    await delay(null)
  },

  leaderboard: async (page) => {
    const mine = state.sheets
      .filter((s) => s.isOpen)
      .map((s) => ({ sheetId: s.id, title: s.title, name: state.user.name, likeCount: s.likeCount }))
    const others = Object.entries(state.friendSheets).flatMap(([, sheets]) =>
      sheets.map((s) => ({
        sheetId: s.id,
        title: s.title,
        name: s.ownerName ?? '친구',
        likeCount: s.likeCount,
      })),
    )
    const all = [...mine, ...others]
      .sort((a, b) => b.likeCount - a.likeCount)
      .map((row, i) => ({ ...row, rank: i + 1 }))

    return delay({ entries: all.slice(page * 10, page * 10 + 10), totalPages: 1 })
  },

  weeklyReport: async () => delay(buildMockReport()),
  createReport: async () => delay(buildMockReport(), 1200),

  rewardTrack: async () => {
    const bound = boundSheet()
    const rate = bound?.achievementRate ?? 0

    return delay({
      sheetId: bound?.id ?? null,
      achievementRate: rate,
      milestones: REWARD_KINDS.map((kind, i) => {
        const milestone = i + 1
        const percent = STEP_PERCENT * milestone
        const claim = state.rewardClaims[milestone]
        return {
          milestone,
          percent,
          kind,
          creditAmount: kind === 'CREDIT' ? CREDIT_AMOUNT : null,
          reached: rate >= percent,
          claimed: claim != null,
          grantedPoint: claim?.grantedPoint ?? null,
          grantedNames: claim?.landmarks.map((landmark) => landmark.name) ?? [],
        }
      }),
    })
  },

  claimReward: async (milestone) => {
    /*
      서버가 막는 것을 여기서도 막는다. 목업이 무엇이든 내주면 목업으로 확인한 화면이
      실제 서버에서 처음 오류를 만난다 — 잠긴 상자를 눌렀을 때 무슨 문구가 뜨는지가
      그 오류 경로에 달려 있다.
    */
    if (milestone < 1 || milestone > MILESTONE_COUNT) {
      throw new Error('없는 보상 구간입니다.')
    }
    if (state.rewardClaims[milestone]) {
      throw new Error('이미 수령한 보상입니다.')
    }

    const bound = boundSheet()
    if (!bound) throw new Error('만다라트를 먼저 만들어 주세요.')
    if (bound.achievementRate < STEP_PERCENT * milestone) {
      throw new Error('아직 이 구간에 도달하지 않았습니다.')
    }

    const kind = REWARD_KINDS[milestone - 1]
    const pool = kind === 'LANDMARK' ? rewardLandmarkPool() : []

    // 크레딧 구간이거나, 랜드마크 구간인데 줄 것이 남지 않은 경우.
    if (kind === 'CREDIT' || pool.length === 0) {
      /*
        서버는 일일 포인트 상한을 거치지 않는 경로로 지급한다(상한과 보상액이 같은 1000P 라
        상한을 타면 그날 과제를 한 사람이 0원을 받는다). 목업에는 상한이 없어 그냥 더한다.

        포인트 내역(pointLogs)에도 남기지 않는다 — 서버가 과제 적립 경로를 타지 않으므로
        point_log 행이 생기지 않는다. 여기서 남기면 목업에만 있는 줄이 된다.
      */
      state.user = { ...state.user, point: state.user.point + CREDIT_AMOUNT }
      state.rewardClaims[milestone] = {
        kind: 'CREDIT',
        grantedPoint: CREDIT_AMOUNT,
        landmarks: [],
      }
      save()

      return delay({
        milestone,
        kind: 'CREDIT' as RewardKind,
        grantedPoint: CREDIT_AMOUNT,
        landmarks: [],
        currentPoint: state.user.point,
        fallbackFromLandmark: kind === 'LANDMARK',
      })
    }

    // 마지막 구간(100%)은 남은 전종, 그 외에는 무작위 1종.
    const granted =
      milestone === MILESTONE_COUNT ? pool : [pool[Math.floor(Math.random() * pool.length)]] // NOSONAR

    /*
      보유 목록을 건드리지 않는다 — 목업은 처음부터 13종을 다 보유한 상태다(`initial()`).
      서버는 여기서 user_building 행을 만든다.
    */
    state.rewardClaims[milestone] = { kind: 'LANDMARK', grantedPoint: null, landmarks: granted }
    save()

    return delay({
      milestone,
      kind: 'LANDMARK' as RewardKind,
      grantedPoint: null,
      landmarks: granted,
      currentPoint: state.user.point,
      fallbackFromLandmark: false,
    })
  },
}

function buildMockReport(): WeeklyReport {
  const sheets = state.sheets.filter((s) => (s.domains?.length ?? 0) > 0)
  const allSubjects = sheets.flatMap((s) => s.domains?.flatMap((d) => d.subjects) ?? [])
  const completed = allSubjects.filter((s) => s.isDone).length
  const tried = allSubjects.reduce((acc, s) => acc + s.tryCount, 0)

  const ranked = sheets
    .flatMap((s) => s.domains ?? [])
    .filter((d) => d.subjects.length > 0)
    .map((d) => ({
      label: d.title,
      value: Math.round(d.subjects.reduce((a, s) => a + s.progress, 0) / d.subjects.length),
    }))
    .sort((a, b) => b.value - a.value)

  return {
    title: ranked[0] ? `“${ranked[0].label}”에서 가장 꾸준했어요` : '이번 주 기록',
    summary: `전체 과제 ${allSubjects.length}개 중 ${completed}개를 끝냈고, 누적 ${tried}회 실천했습니다.`,
    metrics: [
      { label: '누적 실천', value: `${tried}회` },
      { label: '완료한 과제', value: `${completed}개` },
    ],
    strengths: ranked.slice(0, 3).map((r) => `${r.label} — ${r.value}% 달성`),
    improvements: ranked
      .slice(-3)
      .reverse()
      .map((r) => `${r.label} — ${r.value}%, 이번 주에 한 번만 시작해 보세요`),
    sheets: sheets.map((s) => ({
      sheetId: s.id,
      title: s.title,
      completedCount: s.domains?.flatMap((d) => d.subjects).filter((x) => x.isDone).length ?? 0,
      targetCount: s.domains?.flatMap((d) => d.subjects).length ?? 0,
      achievementRate: s.achievementRate,
      domains: (s.domains ?? [])
        .filter((d) => d.subjects.length > 0)
        .map((d) => ({
          label: d.title,
          value: Math.round(d.subjects.reduce((a, x) => a + x.progress, 0) / d.subjects.length),
        })),
    })),
  }
}
