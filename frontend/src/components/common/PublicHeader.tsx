import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import Logo from './Logo'

type PublicHeaderProps = {
  showLoginButton?: boolean
}

/** 비로그인 화면(랜딩/로그인 등) 공통 헤더 — 로고 + 로그인 버튼(선택적으로 숨김). */
export default function PublicHeader({ showLoginButton = true }: PublicHeaderProps) {
  return (
    <header className="h-[72px] border-b border-slate-100 bg-white">
      <div className="header-row px-5">
        <Link
          to="/"
          aria-label="만다린 홈"
          className="flex items-center gap-2.5 text-slate-950 no-underline"
        >
          <Logo className="size-9 shrink-0 text-brand-500" />
          <span className="brand-wordmark text-xl">만다린</span>
        </Link>

        {showLoginButton && (
          <Link
            to="/login"
            className={cn(
              'focus-ring rounded-xl px-6 py-3',
              'bg-slate-950 text-sm font-bold text-white no-underline',
              'transition hover:bg-slate-800',
              'focus-visible:outline-brand',
            )}
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
