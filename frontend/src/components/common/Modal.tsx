import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

/**
 * 공용 모달. ESC 로 닫히고, 열리는 동안 배경 스크롤을 막고, 초점을 안으로 가둔다.
 * 목업이라도 이 세 가지가 빠지면 키보드로 쓸 수 없다.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    // 열리자마자 패널 안 첫 요소로 초점을 옮긴다.
    window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(
        'input, button, a[href], select, textarea',
      )?.focus()
    }, 20)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-ink-950/45 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        className={cn(
          'animate-pop relative m-0 w-full overflow-hidden rounded-t-3xl border sm:m-6 sm:rounded-3xl',
          size === 'sm' && 'sm:max-w-md',
          size === 'md' && 'sm:max-w-xl',
          size === 'lg' && 'sm:max-w-3xl',
        )}
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-hairline)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-7">
          <div className="min-w-0">
            <h2 className="m-0 text-lg font-extrabold tracking-[-0.03em]">{title}</h2>
            {description && (
              <p className="muted m-0 mt-1.5 text-[13.5px] font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid size-9 shrink-0 place-items-center rounded-full border-0 bg-[var(--surface-sunken)] text-lg leading-none text-[var(--text-muted)] transition hover:text-[var(--text-strong)]"
          >
            ×
          </button>
        </div>

        {children && <div className="px-6 py-5 sm:px-7">{children}</div>}

        {footer && (
          <div
            className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-4 sm:px-7"
            style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-sunken)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
