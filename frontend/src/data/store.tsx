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
  clearLoggedOut,
  getAccessToken,
  markLoggedOut,
  onSessionExpired,
  reissueAccessToken,
  setAccessToken,
  wasLoggedOut,
} from '../api/client'
import { auth } from '../api/endpoints'
import { apiGateway, type Gateway, type SheetDraft } from './gateway'
import { mockGateway, resetMock } from './mockGateway'
import type {
  AppNotification,
  Friend,
  FriendRequest,
  RewardClaimResult,
  RewardTrack,
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

/**
 * 데이터 출처는 <b>로그인할 때 한 번 정해지고, 그 뒤로는 바꿀 수 없다.</b>
 *
 * <p>목업이 되는 길은 로그인 화면의 "목업 데이터로 화면 보기"({@link Ctx.enterMockSession})
 * 하나뿐이고, 실제 계정으로 들어오는 모든 길은 {@link clearMockSession} 으로 이 값을 지운다.
 * 세션 도중에 뒤집는 수단은 두지 않는다 — 화면 절반은 서버 것, 절반은 브라우저 것을 보고
 * 있는 상태가 만들어지고, 그 상태에서 저장을 누르면 무엇이 어디에 남았는지 알 수 없다.
 *
 * <p>localStorage 에 남기는 이유는 <b>새로고침을 견디기 위해서</b>다. 목업으로 보다가 F5 를
 * 누르면 서버 데이터로 튕기는 것을 막는 것이 전부이고, 출처를 고르는 손잡이가 아니다.
 */
function initialMode(): Mode {
  const saved = window.localStorage.getItem(MODE_KEY)
  return saved === 'api' || saved === 'mock' ? saved : ENV_MODE
}

/**
 * 실제 계정으로 로그인하는 길목에서 목업 표시를 지운다.
 *
 * <p>목업으로 화면을 보다가 카카오·테스트 계정으로 들어오면 저장분에 'mock' 이 남아 있어서,
 * <b>로그인은 됐는데 화면은 계속 브라우저 안 데이터를 보여준다</b> — 서버 데이터를 확인하려고
 * 들어온 것이므로 정확히 반대의 결과다.
 *
 * <p>스토어 밖(카카오 콜백 화면)에서도 불러야 해서 모듈 함수로 둔다. 두 로그인 경로 중
 * 하나라도 빠뜨리면 위 증상이 그 경로에서만 되살아난다.
 */
export function clearMockSession(): void {
  try {
    window.localStorage.setItem(MODE_KEY, 'api')
  } catch {
    // 저장이 막힌 브라우저. 어차피 목업 표시도 남지 못했으므로 지울 것이 없다.
  }
}

type SessionStatus = 'checking' | 'authed' | 'guest'

type Slice<T> = { data: T; loading: boolean; error: string | null }

const idle = <T,>(data: T): Slice<T> => ({ data, loading: false, error: null })

function messageOf(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback
}

type Ctx = {
  /**
   * 지금 보고 있는 데이터의 출처. <b>읽기 전용이다</b> — 바꾸는 수단을 내보내지 않는다.
   * 정하는 곳은 로그인뿐이다({@link initialMode} 주석).
   */
  mode: Mode
  gateway: Gateway

  session: SessionStatus
  user: User | null
  theme: 'light' | 'dark'
  toggleTheme: () => void

  /* 세션 */
  loginWithToken: (token: string) => Promise<boolean>
  startKakaoLogin: () => void
  /**
   * 테스트 계정으로 로그인한다. 성공하면 화면을 통째로 /app 으로 옮긴다.
   *
   * 실패해도 토스트를 띄우지 않는다 — 비밀번호를 틀렸다는 말은 입력 칸 옆에 있어야 한다.
   * 호출한 화면이 `false` 를 받아 직접 알린다.
   */
  loginAsTester: (loginId: string, password: string) => Promise<boolean>
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

  /**
   * 마일스톤 보상 수령. 성공하면 받은 것을 그대로 돌려준다 — 화면이 공개 연출에 쓴다.
   *
   * <p>성공 토스트를 띄우지 않는다. 무엇을 받았는지는 모달이 보여주고, 토스트까지 겹치면
   * 같은 말을 두 곳에서 한다.
   */
  claimReward: (milestone: number) => Promise<RewardClaimResult | null>

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
      /*
        직접 로그아웃한 탭이면 아무 방법으로도 세션을 되살리지 않는다.

        <p>목업 모드는 `me()` 가 늘 성공하고, api 모드는 리프레시 쿠키가 남아 있으면
        재발급이 성공한다. 그래서 이 확인이 없으면 로그아웃한 뒤 주소창으로 다시 들어오는
        순간(= 앱이 처음부터 뜨는 순간) 로그인 상태로 돌아간다.
      */
      if (wasLoggedOut()) {
        setUser(null)
        setSession('guest')
        return
      }

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

      /*
        테스트 계정 로그인.

        카카오와 달리 리다이렉트가 없어 콜백 화면(`OAuthCallbackPage`)을 지나지 않는다. 그래서
        그 화면이 하던 세 가지를 여기서 한다 — 목업 표시 지우기, 토큰 저장, 그리고 새로고침하며
        /app 진입. 상태만 바꿔 들어가면 세션 복원이 다시 돌지 않아 사용자·시트가 비어 있는
        첫 화면이 뜬다.
      */
      loginAsTester: async (loginId, password) => {
        try {
          const data = await auth.testLogin(loginId, password)
          clearMockSession()
          setAccessToken(data.accessToken)
          window.location.replace('/app')
          return true
        } catch {
          // 실패 문구는 입력 칸 옆에 붙어야 읽힌다. 화면이 알린다.
          return false
        }
      },

      enterMockSession: () => {
        // 로그아웃 표시를 지우지 않으면 세션 복원이 목업 세션까지 게스트로 되돌린다.
        clearLoggedOut()
        window.localStorage.setItem(MODE_KEY, 'mock')
        setModeState('mock')
      },

      /*
        로그아웃.

        <p>세 곳을 같이 비워야 끝난다 — 액세스 토큰, 데이터 모드, 그리고 "되살리지 말라"는
        표시다. 토큰만 비우면 상태로만 게스트가 되고, 앱이 처음부터 뜨는 순간(주소창 입력·
        새로 고침) 복원 로직이 목업 세션이나 리프레시 쿠키로 다시 로그인시킨다.

        <p>모드를 'api' 로 되돌리는 것이 특히 중요하다. 목업으로 화면을 보다가 로그아웃하면
        localStorage 에 'mock' 이 남고, 목업 게이트웨이의 `me()` 는 늘 성공하므로
        <b>토큰이 없어도</b> 다음 부팅에서 로그인 상태가 된다.
      */
      logout: async () => {
        try {
          await gatewayRef.current.logout()
        } catch {
          // 서버가 실패해도 로컬 세션은 비운다.
        }
        clearAccessToken()
        markLoggedOut()
        // 저장분과 지금 화면의 출처를 함께 되돌린다 — 앞은 다음 부팅, 뒤는 지금을 위한 것이다.
        clearMockSession()
        setModeState('api')
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

          const completedCount = res.completedSubjectIds?.length ?? 0
          if (completedCount > 0) {
            if (res.earned > 0) {
              toast.show({
                tone: 'point',
                title: `+${res.earned}P 적립`,
                body: '건물이 한 단계 자랐어요.',
              })
            } else {
              toast.show({
                tone: 'point',
                title: '과제 수행 완료!',
                body: '오늘 일일 포인트 상한(1,000P)을 채워 포인트는 적립되지 않았어요.',
              })
            }
          } else {
            toast.show({
              tone: 'info',
              title: '이미 수행한 과제예요',
              body: '포인트는 주기마다 한 번만 쌓여요.',
            })
          }
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

      claimReward: async (milestone) => {
        try {
          const res = await gatewayRef.current.claimReward(milestone)
          /*
            서버가 지급 후 잔액을 함께 준다. 그 값을 그대로 쓴다 — 여기서 더하면
            크레딧 대체 지급(fallbackFromLandmark)처럼 금액이 종류와 다른 경우에 어긋난다.
          */
          setUser((prev) => (prev ? { ...prev, point: res.currentPoint } : prev))
          return res
        } catch (cause) {
          fail(cause, '보상을 받지 못했습니다.')
          return null
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

/* ─────────────────────────  보상 트랙  ───────────────────────── */

/**
 * 마일스톤 보상 트랙.
 *
 * <p>공통 데이터(`store` 의 슬라이스)에 두지 않은 이유: 지금 이걸 쓰는 화면이 만다라트 상세
 * 하나뿐인데, 슬라이스로 두면 로그인할 때마다 어느 화면에서도 안 쓰는 요청이 한 번 더 나간다.
 *
 * <p>과제를 수행하면 진행률이 올라 구간이 열릴 수 있으므로, 부르는 화면이 <b>수행 완료 뒤에
 * `reload` 를 불러야 한다.</b> 안 부르면 방금 넘긴 구간이 새로고침 전까지 잠긴 채로 남는다.
 *
 * @param enabled 꺼 두면 요청을 보내지 않는다. 친구 시트(읽기 전용)처럼 <b>남의 화면에
 *   내 계정 트랙을 그릴 수 없는</b> 자리에서 쓴다 — 훅은 조건부로 호출할 수 없으므로
 *   호출을 빼는 대신 여기서 끈다.
 */
export function useRewardTrack(enabled = true) {
  const { gateway, session } = useStore()
  const [track, setTrack] = useState<RewardTrack | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      setTrack(await gateway.rewardTrack())
      setError(null)
    } catch (cause) {
      setError(messageOf(cause, '보상 트랙을 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [enabled, gateway])

  useEffect(() => {
    if (!enabled || session !== 'authed') return
    void reload()
  }, [enabled, reload, session])

  return { track, loading, error, reload, setTrack }
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
