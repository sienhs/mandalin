import { useEffect, useState, type MouseEventHandler } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'

type HeaderProps = {
  hasNotification?: boolean
  onNotificationClick?: MouseEventHandler<HTMLButtonElement>
  onProfileClick?: MouseEventHandler<HTMLButtonElement>
}

const NAV_ITEMS = [
  { label: '홈', to: '/home' },
  { label: '내 만다라트', to: '/village' },
  { label: '상점', to: '/shop' },
  { label: '리포트', to: '/report' },
  { label: '친구', to: '/friends' },
  { label: '리더보드', to: '/leaderboard' },
] as const

function CoinIcon() {
  return (
    <span
      aria-hidden="true"
      className="grid size-5 shrink-0 place-items-center rounded-full bg-[#F7C85C] text-[11px] font-black text-[#D69327] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.38)]"
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
        className="size-5 fill-[#E8B744] stroke-[#E8B744]"
        strokeWidth="1.8"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        <path d="M10 20h4" fill="none" strokeLinecap="round" />
      </svg>
      {hasNotification && (
        <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[#D95569] ring-2 ring-[#F6F7F8]" />
      )}
    </span>
  )
}

export default function Header({
  hasNotification = false,
  onNotificationClick,
  onProfileClick,
}: HeaderProps) {
  const { user, isRestoringSession } = useAuth()
  const [profileImageFailed, setProfileImageFailed] = useState(false)
  const profileImageUrl = user?.profileImageUrl
  const profileInitial = user?.name.trim().slice(0, 1)
  const points = user?.points

  useEffect(() => {
    setProfileImageFailed(false)
  }, [profileImageUrl])

  return (
    <header className="h-20 w-full border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-6 sm:px-8">
        <div className="flex h-full min-w-0 items-center gap-8 lg:gap-12">
          <NavLink
            to="/home"
            aria-label="만다린 홈"
            className="flex shrink-0 items-center gap-3 text-slate-950 no-underline"
          >
            <span className="grid size-9 place-items-center rounded-[11px] bg-[#61B5A7] text-base font-extrabold text-white shadow-sm">
              만
            </span>
            <span className="text-xl font-extrabold tracking-[-0.04em]">만다린</span>
          </NavLink>

          <nav
            aria-label="주 메뉴"
            className="hidden h-full items-center gap-7 md:flex lg:gap-9"
          >
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/home'}
                className={({ isActive }) =>
                  [
                    'relative flex h-full items-center whitespace-nowrap pt-0.5 text-[15px] font-bold tracking-[-0.02em] no-underline transition-colors',
                    'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-transform',
                    isActive
                      ? 'text-[#65AA9F] after:scale-x-100 after:bg-[#65AA9F]'
                      : 'text-[#667085] after:scale-x-0 after:bg-transparent hover:text-[#65AA9F]',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="ml-5 flex shrink-0 items-center gap-4">
          <div
            aria-label={points == null ? '포인트 정보 없음' : `${points.toLocaleString('ko-KR')} 포인트`}
            className="flex h-10 items-center gap-1.5 rounded-full bg-[#FFF6DE] px-4 text-[15px] font-extrabold text-[#A96028]"
          >
            <CoinIcon />
            <span>{points == null ? '— P' : `${points.toLocaleString('ko-KR')} P`}</span>
          </div>

          <button
            type="button"
            aria-label="알림 보기"
            onClick={onNotificationClick}
            className="grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-[#F6F7F8] transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#61B5A7]"
          >
            <BellIcon hasNotification={hasNotification} />
          </button>

          <button
            type="button"
            aria-label={user ? `${user.name} 프로필` : '내 프로필'}
            onClick={onProfileClick}
            className="grid size-10 cursor-pointer place-items-center overflow-hidden rounded-full border-0 bg-[#D95569] text-base font-bold text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D95569]"
          >
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
        </div>
      </div>
    </header>
  )
}
