import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SpotlightOverlay from './SpotlightOverlay'
import { TOURS } from './tours'
import type { TourId, TourStep } from './types'

/**
 * 이 화면에서 실제로 보여 줄 단계만 남긴다.
 *
 * <p>`requireTarget` 단계는 표적이 지금 화면에 있을 때만 남는다. 시작 시점에 한 번만
 * 판정하는 것이 요점이다 — 도중에 다시 걸러 내면 단계 번호가 흔들려서 "3/8" 을 읽던
 * 사용자가 갑자기 "3/6" 을 보게 된다.
 */
/** 이 표식이 붙은 것이 지금 화면에 <b>보이는가</b>. 폭·높이가 0 인 것은 없는 것으로 본다. */
function visible(target: string): boolean {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(target)}"]`)
  for (const el of nodes) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return true
  }
  return false
}

function resolveSteps(id: TourId): TourStep[] {
  return TOURS[id].steps.filter((step) => {
    if (!step.requireTarget || !step.target) return true
    return visible(step.target)
  })
}

/**
 * 이 안내가 가리키는 것 중 <b>하나라도</b> 화면에 나와 있는가.
 *
 * <p>"화면이 그려졌는가" 를 대신 재는 값이다. 표적이 하나도 없다는 것은 아직 스켈레톤이라는
 * 뜻이므로, 그 상태에서 안내를 시작하면 모든 단계가 가운데 카드로 물러나거나
 * `requireTarget` 에 걸려 빠진다.
 *
 * <p>가리킬 것이 애초에 없는 안내(들머리 한 장짜리)는 언제나 참이다 — 기다릴 이유가 없다.
 */
function anyTargetVisible(id: TourId): boolean {
  const targets = TOURS[id].steps.flatMap((s) => (s.target ? [s.target] : []))
  return targets.length === 0 || targets.some(visible)
}

/** 옮겨 간 화면이 자리를 잡기를 기다리는 시간. */
const SETTLE_MS = 500
/** 그래도 아직이면 이만큼마다 다시 본다. */
const RETRY_MS = 120
/** 여기까지 기다려도 안 나오면 그냥 시작한다. 영영 안 뜨는 것보다는 낫다. */
const GIVE_UP_MS = 5000

/** 본 안내를 기억해 두는 자리. 화면마다 한 줄이라 키를 나눠 둔다. */
const seenKey = (id: TourId) => `mandarin.tour.${id}`

function readSeen(): Record<string, boolean> {
  const seen: Record<string, boolean> = {}
  for (const id of Object.keys(TOURS) as TourId[]) {
    try {
      seen[id] = window.localStorage.getItem(seenKey(id)) === '1'
    } catch {
      // 사파리 프라이빗 모드 등. 이번 세션 동안만 기억하지 못할 뿐 동작에는 지장이 없다.
      seen[id] = false
    }
  }
  return seen
}

type Ctx = {
  /** 지금 도는 안내. 없으면 `null`. */
  active: TourId | null
  /**
   * 다른 화면에서 시작해 <b>이 화면으로 오고 있는</b> 안내.
   *
   * <p>도착하자마자 뜨는 것이 아니라 화면이 자리를 잡을 짬(0.5초)을 두기 때문에, 그 사이를
   * 화면 쪽에서 알아야 한다 — 편집기는 들어오자마자 "어떻게 만들까요?" 를 띄우는데, 이것을
   * 모르면 안내가 뜨기 전까지 팝업이 반짝 떴다 사라진다.
   */
  pending: TourId | null
  /** 지금 단계가 가리키는 `data-tour`. 화면이 자기 단계인지 알아볼 때 쓴다. */
  activeTarget: string | null
  start: (id: TourId) => void
  stop: () => void
  seen: (id: TourId) => boolean
  /** 처음부터 다시 보게 한다(도움말 목록에서 고를 때). */
  reset: (id: TourId) => void
  /**
   * 지금 단계가 `target` 을 가리키고 있을 때만 다음으로 넘긴다.
   *
   * <p>화면이 <b>스스로 진도를 낼 때</b> 쓴다 — 코치의 예시 대화가 끝나면 "이렇게 오갑니다"
   * 단계는 할 일을 마쳤으므로 사용자가 다음을 누르기 전에 넘어가는 편이 자연스럽다.
   * 조건 없이 `next()` 를 열어 두면 엉뚱한 단계에서 화면이 안내를 밀어 버린다.
   */
  advanceFrom: (target: string) => void
}

const TourContext = createContext<Ctx | null>(null)

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [state, setState] = useState<{ id: TourId; index: number; steps: TourStep[] } | null>(null)
  const [seenMap, setSeenMap] = useState<Record<string, boolean>>(readSeen)

  /*
    다른 화면에서 시작한 안내. 그 화면에 도착하면 그때 뜬다.

    <b>ref 가 아니라 상태다.</b> 옮겨 가는 화면이 "안내가 오는 중" 을 알아야 자기 팝업을
    미룰 수 있는데, ref 로 두면 값이 바뀌어도 아무도 다시 그려지지 않는다.
  */
  const [pending, setPending] = useState<TourId | null>(null)

  const markSeen = useCallback((id: TourId) => {
    try {
      window.localStorage.setItem(seenKey(id), '1')
    } catch {
      /* 저장에 실패해도 이번 세션 동안은 정상 동작한다 */
    }
    setSeenMap((prev) => ({ ...prev, [id]: true }))
  }, [])

  const start = useCallback(
    (id: TourId) => {
      if (location.pathname !== TOURS[id].path) {
        setPending(id)
        navigate(TOURS[id].path)
        return
      }
      const steps = resolveSteps(id)
      if (steps.length === 0) return
      setPending(null)
      setState({ id, index: 0, steps })
    },
    [location.pathname, navigate],
  )

  /*
    옮겨 간 화면이 자리를 잡은 뒤에 띄운다. 도착 즉시 띄우면 아직 데이터가 없어 첫 단계의
    표적이 없고(카드가 가운데로 물러난다), 그 뒤에 목록이 그려지며 화면이 통째로 움직인다.
  */
  /*
    <b>0.5초로 끝내지 않고, 가리킬 것이 나올 때까지 다시 본다.</b>

    고정 시간만으로는 마을 화면을 못 따라간다 — 그 경로는 코드가 따로 떨어져 있어(`Lazy`)
    묶음을 내려받는 시간이 먼저 들고, 그다음 시트와 마을 데이터를 받는 동안은 스켈레톤 두
    장뿐이다. 그 사이에 시작해 버리면 여덟 단계가 전부 <b>없는 것을 설명하게 된다</b> —
    배치 패널 단계는 통째로 빠지고 나머지는 가운데 카드로 물러난다.

    빠른 화면(편집기·코치)에서는 첫 판정에 바로 통과하므로 예전과 똑같이 0.5초에 뜬다.
  */
  useEffect(() => {
    if (!pending || location.pathname !== TOURS[pending].path) return

    const deadline = Date.now() + GIVE_UP_MS
    let timer = 0

    const attempt = () => {
      if (!anyTargetVisible(pending) && Date.now() < deadline) {
        timer = window.setTimeout(attempt, RETRY_MS)
        return
      }
      const steps = resolveSteps(pending)
      /*
        예약을 <b>띄우는 순간에</b> 지운다. 여기서 먼저 지우면 그 리렌더에 안내가 아직 없어서,
        도착한 화면이 미뤄 두었던 팝업을 한 프레임 동안 열었다 닫는다.
      */
      setPending(null)
      if (steps.length > 0) setState({ id: pending, index: 0, steps })
    }

    timer = window.setTimeout(attempt, SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [location.pathname, pending])

  /*
    안내가 도는 도중에 화면을 옮기면 끝낸다. 표적이 전부 사라진 채로 남으면 가운데 카드만
    떠서, 사용자는 무엇을 설명하는지 알 수 없는 판을 닫아야 한다.
  */
  useEffect(() => {
    if (state && location.pathname !== TOURS[state.id].path) setState(null)
  }, [location.pathname, state])

  const stop = useCallback(() => {
    setState((prev) => {
      if (prev) markSeen(prev.id)
      return null
    })
  }, [markSeen])

  const next = useCallback(() => {
    setState((prev) => {
      if (!prev) return null
      if (prev.index + 1 >= prev.steps.length) {
        markSeen(prev.id)
        return null
      }
      return { ...prev, index: prev.index + 1 }
    })
  }, [markSeen])

  const prev = useCallback(() => {
    setState((s) => (s ? { ...s, index: Math.max(0, s.index - 1) } : null))
  }, [])

  const advanceFrom = useCallback(
    (target: string) => {
      setState((prevState) => {
        if (!prevState) return null
        if (prevState.steps[prevState.index]?.target !== target) return prevState
        if (prevState.index + 1 >= prevState.steps.length) {
          markSeen(prevState.id)
          return null
        }
        return { ...prevState, index: prevState.index + 1 }
      })
    },
    [markSeen],
  )

  const onAction = useCallback(
    (to: string, actionState?: unknown) => {
      setState((prevState) => {
        if (prevState) markSeen(prevState.id)
        return null
      })
      navigate(to, actionState ? { state: actionState } : undefined)
    },
    [markSeen, navigate],
  )

  const seen = useCallback((id: TourId) => Boolean(seenMap[id]), [seenMap])

  const reset = useCallback(
    (id: TourId) => {
      try {
        window.localStorage.removeItem(seenKey(id))
      } catch {
        /* 지우지 못해도 아래 상태만으로 이번 세션은 다시 볼 수 있다 */
      }
      setSeenMap((prevMap) => ({ ...prevMap, [id]: false }))
      start(id)
    },
    [start],
  )

  const activeTarget = state ? (state.steps[state.index]?.target ?? null) : null

  const value = useMemo<Ctx>(
    () => ({
      active: state?.id ?? null,
      pending,
      activeTarget,
      start,
      stop,
      seen,
      reset,
      advanceFrom,
    }),
    [state?.id, pending, activeTarget, start, stop, seen, reset, advanceFrom],
  )

  return (
    <TourContext.Provider value={value}>
      {children}
      {state && (
        <SpotlightOverlay
          tour={TOURS[state.id]}
          steps={state.steps}
          index={state.index}
          onPrev={prev}
          onNext={next}
          onClose={stop}
          onAction={onAction}
        />
      )}
    </TourContext.Provider>
  )
}

export function useTour(): Ctx {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('TourProvider 안에서만 쓸 수 있습니다')
  return ctx
}

/**
 * 이 화면의 안내를 <b>처음 들어왔을 때 한 번</b> 띄운다.
 *
 * <p>`ready` 는 "지금 띄워도 되는가" 다. 화면이 아직 뼈대(스켈레톤)이거나 다른 팝업이 덮고
 * 있으면 안내가 가리킬 것이 없다 — 코치 화면은 핵심 목표 입력 팝업이 닫힌 뒤라야 하고,
 * 홈은 만다라트 목록이 도착한 뒤라야 한다.
 *
 * <p>`force` 는 이미 본 안내라도 다시 띄운다. 만드는 방식 팝업에서 "AI 코치와 대화로
 * 만들기" 로 넘어온 경우가 그렇다 — 그 길을 고른 사람은 설명을 원한 것이다.
 */
export function useAutoTour(id: TourId, { ready = true, force = false } = {}) {
  const { start, seen, active, pending } = useTour()
  const fired = useRef(false)
  const timer = useRef<number | null>(null)

  /*
    예약한 타이머를 <b>의존성이 바뀔 때 지우지 않는다.</b> 여기 의존성에는 로딩 상태처럼
    잠깐 사이에 여러 번 뒤집히는 값이 들어 있는데, 뒷정리에서 지우면 그때마다 예약이
    취소된다. 두 번째부터는 `fired` 가 참이라 다시 걸지도 않으므로 결과는 <b>안내가 영영
    안 뜨는 것</b>이다. 화면을 떠날 때만 지운다(아래 효과).
  */
  /* `pending` 도 막는다 — 도움말에서 골라 온 안내가 이미 예약돼 있으면 같은 것을 두 번 켠다. */
  useEffect(() => {
    if (!ready || fired.current || active || pending) return
    if (!force && seen(id)) return
    fired.current = true
    if (timer.current) window.clearTimeout(timer.current)
    // 화면이 자리를 잡을 짬. `animate-rise`(0.45s)가 끝난 뒤라야 구멍이 제자리에 뚫린다.
    timer.current = window.setTimeout(() => start(id), 500)
  }, [ready, force, id, seen, start, active, pending])

  /*
    <b>떠날 때 `fired` 를 되돌린다.</b> 되돌리지 않으면 개발 모드에서 안내가 아예 안 뜬다 —
    `StrictMode` 가 효과를 mount → cleanup → mount 로 돌리는데, 가짜 cleanup 이 예약을
    지운 뒤 두 번째 mount 는 `fired` 가 참이라 그냥 돌아가기 때문이다. 운영에서도 화면을
    나갔다 돌아오면 다시 판단해야 맞다(이미 본 안내는 `seen` 이 막는다).
  */
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = null
      fired.current = false
    },
    [],
  )
}
