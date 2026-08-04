import { useEffect, useState } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

/** 도메인 8색. 만다라트 칸 · 마을 건물 · 리포트 막대가 모두 이 배열을 인용한다. */
export const DOMAIN_COLORS = [
  '#e8590c',
  '#d9480f',
  '#1971c2',
  '#0c8599',
  '#2f9e44',
  '#5f3dc4',
  '#c2255c',
  '#f08c00',
] as const

export function domainColor(index: number): string {
  return DOMAIN_COLORS[((index % 8) + 8) % 8]
}

/* ───────────────────────── 진행 표시 ───────────────────────── */

export function ProgressBar({
  value,
  color,
  label,
  size = 'md',
}: {
  value: number
  color?: string
  label?: string
  size?: 'sm' | 'md'
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: `${clamped}%`,
          background: color
            ? `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color}, white 28%))`
            : 'linear-gradient(90deg, var(--color-brand-600), var(--color-brand-400))',
        }}
      />
    </div>
  )
}

/** 원형 진행률. 홈·상세 헤더에서 달성률을 한눈에 보여준다. */
export function ProgressRing({
  value,
  size = 92,
  stroke = 9,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-[var(--surface-sunken)]"
        />
        <defs>
          <linearGradient id={`ring-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-500)" />
            <stop offset="100%" stopColor="var(--color-brand-300)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#ring-${size})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

/* ───────────────────────── 배지 · 칩 ───────────────────────── */

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'brand' | 'success' | 'muted'
  className?: string
}) {
  /*
    색이 있는 배지는 그라데이션 + 흰 글자다.

    <p>예전에는 옅은 반투명 배경(`bg-brand-500/12`)에 같은 계열 진한 글자를 얹었다. 카드
    위에서는 배경이 거의 사라져 글자만 뜬 것처럼 보였고, 그 옅은 판이 화면 곳곳에 흩어져
    있어 무엇이 강조인지 읽히지 않았다. 채운 그라데이션은 카드·배경 어디에 놓아도 같은
    무게로 읽힌다. 회색(neutral·muted)은 강조가 아니라 바탕이라 그대로 둔다.
  */
  const tones = {
    neutral: 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
    brand: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white',
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white',
    muted: 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
  } as const

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ───────────────────────── 폼 ───────────────────────── */

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[12.5px] font-bold text-[var(--text-muted)]">{label}</span>
      {children}
      {hint && <span className="text-[11.5px] font-medium text-[var(--text-muted)]">{hint}</span>}
    </label>
  )
}

/**
 * 입력 계열 공통 스타일.
 *
 * <p>⚠️ <b>`w-full` 이 들어 있다.</b> 폼에서는 이게 맞지만, flex 줄 안에 다른 것과 나란히
 * 둘 때는 함정이 된다. `className="w-[92px] shrink-0"` 처럼 폭을 줘도 `w-full` 이 살아남아
 * 100% 로 잡히고, `shrink-0` 때문에 줄어들지도 못해 부모 밖으로 넘쳐 잘린다.
 * (만다라트 만들기의 주기 선택이 실제로 그렇게 깨져 있었다 — 옆 입력창은 40px 로 짓눌렸다.)
 *
 * <p>flex 안에서 좁게 쓰려면 <b>`shrink-0` 대신 `min-w-0` 과 명시적 basis</b>를 쓰거나,
 * 애초에 이 스타일을 쓰지 않는 별도 컨트롤을 만든다.
 */
const CONTROL =
  'w-full rounded-xl border bg-[var(--surface-card)] px-3.5 text-sm font-semibold text-[var(--text-strong)] ' +
  'outline-none transition-colors placeholder:font-medium placeholder:text-[var(--text-muted)] ' +
  'focus:border-brand-400 h-11'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(CONTROL, className)}
      style={{ borderColor: 'var(--border-hairline)' }}
      {...rest}
    />
  )
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(CONTROL, 'cursor-pointer', className)}
      style={{ borderColor: 'var(--border-hairline)' }}
      {...rest}
    >
      {children}
    </select>
  )
}

/** 두세 개 선택지를 나란히 두는 토글. 탭·필터·공개여부에 함께 쓴다. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
  className,
}: {
  value: T
  options: Array<{ value: T; label: ReactNode }>
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn(
        // self-start 가 없으면 세로 flex(예: Field) 안에서 stretch 로 늘어나, 버튼 두 개
        // 오른쪽이 텅 빈 알약이 된다. inline-flex 라는 이름과 실제 폭이 어긋나던 자리다.
        'inline-flex items-center gap-1 self-start rounded-full p-1',
        'bg-[var(--surface-sunken)]',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full font-bold transition-all duration-200',
              size === 'sm' ? 'h-8 px-3 text-[12.5px]' : 'h-9 px-4 text-[13px]',
              active
                ? 'bg-[var(--surface-card)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(0,0,0,.08),0_6px_16px_-8px_rgba(0,0,0,.25)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/* ───────────────────────── 상태 화면 ───────────────────────── */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-2xl bg-[var(--surface-sunken)] text-2xl"
      >
        {icon}
      </span>
      <p className="m-0 mt-4 text-base font-extrabold tracking-[-0.02em]">{title}</p>
      <p className="muted m-0 mt-2 max-w-sm text-[13.5px] font-medium leading-relaxed">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden="true" />
}

/**
 * 요청이 실패했을 때. 서버가 준 메시지를 그대로 보여주고 다시 시도할 길을 남긴다.
 * "불러오지 못했습니다"만 띄우고 끝내면 사용자는 무엇을 해야 할지 알 수 없다.
 */
export function ErrorState({
  message,
  onRetry,
  hint,
}: {
  message: string
  onRetry?: () => void
  hint?: ReactNode
}) {
  return (
    <div className="card px-6 py-12 text-center" role="alert">
      <span
        aria-hidden="true"
        className="mx-auto grid size-12 place-items-center rounded-2xl text-xl"
        style={{ background: 'var(--surface-sunken)' }}
      >
        ⚠️
      </span>
      <p className="m-0 mt-4 text-[15px] font-extrabold">불러오지 못했어요</p>
      <p className="muted m-0 mx-auto mt-2 max-w-md text-[13px] font-medium leading-relaxed">
        {message}
      </p>
      {hint && (
        <p className="muted m-0 mx-auto mt-3 max-w-md text-[12px] font-medium leading-relaxed">
          {hint}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 h-10 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white transition hover:bg-brand-500"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}

/**
 * 프로필 아바타. 카카오 사진 → 이름 첫 글자 순으로 물러난다.
 * 사진 URL 이 깨지는 경우가 잦아 onError 폴백을 반드시 둔다.
 */
export function Avatar({
  name,
  imageUrl,
  fallback,
  size = 40,
  ring,
}: {
  name?: string
  imageUrl?: string | null
  fallback?: string
  size?: number
  ring?: boolean
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [imageUrl])

  const initial = (fallback ?? name ?? '?').trim().slice(0, 1) || '?'

  return (
    <span
      aria-label={name ? `${name} 프로필` : undefined}
      role={name ? 'img' : undefined}
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-full',
        'bg-gradient-to-br from-brand-400 to-brand-600 font-black text-white',
        ring && 'ring-2 ring-brand-400/60 ring-offset-2 ring-offset-[var(--surface-card)]',
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt=""
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  )
}
