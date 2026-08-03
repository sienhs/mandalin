import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-[-0.01em] ' +
  'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 ' +
  'active:translate-y-px select-none whitespace-nowrap'

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-[0_1px_2px_rgba(232,57,12,.28),0_8px_20px_-8px_rgba(232,57,12,.55)] ' +
    'hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_2px_4px_rgba(232,57,12,.3),0_14px_28px_-10px_rgba(232,57,12,.6)]',
  secondary:
    'border border-[var(--border-hairline)] bg-[var(--surface-card)] text-[var(--text-strong)] ' +
    'hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600',
  ghost:
    'text-[var(--text-muted)] hover:bg-black/[.045] hover:text-[var(--text-strong)] dark:hover:bg-white/[.06]',
  danger:
    'border border-red-500/25 bg-red-500/[.08] text-red-600 hover:bg-red-500/[.14] dark:text-red-400',
  quiet:
    'bg-[var(--surface-sunken)] text-[var(--text-strong)] hover:bg-black/[.06] dark:hover:bg-white/[.08]',
}

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[52px] px-7 text-base',
}

type Props = {
  variant?: Variant
  size?: Size
  to?: string
  /** `to` 와 함께 쓰는 라우터 state. 도착한 화면이 "어디서 왔는지" 알아야 할 때 쓴다. */
  state?: unknown
  full?: boolean
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

/** 링크로도 버튼으로도 쓰는 공용 버튼. `to` 를 주면 react-router Link 로 렌더한다. */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  state,
  full,
  className,
  children,
  ...rest
}: Props) {
  const classes = cn(BASE, VARIANT[variant], SIZE[size], full && 'w-full', className)

  if (to) {
    return (
      <Link to={to} state={state} className={cn(classes, 'no-underline')}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
