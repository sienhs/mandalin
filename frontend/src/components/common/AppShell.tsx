import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../data/store'
/*
  셸의 링크는 하나도 빠짐없이 이탈 확인을 거쳐야 한다. 만다라트를 만들던 중 사이드바를
  누르면 81칸이 사라졌던 게 여기서 시작한다 — 한 곳이라도 맨 `NavLink` 로 남으면 그 링크만
  조용히 초안을 버린다. 그래서 이름을 그대로 `NavLink` 로 받아 쓴다.
*/
import { GuardedNavLink as NavLink, useUnsavedGuard } from './UnsavedGuard'
import { cn } from '../../utils/cn'
import { fromNow, num } from '../../utils/format'
import Logo from './Logo'
import { Avatar, Skeleton } from './Primitives'
import {
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconChart,
  IconFriends,
  IconGrid,
  IconHome,
  IconMoon,
  IconMore,
  IconShop,
  IconSun,
  IconTrophy,
  IconVillage,
} from './Icons'
import OnboardingTour from './OnboardingTour'

type NavItem = {
  to: string
  label: string
  icon: (props: { className?: string }) => React.ReactElement
  primary?: boolean
}

/**
 * 주 메뉴. 순서가 곧 서비스의 핵심 루프다 —
 * 오늘 할 일(홈) → 목표 설계(만다라트) → 결과 확인(마을) → 보상(상점) → 되돌아보기(리포트).
 *
 * <p>AI 코치는 여기 두지 않는다. 코치는 <b>만다라트를 만드는 도중</b>에 부르는 도구라
 * 그 화면 안에서 이어지는 것이 맞고(생성 화면의 "AI 코치로 이어 만들기"), 메뉴에 두면
 * 쓰던 초안을 두고 떠나는 이동이 된다. `/app/coach` 경로 자체는 살아 있다.
 */
const NAV: NavItem[] = [
  { to: '/app', label: '홈', icon: IconHome, primary: true },
  { to: '/app/sheets', label: '내 만다라트', icon: IconGrid, primary: true },
  { to: '/app/village', label: '내 마을', icon: IconVillage, primary: true },
  { to: '/app/shop', label: '상점', icon: IconShop },
  { to: '/app/report', label: '리포트', icon: IconChart },
  { to: '/app/friends', label: '친구', icon: IconFriends },
  { to: '/app/leaderboard', label: '리더보드', icon: IconTrophy },
]

export default function AppShell() {
  const {
    user,
    theme,
    toggleTheme,
    logout,
    mode,
    setMode,
    onboarded,
    notifications,
    reloadNotifications,
  } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  /** 링크가 아닌 이동(알림 항목·로그아웃)도 같은 확인을 거친다. */
  const { guard } = useUnsavedGuard()
  const [moreOpen, setMoreOpen] = useState(false)
  const [notiOpen, setNotiOpen] = useState(false)

  /**
   * 3D 마을 화면인가.
   *
   * <p>이 화면만 <b>세로를 한 픽셀도 낭비할 수 없다</b> — 캔버스 아래에 조작 바와 이동 버튼이
   * 있고 그 셋이 전부 첫 화면에 들어와야 하는데, 헤더(64) + 본문 위 여백(24)이 그만큼을
   * 먼저 가져간다. 그래서 여기서만 헤더를 <b>본문 위에 겹치고</b> 배경을 지운다. 헤더가
   * 흐름에서 빠지면 그 88px 이 캔버스로 간다.
   *
   * <p>버튼은 그대로 둔다. 각자 배경과 테두리가 있어 3D 위에서도 읽히고, 지우는 것은 헤더
   * <b>판</b>(배경·블러·아래 테두리)뿐이다.
   *
   * <p>다른 화면은 전혀 건드리지 않는다 — 헤더가 sticky 로 자리를 차지하는 편이 카드 목록을
   * 읽을 때 맞다.
   */
  const overlayHeader = location.pathname === '/app/village'

  /**
   * 사이드바 접힘. 새로고침해도 유지된다.
   *
   * <p>3D 마을처럼 넓은 화면이 필요한 곳에서 248px 을 되찾으려고 접는 것인데, 페이지를
   * 옮길 때마다 다시 펴지면 접는 의미가 없다. 읽기는 초기화 함수 안에서 한 번만 한다 —
   * 렌더마다 localStorage 를 만지면 느리다.
   */
  const [navOpen, setNavOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nav-collapsed') !== '1'
    } catch {
      // 사파리 프라이빗 모드 등에서 접근이 막히면 그냥 펼친 상태로 둔다.
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('nav-collapsed', navOpen ? '0' : '1')
    } catch {
      /* 저장에 실패해도 이번 세션 동안은 정상 동작한다 */
    }
  }, [navOpen])

  /** 수락/거절이 필요한 항목 수. 서버가 계산해 준다. */
  const pending = notifications.data.actionRequiredCount

  useEffect(() => {
    setMoreOpen(false)
    setNotiOpen(false)
  }, [location.pathname])

  /**
   * 마을 화면에서만 문서 스크롤바를 숨긴다.
   *
   * <p>이 화면은 본문이 `h-dvh` 이고 캔버스가 남은 높이를 flex 로 받으므로 스크롤할 것이 없는데,
   * 그래도 스크롤바 자리(약 15px)가 남으면 캔버스 폭이 그만큼 줄고 오른쪽에 회색 띠가 보인다.
   *
   * <p><b>`overflow: hidden` 이 아니라 스크롤바만 숨긴다.</b> 창을 아주 낮추면(768px 아래)
   * 내용이 넘칠 수 있는데, 그때 스크롤 자체를 막으면 아래 버튼에 닿을 수 없다. 바만 감추면
   * 휠·키보드로는 여전히 움직인다.
   *
   * <p>`html` 에 거는 이유는 문서 스크롤바가 거기 붙기 때문이다 — 셸 안쪽 div 에 걸어도 안 먹는다.
   * 화면을 떠날 때 반드시 되돌린다. 안 그러면 다른 화면의 스크롤바까지 사라진다.
   */
  useEffect(() => {
    if (!overlayHeader) return
    const root = document.documentElement
    root.classList.add('no-scrollbar')
    return () => root.classList.remove('no-scrollbar')
  }, [overlayHeader])

  return (
    <div className="min-h-dvh" style={{ background: 'var(--surface-page)' }}>
      <a
        href="#main"
        className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"
      >
        본문으로 건너뛰기
      </a>

      {/* ───────── 데스크톱 사이드바 ───────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r px-4 py-6',
          navOpen && 'lg:flex',
        )}
        style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
      >
        <div className="mb-8 flex items-start justify-between gap-2">
          <NavLink to="/app" className="flex items-center gap-2.5 px-2 no-underline">
            <Logo className="size-9 shrink-0 text-brand-500" />
            <span className="flex flex-col leading-none">
              <strong className="text-[17px] font-black tracking-[-0.04em]">만다린</strong>
              <span className="muted mt-1 text-[11px] font-bold">목표를 도시로 짓다</span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="메뉴 접기"
            aria-expanded={true}
            title="메뉴 접기"
            className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-black/[.04] hover:text-[var(--text-strong)] dark:hover:bg-white/[.05]"
          >
            <IconArrowLeft className="size-[18px]" />
          </button>
        </div>

        <nav aria-label="주 메뉴" className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold no-underline transition-all duration-200',
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-[var(--text-muted)] hover:bg-black/[.04] hover:text-[var(--text-strong)] dark:hover:bg-white/[.05]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute left-0 h-5 w-[3px] rounded-r-full bg-brand-500 transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <Icon className="size-[21px]" />
                  {label}
                  {to === '/app/friends' && pending > 0 && (
                    <span className="ml-auto grid size-5 place-items-center rounded-full bg-brand-500 text-[10px] font-black text-white">
                      {pending}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ───────── 상단 바 ───────── */}
      <header
        className={cn(
          'top-0 z-30',
          // 사이드바와 같은 200ms — 다르면 본문이 먼저 도착해 빈틈이 잠깐 보인다.
          'transition-[padding] duration-200 ease-out motion-reduce:transition-none',
          navOpen && 'lg:pl-[248px]',
          /*
            마을 화면만 흐름에서 빼 본문 위에 겹친다(`absolute`). `sticky` 로는 자리를 계속
            차지해서 아래 내용을 밀어낸다 — 되찾으려는 것이 바로 그 64px 이다.
            `pointer-events-none` 은 판에만 걸고 버튼에는 다시 켠다(아래 참고).
          */
          overlayHeader
            ? 'pointer-events-none absolute inset-x-0'
            : 'sticky border-b backdrop-blur-xl',
        )}
        style={
          overlayHeader
            ? undefined
            : {
                background: 'color-mix(in oklab, var(--surface-page), transparent 25%)',
                borderColor: 'var(--border-hairline)',
              }
        }
      >
        {/*
          겹칠 때는 빈 자리가 클릭을 먹지 않아야 한다 — 헤더가 3D 위 64px 을 덮고 있어서, 판이
          이벤트를 받으면 그 띠에서 마을을 돌리거나 클릭할 수 없다. 그래서 판은
          `pointer-events-none` 으로 통과시키고 **실제 버튼 묶음에만** 다시 켠다(아래 세 곳).
        */}
        <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center gap-3 px-4 sm:px-6">
          {/*
            펴기 버튼은 접혔을 때만, 그리고 사이드바가 있던 자리에 그대로 둔다.
            화면 위에 떠다니는 버튼으로 만들면 3D 캔버스나 카드 위에 얹혀 다시 가리게 되는데,
            사이드바를 접는 이유가 화면을 비우기 위해서라 그건 앞뒤가 맞지 않는다.
            헤더 안이면 항상 같은 자리에 있고 본문을 침범하지 않는다.
          */}
          {!navOpen && (
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="메뉴 펴기"
              aria-expanded={false}
              title="메뉴 펴기"
              className={cn(
                'hidden size-10 shrink-0 place-items-center rounded-full border text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)] lg:grid',
                overlayHeader && 'pointer-events-auto',
              )}
              style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
            >
              <IconArrowRight className="size-[18px]" />
            </button>
          )}

          {/* 접힌 데스크톱에서는 로고가 사라지므로 여기서 대신 보여 준다. */}
          <NavLink
            to="/app"
            className={cn(
              'flex items-center gap-2 no-underline',
              navOpen ? 'lg:hidden' : 'lg:flex',
              overlayHeader && 'pointer-events-auto',
            )}
          >
            <Logo className="size-8 shrink-0 text-brand-500" />
            <strong className="text-base font-black tracking-[-0.04em]">만다린</strong>
          </NavLink>

          <div
            className={cn(
              'ml-auto flex items-center gap-1.5 sm:gap-2',
              overlayHeader && 'pointer-events-auto',
            )}
          >
            {/* 페이지 제목이나 본문 폭과 무관하게 항상 오른쪽 도구 영역의 첫 자리에 둔다. */}
            <button
              type="button"
              onClick={() => setMode(mode === 'mock' ? 'api' : 'mock')}
              title={
                mode === 'mock'
                  ? '지금은 브라우저 안의 목업 데이터입니다. 눌러서 실제 서버로 전환'
                  : '지금은 실제 백엔드에 연결돼 있습니다. 눌러서 목업으로 전환'
              }
              className={cn(
                'hidden h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11.5px] font-black text-white sm:flex',
                mode === 'mock'
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-700',
              )}
            >
              {mode === 'mock' ? '목업 데이터' : '서버 연결됨'}
            </button>

            <NavLink
              to="/app/shop"
              className="flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] font-extrabold no-underline transition-colors hover:border-brand-300"
              style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
              aria-label={`보유 포인트 ${num(user?.point ?? 0)} 포인트, 상점으로 이동`}
            >
              <span
                aria-hidden="true"
                className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[10px] font-black text-white"
              >
                P
              </span>
              {num(user?.point ?? 0)}
            </NavLink>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? '밝은 테마로 전환' : '어두운 테마로 전환'}
              className="grid size-10 place-items-center rounded-full border text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
              style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
            >
              {theme === 'dark' ? (
                <IconSun className="size-[18px]" />
              ) : (
                <IconMoon className="size-[18px]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setNotiOpen(true)
                void reloadNotifications()
              }}
              aria-label={pending > 0 ? `알림 ${pending}건 확인 필요` : '알림 보기'}
              className="relative grid size-10 place-items-center rounded-full border text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
              style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
            >
              <IconBell className="size-[18px]" />
              {pending > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-black text-white ring-2 ring-[var(--surface-page)]">
                  {pending}
                </span>
              )}
            </button>

            <NavLink to="/app/me" aria-label="마이페이지" className="ml-0.5 no-underline">
              <Avatar
                name={user?.name}
                imageUrl={user?.profileImageUrl ?? null}
                fallback={user?.name?.slice(0, 1) ?? '?'}
                size={40}
              />
            </NavLink>
          </div>
        </div>
      </header>

      <main
        id="main"
        className={cn(
          'transition-[padding] duration-200 ease-out motion-reduce:transition-none',
          navOpen && 'lg:pl-[248px]',
        )}
      >
        {/*
          마을 화면만 위·아래 여백을 줄이고 **높이를 화면에 못 박는다.**

          위(`pt-6` 24 → `pt-3` 12): 헤더가 겹쳐 있으니 그 아래 첫 줄(뒤로 버튼)이 헤더와 겹치지
          않을 만큼만 남긴다. 아래(`lg:pb-16` 64 → `lg:pb-4` 16): 마을 화면은 스크롤할 것이
          없으므로 바닥 여백이 그냥 화면을 먹는다.

          `lg:h-dvh` + `flex flex-col` 이 핵심이다. 예전에는 캔버스 높이를 `100dvh - 228px` 처럼
          <b>뺄셈으로</b> 맞췄는데, 그러면 요소 높이를 하나라도 잘못 세는 순간(실제로 조작 바의
          card 테두리 2px 과 버튼의 h-11 을 놓쳤다) 그만큼 어긋나 미세하게 스크롤됐다. 여기서
          높이를 화면으로 고정하고 캔버스가 `flex-1` 로 남은 만큼 가져가면 <b>산수가 사라진다</b> —
          브라우저가 정확히 나눈다. `box-border`(Tailwind 기본)라 위 패딩도 이 높이 안에 든다.

          <b>줄인 것은 여백뿐이다</b> — 캔버스도 조작 바도 버튼도 크기가 그대로다.
          모바일 하단 탭바를 피하는 `pb-28` 은 남긴다(그 자리에 탭바가 실제로 있다).
        */}
        <div
          className={cn(
            'mx-auto w-full max-w-[1320px] px-4 pb-28 sm:px-6',
            overlayHeader ? 'pt-3 lg:flex lg:h-dvh lg:flex-col lg:pb-4' : 'pt-6 lg:pb-16',
          )}
        >
          <Outlet />
        </div>
      </main>

      {/* ───────── 모바일 하단 탭바 ───────── */}
      <nav
        aria-label="주 메뉴"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl lg:hidden"
        style={{
          background: 'color-mix(in oklab, var(--surface-card), transparent 12%)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        {/* primary 3개 + '더 보기' = 4칸. NAV 의 primary 개수를 바꾸면 여기도 함께 고친다. */}
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {NAV.filter((item) => item.primary).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold no-underline transition-colors',
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-[var(--text-muted)]',
                )
              }
            >
              <Icon className="size-[22px]" />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold text-[var(--text-muted)]"
          >
            <IconMore className="size-[22px]" />
            더보기
            {pending > 0 && (
              <span className="absolute right-5 top-2 size-2 rounded-full bg-brand-500" />
            )}
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 border-0 bg-ink-950/45"
          />
          <div
            className="animate-pop absolute inset-x-0 bottom-0 rounded-t-3xl border-t p-5 pb-8"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
          >
            <p className="muted m-0 mb-3 px-1 text-[12px] font-bold">더 보기</p>
            <div className="grid grid-cols-2 gap-2">
              {NAV.filter((item) => !item.primary).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold no-underline"
                  style={{ background: 'var(--surface-sunken)' }}
                >
                  <Icon className="size-5" />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/app/me"
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold no-underline"
                style={{ background: 'var(--surface-sunken)' }}
              >
                마이페이지
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  const go = async () => {
                    await logout()
                    navigate('/')
                  }
                  if (!guard(() => void go())) void go()
                }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold text-red-500"
                style={{ background: 'var(--surface-sunken)' }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── 알림 패널 ───────── */}
      {notiOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="알림">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setNotiOpen(false)}
            className="absolute inset-0 border-0 bg-ink-950/40 backdrop-blur-[2px]"
          />
          <div
            className="animate-pop absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col border-l"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
          >
            <div
              className="flex items-center justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <h2 className="m-0 text-base font-extrabold">알림</h2>
              <button
                type="button"
                onClick={() => setNotiOpen(false)}
                aria-label="닫기"
                className="grid size-8 place-items-center rounded-full text-lg text-[var(--text-muted)]"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {notifications.loading && notifications.data.items.length === 0 ? (
                <div className="flex flex-col gap-2 p-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : notifications.data.items.length === 0 ? (
                <p className="muted px-4 py-12 text-center text-sm font-semibold">
                  새로운 알림이 없어요.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {notifications.data.items.map((n, i) => (
                    <li key={`${n.kind}-${n.referenceId ?? i}`}>
                      <button
                        type="button"
                        onClick={() => {
                          const go = () => {
                            if (n.kind === 'FRIEND_REQUEST') navigate('/app/friends?tab=requests')
                            else if (n.kind === 'TODO_REMAINING') navigate('/app')
                            else navigate('/app/sheets')
                            setNotiOpen(false)
                          }
                          if (!guard(go)) go()
                        }}
                        className={cn(
                          'flex w-full flex-col items-start gap-1 rounded-2xl px-4 py-3.5 text-left transition-colors',
                          n.actionRequired
                            ? 'bg-brand-500/[.07] hover:bg-brand-500/[.12]'
                            : 'hover:bg-black/[.03] dark:hover:bg-white/[.04]',
                        )}
                      >
                        <span className="flex w-full items-center gap-2">
                          {n.actionRequired && (
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 rounded-full bg-brand-500"
                            />
                          )}
                          <strong className="min-w-0 flex-1 text-[13.5px] font-extrabold">
                            {n.title}
                          </strong>
                          {n.createdAt && (
                            <span className="muted shrink-0 text-[11px] font-bold">
                              {fromNow(n.createdAt)}
                            </span>
                          )}
                        </span>
                        <span className="muted text-[12.5px] font-medium leading-snug">
                          {n.body}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 읽음 처리가 없다는 사실을 숨기지 않는다 */}
            <p
              className="muted m-0 border-t px-5 py-3 text-[11px] font-medium leading-relaxed"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              알림은 받은 요청과 남은 할 일을 그때그때 모아 보여줍니다. 따로 읽음 처리를 하지
              않아요.
            </p>
          </div>
        </div>
      )}

      {!onboarded && <OnboardingTour />}
    </div>
  )
}
