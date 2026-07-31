import { useEffect, useState, type MouseEventHandler } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { cn } from '../../utils/cn'
import '../../styles/header.css'

type HeaderProps = {
  hasNotification?: boolean
  fallbackPoint?: number
  fallbackProfileName?: string
  onNotificationClick?: MouseEventHandler<HTMLButtonElement>
  onProfileClick?: MouseEventHandler<HTMLButtonElement>
}

/** 로그인 후 서비스 공통 상단 내비게이션 메뉴. */
const NAV_ITEMS = [
  { label: '홈', to: '/home' },
  { label: '내 만다라트', to: '/sheets' },
  { label: '상점', to: '/shop' },
  { label: '리포트', to: '/report' },
  { label: '친구', to: '/friends' },
  { label: '리더보드', to: '/leaderboard' },
] as const

function CoinIcon() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-5 shrink-0 place-items-center rounded-full',
        'bg-coin-bg text-[11px] font-black text-coin-text',
        'shadow-[inset_0_0_0_2px_rgba(255,255,255,0.38)]',
      )}
    >
      ₩
    </span>
  )
}

function BellIcon({ hasNotification }: { hasNotification: boolean }) {
  return (
    <span className="relative" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        className="size-5 fill-gold stroke-gold"
        strokeWidth="1.8"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        <path d="M10 20h4" fill="none" strokeLinecap="round" />
      </svg>
      {hasNotification && (
        <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-alert ring-2 ring-surface-muted" />
      )}
    </span>
  )
}

/**
 * 로그인 후 화면 공통 헤더 — 로고, 주 메뉴, 포인트, 알림, 프로필 아바타.
 * 유저 데이터는 AuthContext에서 가져오며, 세션 복원 중(isRestoringSession)에는
 * 아바타 자리에 로딩 표시를 보여준다.
 */
export default function Header({
  hasNotification = false,
  fallbackPoint,
  fallbackProfileName,
  onNotificationClick,
  onProfileClick,
}: HeaderProps) {
  const { user, isRestoringSession, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileImageFailed, setProfileImageFailed] = useState(false)
  const profileImageUrl = user?.profileImageUrl
  const profileName = user?.name ?? fallbackProfileName
  const profileInitial = profileName?.trim().slice(0, 1)
  const point = user?.point ?? fallbackPoint

  // 프로필 이미지 URL이 바뀌면(유저 전환 등) 이전 로드 실패 상태를 초기화해 다시 시도.
  useEffect(() => {
    setProfileImageFailed(false)
  }, [profileImageUrl])

  // 페이지 이동이 끝나면 열려 있던 작은 화면용 메뉴를 닫는다.
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // logout()은 서버 요청이 실패해도 로컬 세션을 비우므로 성공/실패를 가르지 않는다.
  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-header">
      <div className="header-row">
        <div className="app-header-leading">
          <NavLink
            to="/home"
            aria-label="만다린 홈"
            className="app-header-brand"
          >
            <span className="brand-mark size-9 rounded-[11px] text-base shadow-sm">
              만
            </span>
            <span className="brand-wordmark hidden text-xl sm:inline">만다린</span>
          </NavLink>

          <nav
            aria-label="주 메뉴"
            className="app-header-desktop-nav"
          >
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/home'}
                className={({ isActive }) =>
                  cn(
                    'app-header-nav-link',
                    isActive
                      ? 'app-header-nav-link-active'
                      : 'app-header-nav-link-idle',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="app-header-actions">
          <div
            aria-label={
              point == null
                ? '포인트 정보 없음'
                : `${point.toLocaleString('ko-KR')} 포인트`
            }
            className="app-header-points"
          >
            <CoinIcon />
            <span className="hidden sm:inline">
              {point == null ? '— P' : `${point.toLocaleString('ko-KR')} P`}
            </span>
          </div>

          <button
            type="button"
            aria-label="알림 보기"
            onClick={onNotificationClick}
            className={cn(
              'icon-btn focus-ring size-[40px]',
              'bg-surface-muted transition-colors hover:bg-slate-200',
              'focus-visible:outline-brand',
            )}
          >
            <BellIcon hasNotification={hasNotification} />
          </button>

          <button
            type="button"
            aria-label={profileName ? `${profileName} 프로필` : '내 프로필'}
            onClick={onProfileClick ?? (() => navigate('/mypage'))}
            className={cn(
              'icon-btn focus-ring size-[40px] overflow-hidden',
              'bg-alert text-base font-bold text-white',
              'transition-transform hover:scale-105',
              'focus-visible:outline-alert',
            )}
          >
            {/*
              프로필 아바타 3단 폴백:
              1) 카카오 프로필 사진(user.profileImageUrl, 로그인 시 백엔드가 내려줌)이 있고
                 로드에 실패하지 않았으면 그대로 표시.
              2) 이미지가 없거나 onError로 profileImageFailed가 true가 되면 이름 첫 글자로 대체.
              3) 이름도 아직 없으면(세션 복원 중이거나 비로그인) 로딩 점(…) 또는 기본 아이콘.
            */}
            {profileImageUrl && !profileImageFailed ? (
              <img
                src={profileImageUrl}
                alt=""
                onError={() => setProfileImageFailed(true)}
                className="size-full object-cover"
              />
            ) : profileInitial ? (
              profileInitial
            ) : (
              <span aria-hidden="true">{isRestoringSession ? '…' : '👤'}</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              'app-header-logout',
              'focus-ring',
            )}
          >
            {isLoggingOut ? '로그아웃 중…' : '로그아웃'}
          </button>

          <button
            type="button"
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
            className={cn(
              'app-header-menu-button',
              'icon-btn focus-ring size-[40px] xl:hidden',
            )}
          >
            <span className="app-header-menu-lines" aria-hidden="true">
              <span
                className={cn(
                  'app-header-menu-line transition-transform',
                  isMenuOpen && 'translate-y-[6px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'app-header-menu-line transition-opacity',
                  isMenuOpen && 'opacity-0',
                )}
              />
              <span
                className={cn(
                  'app-header-menu-line transition-transform',
                  isMenuOpen && '-translate-y-[6px] -rotate-45',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="작은 화면 주 메뉴"
          className="app-header-mobile-nav"
        >
          <div className="app-header-mobile-nav-inner">
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/home'}
                className={({ isActive }) =>
                  cn(
                    'app-header-mobile-link',
                    isActive
                      ? 'app-header-mobile-link-active'
                      : 'app-header-mobile-link-idle',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="app-header-mobile-logout"
            >
              {isLoggingOut ? '로그아웃 중…' : '로그아웃'}
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
