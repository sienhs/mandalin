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
import { NavLink, useNavigate, type NavLinkProps } from 'react-router-dom'
import Button from './ActionButton'
import Modal from './Modal'

export type UnsavedWarning = {
  title: string
  description: string
  /** 이탈을 확정하는 버튼 글자. 기본은 "나가기". */
  leaveLabel?: string
  /** 머무르는 버튼 글자. 기본은 "계속 작성하기". */
  stayLabel?: string
  /** 이탈이 확정된 뒤 부를 정리 함수(보관한 초안 삭제 등). */
  onLeave?: () => void
}

type Ctx = {
  /**
   * 이탈해도 되는지 검사한다. 막았으면 `true` — 호출한 쪽은 기본 동작을 취소해야 한다.
   * 막을 것이 없으면 `false` 를 주고, 이동은 호출한 쪽이 그대로 진행한다.
   */
  guard: (proceed: () => void) => boolean
  /** 미저장 경고를 걸거나(`warning`) 푼다(`null`). */
  setWarning: (warning: UnsavedWarning | null) => void
}

const GuardContext = createContext<Ctx | null>(null)

/**
 * 작성 중인 내용을 두고 화면을 떠나려 할 때 한 번 묻는 장치.
 *
 * <p><b>왜 라우터 기능을 안 쓰나.</b> react-router 의 `useBlocker` 는 data router
 * (`createBrowserRouter` + `RouterProvider`)에서만 동작한다. 이 앱은 `BrowserRouter` +
 * `<Routes>` 라 쓸 수 없고, 라우터를 바꾸는 것은 이 문제 하나를 고치기엔 너무 큰 수술이다.
 * 그래서 <b>이동을 만드는 쪽</b>(사이드바·탭바·알림 등)이 여기를 거치게 한다.
 *
 * <p>대신 한계가 있다: 브라우저 뒤로가기/앞으로가기는 이 장치가 잡지 못한다. 그래서 이
 * 팝업은 두 번째 방어선이고, 첫 번째는 <b>초안 자동 보관</b>(`features/sheet/draftStorage`)
 * 이다 — 못 막고 나가더라도 돌아오면 그대로 있다.
 */
export function UnsavedGuardProvider({ children }: { children: ReactNode }) {
  /*
    경고 내용은 ref 에 둔다. 상태로 두면 초안이 한 글자 바뀔 때마다 Provider 가 다시 그려져
    앱 전체(사이드바·본문)가 함께 렌더된다. 읽는 시점은 이동을 시도하는 순간뿐이라 ref 로 충분하다.
  */
  const warningRef = useRef<UnsavedWarning | null>(null)

  /** 물어보는 중인 이동. 문구를 함께 담아 둬야 팝업이 뜬 뒤 경고가 풀려도 글이 비지 않는다. */
  const [pending, setPending] = useState<{ proceed: () => void; warning: UnsavedWarning } | null>(
    null,
  )

  const setWarning = useCallback((warning: UnsavedWarning | null) => {
    warningRef.current = warning
  }, [])

  const guard = useCallback((proceed: () => void) => {
    const warning = warningRef.current
    if (!warning) return false
    setPending({ proceed, warning })
    return true
  }, [])

  /*
    새로고침·탭 닫기·주소 직접 입력. 리스너는 늘 달아 두고 안에서 판단한다 —
    걸고 풀기를 상태로 좇으면 초안이 바뀔 때마다 리스너를 갈아 끼우게 된다.
  */
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!warningRef.current) return
      event.preventDefault()
      // 요즘 브라우저는 문구를 무시하고 자체 안내를 띄운다. 값 자체가 있어야 동작하는 구형용.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const value = useMemo(() => ({ guard, setWarning }), [guard, setWarning])

  const leave = () => {
    if (!pending) return
    const { proceed, warning } = pending
    warning.onLeave?.()
    /*
      이동하는 동안 경고를 풀어 둔다. 떠나는 화면이 언마운트되며 어차피 풀리지만, 그 사이에
      다른 이동이 겹치면 같은 팝업이 두 번 뜬다.
    */
    warningRef.current = null
    setPending(null)
    proceed()
  }

  return (
    <GuardContext.Provider value={value}>
      {children}

      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending?.warning.title ?? ''}
        description={pending?.warning.description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPending(null)}>
              {pending?.warning.stayLabel ?? '계속 작성하기'}
            </Button>
            <Button variant="danger" size="sm" onClick={leave}>
              {pending?.warning.leaveLabel ?? '나가기'}
            </Button>
          </>
        }
      />
    </GuardContext.Provider>
  )
}

function useGuardContext(): Ctx {
  const ctx = useContext(GuardContext)
  if (!ctx) throw new Error('UnsavedGuardProvider 안에서만 쓸 수 있습니다')
  return ctx
}

/** 이동을 만드는 쪽(사이드바·버튼)이 쓴다. */
export function useUnsavedGuard(): Pick<Ctx, 'guard'> {
  const { guard } = useGuardContext()
  return { guard }
}

/**
 * 작성 중인 화면이 쓴다. `warning` 이 `null` 이면 경고를 걸지 않는다.
 *
 * <p>`warning` 은 매 렌더 새로 만들어도 되지만(ref 에 담기므로 렌더를 유발하지 않는다),
 * 화면이 사라질 때 반드시 풀린다.
 */
export function useUnsavedWarning(warning: UnsavedWarning | null): void {
  const { setWarning } = useGuardContext()

  useEffect(() => {
    setWarning(warning)
    return () => setWarning(null)
  }, [setWarning, warning])
}

/**
 * 이탈 확인을 거치는 `NavLink`.
 *
 * <p>`NavLink` 를 그대로 감싸는 이유는 활성 상태 스타일(`isActive`)과 render prop 을
 * 쓰는 곳이 많아서다 — 평범한 버튼으로 바꾸면 그 표시가 전부 사라진다.
 */
export function GuardedNavLink({ to, onClick, children, ...rest }: NavLinkProps) {
  const { guard } = useUnsavedGuard()
  const navigate = useNavigate()

  return (
    <NavLink
      to={to}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        /*
          새 탭·새 창으로 여는 조작은 지금 화면을 떠나지 않는다. 가로채면 오히려 방해가 된다.
        */
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        if (guard(() => navigate(to))) event.preventDefault()
      }}
      {...rest}
    >
      {children}
    </NavLink>
  )
}
