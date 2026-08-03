import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '../../utils/cn'

type Tone = 'success' | 'info' | 'warn' | 'point'

type ToastItem = {
  id: number
  tone: Tone
  title: string
  body?: string
}

type ToastCtx = {
  show: (input: { tone?: Tone; title: string; body?: string }) => void
}

const Ctx = createContext<ToastCtx | null>(null)

const TONE: Record<Tone, { ring: string; icon: string; iconWrap: string }> = {
  success: {
    ring: 'border-emerald-500/25',
    icon: '✓',
    iconWrap: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  },
  info: {
    ring: 'border-sky-500/25',
    icon: 'i',
    iconWrap: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  },
  warn: {
    ring: 'border-amber-500/30',
    icon: '!',
    iconWrap: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  point: {
    ring: 'border-brand-500/30',
    icon: '＋',
    iconWrap: 'bg-brand-500/12 text-brand-600 dark:text-brand-400',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const show = useCallback<ToastCtx['show']>(({ tone = 'success', title, body }) => {
    seq.current += 1
    const id = seq.current
    setItems((list) => [...list, { id, tone, title, body }].slice(-3))
    window.setTimeout(() => {
      setItems((list) => list.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <Ctx.Provider value={value}>
      {children}
      {/*
        하단 중앙 고정. 모바일 탭바(높이 64px)를 피해 위로 올린다.
        aria-live 로 읽어주되 초점은 뺏지 않는다.
      */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-[84px] z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'animate-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3',
              TONE[t.tone].ring,
            )}
            style={{ background: 'var(--surface-raised)', boxShadow: 'var(--shadow-pop)' }}
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[13px] font-black',
                TONE[t.tone].iconWrap,
              )}
            >
              {TONE[t.tone].icon}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold">{t.title}</p>
              {t.body && <p className="muted m-0 mt-0.5 text-[13px] font-medium">{t.body}</p>}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast 는 ToastProvider 안에서만 쓸 수 있습니다.')
  return ctx
}
