import { useEffect, useRef, useState } from 'react'
import Button from '../common/ActionButton'
import { Field, Input } from '../common/Primitives'
import { MAX_SHEET_TITLE } from '../../features/sheet/draftStorage'

type Props = {
  open: boolean
  /** 입력을 마쳤다. 다듬은 값이 온다(빈 문자열로는 오지 않는다). */
  onSubmit: (goal: string) => void
  /** 적지 않고 나간다. 화면을 떠나는 유일한 길이다. */
  onLeave: () => void
}

/**
 * 핵심 목표가 비어 있을 때 코치 화면을 덮는 입력 팝업.
 *
 * **공용 `Modal` 을 쓰지 않는다** — 그쪽은 ESC·배경·× 로 언제나 닫히는데 여기는 적어야
 * 넘어갈 수 있다. 대신 `onLeave` 로 나가는 길은 남긴다.
 *
 * 값을 여기서 들고 있는 이유는 부모의 `goal` 을 건드리면 글자마다 시트가 서버로 나가서다.
 */
export default function CoachGoalPrompt({ open, onSubmit, onLeave }: Props) {
  const [value, setValue] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    // 닫을 수 없는 창일수록 Tab 이 뒤 화면으로 새면 안 된다.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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
    window.setTimeout(() => panelRef.current?.querySelector('input')?.focus(), 20)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [open])

  if (!open) return null

  const trimmed = value.trim()

  const submit = () => {
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coach-goal-prompt-title"
    >
      {/* 배경은 버튼이 아니다 — 눌러도 안 닫히므로 누를 수 있게 보이면 안 된다. */}
      <div className="absolute inset-0 bg-ink-950/45 backdrop-blur-[2px]" />

      <div
        ref={panelRef}
        className="animate-pop relative m-0 w-full overflow-hidden rounded-t-3xl border sm:m-6 sm:max-w-md sm:rounded-3xl"
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-hairline)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <div className="px-6 pt-6 sm:px-7">
          <h2
            id="coach-goal-prompt-title"
            className="m-0 text-lg font-extrabold tracking-[-0.03em]"
          >
            무엇을 이루고 싶으세요?
          </h2>
          <p className="muted m-0 mt-1.5 text-[13.5px] font-medium leading-relaxed">
            만다라트 가운데 칸에 들어갈 핵심 목표예요. 코치가 이 목표에 맞춰 세부 목표와 과제를
            제안합니다.
          </p>
        </div>

        <div className="px-6 py-5 sm:px-7">
          <Field label="핵심 목표">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="예) 건강한 몸 만들기"
              maxLength={MAX_SHEET_TITLE}
            />
          </Field>
        </div>

        <div
          className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-4 sm:px-7"
          style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-sunken)' }}
        >
          <Button variant="ghost" size="sm" onClick={onLeave}>
            나중에 할게요
          </Button>
          <Button size="sm" disabled={!trimmed} onClick={submit}>
            코치와 시작하기
          </Button>
        </div>
      </div>
    </div>
  )
}
