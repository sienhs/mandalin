import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Button from '../../components/common/ActionButton'
import { cn } from '../../utils/cn'
import type { Tour, TourStep } from './types'

type Rect = { top: number; left: number; width: number; height: number }

/** 카드 최대 폭. 좁은 화면에서는 여백을 뺀 만큼으로 줄어든다. */
const CARD_MAX = 360
/** 구멍과 카드 사이. */
const GAP = 14
/** 화면 가장자리에서 카드가 떨어져 있을 거리. */
const EDGE = 12
const DIM = 'rgba(12, 10, 9, 0.62)'

/**
 * `data-tour` 로 요소를 찾는다. <b>보이는 것 중 첫 번째</b>를 고른다.
 *
 * <p>같은 표식이 두 곳에 붙어 있는 자리가 있다 — 데스크톱 사이드바와 모바일 탭바가
 * 같은 메뉴를 각각 그린다. 둘 중 지금 화면에 안 뜬 쪽은 `display:none` 이라 크기가 0 이므로,
 * 단순히 `querySelector` 로 첫 번째를 잡으면 좁은 화면에서 <b>보이지도 않는 요소</b>를
 * 가리키게 된다(구멍이 좌상단 0,0 에 뚫린다).
 */
function findTarget(target?: string): HTMLElement | null {
  if (!target) return null
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(target)}"]`)
  for (const el of nodes) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return el
  }
  return null
}

function readRect(target?: string): Rect | null {
  const el = findTarget(target)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

/** 1px 미만 차이는 같은 것으로 본다 — 애니메이션 중에 매 프레임 리렌더되지 않게. */
function same(a: Rect | null, b: Rect | null) {
  if (!a || !b) return a === b
  return (
    Math.abs(a.top - b.top) < 1 &&
    Math.abs(a.left - b.left) < 1 &&
    Math.abs(a.width - b.width) < 1 &&
    Math.abs(a.height - b.height) < 1
  )
}

type Props = {
  tour: Tour
  /** 이 화면에서 실제로 보여 줄 단계. 원본이 아니라 걸러진 것이다(`resolveSteps`). */
  steps: TourStep[]
  index: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  /** 마무리 단계의 이동 버튼. 안내를 끝내고 이동시키는 것은 Provider 가 한다. */
  onAction: (to: string, state?: unknown) => void
}

export default function SpotlightOverlay({
  tour,
  steps,
  index,
  onPrev,
  onNext,
  onClose,
  onAction,
}: Props) {
  const step = steps[index]
  const last = index === steps.length - 1
  const pad = step.padding ?? 8

  const [rect, setRect] = useState<Rect | null>(() => readRect(step.target))
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [cardH, setCardH] = useState(190)
  const cardRef = useRef<HTMLDivElement>(null)

  /*
    강조할 요소를 화면 안으로 들인다. 스크롤이 끝나기를 기다리지 않는다 — 아래 rAF 가
    매 프레임 위치를 다시 재므로 구멍이 요소를 따라 미끄러진다.
  */
  useEffect(() => {
    findTarget(step.target)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [step.target, index])

  /*
    위치는 <b>매 프레임 다시 잰다.</b>

    `resize` · `scroll` 리스너로는 부족했다. 이 앱에는 위치를 바꾸는 요소가 스크롤 말고도
    많다 — 사이드바 접기(200ms transition), 카드의 `animate-rise`, 3D 미리보기가 늦게
    올라오며 밀어내는 레이아웃. 이벤트로 좇으면 그 사이에 구멍만 옛 자리에 남는다.

    같은 값이면 `setState` 가 그대로 이전 객체를 돌려주므로 React 가 리렌더를 건너뛴다.
  */
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const next = readRect(step.target)
      setRect((prev) => (same(prev, next) ? prev : next))
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [step.target])

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* 카드 높이를 알아야 위/아래 중 어디에 놓을지 정할 수 있다. */
  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setCardH(el.offsetHeight))
    observer.observe(el)
    setCardH(el.offsetHeight)
    return () => observer.disconnect()
  }, [])

  /*
    강조한 요소를 실제로 누르면 다음으로. <b>버블링 단계에서 듣는다</b> — 그 요소의 원래
    동작(코치 화면의 말하기 버튼 등)이 먼저 돌아야 하기 때문이다.
  */
  useEffect(() => {
    if (!step.interactive) return
    const el = findTarget(step.target)
    if (!el) return
    const onClick = () => onNext()
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [step.interactive, step.target, index, onNext])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowRight') onNext()
      else if (event.key === 'ArrowLeft') onPrev()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, onNext, onPrev])

  const cardW = Math.min(CARD_MAX, viewport.w - EDGE * 2)

  /*
    구멍을 <b>화면 안으로 잘라 낸다.</b>

    좁은 화면에서는 카드 하나가 화면보다 훨씬 길어진다 — 모바일의 "오늘의 할 일" 은 목록을
    접지 않아 4700px 까지 자란다. 자르지 않으면 구멍이 화면을 통째로 덮어 <b>어둠이 한 점도
    안 보이고</b>(강조의 뜻이 사라진다), 테두리도 화면 밖에 그려진다. 잘라 두면 적어도 위아래
    가장자리에 어둠이 남고 테두리가 화면 안에 붙는다.
  */
  const hole = rect
    ? (() => {
        const top = Math.max(0, rect.top - pad)
        const left = Math.max(0, rect.left - pad)
        const bottom = Math.min(viewport.h, rect.top + rect.height + pad)
        const right = Math.min(viewport.w, rect.left + rect.width + pad)
        return {
          top,
          left,
          width: Math.max(0, right - left),
          height: Math.max(0, bottom - top),
        }
      })()
    : null

  /*
    카드 자리. <b>아래 → 위 → 오른쪽 → 왼쪽</b> 순으로 들어갈 곳을 찾는다.

    옆자리가 반드시 있어야 한다. 위아래만 보고 안 되면 구멍 위에 얹던 때에는, 세로로 긴
    카드(오늘의 할 일·내 마을은 460px 이 넘는다)를 가리킬 때 <b>설명하려는 바로 그것</b>을
    카드가 덮었다. 화면에는 남는 가로 공간이 그만큼 있었는데도.
  */
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, Math.max(min, max)))

  let cardTop: number
  let cardLeft: number
  if (!hole) {
    cardTop = clamp(viewport.h / 2 - cardH / 2, EDGE, viewport.h - cardH - EDGE)
    cardLeft = clamp(viewport.w / 2 - cardW / 2, EDGE, viewport.w - cardW - EDGE)
  } else {
    const below = hole.top + hole.height + GAP
    const above = hole.top - GAP - cardH
    const right = hole.left + hole.width + GAP
    const leftOf = hole.left - GAP - cardW

    if (below + cardH <= viewport.h - EDGE) {
      cardTop = below
      cardLeft = clamp(hole.left + hole.width / 2 - cardW / 2, EDGE, viewport.w - cardW - EDGE)
    } else if (above >= EDGE) {
      cardTop = above
      cardLeft = clamp(hole.left + hole.width / 2 - cardW / 2, EDGE, viewport.w - cardW - EDGE)
    } else {
      // 옆으로 뺀다. 세로는 구멍 가운데에 맞추되 화면 밖으로 나가지 않게 잡아 둔다.
      cardTop = clamp(
        hole.top + hole.height / 2 - cardH / 2,
        EDGE,
        viewport.h - cardH - EDGE,
      )
      if (right + cardW <= viewport.w - EDGE) cardLeft = right
      else if (leftOf >= EDGE) cardLeft = leftOf
      else {
        /*
          네 방향 어디에도 자리가 없다 — 좁은 화면에서 화면보다 큰 것을 가리킬 때다.
          이때는 <b>아래에 붙인다</b>(바텀시트). 구멍 가운데에 얹으면 설명하려는 것의
          한복판을 가리는데, 아래에 붙이면 적어도 위쪽 절반은 그대로 보인다.
        */
        cardTop = Math.max(EDGE, viewport.h - cardH - EDGE)
        cardLeft = clamp(hole.left + hole.width / 2 - cardW / 2, EDGE, viewport.w - cardW - EDGE)
      }
    }
  }

  const ring = step.tone === 'ai' ? 'rgb(14 165 233)' : 'var(--color-brand-500)'

  /*
    구멍 밖을 덮는 판. `interactive` 단계에서는 <b>네 조각으로 나눠</b> 가운데를 비운다 —
    한 장으로 덮으면 강조한 버튼을 누를 수 없어서 "눌러 보세요" 가 거짓말이 된다.
  */
  const blockers: Array<{ key: string; style: React.CSSProperties }> =
    step.interactive && hole
      ? [
          { key: 't', style: { top: 0, left: 0, width: '100%', height: Math.max(0, hole.top) } },
          {
            key: 'b',
            style: {
              top: hole.top + hole.height,
              left: 0,
              width: '100%',
              height: Math.max(0, viewport.h - hole.top - hole.height),
            },
          },
          {
            key: 'l',
            style: {
              top: hole.top,
              left: 0,
              width: Math.max(0, hole.left),
              height: hole.height,
            },
          },
          {
            key: 'r',
            style: {
              top: hole.top,
              left: hole.left + hole.width,
              width: Math.max(0, viewport.w - hole.left - hole.width),
              height: hole.height,
            },
          },
        ]
      : []

  return (
    <div
      className="fixed inset-0 z-[95]"
      role="dialog"
      aria-modal="true"
      aria-label={`${tour.label} 안내`}
    >
      {/*
        어둠과 강조 테두리를 한 요소로 낸다 — 바깥으로 9999px 퍼지는 그림자가 곧 어둠이다.
        네 조각을 따로 그리면 단계가 바뀔 때 네 조각이 각각 움직여 이음매가 벌어진다.
      */}
      {hole ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            boxShadow: `0 0 0 9999px ${DIM}`,
            outline: `2px solid ${ring}`,
            outlineOffset: '-1px',
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0" style={{ background: DIM }} />
      )}

      {/* 강조한 자리를 한 번 더 알린다. 눌러야 하는 단계에서만. */}
      {step.interactive && hole && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute animate-ping rounded-2xl motion-reduce:animate-none"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            border: `2px solid ${ring}`,
          }}
        />
      )}

      {step.interactive && hole ? (
        blockers.map((b) => (
          <div key={b.key} className="absolute" style={{ position: 'absolute', ...b.style }} />
        ))
      ) : (
        <button
          type="button"
          aria-label="다음 단계"
          onClick={onNext}
          className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
        />
      )}

      <div
        ref={cardRef}
        className="animate-pop absolute rounded-[20px] border p-5"
        style={{
          top: cardTop,
          left: cardLeft,
          width: cardW,
          background: 'var(--surface-card)',
          borderColor: 'var(--border-hairline)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <p className="muted m-0 text-[11px] font-black tracking-[.04em]">
          {tour.label} · {index + 1}/{steps.length}
        </p>
        <h2 className="m-0 mt-2 text-[16.5px] font-extrabold leading-snug tracking-[-0.03em]">
          {step.title}
        </h2>
        <p className="muted m-0 mt-2 text-[13px] font-medium leading-relaxed">{step.body}</p>
        {step.hint && (
          <p
            className="m-0 mt-3 rounded-xl px-3 py-2.5 text-[11.5px] font-bold leading-relaxed"
            style={{ background: 'var(--surface-sunken)' }}
          >
            {step.hint}
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-5' : 'w-1.5',
              )}
              style={{ background: i === index ? ring : 'var(--border-hairline)' }}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            건너뛰기
          </Button>
          <span className="flex-1" />
          {index > 0 && (
            <Button variant="secondary" size="sm" onClick={onPrev}>
              이전
            </Button>
          )}
          {step.action ? (
            <Button
              size="sm"
              variant={step.tone === 'ai' ? 'ai' : 'primary'}
              onClick={() => onAction(step.action!.to, step.action!.state)}
            >
              {step.action.label}
            </Button>
          ) : (
            <Button size="sm" variant={step.tone === 'ai' ? 'ai' : 'primary'} onClick={onNext}>
              {last ? '다 봤어요' : '다음'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
