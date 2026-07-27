import { Link } from 'react-router-dom'

type PublicHeaderProps = {
  showLoginButton?: boolean
}

export default function PublicHeader({ showLoginButton = true }: PublicHeaderProps) {
  return (
    <header className="h-[72px] border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          aria-label="만다린 홈"
          className="flex items-center gap-2.5 text-slate-950 no-underline"
        >
          <span className="grid size-9 place-items-center rounded-[10px] bg-[#61B5A7] text-base font-extrabold text-white shadow-sm">
            만
          </span>
          <span className="text-xl font-extrabold tracking-[-0.04em]">만다린</span>
        </Link>

        {showLoginButton && (
          <Link
            to="/login"
            className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white no-underline transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#61B5A7]"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
