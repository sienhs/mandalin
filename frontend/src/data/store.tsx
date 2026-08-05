import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  clearAccessToken,
  getAccessToken,
  onSessionExpired,
  reissueAccessToken,
  setAccessToken,
} from '../api/client'
import { auth } from '../api/endpoints'
import { apiGateway, type Gateway, type SheetDraft } from './gateway'
import { mockGateway, resetMock } from './mockGateway'
import type {
  AppNotification,
  Friend,
  FriendRequest,
  Sheet,
  ShopItem,
  Terrain,
  TodoItem,
  User,
} from './types'
import { useToast } from '../components/common/Toast'

type Mode = 'api' | 'mock'

const ENV_MODE: Mode = (import.meta.env.VITE_DATA_MODE as Mode) ?? 'api'
const MODE_KEY = 'mandarin.dataMode'
const THEME_KEY = 'mandarin.theme'

function initialMode(): Mode {
  const saved = window.localStorage.getItem(MODE_KEY)
  return saved === 'api' || saved === 'mock' ? saved : ENV_MODE
}

type SessionStatus = 'checking' | 'authed' | 'guest'

type Slice<T> = { data: T; loading: boolean; error: string | null }

const idle = <T,>(data: T): Slice<T> => ({ data, loading: false, error: null })

function messageOf(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback
}

type Ctx = {
  mode: Mode
  setMode: (mode: Mode) => void
  gateway: Gateway

  session: SessionStatus
  user: User | null
  theme: 'light' | 'dark'
  toggleTheme: () => void

  /* 세션 */
  loginWithToken: (token: string) => Promise<boolean>
  startKakaoLogin: () => void
  enterMockSession: () => void
  logout: () => Promise<void>
  onboarded: boolean
  finishOnboarding: () => void

  /* 데이터 */
  sheets: Slice<Sheet[]>
  /**
   * 시트 상세 캐시(sheetId → 도메인·과제까지 채워진 시트).
   *
   * 목록 응답에는 과제가 없고, 오늘의 할 일 응답에는 sheetId 가 없다.
   * 그런데 수행 완료 API 는 `/sheets/{sheetId}/subjects/complete` 로 sheetId 를 요구한다.
   * 그래서 로그인 직후 시트 상세를 한 번씩 받아 두고, 화면들이 이 캐시를 공유한다.
   */
  details: Slice<Record<number, Sheet>>
  todos: Slice<TodoItem[]>
  shop: Slice<ShopItem[]>
  friends: Slice<Friend[]>
  requests: Slice<FriendRequest[]>
  /** 알림. 서버가 친구 요청·그룹 초대·남은 할 일을 모아 내려준다. */
  notifications: Slice<{ actionRequiredCount: number; items: AppNotification[] }>

  reloadSheets: () => Promise<void>
  reloadDetails: () => Promise<void>
  reloadTodos: () => Promise<void>
  reloadShop: () => Promise<void>
  reloadFriends: () => Promise<void>
  reloadNotifications: () => Promise<void>

  /* 액션 — 성공하면 true */
  createSheet: (draft: SheetDraft) => Promise<number | null>
  deleteSheet: (sheetId: number) => Promise<boolean>
  toggleLike: (sheetId: number) => Promise<{ isLiked: boolean; likeCount: number } | null>
  /** 만다라트 내용은 고칠 수 없다. 공개 여부만 바꿀 수 있다. */
  setVisibility: (sheetId: number, isOpen: boolean) => Promise<boolean>
  completeSubjects: (sheetId: number, subjectIds: number[]) => Promise<boolean>
  purchase: (item: ShopItem) => Promise<boolean>
  setTerrain: (sheetId: number, terrain: Terrain) => Promise<boolean>
  updateName: (name: string) => Promise<boolean>

  sendFriendRequest: (uuid: string) => Promise<boolean>
  acceptRequest: (requestId: number) => Promise<boolean>
  rejectRequest: (requestId: number) => Promise<boolean>
  removeFriend: (friendRelationId: number) => Promise<boolean>

  resetMockData: () => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast()

  const [mode, setModeState] = useState<Mode>(initialMode)
  const gateway = mode === 'mock' ? mockGateway : apiGateway

  const [session, setSession] = useState<SessionStatus>('checking')
  const [user, setUser] = useState<User | null>(null)
  const [onboarded, setOnboarded] = useState(
    () => window.localStorage.getItem('mandarin.onboarded') === '1',
  )
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (window.localStorage.getItem(THEME_KEY) as 'light' | 'dark') ?? 'light',
  )

  const [sheets, setSheets] = useState<Slice<Sheet[]>>(idle([]))
  const [details, setDetails] = useState<Slice<Record<number, Sheet>>>(idle({}))
  const [todos, setTodos] = useState<Slice<TodoItem[]>>(idle([]))
  const [shop, setShop] = useState<Slice<ShopItem[]>>(idle([]))
  const [friends, setFriends] = useState<Slice<Friend[]>>(idle([]))
  const [requests, setRequests] = useState<Slice<FriendRequest[]>>(idle([]))
  const [notifications, setNotifications] = useState<
    Slice<{ actionRequiredCount: number; items: AppNotification[] }>
  >(idle({ actionRequiredCount: 0, items: [] }))

  const gatewayRef = useRef(gateway)
  gatewayRef.current = gateway

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  /* ─────────────  세션 복원  ───────────── */

  useEffect(() => {
    let alive = true

    const restore = async () => {
      if (mode === 'mock') {
        const me = await mockGateway.me()
        if (!alive) return
        setUser(me)
        setSession('authed')
        return
      }

      // 개발용 토큰을 .env 로 넣어둔 경우 그대로 쓴다.
      const injected = import.meta.env.VITE_DEV_ACCESS_TOKEN as string | undefined
      if (injected && !getAccessToken()) setAccessToken(injected)

      // 토큰이 없으면 리프레시 쿠키로 한 번 살려본다.
      if (!getAccessToken()) await reissueAccessToken()

      if (!getAccessToken()) {
        if (alive) {
          setUser(null)
          setSession('guest')
        }
        return
      }

      try {
        const me = await apiGateway.me()
        if (!alive) return
        setUser(me)
        setSession('authed')
      } catch {
        clearAccessToken()
        if (alive) {
          setUser(null)
          setSession('guest')
        }
      }
    }

    setSession('checking')
    void restore()
    return () => {
      alive = false
    }
  }, [mode])

  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null)
        setSession('guest')
        toast.show({ tone: 'warn', title: '로그인이 만료됐어요', body: '다시 로그인해 주세요.' })
      }),
    [toast],
  )

  /* ─────────────  로더  ───────────── */

  const load = useCallback(
    async <T,>(
      run: (g: Gateway) => Promise<T>,
      setSlice: (updater: (prev: Slice<T>) => Slice<T>) => void,
      fallbackMessage: string,
    ) => {
      setSlice((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const data = await run(gatewayRef.current)
        setSlice(() => ({ data, loading: false, error: null }))
      } catch (cause) {
        setSlice((prev) => ({
          ...prev,
          loading: false,
          error: messageOf(cause, fallbackMessage),
        }))
      }
    },
    [],
  )

  const reloadSheets = useCallback(
    () => load((g) => g.listSheets(), setSheets, '만다라트 목록을 불러오지 못했습니다.'),
    [load],
  )

  /**
   * 목록에 있는 시트의 상세를 한 번에 받아 캐시한다.
   * 하나가 실패해도(비공개 등) 나머지는 살린다 — 전부 아니면 전무가 되면 화면이 통째로 빈다.
   */
  const reloadDetails = useCallback(async () => {
    setDetails((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const list = await gatewayRef.current.listSheets()
      const loaded = await Promise.all(
        list.map((s) =>
          gatewayRef.current.sheetDetail(s.id).catch(() => null),
        ),
      )
      const map: Record<number, Sheet> = {}
      for (const sheet of loaded) if (sheet) map[sheet.id] = sheet
      setDetails({ data: map, loading: false, error: null })
    } catch (cause) {
      setDetails((prev) => ({
        ...prev,
        loading: false,
        error: messageOf(cause, '만다라트를 불러오지 못했습니다.'),
      }))
    }
  }, [])

  const reloadTodos = useCallback(
    () => load((g) => g.todo(), setTodos, '오늘의 할 일을 불러오지 못했습니다.'),
    [load],
  )
  const reloadShop = useCallback(
    () => load((g) => g.shopList(), setShop, '상점 목록을 불러오지 못했습니다.'),
    [load],
  )
  const reloadNotifications = useCallback(
    () => load((g) => g.notifications(), setNotifications, '알림을 불러오지 못했습니다.'),
    [load],
  )

  const reloadFriends = useCallback(async () => {
    await Promise.all([
      load((g) => g.friends(), setFriends, '친구 목록을 불러오지 못했습니다.'),
      load((g) => g.friendRequests(), setRequests, '친구 요청을 불러오지 못했습니다.'),
    ])
  }, [load])

  // 로그인되면 공통 데이터를 한 번에 채운다.
  useEffect(() => {
    if (session !== 'authed') return
    void reloadSheets()
    void reloadDetails()
    void reloadTodos()
    void reloadShop()
    void reloadFriends()
    void reloadNotifications()
  }, [
    session,
    mode,
    reloadSheets,
    reloadDetails,
    reloadTodos,
    reloadShop,
    reloadFriends,
    reloadNotifications,
  ])

  /* ─────────────  액션  ───────────── */

  const value = useMemo<Ctx>(() => {
    const fail = (cause: unknown, fallback: string) => {
      toast.show({ tone: 'warn', title: messageOf(cause, fallback) })
    }

    return {
      mode,
      gateway,
      setMode: (next) => {
        window.localStorage.setItem(MODE_KEY, next)
        setModeState(next)
      },

      session,
      user,
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),

      onboarded,
      finishOnboarding: () => {
        window.localStorage.setItem('mandarin.onboarded', '1')
        setOnboarded(true)
      },

      loginWithToken: async (token) => {
        setAccessToken(token.trim())
        try {
          const me = await apiGateway.me()
          setUser(me)
          setSession('authed')
          return true
        } catch (cause) {
          clearAccessToken()
          fail(cause, '토큰으로 로그인하지 못했습니다.')
          return false
        }
      },

      startKakaoLogin: () => {
        window.location.href = auth.kakaoLoginUrl()
      },

      enterMockSession: () => {
        window.localStorage.setItem(MODE_KEY, 'mock')
        setModeState('mock')
      },

      logout: async () => {
        try {
          await gatewayRef.current.logout()
        } catch {
          // 서버가 실패해도 로컬 세션은 비운다.
        }
        clearAccessToken()
        setUser(null)
        setSession('guest')
      },

      sheets,
      details,
      todos,
      shop,
      friends,
      requests,
      notifications,
      reloadSheets,
      reloadDetails,
      reloadTodos,
      reloadShop,
      reloadFriends,
      reloadNotifications,

      createSheet: async (draft) => {
        try {
          const id = await gatewayRef.current.createSheet(draft)
          await Promise.all([reloadSheets(), reloadDetails()])
          void reloadTodos()
          toast.show({
            tone: 'success',
            title: '만다라트를 저장했어요',
            body: '목록에서 언제든 다시 열 수 있어요.',
          })
          return id
        } catch (cause) {
          fail(cause, '만다라트를 저장하지 못했습니다.')
          return null
        }
      },

      deleteSheet: async (sheetId) => {
        try {
          await gatewayRef.current.deleteSheet(sheetId)
          await Promise.all([reloadSheets(), reloadDetails()])
          void reloadTodos()
          toast.show({ tone: 'success', title: '만다라트를 삭제했어요' })
          return true
        } catch (cause) {
          fail(cause, '삭제하지 못했습니다.')
          return false
        }
      },

      setVisibility: async (sheetId, isOpen) => {
        try {
          await gatewayRef.current.setVisibility(sheetId, isOpen)
          await Promise.all([reloadSheets(), reloadDetails()])
          toast.show({
            tone: 'success',
            title: isOpen ? '공개로 바꿨어요' : '비공개로 바꿨어요',
            body: isOpen
              ? '리더보드와 친구 목록에 보입니다.'
              : '이제 나만 볼 수 있어요.',
          })
          return true
        } catch (cause) {
          fail(cause, '공개 여부를 바꾸지 못했습니다.')
          return false
        }
      },

      toggleLike: async (sheetId) => {
        try {
          const res = await gatewayRef.current.toggleLike(sheetId)
          setSheets((prev) => ({
            ...prev,
            data: prev.data.map((s) =>
              s.id === sheetId ? { ...s, isLiked: res.isLiked, likeCount: res.likeCount } : s,
            ),
          }))
          return res
        } catch (cause) {
          fail(cause, '좋아요를 반영하지 못했습니다.')
          return null
        }
      },

      completeSubjects: async (sheetId, subjectIds) => {
        try {
          const res = await gatewayRef.current.completeSubjects(sheetId, subjectIds)
          setUser((prev) => (prev ? { ...prev, point: res.totalPoint } : prev))
          await Promise.all([reloadTodos(), reloadSheets(), reloadDetails()])
          void reloadNotifications()
          /*
            서버는 이미 수행한 과제를 조용히 무시한다(earned = 0). 그때도 "+0P 적립" 을 띄우면
            적립된 것처럼 읽히므로 무엇이 일어났는지 그대로 말한다. 다른 탭에서 먼저 눌렀거나
            주기가 막 넘어간 경우에 걸린다.
          */
          toast.show(
            res.earned > 0
              ? { tone: 'point', title: `+${res.earned}P 적립`, body: '건물이 한 단계 자랐어요.' }
              : { tone: 'info', title: '이미 수행한 과제예요', body: '포인트는 주기마다 한 번만 쌓여요.' },
          )
          return true
        } catch (cause) {
          fail(cause, '수행 완료를 저장하지 못했습니다.')
          return false
        }
      },

      purchase: async (item) => {
        try {
          const res = await gatewayRef.current.purchase(item.itemId)
          setUser((prev) => (prev ? { ...prev, point: res.remainingPoint } : prev))
          await reloadShop()
          toast.show({
            tone: 'success',
            title: `${item.name}을(를) 구매했어요`,
            body: `${res.paidPoint.toLocaleString('ko-KR')}P 차감 · 잔액 ${res.remainingPoint.toLocaleString('ko-KR')}P`,
          })
          return true
        } catch (cause) {
          fail(cause, '구매하지 못했습니다.')
          return false
        }
      },

      setTerrain: async (sheetId, terrain) => {
        try {
          await gatewayRef.current.setTerrain(sheetId, terrain)
          return true
        } catch (cause) {
          fail(cause, '지형을 바꾸지 못했습니다.')
          return false
        }
      },

      updateName: async (name) => {
        try {
          await gatewayRef.current.updateName(name)
          setUser((prev) => (prev ? { ...prev, name } : prev))
          toast.show({ tone: 'success', title: '닉네임을 바꿨어요' })
          return true
        } catch (cause) {
          fail(cause, '닉네임을 바꾸지 못했습니다.')
          return false
        }
      },

      sendFriendRequest: async (uuid) => {
        try {
          await gatewayRef.current.sendFriendRequest(uuid)
          toast.show({ tone: 'success', title: '친구 요청을 보냈어요' })
          return true
        } catch (cause) {
          fail(cause, '친구 요청을 보내지 못했습니다.')
          return false
        }
      },

      acceptRequest: async (requestId) => {
        try {
          await gatewayRef.current.acceptRequest(requestId)
          await reloadFriends()
          void reloadNotifications()
          toast.show({ tone: 'success', title: '친구가 되었어요' })
          return true
        } catch (cause) {
          fail(cause, '요청을 수락하지 못했습니다.')
          return false
        }
      },

      rejectRequest: async (requestId) => {
        try {
          await gatewayRef.current.rejectRequest(requestId)
          await reloadFriends()
          void reloadNotifications()
          return true
        } catch (cause) {
          fail(cause, '요청을 거절하지 못했습니다.')
          return false
        }
      },

      removeFriend: async (friendRelationId) => {
        try {
          await gatewayRef.current.removeFriend(friendRelationId)
          await reloadFriends()
          return true
        } catch (cause) {
          fail(cause, '친구를 삭제하지 못했습니다.')
          return false
        }
      },

      resetMockData: () => {
        resetMock()
        void reloadSheets()
        void reloadDetails()
        void reloadTodos()
        void reloadShop()
        void reloadFriends()
        toast.show({ tone: 'info', title: '목업 데이터를 처음 상태로 되돌렸어요' })
      },
    }
  }, [
    mode,
    gateway,
    session,
    user,
    theme,
    onboarded,
    sheets,
    details,
    todos,
    shop,
    friends,
    requests,
    notifications,
    reloadSheets,
    reloadDetails,
    reloadTodos,
    reloadShop,
    reloadFriends,
    reloadNotifications,
    toast,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore 는 StoreProvider 안에서만 쓸 수 있습니다.')
  return ctx
}

/* ─────────────────────────  시트 상세  ───────────────────────── */

/**
 * 상세는 목록과 응답이 달라(도메인·과제 포함) 화면에서 따로 받아온다.
 * 친구 시트도 같은 엔드포인트를 쓰지만 읽기 전용으로만 그린다.
 */
export function useSheetDetail(sheetId: number | null) {
  const { gateway, session } = useStore()
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (sheetId == null || Number.isNaN(sheetId)) {
      setLoading(false)
      setError('잘못된 주소입니다.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      setSheet(await gateway.sheetDetail(sheetId))
    } catch (cause) {
      setSheet(null)
      setError(messageOf(cause, '만다라트를 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [gateway, sheetId])

  useEffect(() => {
    if (session !== 'authed') return
    void reload()
  }, [reload, session])

  return { sheet, loading, error, reload, setSheet }
}

/* ─────────────────────────  파생 계산  ───────────────────────── */

/** 과제 진행률 → 건물 성장 단계(0~3). 마을과 그리드가 같은 기준을 쓴다. */
export function stageOf(progress: number): 0 | 1 | 2 | 3 {
  if (progress <= 0) return 0
  if (progress < 40) return 1
  if (progress < 85) return 2
  return 3
}

/**
 * 81칸 중 완전히 완료된 칸 수.
 *
 * 과제는 서버의 최종 완료 상태를 세고, 세부 목표는 과제 8개가 모두 끝났을 때 중앙과
 * 외곽의 중복 칸 2개를 센다. 핵심 목표는 8개 세부 목표가 모두 끝났을 때 완료된다.
 */
export function completedCells(sheet: Sheet): number {
  const domains = sheet.domains ?? []
  const completedSubjects = domains.reduce(
    (count, domain) => count + domain.subjects.filter((subject) => subject.isDone).length,
    0,
  )
  const completedDomains = domains.filter(
    (domain) => domain.subjects.length === 8 && domain.subjects.every((subject) => subject.isDone),
  ).length
  const completedCore = domains.length === 8 && completedDomains === 8 ? 1 : 0

  return completedSubjects + completedDomains * 2 + completedCore
}

export function domainProgress(subjects: { progress: number }[]): number {
  if (subjects.length === 0) return 0
  return Math.round(subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length)
}
